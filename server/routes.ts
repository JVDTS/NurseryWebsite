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
import csrf from "csurf";
import { sendContactEmail } from "./emailService";
import { comparePassword } from "./security";

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
    }),
    cookie: {
      httpOnly: true, // Prevents JavaScript access to cookies
      sameSite: 'strict', // CSRF protection
      secure: process.env.NODE_ENV === 'production', // Require HTTPS in production
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };
  
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  
  // Set up session store for storage
  storage.sessionStore = sessionSettings.store;
  
  // Setup CSRF protection
  const csrfProtection = csrf({ cookie: false });
  
  // Apply CSRF protection to state-changing routes
  // Create a list of routes that should be protected by CSRF
  const csrfProtectedRoutes = [
    '/api/admin/login',
    '/api/admin/logout',
    '/api/admin/nurseries',
    '/api/admin/events',
    '/api/admin/gallery',
    '/api/admin/newsletters'
    // Removed '/api/contact' from CSRF protection to troubleshoot form submissions
  ];
  
  // Apply CSRF middleware to routes that modify state
  app.use((req, res, next) => {
    const path = req.path;
    const method = req.method;
    
    // Only apply CSRF protection to state-changing methods on protected routes
    const isStateChangingMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
    const needsProtection = csrfProtectedRoutes.some(route => path.startsWith(route)) && isStateChangingMethod;
    
    if (needsProtection) {
      return csrfProtection(req, res, next);
    }
    
    next();
  });
  
  // Add a route to get a CSRF token
  app.get('/api/csrf-token', csrfProtection, (req, res) => {
    // Set cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    // Generate a fresh token
    const token = req.csrfToken();
    console.log('Generated new CSRF token');
    
    res.json({ csrfToken: token });
  });
  
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
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password"
        });
      }
      
      // Use bcrypt to compare passwords
      const passwordMatch = await comparePassword(password, user.password);
      if (!passwordMatch) {
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
  
  // ===== SUPER ADMIN USER MANAGEMENT ROUTES =====
  
  // Get all users (for super admin)
  app.get("/api/admin/users", superAdminOnly, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.status(200).json({ 
        success: true, 
        users: usersWithoutPasswords 
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch users" 
      });
    }
  });
  
  // Create new user (super admin only)
  app.post("/api/admin/users", superAdminOnly, async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ 
          success: false, 
          message: "Username already exists" 
        });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ 
          success: false, 
          message: "Email already exists" 
        });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Don't return the password
      const { password, ...newUserWithoutPassword } = newUser;
      
      // Log this activity
      const adminUser = await storage.getUser(req.session.userId!);
      if (adminUser) {
        const nursery = userData.nurseryId ? await storage.getNursery(userData.nurseryId) : null;
        
        await storage.logActivity({
          userId: adminUser.id,
          username: adminUser.username,
          userRole: adminUser.role,
          nurseryId: nursery?.id || null,
          nurseryName: nursery?.name || null,
          actionType: 'create_user',
          resourceId: newUser.id,
          description: `Created new user ${newUser.username} with role ${newUser.role}`
        });
      }
      
      res.status(201).json({ 
        success: true, 
        user: newUserWithoutPassword 
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to create user" 
      });
    }
  });
  
  // Update user (super admin only)
  app.put("/api/admin/users/:id", superAdminOnly, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }
      
      // If username is being updated, check if it's already taken
      if (userData.username && userData.username !== existingUser.username) {
        const existingUsername = await storage.getUserByUsername(userData.username);
        if (existingUsername && existingUsername.id !== userId) {
          return res.status(400).json({ 
            success: false, 
            message: "Username already exists" 
          });
        }
      }
      
      // If email is being updated, check if it's already taken
      if (userData.email && userData.email !== existingUser.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail && existingEmail.id !== userId) {
          return res.status(400).json({ 
            success: false, 
            message: "Email already exists" 
          });
        }
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      if (!updatedUser) {
        return res.status(500).json({ 
          success: false, 
          message: "Failed to update user" 
        });
      }
      
      // Log this activity
      const adminUser = await storage.getUser(req.session.userId!);
      if (adminUser) {
        const nursery = updatedUser.nurseryId ? await storage.getNursery(updatedUser.nurseryId) : null;
        
        await storage.logActivity({
          userId: adminUser.id,
          username: adminUser.username,
          userRole: adminUser.role,
          nurseryId: nursery?.id || null,
          nurseryName: nursery?.name || null,
          actionType: 'update_user',
          resourceId: updatedUser.id,
          description: `Updated user ${updatedUser.username}`
        });
      }
      
      // Don't return the password
      const { password, ...updatedUserWithoutPassword } = updatedUser;
      
      res.status(200).json({ 
        success: true, 
        user: updatedUserWithoutPassword 
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update user" 
      });
    }
  });
  
  // ===== ACTIVITY LOGS ROUTES =====
  
  // Get all activity logs (super admin only)
  app.get("/api/admin/activity-logs", superAdminOnly, async (req: Request, res: Response) => {
    try {
      const logs = await storage.getActivityLogs();
      res.status(200).json({ 
        success: true, 
        logs 
      });
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch activity logs" 
      });
    }
  });
  
  // Get activity logs for a specific nursery (nursery admin or super admin)
  app.get("/api/admin/nurseries/:nurseryId/activity-logs", nurseryAdminOnly, nurseryAccessCheck("nurseryId"), async (req: Request, res: Response) => {
    try {
      const nurseryId = parseInt(req.params.nurseryId);
      const logs = await storage.getActivityLogsByNursery(nurseryId);
      res.status(200).json({ 
        success: true, 
        logs 
      });
    } catch (error) {
      console.error("Error fetching nursery activity logs:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch nursery activity logs" 
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
  
  // Upload a gallery image file
  app.post("/api/admin/upload/gallery", nurseryAdminOnly, async (req: Request, res: Response) => {
    try {
      console.log('Processing file upload for gallery...');
      
      // Check content type to ensure it's multipart form data
      const contentType = req.headers['content-type'] || '';
      if (!contentType.includes('multipart/form-data')) {
        console.error('Invalid content type for file upload:', contentType);
        return res.status(400).json({
          success: false,
          message: "Invalid request format. Must be multipart/form-data."
        });
      }
      
      const fileData = await processFileUpload(req);
      
      if (!fileData) {
        console.error('No file received in the upload request');
        return res.status(400).json({
          success: false,
          message: "No file uploaded. Please select a file."
        });
      }
      
      console.log('File uploaded successfully:', fileData.filename);
      
      // Check if file is an image
      if (!fileData.mimetype.startsWith('image/')) {
        // Clean up the uploaded file
        fs.unlinkSync(fileData.path);
        console.error('Invalid file type uploaded:', fileData.mimetype);
        
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed for gallery"
        });
      }
      
      const fileUrl = getFileUrl(fileData.filename);
      
      res.status(200).json({
        success: true,
        fileUrl,
        filename: fileData.filename,
        originalname: fileData.originalname,
        size: fileData.size
      });
      
    } catch (error) {
      console.error("Error uploading gallery image file:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload gallery image file"
      });
    }
  });
  
  // Add a gallery image
  app.post("/api/admin/nurseries/:nurseryId/gallery", nurseryAdminOnly, nurseryAccessCheck("nurseryId"), async (req: Request, res: Response) => {
    try {
      const nurseryId = parseInt(req.params.nurseryId);
      
      // Gallery image schema
      const galleryImageSchema = z.object({
        imageUrl: z.string(), // Allow both URLs and local file paths
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
      
      // If it's a file stored in our uploads folder, delete the actual file
      if (image.imageUrl.startsWith('/uploads/')) {
        // Extract the filename from URL
        const filename = image.imageUrl.split('/').pop();
        if (filename) {
          deleteFile(filename);
        }
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
  
  // Upload a newsletter file
  app.post("/api/admin/upload/newsletter", nurseryAdminOnly, async (req: Request, res: Response) => {
    try {
      console.log("Processing file upload for newsletter...");
      const fileData = await processFileUpload(req);
      
      if (!fileData) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }
      
      // Check if file is a PDF (by mimetype or extension)
      const isPdfByMimetype = fileData.mimetype === 'application/pdf';
      const isPdfByExtension = fileData.filename.toLowerCase().endsWith('.pdf');
      
      if (!isPdfByMimetype && !isPdfByExtension) {
        // Clean up the uploaded file
        fs.unlinkSync(fileData.path);
        
        return res.status(400).json({
          success: false,
          message: "Only PDF files are allowed for newsletters"
        });
      }
      
      const fileUrl = getFileUrl(fileData.filename);
      console.log(`File uploaded successfully: ${fileData.filename}`);
      
      res.status(200).json({
        success: true,
        fileUrl,
        filename: fileData.filename,
        originalname: fileData.originalname,
        size: fileData.size
      });
      
    } catch (error) {
      console.error("Error uploading newsletter file:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload newsletter file"
      });
    }
  });
  
  // Get all newsletters (super admin only)
  app.get("/api/admin/newsletters", superAdminOnly, async (req: Request, res: Response) => {
    try {
      const allNewsletters = await storage.getAllNewsletters();
      
      // Transform data to match client expectations
      const newsletters = allNewsletters.map(newsletter => ({
        id: newsletter.id,
        title: newsletter.title,
        description: newsletter.content,
        fileUrl: newsletter.pdfUrl,
        publishDate: newsletter.publishDate,
        nurseryId: newsletter.nurseryId
      }));
      
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
      const nurseryNewsletters = await storage.getNewslettersByNursery(nurseryId);
      
      // Transform data to match client expectations
      const newsletters = nurseryNewsletters.map(newsletter => ({
        id: newsletter.id,
        title: newsletter.title,
        description: newsletter.content,
        fileUrl: newsletter.pdfUrl,
        publishDate: newsletter.publishDate,
        nurseryId: newsletter.nurseryId
      }));
      
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
      
      // Newsletter schema matching the client fields
      const newsletterSchema = z.object({
        title: z.string().min(3),
        description: z.string().min(5),
        fileUrl: z.string()
          .refine(val => val.startsWith('/uploads/') || val.startsWith('http'), {
            message: 'Please provide a valid URL or an uploaded file path'
          }),
        publishDate: z.string().or(z.date()),
        tags: z.string().optional() // Optional tags for categorizing newsletters
      });
      
      const newsletterData = newsletterSchema.parse(req.body);
      
      // Map client fields to database fields
      const newNewsletter = await storage.createNewsletter({
        title: newsletterData.title,
        content: newsletterData.description,
        pdfUrl: newsletterData.fileUrl,
        nurseryId,
        publishedBy: req.session.userId!,
        publishDate: new Date(newsletterData.publishDate),
        tags: newsletterData.tags || '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Transform database fields back to client field names
      const transformedNewsletter = {
        id: newNewsletter.id,
        title: newNewsletter.title,
        description: newNewsletter.content,
        fileUrl: newNewsletter.pdfUrl,
        publishDate: newNewsletter.publishDate,
        nurseryId: newNewsletter.nurseryId,
        tags: newNewsletter.tags || ''
      };
      
      res.status(201).json({
        success: true,
        message: "Newsletter created successfully",
        newsletter: transformedNewsletter
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
      
      // Newsletter update schema matching client fields
      const newsletterUpdateSchema = z.object({
        title: z.string().min(3).optional(),
        description: z.string().min(5).optional(),
        fileUrl: z.string()
          .refine(val => val.startsWith('/uploads/') || val.startsWith('http'), {
            message: 'Please provide a valid URL or an uploaded file path'
          })
          .optional(),
        publishDate: z.string().or(z.date()).optional(),
        tags: z.string().optional() // Optional tags for categorizing newsletters
      });
      
      const newsletterData = newsletterUpdateSchema.parse(req.body);
      
      // Map client fields to database fields
      const updateData: any = {};
      
      if (newsletterData.title) updateData.title = newsletterData.title;
      if (newsletterData.description) updateData.content = newsletterData.description;
      if (newsletterData.fileUrl) updateData.pdfUrl = newsletterData.fileUrl;
      if (newsletterData.publishDate) updateData.publishDate = new Date(newsletterData.publishDate);
      if (newsletterData.tags) updateData.tags = newsletterData.tags;
      updateData.updatedAt = new Date();
      
      const updatedNewsletter = await storage.updateNewsletter(newsletterId, updateData);
      
      if (!updatedNewsletter) {
        return res.status(404).json({
          success: false,
          message: "Failed to update newsletter"
        });
      }
      
      // Transform database fields back to client field names
      const transformedNewsletter = {
        id: updatedNewsletter.id,
        title: updatedNewsletter.title,
        description: updatedNewsletter.content,
        fileUrl: updatedNewsletter.pdfUrl,
        publishDate: updatedNewsletter.publishDate,
        nurseryId: updatedNewsletter.nurseryId,
        tags: updatedNewsletter.tags || ''
      };
      
      res.status(200).json({
        success: true,
        message: "Newsletter updated successfully",
        newsletter: transformedNewsletter
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
  
  // Email settings check route
  app.get("/api/admin/email/verify", authenticateUser, async (req: Request, res: Response) => {
    try {
      const { verifyEmailConfig } = await import('./emailService');
      const isConfigValid = await verifyEmailConfig();
      
      res.status(200).json({
        success: true,
        isConfigValid,
        emailUser: process.env.EMAIL_USER || "Not configured",
        emailHost: process.env.EMAIL_HOST || "Not configured"
      });
    } catch (error) {
      console.error("Error verifying email config:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify email configuration"
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
        createdAt: new Date()
      };
      
      // Store the contact submission
      const savedContact = await storage.createContactSubmission(contactData);
      
      // Send email to IT@kingsborough.org.uk
      const { sendContactEmail } = await import('./emailService');
      const emailSent = await sendContactEmail(validatedData);
      
      // Return success
      res.status(201).json({ 
        success: true, 
        message: "Contact form submitted successfully",
        data: savedContact,
        emailSent
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
      
      const nurseryNewsletters = await storage.getNewslettersByNursery(nursery.id);
      
      // Transform data to match client expectations
      const newsletters = nurseryNewsletters.map(newsletter => ({
        id: newsletter.id,
        title: newsletter.title,
        description: newsletter.content,
        fileUrl: newsletter.pdfUrl,
        publishDate: newsletter.publishDate,
        nurseryId: newsletter.nurseryId,
        tags: newsletter.tags || ""
      }));
      
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
      const allNewsletters = await storage.getAllNewsletters();
      
      // Transform the data to match client expectations
      const newsletters = allNewsletters.map(newsletter => ({
        id: newsletter.id,
        title: newsletter.title,
        description: newsletter.content,
        fileUrl: newsletter.pdfUrl,
        publishDate: newsletter.publishDate,
        nurseryId: newsletter.nurseryId,
        tags: newsletter.tags || ''
      }));
      
      res.status(200).json(newsletters);
      
    } catch (error) {
      console.error("Error fetching all newsletters:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch newsletters"
      });
    }
  });
  
  // API endpoint to get PDF thumbnails for newsletters
  app.get("/api/newsletters/thumbnails", async (req: Request, res: Response) => {
    try {
      const allNewsletters = await storage.getAllNewsletters();
      
      // Skip actual thumbnail generation due to compatibility issues with pdfjs
      // Just return IDs with empty thumbnail URLs to trigger the fallback UI
      const thumbnails = allNewsletters.map(newsletter => ({
        id: newsletter.id,
        thumbnailUrl: ''
      }));
      
      res.json({ success: true, thumbnails });
    } catch (error) {
      console.error("Error processing thumbnails request:", error);
      res.status(500).json({ success: false, message: "Failed to process thumbnails" });
    }
  });

  // API endpoint to view all contact form submissions
  app.get("/api/contact-submissions", async (req: Request, res: Response) => {
    try {
      const contactSubmissions = await storage.getContactSubmissions();
      res.json({ success: true, data: contactSubmissions });
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ success: false, message: "Failed to fetch contact submissions" });
    }
  });

  // API endpoint to fetch testimonials from real parents by location
  app.get("/api/reviews", async (req: Request, res: Response) => {
    try {
      const { fetchReviews } = await import('./reviews');
      
      // Get location parameter (or default to all locations)
      const location = req.query.location as string || 'default';
      
      // Fetch reviews for the specified location
      const reviews = await fetchReviews(location);
      
      res.json({ success: true, reviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch reviews",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
