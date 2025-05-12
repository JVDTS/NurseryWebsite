import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import * as fs from 'fs';
import { storage } from "./storage";
import { contactFormSchema, z } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import MemoryStore from "memorystore";
import { processFileUpload, getFileUrl, deleteFile } from "./fileStorage";
import { sendContactEmail } from "./emailService";

// Define minimal session properties
declare module 'express-session' {
  interface SessionData {
    preferences?: {
      theme?: string;
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up basic session for user preferences only
  const SessionStore = MemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'nursery-app-secret',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // 24 hours
    }),
    cookie: {
      httpOnly: true, 
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };
  
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  
  // Set up session store for storage
  storage.sessionStore = sessionSettings.store;
  
  // Contact form submission endpoint
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const data = contactFormSchema.parse(req.body);
      
      // Add current date as Date object to createdAt field
      const contactData = {
        ...data,
        createdAt: new Date()
      };
      
      // Send email notification
      if (process.env.SMTP_HOST) {
        try {
          await sendContactEmail(data);
        } catch (error) {
          console.error('Failed to send contact email:', error);
          // Continue processing regardless of email status
        }
      } else {
        console.log('Email not configured. Would have sent:', JSON.stringify(data, null, 2));
      }
      
      // Store contact submission
      const submission = await storage.createContactSubmission(contactData);
      
      res.status(201).json({ 
        success: true, 
        message: "Contact form submitted successfully",
        id: submission.id
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          success: false,
          message: validationError.message,
          details: error.format()
        });
      }
      
      console.error('Error handling contact form:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to submit contact form" 
      });
    }
  });
  
  // Nursery info endpoints
  app.get("/api/nurseries", async (req: Request, res: Response) => {
    try {
      const nurseries = await storage.getAllNurseries();
      res.json({ success: true, nurseries });
    } catch (error) {
      console.error('Error fetching nurseries:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to get nurseries" 
      });
    }
  });
  
  app.get("/api/nurseries/:location", async (req: Request, res: Response) => {
    try {
      const location = req.params.location;
      const nursery = await storage.getNurseryByLocation(location);
      
      if (!nursery) {
        return res.status(404).json({ 
          success: false, 
          message: `Nursery at ${location} not found` 
        });
      }
      
      res.json({ success: true, nursery });
    } catch (error) {
      console.error(`Error fetching nursery at ${req.params.location}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to get nursery" 
      });
    }
  });
  
  app.get("/api/nurseries/:location/events", async (req: Request, res: Response) => {
    try {
      const location = req.params.location;
      const nursery = await storage.getNurseryByLocation(location);
      
      if (!nursery) {
        return res.status(404).json({ 
          success: false, 
          message: `Nursery at ${location} not found` 
        });
      }
      
      const events = await storage.getEventsByNursery(nursery.id);
      res.json({ success: true, events });
    } catch (error) {
      console.error(`Error fetching events for nursery at ${req.params.location}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to get events" 
      });
    }
  });
  
  app.get("/api/nurseries/:location/gallery", async (req: Request, res: Response) => {
    try {
      const location = req.params.location;
      const nursery = await storage.getNurseryByLocation(location);
      
      if (!nursery) {
        return res.status(404).json({ 
          success: false, 
          message: `Nursery at ${location} not found` 
        });
      }
      
      const galleryImages = await storage.getGalleryImagesByNursery(nursery.id);
      
      // Add full URLs to images
      const imagesWithUrls = galleryImages.map(image => ({
        ...image,
        url: getFileUrl(image.imageUrl)
      }));
      
      res.json({ success: true, images: imagesWithUrls });
    } catch (error) {
      console.error(`Error fetching gallery for nursery at ${req.params.location}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to get gallery" 
      });
    }
  });
  
  app.get("/api/nurseries/:location/newsletters", async (req: Request, res: Response) => {
    try {
      const location = req.params.location;
      const nursery = await storage.getNurseryByLocation(location);
      
      if (!nursery) {
        return res.status(404).json({ 
          success: false, 
          message: `Nursery at ${location} not found` 
        });
      }
      
      const newsletters = await storage.getNewslettersByNursery(nursery.id);
      
      // Add URLs to newsletters
      const newslettersWithUrls = newsletters.map(newsletter => ({
        ...newsletter,
        url: getFileUrl(newsletter.pdfUrl || '')
      }));
      
      res.json({ success: true, newsletters: newslettersWithUrls });
    } catch (error) {
      console.error(`Error fetching newsletters for nursery at ${req.params.location}:`, error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to get newsletters" 
      });
    }
  });
  
  app.get("/api/newsletters", async (req: Request, res: Response) => {
    try {
      const newsletters = await storage.getAllNewsletters();
      
      // Add URLs to newsletters
      const newslettersWithUrls = newsletters.map(newsletter => ({
        ...newsletter,
        url: getFileUrl(newsletter.pdfUrl || '')
      }));
      
      res.json({ success: true, newsletters: newslettersWithUrls });
    } catch (error) {
      console.error('Error fetching all newsletters:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to get newsletters" 
      });
    }
  });
  
  return createServer(app);
}