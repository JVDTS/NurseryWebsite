import { Express, Request, Response } from 'express';
import { storage } from './storage';
import { isAuthenticated, hasRole } from './replitAuth';

/**
 * CMS-like API routes for content management
 * Provides Strapi-like functionality for managing nursery content
 */
export async function registerCMSRoutes(app: Express): Promise<void> {
  
  // Nursery content endpoints (public access)
  app.get("/api/cms/nurseries/slug/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const nursery = await storage.getNurseryByLocation(slug);
      
      if (!nursery) {
        return res.status(404).json({ error: 'Nursery not found' });
      }

      // Get related content
      const [newsletters, events, galleryImages] = await Promise.all([
        storage.getNewslettersByNursery(nursery.id),
        storage.getEventsByNursery(nursery.id),
        storage.getGalleryImagesByNursery(nursery.id)
      ]);

      res.json({
        data: {
          ...nursery,
          newsletters,
          events,
          galleryImages
        }
      });
    } catch (error) {
      console.error('Error fetching nursery by slug:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Newsletters by nursery slug
  app.get("/api/cms/nurseries/slug/:slug/newsletters", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const nursery = await storage.getNurseryByLocation(slug);
      
      if (!nursery) {
        return res.status(404).json({ error: 'Nursery not found' });
      }

      const newsletters = await storage.getNewslettersByNursery(nursery.id);
      res.json({ data: newsletters });
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Gallery images by nursery slug
  app.get("/api/cms/nurseries/slug/:slug/gallery", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const { category, featured } = req.query;
      
      const nursery = await storage.getNurseryByLocation(slug);
      
      if (!nursery) {
        return res.status(404).json({ error: 'Nursery not found' });
      }

      const filters: any = { nurseryId: nursery.id };
      
      if (category) {
        filters.category = category;
      }

      let galleryImages = await storage.getGalleryImages(filters);

      if (featured === 'true') {
        galleryImages = galleryImages.filter(img => img.featured);
      }

      res.json({ data: galleryImages });
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Events by nursery slug
  app.get("/api/cms/nurseries/slug/:slug/events", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const { status, upcoming } = req.query;
      
      const nursery = await storage.getNurseryByLocation(slug);
      
      if (!nursery) {
        return res.status(404).json({ error: 'Nursery not found' });
      }

      let events = await storage.getEventsByNursery(nursery.id);

      if (status) {
        events = events.filter(event => event.status === status);
      }

      if (upcoming === 'true') {
        const now = new Date();
        events = events.filter(event => new Date(event.date) >= now);
      }

      // Sort by date
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      res.json({ data: events });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // CMS Management endpoints (authenticated access only)
  
  // Create newsletter (nursery managers can only create for their assigned nursery)
  app.post("/api/cms/newsletters", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { title, content, month, year, nurseryId, pdfPath } = req.body;

      // Check if user can manage this nursery
      if (user.role !== 'super_admin' && user.assignedNurseryId && user.assignedNurseryId !== nurseryId) {
        return res.status(403).json({ error: 'Access denied to this nursery' });
      }

      const newsletter = await storage.createNewsletter({
        title,
        content,
        month,
        year,
        nurseryId,
        pdfPath,
        createdBy: user.id
      });

      res.status(201).json({ data: newsletter });
    } catch (error) {
      console.error('Error creating newsletter:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create gallery image
  app.post("/api/cms/gallery-images", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { title, description, filename, categoryId, nurseryId, featured } = req.body;

      // Check if user can manage this nursery
      if (user.role !== 'super_admin' && user.assignedNurseryId && user.assignedNurseryId !== nurseryId) {
        return res.status(403).json({ error: 'Access denied to this nursery' });
      }

      const galleryImage = await storage.createGalleryImage({
        title,
        description,
        filename,
        categoryId,
        nurseryId,
        featured: featured || false,
        uploadedBy: user.id,
        status: 'approved'
      });

      res.status(201).json({ data: galleryImage });
    } catch (error) {
      console.error('Error creating gallery image:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create event
  app.post("/api/cms/events", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { title, description, date, location, eventType, maxParticipants, registrationRequired, nurseryId } = req.body;

      // Check if user can manage this nursery
      if (user.role !== 'super_admin' && user.assignedNurseryId && user.assignedNurseryId !== nurseryId) {
        return res.status(403).json({ error: 'Access denied to this nursery' });
      }

      const event = await storage.createEvent({
        title,
        description,
        date: new Date(date),
        location,
        eventType,
        maxParticipants,
        registrationRequired: registrationRequired || false,
        nurseryId,
        createdBy: user.id,
        status: 'scheduled'
      });

      res.status(201).json({ data: event });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update newsletter
  app.put("/api/cms/newsletters/:id", isAuthenticated, hasRole(["super_admin", "admin", "editor"]), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const updateData = req.body;

      // Get existing newsletter to check permissions
      const existingNewsletter = await storage.getNewsletter(parseInt(id));
      if (!existingNewsletter) {
        return res.status(404).json({ error: 'Newsletter not found' });
      }

      // Check if user can manage this nursery
      if (user.role !== 'super_admin' && user.assignedNurseryId && user.assignedNurseryId !== existingNewsletter.nurseryId) {
        return res.status(403).json({ error: 'Access denied to this nursery' });
      }

      const newsletter = await storage.updateNewsletter(parseInt(id), updateData);
      res.json({ data: newsletter });
    } catch (error) {
      console.error('Error updating newsletter:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete newsletter
  app.delete("/api/cms/newsletters/:id", isAuthenticated, hasRole(["super_admin", "admin"]), async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      // Get existing newsletter to check permissions
      const existingNewsletter = await storage.getNewsletter(parseInt(id));
      if (!existingNewsletter) {
        return res.status(404).json({ error: 'Newsletter not found' });
      }

      // Check if user can manage this nursery
      if (user.role !== 'super_admin' && user.assignedNurseryId && user.assignedNurseryId !== existingNewsletter.nurseryId) {
        return res.status(403).json({ error: 'Access denied to this nursery' });
      }

      const success = await storage.deleteNewsletter(parseInt(id));
      if (success) {
        res.json({ message: 'Newsletter deleted successfully' });
      } else {
        res.status(404).json({ error: 'Newsletter not found' });
      }
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // List all content for management (filtered by user permissions)
  app.get("/api/cms/content", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { type, nurseryId } = req.query;

      let targetNurseryId = nurseryId ? parseInt(nurseryId as string) : undefined;

      // If user is nursery manager, restrict to their assigned nursery
      if (user.role !== 'super_admin' && user.assignedNurseryId) {
        targetNurseryId = user.assignedNurseryId;
      }

      let content: any = {};

      if (!type || type === 'newsletters') {
        content.newsletters = targetNurseryId ? 
          await storage.getNewslettersByNursery(targetNurseryId) :
          await storage.getAllNewsletters();
      }

      if (!type || type === 'events') {
        content.events = targetNurseryId ?
          await storage.getEventsByNursery(targetNurseryId) :
          await storage.getAllEvents();
      }

      if (!type || type === 'gallery') {
        content.galleryImages = targetNurseryId ?
          await storage.getGalleryImagesByNursery(targetNurseryId) :
          await storage.getGalleryImages({});
      }

      res.json({ data: content });
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}