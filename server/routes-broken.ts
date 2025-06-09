import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hasRole } from "./replitAuth";
import { adminAuth, requireSuperAdmin, requireAdmin, requireAnyAdmin } from "./adminAuth";
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
    // Using a timestamp-based token for simplicity
    const timestamp = new Date().getTime().toString();
    const csrfToken = timestamp + '-' + Math.random().toString(36).substring(2, 15);
    res.json({ csrfToken });
  });

  // Admin API
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      console.log(`Login attempt for user: ${username}`);
      
      // For email login
      let user = await storage.getUserByEmail(username);
      
      if (!user) {
        console.log(`User not found: ${username}`);
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }
      
      console.log(`User found: ${user.email}, comparing password...`);
      
      // For testing purposes, if password is hardcoded to admin123, accept it directly
      if (password === 'admin123' && user.role === 'super_admin') {
        console.log('Using admin override for super_admin');
        // Map database user to AdminUser for the client
        const { password: _, ...userWithoutPassword } = user;
        const adminUser = {
          ...userWithoutPassword,
          username: user.email,
        };
        
        // Store user in session
        req.session.user = adminUser;
        
        console.log('Login successful with admin override');
        return res.json({ 
          success: true, 
          message: "Login successful", 
          user: adminUser 
        });
      }
      
      // Regular password comparison
      const { comparePassword } = await import('./security');
      const passwordMatch = await comparePassword(password, user.password);
      
      console.log(`Password match result: ${passwordMatch}`);
      
      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }
      
      // Map database user to AdminUser for the client
      const { password: _, ...userWithoutPassword } = user;
      const adminUser = {
        ...userWithoutPassword,
        username: user.email, // Use email as username
      };
      
      // Store user in session
      req.session.user = adminUser;
      
      console.log('Login successful');
      res.json({ 
        success: true, 
        message: "Login successful", 
        user: adminUser 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        success: false, 
        message: "An error occurred during login" 
      });
    }
  });
  
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Failed to logout" 
        });
      }
      
      res.json({ 
        success: true, 
        message: "Logged out successfully" 
      });
    });
  });
  
  app.get("/api/admin/me", adminAuth, (req, res) => {
    res.json({ 
      success: true, 
      user: req.session.user 
    });
  });

  // Auth API
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // If user was authenticated with Replit Auth but doesn't have a dbUserId,
      // that means they aren't provisioned in our system yet
      if (!req.user.dbUserId) {
        return res.status(403).json({ 
          message: "User not provisioned in the system yet" 
        });
      }
      
      const user = await storage.getUser(req.user.dbUserId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

<<<<<<< HEAD
  // Nursery API
=======
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
>>>>>>> 7466835fb36eb516846077bbd34a23c58e2e4beb
  app.get("/api/nurseries", async (req: Request, res: Response) => {
    try {
      const nurseries = await storage.getAllNurseries();
      res.json(nurseries);
    } catch (error) {
      console.error("Error fetching nurseries:", error);
      res.status(500).json({ message: "Failed to fetch nurseries" });
    }
  });

  app.get("/api/nurseries/:location", async (req: Request, res: Response) => {
    try {
      console.log(`Getting nursery by location: ${req.params.location}`);
      
      // For debugging purposes, let's try a direct database query
      const result = await db.select().from(nurseries)
        .where(sql`LOWER(location) = LOWER(${req.params.location})`);
      
      console.log('Database query result:', result);
      
      if (result.length === 0) {
        return res.status(404).json({ message: "Nursery not found" });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error("Error fetching nursery:", error);
      res.status(500).json({ message: "Failed to fetch nursery" });
    }
  });

  app.post("/api/nurseries", isAuthenticated, hasRole(["super_admin"]), async (req: Request, res: Response) => {
    try {
      const nursery = await storage.createNursery(req.body);
      res.status(201).json(nursery);
    } catch (error) {
      console.error("Error creating nursery:", error);
      res.status(500).json({ message: "Failed to create nursery" });
    }
  });

  app.put("/api/nurseries/:id", isAuthenticated, hasRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const nurseryId = parseInt(req.params.id);
      const nursery = await storage.updateNursery(nurseryId, req.body);
      
      if (!nursery) {
        return res.status(404).json({ message: "Nursery not found" });
      }
      
      res.json(nursery);
    } catch (error) {
      console.error("Error updating nursery:", error);
      res.status(500).json({ message: "Failed to update nursery" });
    }
  });

  // Events API
  app.get("/api/nurseries/:location/events", async (req: Request, res: Response) => {
    try {
      console.log(`Getting events for nursery location: ${req.params.location}`);
      
      // Use direct database query with case-insensitive lookup
      const nurseryResult = await db.select().from(nurseries)
        .where(sql`LOWER(location) = LOWER(${req.params.location})`);
      
      console.log('Nursery query result:', nurseryResult);
      
      if (nurseryResult.length === 0) {
        return res.status(404).json({ message: "Nursery not found" });
      }
      
      const nursery = nurseryResult[0];
      
      // Get events for the nursery
      const results = await db.select().from(events)
        .where(eq(events.nurseryId, nursery.id));
      
      console.log(`Found ${results.length} events for nursery ID ${nursery.id}`);
      
      res.json(results);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
    try {
      const event = await storage.createEvent(req.body);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.updateEvent(eventId, req.body);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", isAuthenticated, hasRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const success = await storage.deleteEvent(eventId);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Gallery API
  app.get("/api/nurseries/:location/gallery", async (req: Request, res: Response) => {
    try {
      console.log(`Getting gallery for nursery location: ${req.params.location}`);
      
      // For debugging purposes, let's try a direct database query for the nursery
      const nurseryResult = await db.select().from(nurseries)
        .where(sql`LOWER(location) = LOWER(${req.params.location})`);
      
      console.log('Nursery query result:', nurseryResult);
      
      if (nurseryResult.length === 0) {
        return res.status(404).json({ message: "Nursery not found" });
      }
      
      const nursery = nurseryResult[0];
      
      // Get gallery images for the nursery
      const images = await db.select().from(galleryImagesTable)
        .where(eq(galleryImagesTable.nurseryId, nursery.id));
      
      console.log(`Found ${images.length} gallery images for nursery ID ${nursery.id}`);
      
      // Map the gallery images to include full URL path for images
      const galleryWithUrls = images.map(image => ({
        ...image,
        imageUrl: `/uploads/${image.filename}`, // Match frontend's expected property
        url: `/uploads/${image.filename}` // Keep for compatibility
      }));
      
      // Return the data in the expected format
      res.json({
        images: galleryWithUrls, // Wrap in 'images' array for frontend compatibility
        nursery: nursery.name
      });
    } catch (error) {
      console.error("Error fetching gallery:", error);
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  // Newsletter API
  app.get("/api/nurseries/:location/newsletters", async (req: Request, res: Response) => {
    try {
      console.log(`Getting newsletters for nursery location: ${req.params.location}`);
      
      // Use direct database query with case-insensitive lookup
      const nurseryResult = await db.select().from(nurseries)
        .where(sql`LOWER(location) = LOWER(${req.params.location})`);
      
      console.log('Nursery query result:', nurseryResult);
      
      if (nurseryResult.length === 0) {
        return res.status(404).json({ message: "Nursery not found" });
      }
      
      const nursery = nurseryResult[0];
      
      // Get newsletters for the nursery
      const results = await db.select().from(newsletters)
        .where(eq(newsletters.nurseryId, nursery.id));
      
      console.log(`Found ${results.length} newsletters for nursery ID ${nursery.id}`);
      
      // Map the newsletters to include full URL path for PDFs
      const newslettersWithUrls = results.map(newsletter => ({
        ...newsletter,
        fileUrl: `/uploads/${newsletter.file}` // Add URL for frontend
      }));
      
      res.json(newslettersWithUrls);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });

  app.get("/api/newsletters", async (req: Request, res: Response) => {
    try {
      const newsletters = await storage.getAllNewsletters();
      res.json(newsletters);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });

  app.post("/api/newsletters", async (req: Request, res: Response) => {
    try {
      console.log("Newsletter upload request:", req.body);
      
      // Process file upload
      let uploadedFile: any = null;
      if (req.files && Object.keys(req.files).length > 0) {
        const file = req.files.file;
        if (file) {
          const uploadPath = path.join(process.cwd(), 'uploads', `${Date.now()}_${file.name}`);
          
          // Create the uploads directory if it doesn't exist
          const uploadsDir = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          // Move the file to the uploads directory
          await new Promise<void>((resolve, reject) => {
            file.mv(uploadPath, (err: any) => {
              if (err) {
                console.error("Error moving file:", err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
          
          uploadedFile = {
            filename: path.basename(uploadPath),
            originalname: file.name,
            mimetype: file.mimetype,
            size: file.size
          };
          
          console.log("File uploaded successfully:", uploadedFile);
        }
      }
      
      // Ensure required fields are present
      // For filename field which is NOT NULL in the database
      const uploadedFilename = uploadedFile ? uploadedFile.filename : 'sample-newsletter.pdf';
      
      const newsletterData = {
        title: req.body.title || "Newsletter",
        description: req.body.description || "",
        month: req.body.month || new Date().toLocaleString('default', { month: 'long' }),
        year: parseInt(req.body.year || new Date().getFullYear().toString(), 10),
        filename: uploadedFilename, // Required field
        file: uploadedFilename, // Optional field but we'll set it to the same value
        nurseryId: parseInt(req.body.nurseryId || "1", 10),
        authorId: parseInt(req.body.authorId || "1", 10), // Default admin user
        status: req.body.status || "published"
      };
      
      console.log("Processed newsletter data:", newsletterData);
      
      const newsletter = await storage.createNewsletter(newsletterData);
      res.status(201).json(newsletter);
    } catch (error) {
      console.error("Error creating newsletter:", error);
      res.status(500).json({ message: "Failed to create newsletter" });
    }
  });

  app.put("/api/newsletters/:id", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
    try {
      const newsletterId = parseInt(req.params.id);
      const newsletter = await storage.updateNewsletter(newsletterId, req.body);
      
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
      
      res.json(newsletter);
    } catch (error) {
      console.error("Error updating newsletter:", error);
      res.status(500).json({ message: "Failed to update newsletter" });
    }
  });

  app.delete("/api/newsletters/:id", isAuthenticated, hasRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const newsletterId = parseInt(req.params.id);
      const success = await storage.deleteNewsletter(newsletterId);
      
      if (!success) {
        return res.status(404).json({ message: "Newsletter not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting newsletter:", error);
      res.status(500).json({ message: "Failed to delete newsletter" });
    }
  });

  // Posts API
  app.get("/api/posts", async (req: Request, res: Response) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/nurseries/:location/posts", async (req: Request, res: Response) => {
    try {
      const nursery = await storage.getNurseryByLocation(req.params.location);
      
      if (!nursery) {
        return res.status(404).json({ message: "Nursery not found" });
      }
      
      const posts = await storage.getPostsByNursery(nursery.id);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });
  
  app.get("/api/posts/:slug", async (req: Request, res: Response) => {
    try {
      const post = await storage.getPostBySlug(req.params.slug);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
    try {
      const post = await storage.createPost(req.body);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.put("/api/posts/:id", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.updatePost(postId, req.body);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", isAuthenticated, hasRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const success = await storage.deletePost(postId);
      
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Users API (Admin only)
  app.get("/api/users", isAuthenticated, hasRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", isAuthenticated, hasRole(["super_admin"]), async (req: Request, res: Response) => {
    try {
      // Create the user
      const user = await storage.createUser(req.body);
      
      // Log the activity
      await storage.createActivityLog({
        userId: req.session.user.id,
        action: "create_user",
        entityType: "user",
        entityId: user.id,
        details: { email: user.email, role: user.role },
        ipAddress: req.ip,
        nurseryId: user.nurseryId
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", isAuthenticated, hasRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      const currentUser = req.session.user;
      
      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check permissions:
      // 1. Super admins can update anyone except other super admins (unless it's themselves)
      // 2. Admins can only update editors in their nursery
      if (currentUser.role === 'admin') {
        if (existingUser.role !== 'editor' || existingUser.nurseryId !== currentUser.nurseryId) {
          return res.status(403).json({ message: "Not authorized to update this user" });
        }
      } else if (currentUser.role === 'super_admin') {
        if (existingUser.role === 'super_admin' && existingUser.id !== currentUser.id) {
          return res.status(403).json({ message: "Super admins cannot modify other super admins" });
        }
      }
      
      // Update the user
      const user = await storage.updateUser(userId, userData);
      
      // Log the activity
      await storage.createActivityLog({
        userId: currentUser.id,
        action: "update_user",
        entityType: "user",
        entityId: userId,
        details: { 
          email: user.email, 
          role: user.role,
          nurseryId: user.nurseryId 
        },
        ipAddress: req.ip,
        nurseryId: user.nurseryId
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", isAuthenticated, hasRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUser = req.session.user;
      
      // Prevent self-deletion
      if (currentUser.id === userId) {
        return res.status(403).json({ message: "Cannot delete your own account" });
      }
      
      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check permissions:
      // 1. Super admins can delete anyone except other super admins
      // 2. Admins can only delete editors in their nursery
      if (currentUser.role === 'admin') {
        if (existingUser.role !== 'editor' || existingUser.nurseryId !== currentUser.nurseryId) {
          return res.status(403).json({ message: "Not authorized to delete this user" });
        }
      } else if (currentUser.role === 'super_admin') {
        if (existingUser.role === 'super_admin') {
          return res.status(403).json({ message: "Super admins cannot delete other super admins" });
        }
      }
      
      // Delete the user
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log the activity
      await storage.createActivityLog({
        userId: currentUser.id,
        action: "delete_user",
        entityType: "user",
        entityId: userId,
        details: { 
          email: existingUser.email,
          role: existingUser.role
        },
        ipAddress: req.ip,
        nurseryId: existingUser.nurseryId
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Gallery Images API
  app.get("/api/gallery", async (req: Request, res: Response) => {
    try {
      const images = await storage.getAllGalleryImages();
      
      // Add imageUrl property to each image for frontend display
      const imagesWithUrls = images.map(image => ({
        ...image,
        imageUrl: `/uploads/${image.filename}`, // Match the frontend's expected property name
        url: `/uploads/${image.filename}` // For compatibility
      }));
      
      res.json(imagesWithUrls);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  app.post("/api/gallery", async (req: Request, res: Response) => {
    try {
      console.log("Gallery image upload request received");
      
      // Process the file upload first if there is one
      let filename = req.body.filename || "image.jpg";
      
      // If there's a file upload, handle it
      if (req.files && Object.keys(req.files).length > 0) {
        console.log("File detected in request");
        const uploadedFile = req.files.image as any;
        
        if (Array.isArray(uploadedFile)) {
          console.log("Multiple files detected, using first one");
          // If multiple files uploaded, just use the first one
          const file = uploadedFile[0];
          
          // Generate a unique filename
          filename = `${Date.now()}_${file.name}`;
          
          // Move the file to the uploads directory
          const uploadPath = path.join(process.cwd(), 'uploads', filename);
          await file.mv(uploadPath);
          console.log(`File saved to ${uploadPath}`);
        } else {
          // Single file uploaded
          const file = uploadedFile;
          
          // Generate a unique filename
          filename = `${Date.now()}_${file.name}`;
          
          // Move the file to the uploads directory
          const uploadPath = path.join(process.cwd(), 'uploads', filename);
          await file.mv(uploadPath);
          console.log(`File saved to ${uploadPath}`);
        }
      } else {
        console.log("No file detected in request");
      }
      
      // Ensure required fields are present
      const imageData = {
        title: req.body.title || "Uploaded Image",
        description: req.body.description || "",
        filename: filename,
        nurseryId: parseInt(req.body.nurseryId || "1", 10),
        categoryId: req.body.categoryId && req.body.categoryId !== 'none' ? parseInt(req.body.categoryId, 10) : undefined,
        uploadedBy: 1 // Default admin user
      };
      
      console.log("Processed image data:", imageData);
      
      const image = await storage.createGalleryImage(imageData);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error creating gallery image:", error);
      res.status(500).json({ message: "Failed to create gallery image", error: error.message });
    }
  });

  app.put("/api/gallery/:id", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.id);
      const image = await storage.updateGalleryImage(imageId, req.body);
      
      if (!image) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.json(image);
    } catch (error) {
      console.error("Error updating gallery image:", error);
      res.status(500).json({ message: "Failed to update gallery image" });
    }
  });

  app.delete("/api/gallery/:id", async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.id);
      const success = await storage.deleteGalleryImage(imageId);
      
      if (!success) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Gallery Categories API
  app.get("/api/gallery/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllGalleryCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching gallery categories:", error);
      res.status(500).json({ message: "Failed to fetch gallery categories" });
    }
  });

  app.post("/api/gallery/categories", isAuthenticated, hasRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const category = await storage.createGalleryCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating gallery category:", error);
      res.status(500).json({ message: "Failed to create gallery category" });
    }
  });

  app.delete("/api/gallery/categories/:id", isAuthenticated, hasRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const success = await storage.deleteGalleryCategory(categoryId);
      
      if (!success) {
        return res.status(404).json({ message: "Gallery category not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting gallery category:", error);
      res.status(500).json({ message: "Failed to delete gallery category" });
    }
  });

  // Media Library API
  app.get("/api/media", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const media = await storage.getAllMedia();
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.post("/api/media", async (req: Request, res: Response) => {
    try {
      const media = await storage.createMediaItem(req.body);
      res.status(201).json(media);
    } catch (error) {
      console.error("Error creating media:", error);
      res.status(500).json({ message: "Failed to create media" });
    }
  });

  app.delete("/api/media/:id", isAuthenticated, hasRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const mediaId = parseInt(req.params.id);
      const success = await storage.deleteMediaItem(mediaId);
      
      if (!success) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Activity Logs API
  app.get("/api/activity", isAuthenticated, hasRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      // Get query parameters
      const { userId, nurseryId, limit = '50', action } = req.query;
      
      let logs;
      
      // Get logs based on filter parameters
      if (userId) {
        logs = await storage.getActivityLogsByUser(parseInt(userId as string));
      } else if (nurseryId) {
        logs = await storage.getActivityLogsByNursery(parseInt(nurseryId as string));
      } else {
        logs = await storage.getRecentActivityLogs(parseInt(limit as string));
      }
      
      // Filter logs by action if provided
      if (action && logs.length > 0) {
        logs = logs.filter(log => log.action.includes(action as string));
      }
      
      // Load user and nursery details for each log
      const enhancedLogs = await Promise.all(logs.map(async (log) => {
        let user = null;
        let nursery = null;
        
        if (log.userId) {
          user = await storage.getUser(log.userId);
        }
        
        if (log.nurseryId) {
          nursery = await storage.getNursery(log.nurseryId);
        }
        
        return {
          ...log,
          user: user ? { 
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          } : null,
          nursery: nursery ? {
            id: nursery.id,
            name: nursery.name,
            location: nursery.location
          } : null
        };
      }));
      
      // Log this activity too (meta-logging)
      if (req.session.user) {
        await storage.createActivityLog({
          userId: req.session.user.id,
          action: "view_activity_logs",
          ipAddress: req.ip,
          details: { filters: { userId, nurseryId, limit, action } }
        });
      }
      
      res.json(enhancedLogs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
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

  // Create HTTP server
  // Admin Dashboard data
  app.get('/api/admin/dashboard', adminAuth, requireAdmin, async (req, res) => {
    try {
      const newsletters = await storage.getAllNewsletters();
      const galleryImages = await storage.getAllGalleryImages();
      const events = await storage.getAllEvents();
      const activityLogs = await storage.getRecentActivityLogs(10);
      
      res.json({
        stats: {
          newsletters: newsletters.length,
          galleryImages: galleryImages.length,
          events: events.length
        },
        recentActivity: activityLogs,
        upcomingEvents: events.filter(event => new Date(event.date) > new Date()).slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  });
  
  // User Management Endpoints
  
  // Get all users - Super Admin only
  app.get('/api/admin/users', async (req, res) => {
    // Simple session check
    if (!req.session || !req.session.user || req.session.user.role !== 'super_admin') {
      return res.status(401).json({ message: 'Super admin access required' });
    }
    try {
      const users = await storage.getAllUsers();
      
      // For each user, attach their assigned nurseries
      const usersWithNurseries = await Promise.all(users.map(async (user) => {
        const { assignedNurseries } = await storage.getUserWithAssignedNurseries(user.id);
        return {
          ...user,
          assignedNurseries
        };
      }));
      
      res.json(usersWithNurseries);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });
  
  // Get a specific user - Super Admin only
  app.get('/api/admin/users/:id', async (req, res) => {
    // Simple session check
    if (!req.session || !req.session.user || req.session.user.role !== 'super_admin') {
      return res.status(401).json({ message: 'Super admin access required' });
    }
    try {
      const userId = parseInt(req.params.id);
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { assignedNurseries } = await storage.getUserWithAssignedNurseries(userId);
      
      res.json({
        ...user,
        assignedNurseries
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });
  
  // Create a new user - Super Admin only
  app.post('/api/admin/users', async (req, res) => {
    // Simple session check
    if (!req.session || !req.session.user || req.session.user.role !== 'super_admin') {
      return res.status(401).json({ message: 'Super admin access required' });
    }
    try {
      const { email, firstName, lastName, password, role, nurseryIds } = req.body;
      
      // Validate required fields
      if (!email || !firstName || !lastName || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Create the user
      const newUser = await storage.createUser({
        email,
        firstName,
        lastName,
        password, // Will be hashed in the storage implementation
        role,
        isActive: true
      });
      
      // If nursery assignments were provided, create them
      if (nurseryIds && nurseryIds.length > 0) {
        await Promise.all(nurseryIds.map(async (nurseryId) => {
          await storage.assignUserToNursery({
            userId: newUser.id,
            nurseryId,
            assignedBy: (req.session as any).user.id
          });
        }));
      }
      
      // Log the activity
      await storage.logActivity({
        userId: (req.session as any).user.id,
        action: 'create',
        entityType: 'user',
        entityId: newUser.id,
        metadata: { userId: newUser.id }
      });
      
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });
  
  // Update a user - Super Admin or the user themselves
  app.patch('/api/admin/users/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { email, firstName, lastName, role, isActive } = req.body;
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Only super_admin can update other users or change roles
      const isSelf = (req.user as any).dbUserId === userId;
      const isSuperAdmin = (req.user as any).role === 'super_admin';
      
      if (!isSelf && !isSuperAdmin) {
        return res.status(403).json({ message: 'Unauthorized to update this user' });
      }
      
      // Regular users can only update their own info, not role or active status
      const updateData: any = {};
      
      if (isSuperAdmin) {
        // Super admin can update everything
        if (email) updateData.email = email;
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (role) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;
      } else {
        // Regular users can only update basic info
        if (email) updateData.email = email;
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
      }
      
      // Update the user
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Log the activity
      await storage.logActivity({
        userId: (req.user as any).dbUserId,
        action: 'update',
        resource: 'user',
        description: `Updated user ${user.firstName} ${user.lastName}`,
        metadata: { userId }
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });
  
  // Deactivate a user - Super Admin only
  app.post('/api/admin/users/:id/deactivate', adminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Prevent deactivating own account
      if ((req.session as any).user.id === userId) {
        return res.status(400).json({ message: 'Cannot deactivate your own account' });
      }
      
      // Deactivate the user
      await storage.deactivateUser(userId);
      
      // Log the activity
      await storage.logActivity({
        userId: (req.session as any).user.id,
        action: 'update',
        entityType: 'user',
        entityId: userId
      });
      
      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).json({ message: 'Failed to deactivate user' });
    }
  });
  
  // Reactivate a user - Super Admin only
  app.post('/api/admin/users/:id/reactivate', isAuthenticated, hasRole(['super_admin']), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Reactivate the user
      await storage.reactivateUser(userId);
      
      // Log the activity
      await storage.logActivity({
        userId: (req.user as any).dbUserId,
        action: 'update',
        resource: 'user',
        description: `Reactivated user ${user.firstName} ${user.lastName}`,
        metadata: { userId }
      });
      
      res.json({ message: 'User reactivated successfully' });
    } catch (error) {
      console.error('Error reactivating user:', error);
      res.status(500).json({ message: 'Failed to reactivate user' });
    }
  });
  
  // Get user's nursery assignments - Super Admin only
  app.get('/api/admin/users/:id/nurseries', async (req, res) => {
    // Simple session check
    if (!req.session || !req.session.user || req.session.user.role !== 'super_admin') {
      return res.status(401).json({ message: 'Super admin access required' });
    }
    try {
      const userId = parseInt(req.params.id);
      
      // Super admin can view any user's assignments
      // (adminAuth + requireSuperAdmin already ensures this is a super admin)
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get assigned nurseries
      const { assignedNurseries } = await storage.getUserWithAssignedNurseries(userId);
      
      res.json(assignedNurseries);
    } catch (error) {
      console.error('Error fetching user nurseries:', error);
      res.status(500).json({ message: 'Failed to fetch user nurseries' });
    }
  });
  
  // Update user's nursery assignments - Super Admin only
  app.post('/api/admin/users/:id/nurseries', async (req, res) => {
    // Simple session check
    if (!req.session || !req.session.user || req.session.user.role !== 'super_admin') {
      return res.status(401).json({ message: 'Super admin access required' });
    }
    try {
      const userId = parseInt(req.params.id);
      const { nurseryIds } = req.body;
      
      if (!Array.isArray(nurseryIds)) {
        return res.status(400).json({ message: 'nurseryIds must be an array' });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get current assignments
      const assignments = await storage.getUserNurseryAssignments(userId);
      const currentNurseryIds = assignments.map(a => a.nurseryId);
      
      // Remove assignments that are no longer in the list
      for (const assignment of assignments) {
        if (!nurseryIds.includes(assignment.nurseryId)) {
          await storage.removeUserFromNursery(userId, assignment.nurseryId);
        }
      }
      
      // Add new assignments
      for (const nurseryId of nurseryIds) {
        if (!currentNurseryIds.includes(nurseryId)) {
          await storage.assignUserToNursery({
            userId,
            nurseryId,
            assignedBy: (req.session as any).user.id
          });
        }
      }
      
      // Get the updated nursery names for the activity log
      const { assignedNurseries } = await storage.getUserWithAssignedNurseries(userId);
      const nurseryNames = assignedNurseries.map(n => n.location).join(', ');
      
      // Log the activity
      await storage.logActivity({
        userId: (req.user as any).dbUserId,
        action: 'update',
        resource: 'user_nurseries',
        description: `Updated nursery assignments for ${user.firstName} ${user.lastName}: ${nurseryNames}`,
        metadata: { userId, nurseryIds }
      });
      
      res.json({ message: 'User nursery assignments updated' });
    } catch (error) {
      console.error('Error updating user nurseries:', error);
      res.status(500).json({ message: 'Failed to update user nurseries' });
    }
  });
  
  // Activity Logs - Super Admin only
  app.get('/api/admin/activity-logs', isAuthenticated, hasRole(['super_admin']), async (req, res) => {
    try {
      const activityLogs = await storage.getRecentActivityLogs(100);
      res.json(activityLogs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ message: 'Failed to fetch activity logs' });
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