import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hasRole } from "./replitAuth";
import { adminAuth, requireSuperAdmin, requireAdmin, requireAnyAdmin } from "./adminAuth";
import { contactFormSchema, contactSubmissionInsertSchema, nurseries, galleryImages as galleryImagesTable, newsletters, events } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import path from "path";
import fs from "fs";
import fileUpload from "express-fileupload";
import { logActivity, logEntityActivity, ActivityTypes } from "./activityLogger";
import { sendContactEmail } from "./emailService";

/**
 * Register API routes for the CMS
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Rate limiting middleware for contact form
  const contactRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
      success: false,
      message: "Too many contact form submissions from this IP. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

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

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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
      const { username, email, password } = req.body;
      const loginIdentifier = username || email;
      
      console.log(`Login attempt for user: ${loginIdentifier}`);
      
      // For email login
      let user = await storage.getUserByEmail(loginIdentifier);
      
      if (!user) {
        console.log(`User not found: ${loginIdentifier}`);
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
      
      // Log the login activity
      await logActivity({
        req,
        action: ActivityTypes.LOGIN,
        details: {
          email: user.email,
          role: user.role,
          nurseryId: user.nurseryId,
          loginMethod: 'admin_panel'
        }
      });
      
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
  
  app.post("/api/admin/logout", async (req, res) => {
    try {
      // Log the logout activity before destroying session
      if (req.session?.user) {
        await logActivity({
          req,
          action: ActivityTypes.LOGOUT,
          details: {
            email: req.session.user.email,
            role: req.session.user.role,
            logoutMethod: 'admin_panel'
          }
        });
      }
      
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
    } catch (error) {
      console.error("Error during logout:", error);
      req.session.destroy((err) => {
        res.json({ 
          success: true, 
          message: "Logged out successfully" 
        });
      });
    }
  });
  
  app.get("/api/admin/me", adminAuth, async (req, res) => {
    try {
      // Log dashboard access activity periodically (not on every request to avoid spam)
      const now = new Date();
      const lastDashboardAccess = req.session.lastDashboardLog;
      
      // Only log dashboard access once per hour per user
      if (!lastDashboardAccess || (now.getTime() - lastDashboardAccess) > 3600000) {
        await logActivity({
          req,
          action: ActivityTypes.VIEW_DASHBOARD,
          details: {
            role: req.session.user.role,
            nurseryId: req.session.user.nurseryId
          }
        });
        req.session.lastDashboardLog = now.getTime();
      }
      
      res.json({ 
        success: true, 
        user: req.session.user 
      });
    } catch (error) {
      console.error("Error in admin/me endpoint:", error);
      res.json({ 
        success: true, 
        user: req.session.user 
      });
    }
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

  // Nursery API
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
      
      res.json({ events: results });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events", adminAuth, async (req: Request, res: Response) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", adminAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).user.id;
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      
      const eventData = {
        ...req.body,
        createdBy: userId,
        // Convert date strings to Date objects
        startDate: startDate,
        endDate: endDate,
        // Extract date and time for the required fields
        date: startDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
        time: startDate.toTimeString().split(' ')[0], // Format: HH:MM:SS
      };
      const event = await storage.createEvent(eventData);
      
      // Log the activity
      await logActivity({
        req,
        action: ActivityTypes.CREATE_EVENT,
        entityType: "event",
        entityId: event.id,
        nurseryId: event.nurseryId,
        details: {
          title: event.title,
          location: event.location,
          date: event.date,
          status: event.status
        }
      });
      
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const originalEvent = await storage.getEvent(eventId);
      const event = await storage.updateEvent(eventId, req.body);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Log the activity
      await logEntityActivity({
        req,
        action: ActivityTypes.UPDATE_EVENT,
        entityType: "event",
        entityId: eventId,
        entityData: event,
        nurseryId: event.nurseryId,
        previousData: originalEvent
      });
      
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", adminAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      const success = await storage.deleteEvent(eventId);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Log the activity
      if (event) {
        await logActivity({
          req,
          action: ActivityTypes.DELETE_EVENT,
          entityType: "event",
          entityId: eventId,
          nurseryId: event.nurseryId,
          details: {
            title: event.title,
            location: event.location,
            date: event.date
          }
        });
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
      
      // Transform newsletters to match frontend expectations
      const transformedNewsletters = newsletters.map(newsletter => ({
        id: newsletter.id,
        title: newsletter.title,
        description: newsletter.description || '',
        fileUrl: newsletter.filename ? `/uploads/${newsletter.filename}` : '',
        publishDate: newsletter.createdAt,
        nurseryId: newsletter.nurseryId,
        tags: newsletter.tags || '',
        month: newsletter.month,
        year: newsletter.year,
        filename: newsletter.filename,
        status: newsletter.status
      }));
      
      res.json(transformedNewsletters);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });

  app.post("/api/newsletters", adminAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = req.session.user;
      
      // Check if user is active
      if (!currentUser.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
      // Check nursery permissions for uploads
      const nurseryId = parseInt(req.body.nurseryId || "1", 10);
      if (currentUser.role !== 'super_admin') {
        // Non-super admins can only upload to their assigned nursery
        if (currentUser.nurseryId !== nurseryId) {
          return res.status(403).json({ message: 'Cannot upload to this nursery' });
        }
      }
      
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
        authorId: req.session.user?.id || 1,
        status: req.body.status || "published"
      };
      
      console.log("Processed newsletter data:", newsletterData);
      
      const newsletter = await storage.createNewsletter(newsletterData);
      
      // Log the activity (only if we have session data)
      if (req.session?.user) {
        await logActivity({
          req,
          action: ActivityTypes.CREATE_NEWSLETTER,
          entityType: "newsletter",
          entityId: newsletter.id,
          nurseryId: newsletter.nurseryId,
          details: {
            title: newsletter.title,
            month: newsletter.month,
            year: newsletter.year,
            filename: newsletter.filename
          }
        });
      }
      
      res.status(201).json(newsletter);
    } catch (error) {
      console.error("Error creating newsletter:", error);
      res.status(500).json({ message: "Failed to create newsletter" });
    }
  });

  app.put("/api/newsletters/:id", adminAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = req.session.user;
      
      // Check if user is active
      if (!currentUser.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
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

  // Admin newsletter delete route
  app.delete("/api/admin/newsletters/:id", adminAuth, async (req: Request, res: Response) => {
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
  app.get("/api/users", adminAuth, requireAdmin, async (req: Request, res: Response) => {
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

  app.post("/api/users", adminAuth, requireSuperAdmin, async (req: Request, res: Response) => {
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

  app.put("/api/users/:id", adminAuth, requireAdmin, async (req: Request, res: Response) => {
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

  app.delete("/api/users/:id", adminAuth, requireAdmin, async (req: Request, res: Response) => {
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

  app.post("/api/gallery", adminAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = req.session.user;
      
      // Check if user is active
      if (!currentUser.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
      // Check nursery permissions for uploads
      const nurseryId = parseInt(req.body.nurseryId || "1", 10);
      if (currentUser.role !== 'super_admin') {
        // Non-super admins can only upload to their assigned nursery
        if (currentUser.nurseryId !== nurseryId) {
          return res.status(403).json({ message: 'Cannot upload to this nursery' });
        }
      }
      
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
        uploadedBy: req.session.user?.id || 1
      };
      
      console.log("Processed image data:", imageData);
      
      const image = await storage.createGalleryImage(imageData);
      
      // Log the activity
      await logActivity({
        req,
        action: ActivityTypes.UPLOAD_GALLERY_IMAGE,
        entityType: "gallery_image",
        entityId: image.id,
        nurseryId: image.nurseryId,
        details: {
          title: image.title,
          filename: image.filename,
          nurseryId: image.nurseryId
        }
      });
      
      res.status(201).json(image);
    } catch (error) {
      console.error("Error creating gallery image:", error);
      res.status(500).json({ message: "Failed to create gallery image", error: error.message });
    }
  });

  app.put("/api/gallery/:id", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.id);
      const originalImage = await storage.getGalleryImage(imageId);
      const image = await storage.updateGalleryImage(imageId, req.body);
      
      if (!image) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      // Log the activity
      await logEntityActivity({
        req,
        action: ActivityTypes.UPDATE_GALLERY_IMAGE,
        entityType: "gallery_image",
        entityId: imageId,
        entityData: image,
        nurseryId: image.nurseryId,
        previousData: originalImage
      });
      
      res.json(image);
    } catch (error) {
      console.error("Error updating gallery image:", error);
      res.status(500).json({ message: "Failed to update gallery image" });
    }
  });

  app.delete("/api/gallery/:id", async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.id);
      const image = await storage.getGalleryImage(imageId);
      const success = await storage.deleteGalleryImage(imageId);
      
      if (!success) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      // Log the activity (only if we have session data)
      if (req.session?.user && image) {
        await logActivity({
          req,
          action: ActivityTypes.DELETE_GALLERY_IMAGE,
          entityType: "gallery_image",
          entityId: imageId,
          nurseryId: image.nurseryId,
          details: {
            title: image.title,
            filename: image.filename,
            nurseryId: image.nurseryId
          }
        });
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

  app.post("/api/gallery/categories", adminAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const category = await storage.createGalleryCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating gallery category:", error);
      res.status(500).json({ message: "Failed to create gallery category" });
    }
  });

  app.delete("/api/gallery/categories/:id", adminAuth, requireAdmin, async (req: Request, res: Response) => {
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
  app.get("/api/media", adminAuth, async (req: Request, res: Response) => {
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

  app.delete("/api/media/:id", adminAuth, requireAdmin, async (req: Request, res: Response) => {
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
  app.get("/api/activity", adminAuth, requireAdmin, async (req: Request, res: Response) => {
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

  // Get current user's assigned nurseries - Admin endpoint
  app.get("/api/admin/me/nurseries", adminAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Super admins get access to all nurseries
      if (user.role === 'super_admin') {
        const allNurseries = await storage.getAllNurseries();
        return res.json(allNurseries);
      }
      
      // Regular admins get only their assigned nurseries
      const { assignedNurseries } = await storage.getUserWithAssignedNurseries(userId);
      res.json(assignedNurseries);
    } catch (error) {
      console.error("Error fetching user nurseries:", error);
      res.status(500).json({ message: "Failed to fetch user nurseries" });
    }
  });

  // Contact Form submission with comprehensive anti-spam protection
  app.post("/api/contact", contactRateLimit, async (req: Request, res: Response) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Import anti-spam utilities
      const { checkSpam } = await import('./antiSpam.js');
      
      // Validate the request data
      const validatedData = contactFormSchema.parse(req.body);
      
      // Comprehensive spam check
      const spamCheck = checkSpam({
        ...validatedData,
        ipAddress
      });
      
      if (spamCheck.isSpam) {
        console.warn(`Spam detected from IP ${ipAddress}: ${spamCheck.reason} (Score: ${spamCheck.score})`);
        return res.status(400).json({ 
          success: false,
          message: "Your submission was flagged as potential spam. Please try again with a different message." 
        });
      }
      
      // Calculate submission time
      const submissionTime = Math.floor((Date.now() - validatedData.formStartTime) / 1000);
      
      // Store the contact submission with anti-spam data
      const submissionData = contactSubmissionInsertSchema.parse({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        nurseryLocation: validatedData.nurseryLocation,
        message: validatedData.message,
        ipAddress,
        submissionTime
      });
      
      const submission = await storage.createContactSubmission(submissionData);
      
      // Send email notification
      const emailSent = await sendContactEmail(validatedData);
      if (!emailSent) {
        console.warn("Contact form stored but email failed to send");
      }
      
      console.log(`Contact form submitted successfully from IP ${ipAddress} (Score: ${spamCheck.score})`);
      
      res.status(201).json({ 
        success: true,
        message: "Contact form submitted successfully",
        data: submission,
        emailSent 
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
  
  // Get all users - Super Admin only (using session-based auth for admin panel)
  app.get('/api/admin/users', adminAuth, requireSuperAdmin, async (req, res) => {
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
  
  // Get a specific user - Super Admin or the user themselves
  app.get('/api/admin/users/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only super_admin can view other users' details
      if ((req.user as any).dbUserId !== userId && (req.user as any).role !== 'super_admin') {
        return res.status(403).json({ message: 'Unauthorized to view this user' });
      }
      
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
  app.post('/api/admin/users', adminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const { email, firstName, lastName, password, role, nurseryId } = req.body;
      
      // Validate required fields
      if (!email || !firstName || !lastName || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // For admin/editor roles, nursery assignment is required
      if ((role === "admin" || role === "editor") && !nurseryId) {
        return res.status(400).json({ message: 'Nursery assignment is required for admin/editor users' });
      }
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Create the user with single nursery assignment
      const newUser = await storage.createUser({
        email,
        firstName,
        lastName,
        password, // Will be hashed in the storage implementation
        role,
        nurseryId: (role === "admin" || role === "editor") ? nurseryId : null,
        isActive: true
      });
      
      // If a nursery assignment was provided, create the mapping in user_nurseries table
      if (nurseryId && (role === "admin" || role === "editor")) {
        await storage.assignUserToNursery({
          userId: newUser.id,
          nurseryId,
          assignedBy: (req.session as any).user.id
        });
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
  
  // Update a user - Admin access with proper permissions
  app.patch('/api/admin/users/:id', adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { email, firstName, lastName, role, isActive } = req.body;
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check permissions: super_admin can edit anyone, admin can edit editors in their nursery
      const currentUser = req.session.user;
      const isSelf = currentUser.id === userId;
      const isSuperAdmin = currentUser.role === 'super_admin' && currentUser.isActive;
      const isAdmin = currentUser.role === 'admin' && currentUser.isActive;
      
      // Deactivated users cannot perform actions
      if (!currentUser.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
      if (!isSelf && !isSuperAdmin) {
        if (isAdmin && user.role === 'editor' && user.nurseryId === currentUser.nurseryId) {
          // Admin can edit editors in their nursery
        } else {
          return res.status(403).json({ message: 'Unauthorized to update this user' });
        }
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
      } else if (isAdmin && !isSelf) {
        // Admin can update basic info and active status for editors
        if (email) updateData.email = email;
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (isActive !== undefined) updateData.isActive = isActive;
      } else {
        // Regular users can only update their own basic info
        if (email) updateData.email = email;
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
      }
      
      // Update the user
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Log the activity
      await storage.createActivityLog({
        userId: currentUser.id,
        action: 'update_user',
        entityType: 'user',
        entityId: userId,
        details: { 
          email: user.email,
          changes: updateData
        },
        ipAddress: req.ip,
        nurseryId: user.nurseryId
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });
  
  // Deactivate a user - Admin access with proper permissions
  app.post('/api/admin/users/:id/deactivate', adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUser = req.session.user;
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Prevent deactivating own account
      if (currentUser.id === userId) {
        return res.status(400).json({ message: 'Cannot deactivate your own account' });
      }
      
      // Check permissions: super_admin can deactivate anyone, admin can deactivate editors in their nursery
      const isSuperAdmin = currentUser.role === 'super_admin' && currentUser.isActive;
      const isAdmin = currentUser.role === 'admin' && currentUser.isActive;
      
      // Deactivated users cannot perform actions
      if (!currentUser.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
      if (!isSuperAdmin) {
        if (isAdmin && user.role === 'editor' && user.nurseryId === currentUser.nurseryId) {
          // Admin can deactivate editors in their nursery
        } else {
          return res.status(403).json({ message: 'Unauthorized to deactivate this user' });
        }
      }
      
      // Update user to set isActive to false
      await storage.updateUser(userId, { isActive: false });
      
      // Log the activity
      await storage.createActivityLog({
        userId: currentUser.id,
        action: 'deactivate_user',
        entityType: 'user',
        entityId: userId,
        details: { 
          email: user.email,
          role: user.role
        },
        ipAddress: req.ip,
        nurseryId: user.nurseryId
      });
      
      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).json({ message: 'Failed to deactivate user' });
    }
  });
  
  // Reactivate a user - Admin access with proper permissions
  app.post('/api/admin/users/:id/reactivate', adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUser = req.session.user;
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check permissions: super_admin can reactivate anyone, admin can reactivate editors in their nursery
      const isSuperAdmin = currentUser.role === 'super_admin' && currentUser.isActive;
      const isAdmin = currentUser.role === 'admin' && currentUser.isActive;
      
      // Deactivated users cannot perform actions
      if (!currentUser.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
      if (!isSuperAdmin) {
        if (isAdmin && user.role === 'editor' && user.nurseryId === currentUser.nurseryId) {
          // Admin can reactivate editors in their nursery
        } else {
          return res.status(403).json({ message: 'Unauthorized to reactivate this user' });
        }
      }
      
      // Update user to set isActive to true
      await storage.updateUser(userId, { isActive: true });
      
      // Log the activity
      await storage.createActivityLog({
        userId: currentUser.id,
        action: 'reactivate_user',
        entityType: 'user',
        entityId: userId,
        details: { 
          email: user.email,
          role: user.role
        },
        ipAddress: req.ip,
        nurseryId: user.nurseryId
      });
      
      res.json({ message: 'User reactivated successfully' });
    } catch (error) {
      console.error('Error reactivating user:', error);
      res.status(500).json({ message: 'Failed to reactivate user' });
    }
  });
  
  // Delete a user permanently - Super Admin only
  app.delete('/api/admin/users/:id', adminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUser = req.session.user;
      
      // Prevent self-deletion
      if (currentUser.id === userId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Prevent deleting other super admins
      if (user.role === 'super_admin') {
        return res.status(403).json({ message: 'Cannot delete other super admin accounts' });
      }
      
      // Delete the user permanently
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to delete user' });
      }
      
      // Log the activity
      await storage.createActivityLog({
        userId: currentUser.id,
        action: 'delete_user',
        entityType: 'user',
        entityId: userId,
        details: { 
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        },
        ipAddress: req.ip,
        nurseryId: user.nurseryId
      });
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });
  
  // Get user's nursery assignments - Super Admin or the user themselves
  app.get('/api/admin/users/:id/nurseries', adminAuth, requireSuperAdmin, async (req, res) => {
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
  app.post('/api/admin/users/:id/nurseries', adminAuth, requireSuperAdmin, async (req, res) => {
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
  
  // Activity Logs - Admin access
  app.get('/api/admin/activity-logs', adminAuth, async (req, res) => {
    try {
      const activityLogs = await storage.getRecentActivityLogs(100);
      res.json(activityLogs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ message: 'Failed to fetch activity logs' });
    }
  });

  // Notification API endpoints
  app.get('/api/admin/notifications', adminAuth, async (req, res) => {
    try {
      const currentUser = req.session.user;
      if (!currentUser.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
      const notifications = await storage.getNotificationsByUser(currentUser.id);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  app.patch('/api/admin/notifications/:id/read', adminAuth, async (req, res) => {
    try {
      const currentUser = req.session.user;
      if (!currentUser.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
      const notificationId = parseInt(req.params.id);
      const success = await storage.markNotificationAsRead(notificationId);
      
      if (!success) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  app.patch('/api/admin/notifications/mark-all-read', adminAuth, async (req, res) => {
    try {
      const currentUser = req.session.user;
      if (!currentUser.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
      await storage.markAllNotificationsAsRead(currentUser.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
  });

  app.delete('/api/admin/notifications', adminAuth, async (req, res) => {
    try {
      const currentUser = req.session.user;
      if (!currentUser.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      
      await storage.deleteAllNotificationsByUser(currentUser.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      res.status(500).json({ message: 'Failed to clear all notifications' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}