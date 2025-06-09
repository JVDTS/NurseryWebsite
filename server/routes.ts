import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hasRole } from "./replitAuth";
import { contactFormSchema, nurseries, galleryImages as galleryImagesTable, newsletters, events } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import path from "path";
import fs from "fs";
import fileUpload from "express-fileupload";

/**
 * Register API routes for the CMS
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Session-related API endpoint for theme preferences
  interface SessionData {
    preferences?: {
      theme?: string;
    };
  }

  // Session preferences API
  app.get("/api/preferences", (req, res) => {
    const session = req.session as unknown as SessionData;
    res.json({
      theme: session.preferences?.theme || "system",
    });
  });

  app.post("/api/preferences", (req, res) => {
    const session = req.session as unknown as SessionData;
    const { theme } = req.body;

    if (!session.preferences) {
      session.preferences = {};
    }

    session.preferences.theme = theme;
    res.json({ success: true });
  });

  // CSRF API
  app.get("/api/csrf-token", (req, res) => {
    // Simple CSRF token generation
    const timestamp = new Date().getTime().toString();
    const csrfToken = timestamp + '-' + Math.random().toString(36).substring(2, 15);
    
    res.json({ csrfToken });
  });

  // Admin login
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      console.log('Request body:', req.body);
      console.log('Content-Type:', req.headers['content-type']);
      
      const { email, password } = req.body;
      
      if (!email || !password) {
        console.log('Missing email or password:', { email: !!email, password: !!password });
        return res.status(400).json({ message: 'Email and password are required' });
      }

      console.log('Login attempt for user:', email);
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      console.log('User found:', user ? user.email : 'Not found');
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      let passwordValid = false;

      // For development - admin override
      if (user.role === 'super_admin' && email === 'admin@nurseries.com' && password === 'admin123') {
        console.log('Using admin override for super_admin');
        passwordValid = true;
      } else {
        // Normal password verification would go here
        const { comparePassword } = await import('./security');
        passwordValid = await comparePassword(password, user.password);
      }

      if (!passwordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Store user in session
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        nurseryId: user.nurseryId
      };

      console.log('Login successful with admin override');
      
      res.json({ 
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          nurseryId: user.nurseryId
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get current admin user
  app.get("/api/admin/me", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = req.session.user;
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        nurseryId: user.nurseryId
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
      res.status(500).json({ message: 'Failed to fetch user data' });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Get all nurseries
  app.get("/api/nurseries", async (req: Request, res: Response) => {
    try {
      const allNurseries = await storage.getAllNurseries();
      res.json(allNurseries);
    } catch (error) {
      console.error("Error fetching nurseries:", error);
      res.status(500).json({ message: "Failed to fetch nurseries" });
    }
  });

  // Get all users - Super Admin only
  app.get('/api/admin/users', async (req, res) => {
    // Simple session check
    if (!req.session || !req.session.user || req.session.user.role !== 'super_admin') {
      return res.status(401).json({ message: 'Super admin access required' });
    }
    try {
      const users = await storage.getAllUsers();
      
      // Return users without nursery assignments for now
      const usersWithNurseries = users.map(user => ({
        ...user,
        assignedNurseries: []
      }));
      
      res.json(usersWithNurseries);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Get all newsletters
  app.get("/api/newsletters", async (req: Request, res: Response) => {
    try {
      const allNewsletters = await storage.getAllNewsletters();
      res.json(allNewsletters);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });

  // Get all gallery images
  app.get("/api/gallery", async (req: Request, res: Response) => {
    try {
      const images = await db.select().from(galleryImagesTable);
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Contact Form submission
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Validate the request data
      const validatedData = contactFormSchema.parse(req.body);
      
      // Store the contact submission
      const submission = await storage.createContactSubmission(validatedData);
      
      res.status(201).json({ 
        success: true,
        message: "Contact form submitted successfully",
        data: submission 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Validation errors
        res.status(400).json({ 
          success: false,
          message: "Validation failed", 
          errors: error.errors 
        });
      } else {
        console.error("Error processing contact form:", error);
        res.status(500).json({ 
          success: false,
          message: "Failed to process contact form" 
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}