import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contactFormSchema, z } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import MemoryStore from "memorystore";

// Define custom session properties
declare module 'express-session' {
  interface SessionData {
    userId: number;
    userRole: string;
    nurseryId: number | null;
  }
}

// Authentication middleware
const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }
  next();
};

// Authorization middleware for super admin
const superAdminOnly = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false, 
      message: "Super admin access required" 
    });
  }
  
  next();
};

// Authorization middleware for nursery admin
const nurseryAdminOnly = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || (user.role !== 'nursery_admin' && user.role !== 'super_admin')) {
    return res.status(403).json({ 
      success: false, 
      message: "Admin access required" 
    });
  }
  
  next();
};

// Authorization middleware for specific nursery access
const nurseryAccessCheck = (nurseryIdParam: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid user" 
      });
    }
    
    // Super admins can access all nurseries
    if (user.role === 'super_admin') {
      return next();
    }
    
    // Check if nursery admin is accessing their own nursery
    const nurseryId = parseInt(req.params[nurseryIdParam]);
    if (user.role === 'nursery_admin' && user.nurseryId === nurseryId) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false, 
      message: "You do not have access to this nursery" 
    });
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session
  const SessionStore = MemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'nursery-app-secret',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // 24 hours
    })
  };
  
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  
  // Set up session store for storage
  storage.sessionStore = sessionSettings.store;
  
  // Auth login schema
  const loginSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6)
  });
  
  // Login route
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password"
        });
      }
      
      // Set user session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.nurseryId = user.nurseryId;
      
      // Return user info (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: userWithoutPassword
      });
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validationError.message
        });
      } else {
        console.error("Login error:", error);
        res.status(500).json({
          success: false,
          message: "Login failed"
        });
      }
    }
  });
  
  // Logout route
  app.post("/api/admin/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Logout failed"
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Logout successful"
      });
    });
  });
  
  // Get current user info
  app.get("/api/admin/me", authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json({
        success: true,
        user: userWithoutPassword
      });
      
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user information"
      });
    }
  });

  // ===== NURSERY ADMIN ROUTES =====
  
  // Get nursery information (for admins)
  app.get("/api/admin/nurseries/:id", nurseryAdminOnly, nurseryAccessCheck("id"), async (req: Request, res: Response) => {
    try {
      const nurseryId = parseInt(req.params.id);
      const nursery = await storage.getNursery(nurseryId);
      
      if (!nursery) {
        return res.status(404).json({
          success: false,
          message: "Nursery not found"
        });
      }
      
      res.status(200).json({
        success: true,
        nursery
      });
      
    } catch (error) {
      console.error("Error fetching nursery:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch nursery information"
      });
    }
  });
  
  // ===== EVENT MANAGEMENT ROUTES =====
  
  // Get all events (super admin only)
  app.get("/api/admin/events", superAdminOnly, async (req: Request, res: Response) => {
    try {
      const events = await storage.getAllEvents();
      
      res.status(200).json({
        success: true,
        events
      });
      
    } catch (error) {
      console.error("Error fetching all events:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch all events"
      });
    }
  });
  
  // Get events for a nursery
  app.get("/api/admin/nurseries/:nurseryId/events", nurseryAdminOnly, nurseryAccessCheck("nurseryId"), async (req: Request, res: Response) => {
    try {
      const nurseryId = parseInt(req.params.nurseryId);
      const events = await storage.getEventsByNursery(nurseryId);
      
      res.status(200).json({
        success: true,
        events
      });
      
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch events"
      });
    }
  });
  
  // Create a new event
  app.post("/api/admin/nurseries/:nurseryId/events", nurseryAdminOnly, nurseryAccessCheck("nurseryId"), async (req: Request, res: Response) => {
    try {
      const nurseryId = parseInt(req.params.nurseryId);
      
      // Event creation schema
      const eventSchema = z.object({
        title: z.string().min(3),
        date: z.string(),
        time: z.string(),
        location: z.string(),
        description: z.string().min(10)
      });
      
      const eventData = eventSchema.parse(req.body);
      
      const newEvent = await storage.createEvent({
        ...eventData,
        nurseryId,
        createdBy: req.session.userId!,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: "Event created successfully",
        event: newEvent
      });
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validationError.message
        });
      } else {
        console.error("Error creating event:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create event"
        });
      }
    }
  });
  
  // Update an event
  app.put("/api/admin/events/:id", nurseryAdminOnly, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found"
        });
      }
      
      // Check if user has access to this nursery's events
      const user = await storage.getUser(req.session.userId!);
      if (user?.role !== 'super_admin' && user?.nurseryId !== event.nurseryId) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to update this event"
        });
      }
      
      // Event update schema
      const eventUpdateSchema = z.object({
        title: z.string().min(3).optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        location: z.string().optional(),
        description: z.string().min(10).optional()
      });
      
      const eventData = eventUpdateSchema.parse(req.body);
      
      const updatedEvent = await storage.updateEvent(eventId, {
        ...eventData,
        updatedAt: new Date()
      });
      
      res.status(200).json({
        success: true,
        message: "Event updated successfully",
        event: updatedEvent
      });
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validationError.message
        });
      } else {
        console.error("Error updating event:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update event"
        });
      }
    }
  });
  
  // Delete an event
  app.delete("/api/admin/events/:id", nurseryAdminOnly, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found"
        });
      }
      
      // Check if user has access to this nursery's events
      const user = await storage.getUser(req.session.userId!);
      if (user?.role !== 'super_admin' && user?.nurseryId !== event.nurseryId) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to delete this event"
        });
      }
      
      await storage.deleteEvent(eventId);
      
      res.status(200).json({
        success: true,
        message: "Event deleted successfully"
      });
      
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete event"
      });
    }
  });
  
  // ===== GALLERY MANAGEMENT ROUTES =====
  
  // Get all gallery images (super admin only)
  app.get("/api/admin/gallery", superAdminOnly, async (req: Request, res: Response) => {
    try {
      // This route would need to be implemented in storage
      // For now, we can use a workaround by fetching all galleries and combining them
      const nurseries = await storage.getAllNurseries();
      
      // Get gallery images for each nursery and combine them
      const allGalleryPromises = nurseries.map(nursery => 
        storage.getGalleryImagesByNursery(nursery.id)
      );
      
      const allGalleryArrays = await Promise.all(allGalleryPromises);
      const allGalleryImages = allGalleryArrays.flat();
      
      res.status(200).json({
        success: true,
        images: allGalleryImages
      });
      
    } catch (error) {
      console.error("Error fetching all gallery images:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch all gallery images"
      });
    }
  });
  
  // Get gallery images for a nursery
  app.get("/api/admin/nurseries/:nurseryId/gallery", nurseryAdminOnly, nurseryAccessCheck("nurseryId"), async (req: Request, res: Response) => {
    try {
      const nurseryId = parseInt(req.params.nurseryId);
      const images = await storage.getGalleryImagesByNursery(nurseryId);
      
      res.status(200).json({
        success: true,
        images
      });
      
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch gallery images"
      });
    }
  });
  
  // Add a gallery image
  app.post("/api/admin/nurseries/:nurseryId/gallery", nurseryAdminOnly, nurseryAccessCheck("nurseryId"), async (req: Request, res: Response) => {
    try {
      const nurseryId = parseInt(req.params.nurseryId);
      
      // Gallery image schema
      const galleryImageSchema = z.object({
        imageUrl: z.string().url(),
        caption: z.string().optional()
      });
      
      const imageData = galleryImageSchema.parse(req.body);
      
      const newImage = await storage.createGalleryImage({
        ...imageData,
        nurseryId,
        uploadedBy: req.session.userId!,
        createdAt: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: "Image added successfully",
        image: newImage
      });
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validationError.message
        });
      } else {
        console.error("Error adding gallery image:", error);
        res.status(500).json({
          success: false,
          message: "Failed to add gallery image"
        });
      }
    }
  });
  
  // Delete a gallery image
  app.delete("/api/admin/gallery/:id", nurseryAdminOnly, async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.id);
      const image = await storage.getGalleryImage(imageId);
      
      if (!image) {
        return res.status(404).json({
          success: false,
          message: "Image not found"
        });
      }
      
      // Check if user has access to this nursery's gallery
      const user = await storage.getUser(req.session.userId!);
      if (user?.role !== 'super_admin' && user?.nurseryId !== image.nurseryId) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to delete this image"
        });
      }
      
      await storage.deleteGalleryImage(imageId);
      
      res.status(200).json({
        success: true,
        message: "Image deleted successfully"
      });
      
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete gallery image"
      });
    }
  });
  
  // ===== NEWSLETTER MANAGEMENT ROUTES =====
  
  // Get all newsletters (super admin only)
  app.get("/api/admin/newsletters", superAdminOnly, async (req: Request, res: Response) => {
    try {
      const newsletters = await storage.getAllNewsletters();
      
      res.status(200).json({
        success: true,
        newsletters
      });
      
    } catch (error) {
      console.error("Error fetching all newsletters:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch all newsletters"
      });
    }
  });
  
  // Get newsletters for a nursery
  app.get("/api/admin/nurseries/:nurseryId/newsletters", nurseryAdminOnly, nurseryAccessCheck("nurseryId"), async (req: Request, res: Response) => {
    try {
      const nurseryId = parseInt(req.params.nurseryId);
      const newsletters = await storage.getNewslettersByNursery(nurseryId);
      
      res.status(200).json({
        success: true,
        newsletters
      });
      
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch newsletters"
      });
    }
  });
  
  // Create a newsletter
  app.post("/api/admin/nurseries/:nurseryId/newsletters", nurseryAdminOnly, nurseryAccessCheck("nurseryId"), async (req: Request, res: Response) => {
    try {
      const nurseryId = parseInt(req.params.nurseryId);
      
      // Newsletter schema
      const newsletterSchema = z.object({
        title: z.string().min(3),
        content: z.string().min(10),
        pdfUrl: z.string().url().optional()
      });
      
      const newsletterData = newsletterSchema.parse(req.body);
      
      const newNewsletter = await storage.createNewsletter({
        ...newsletterData,
        nurseryId,
        publishedBy: req.session.userId!,
        publishDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: "Newsletter created successfully",
        newsletter: newNewsletter
      });
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validationError.message
        });
      } else {
        console.error("Error creating newsletter:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create newsletter"
        });
      }
    }
  });
  
  // Update a newsletter
  app.put("/api/admin/newsletters/:id", nurseryAdminOnly, async (req: Request, res: Response) => {
    try {
      const newsletterId = parseInt(req.params.id);
      const newsletter = await storage.getNewsletter(newsletterId);
      
      if (!newsletter) {
        return res.status(404).json({
          success: false,
          message: "Newsletter not found"
        });
      }
      
      // Check if user has access to this nursery's newsletters
      const user = await storage.getUser(req.session.userId!);
      if (user?.role !== 'super_admin' && user?.nurseryId !== newsletter.nurseryId) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to update this newsletter"
        });
      }
      
      // Newsletter update schema
      const newsletterUpdateSchema = z.object({
        title: z.string().min(3).optional(),
        content: z.string().min(10).optional(),
        pdfUrl: z.string().url().optional()
      });
      
      const newsletterData = newsletterUpdateSchema.parse(req.body);
      
      const updatedNewsletter = await storage.updateNewsletter(newsletterId, {
        ...newsletterData,
        updatedAt: new Date()
      });
      
      res.status(200).json({
        success: true,
        message: "Newsletter updated successfully",
        newsletter: updatedNewsletter
      });
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validationError.message
        });
      } else {
        console.error("Error updating newsletter:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update newsletter"
        });
      }
    }
  });
  
  // Delete a newsletter
  app.delete("/api/admin/newsletters/:id", nurseryAdminOnly, async (req: Request, res: Response) => {
    try {
      const newsletterId = parseInt(req.params.id);
      const newsletter = await storage.getNewsletter(newsletterId);
      
      if (!newsletter) {
        return res.status(404).json({
          success: false,
          message: "Newsletter not found"
        });
      }
      
      // Check if user has access to this nursery's newsletters
      const user = await storage.getUser(req.session.userId!);
      if (user?.role !== 'super_admin' && user?.nurseryId !== newsletter.nurseryId) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to delete this newsletter"
        });
      }
      
      await storage.deleteNewsletter(newsletterId);
      
      res.status(200).json({
        success: true,
        message: "Newsletter deleted successfully"
      });
      
    } catch (error) {
      console.error("Error deleting newsletter:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete newsletter"
      });
    }
  });
  
  // ===== PUBLIC FACING API ROUTES =====
  
  // Contact form submission
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const validatedData = contactFormSchema.parse(req.body);
      
      // Add timestamp
      const contactData = {
        ...validatedData,
        createdAt: new Date().toISOString()
      };
      
      // Store the contact submission
      const savedContact = await storage.createContactSubmission(contactData);
      
      // Return success
      res.status(201).json({ 
        success: true, 
        message: "Contact form submitted successfully",
        data: savedContact
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          success: false, 
          message: "Validation error",
          errors: validationError.message
        });
      } else {
        console.error("Error submitting contact form:", error);
        res.status(500).json({ 
          success: false, 
          message: "Failed to submit contact form" 
        });
      }
    }
  });
  
  // Get all nurseries for public pages
  app.get("/api/nurseries", async (req: Request, res: Response) => {
    try {
      const nurseries = await storage.getAllNurseries();
      
      res.status(200).json({
        success: true,
        nurseries
      });
      
    } catch (error) {
      console.error("Error fetching nurseries:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch nurseries"
      });
    }
  });
  
  // Get a specific nursery by location
  app.get("/api/nurseries/:location", async (req: Request, res: Response) => {
    try {
      const location = req.params.location;
      const nursery = await storage.getNurseryByLocation(location);
      
      if (!nursery) {
        return res.status(404).json({
          success: false,
          message: "Nursery not found"
        });
      }
      
      res.status(200).json({
        success: true,
        nursery
      });
      
    } catch (error) {
      console.error("Error fetching nursery:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch nursery"
      });
    }
  });
  
  // Get events for a specific nursery location
  app.get("/api/nurseries/:location/events", async (req: Request, res: Response) => {
    try {
      const location = req.params.location;
      const nursery = await storage.getNurseryByLocation(location);
      
      if (!nursery) {
        return res.status(404).json({
          success: false,
          message: "Nursery not found"
        });
      }
      
      const events = await storage.getEventsByNursery(nursery.id);
      
      res.status(200).json({
        success: true,
        events
      });
      
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch events"
      });
    }
  });
  
  // Get gallery for a specific nursery location
  app.get("/api/nurseries/:location/gallery", async (req: Request, res: Response) => {
    try {
      const location = req.params.location;
      const nursery = await storage.getNurseryByLocation(location);
      
      if (!nursery) {
        return res.status(404).json({
          success: false,
          message: "Nursery not found"
        });
      }
      
      const images = await storage.getGalleryImagesByNursery(nursery.id);
      
      res.status(200).json({
        success: true,
        images
      });
      
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch gallery images"
      });
    }
  });
  
  // Get newsletters for a specific nursery location
  app.get("/api/nurseries/:location/newsletters", async (req: Request, res: Response) => {
    try {
      const location = req.params.location;
      const nursery = await storage.getNurseryByLocation(location);
      
      if (!nursery) {
        return res.status(404).json({
          success: false,
          message: "Nursery not found"
        });
      }
      
      const newsletters = await storage.getNewslettersByNursery(nursery.id);
      
      res.status(200).json({
        success: true,
        newsletters
      });
      
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch newsletters"
      });
    }
  });

  // Get all newsletters for public view
  app.get("/api/newsletters", async (req: Request, res: Response) => {
    try {
      const newsletters = await storage.getAllNewsletters();
      
      res.status(200).json(newsletters);
      
    } catch (error) {
      console.error("Error fetching all newsletters:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch newsletters"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
