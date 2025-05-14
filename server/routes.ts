import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hasRole } from "./replitAuth";
import { contactFormSchema } from "@shared/schema";
import { z } from "zod";

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
      
      // For email login
      let user = await storage.getUserByEmail(username);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }
      
      // Compare password (using bcrypt)
      const { comparePassword } = await import('./security');
      const passwordMatch = await comparePassword(password, user.password);
      
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
  
  app.get("/api/admin/me", (req, res) => {
    if (req.session.user) {
      res.json({ 
        success: true, 
        user: req.session.user 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
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
      const nursery = await storage.getNurseryByLocation(req.params.location);
      
      if (!nursery) {
        return res.status(404).json({ message: "Nursery not found" });
      }
      
      res.json(nursery);
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
      const nursery = await storage.getNurseryByLocation(req.params.location);
      
      if (!nursery) {
        return res.status(404).json({ message: "Nursery not found" });
      }
      
      const events = await storage.getEventsByNursery(nursery.id);
      res.json(events);
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
      const nursery = await storage.getNurseryByLocation(req.params.location);
      
      if (!nursery) {
        return res.status(404).json({ message: "Nursery not found" });
      }
      
      const gallery = await storage.getMediaByNursery(nursery.id);
      res.json(gallery);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  // Newsletter API
  app.get("/api/nurseries/:location/newsletters", async (req: Request, res: Response) => {
    try {
      const nursery = await storage.getNurseryByLocation(req.params.location);
      
      if (!nursery) {
        return res.status(404).json({ message: "Nursery not found" });
      }
      
      const newsletters = await storage.getNewslettersByNursery(nursery.id);
      res.json(newsletters);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });

  app.get("/api/newsletters", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const newsletters = await storage.getAllNewsletters();
      res.json(newsletters);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      res.status(500).json({ message: "Failed to fetch newsletters" });
    }
  });

  app.post("/api/newsletters", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
    try {
      const newsletter = await storage.createNewsletter(req.body);
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
      const user = await storage.createUser(req.body);
      
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
      const user = await storage.updateUser(userId, req.body);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", isAuthenticated, hasRole(["super_admin"]), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
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

  app.post("/api/media", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
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
      const logs = await storage.getRecentActivityLogs();
      res.json(logs);
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
  const httpServer = createServer(app);
  return httpServer;
}