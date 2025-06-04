import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, sql, and, or, desc, ilike, isNull, inArray } from 'drizzle-orm';
import session from 'express-session';
import {
  users, User, InsertUser,
  nurseries, Nursery, InsertNursery,
  events, Event, InsertEvent,
  galleryImages, GalleryImage, InsertGalleryImage,
  galleryCategories, GalleryCategory, InsertGalleryCategory,
  newsletters, Newsletter, InsertNewsletter,
  contactSubmissions, ContactSubmission, InsertContact
} from '../shared/schema';
import { IStorage } from './storage';
import { hashPassword } from './security';
import { db, pool } from './db'; // Import the existing db instance and pool

// Create the Drizzle instance - use the shared db instance from db.ts
const drizzleDb = db;

export class DbStorage implements IStorage {
  // Session store for authentication
  public sessionStore: any; // Using any type to avoid express-session typing issues

  constructor() {
    // Initialize the session store using PostgreSQL
    const PgSessionStore = require('connect-pg-simple')(session);
    // Use the imported pool from db.ts
    this.sessionStore = new PgSessionStore({
      pool, 
      tableName: 'session'  // Uses a session table in PostgreSQL
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await drizzleDb.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await drizzleDb.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await drizzleDb.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await hashPassword(insertUser.password);
    
    const result = await drizzleDb.insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
      
    return result[0];
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await hashPassword(userData.password);
    }
    
    const result = await drizzleDb.update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  // Nursery methods
  async getNursery(id: number): Promise<Nursery | undefined> {
    const result = await drizzleDb.select().from(nurseries).where(eq(nurseries.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getNurseryByLocation(location: string): Promise<Nursery | undefined> {
    // Convert location string to lowercase for validation
    const locationLower = location.toLowerCase();
    const validLocations = ['hayes', 'uxbridge', 'hounslow'];
    if (!validLocations.includes(locationLower)) {
      return undefined;
    }
    
    // Create a capitalized version for proper case matching (Hayes, Uxbridge, Hounslow)
    const capitalizedLocation = locationLower.charAt(0).toUpperCase() + locationLower.slice(1);
    
    // Use SQL query with case-insensitive comparison
    const result = await drizzleDb.select().from(nurseries)
      .where(eq(nurseries.location, capitalizedLocation));
    return result.length > 0 ? result[0] : undefined;
  }

  async getAllNurseries(): Promise<Nursery[]> {
    return await drizzleDb.select().from(nurseries);
  }

  async createNursery(insertNursery: InsertNursery): Promise<Nursery> {
    const now = new Date();
    const result = await drizzleDb.insert(nurseries)
      .values({
        ...insertNursery,
        createdAt: insertNursery.createdAt || now,
        updatedAt: insertNursery.updatedAt || now
      })
      .returning();
      
    return result[0];
  }

  async updateNursery(id: number, nurseryData: Partial<InsertNursery>): Promise<Nursery | undefined> {
    const result = await drizzleDb.update(nurseries)
      .set({
        ...nurseryData,
        updatedAt: new Date()
      })
      .where(eq(nurseries.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    const result = await drizzleDb.select().from(events).where(eq(events.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getEventsByNursery(nurseryId: number): Promise<Event[]> {
    return await drizzleDb.select().from(events).where(eq(events.nurseryId, nurseryId));
  }

  async getAllEvents(): Promise<Event[]> {
    return await drizzleDb.select().from(events);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await drizzleDb.insert(events)
      .values({
        ...insertEvent
      })
      .returning();
      
    return result[0];
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await drizzleDb.update(events)
      .set({
        ...eventData
      })
      .where(eq(events.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await drizzleDb.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  // Enhanced Gallery methods with Strapi-like functionality
  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    const result = await drizzleDb.select({
      image: galleryImages,
      category: galleryCategories,
      uploader: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(galleryImages)
    .leftJoin(galleryCategories, eq(galleryImages.categoryId, galleryCategories.id))
    .leftJoin(users, eq(galleryImages.uploadedBy, users.id))
    .where(eq(galleryImages.id, id));
    
    if (result.length === 0) return undefined;
    
    const row = result[0];
    return {
      ...row.image,
      category: row.category,
      uploader: row.uploader
    };
  }

  async getGalleryImages(filters: {
    nurseryId?: number;
    status?: string;
    categoryId?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<GalleryImage[]> {
    let query = drizzleDb.select({
      image: galleryImages,
      category: galleryCategories,
      uploader: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(galleryImages)
    .leftJoin(galleryCategories, eq(galleryImages.categoryId, galleryCategories.id))
    .leftJoin(users, eq(galleryImages.uploadedBy, users.id));

    const conditions = [];
    
    if (filters.nurseryId) {
      conditions.push(eq(galleryImages.nurseryId, filters.nurseryId));
    }
    
    if (filters.status) {
      conditions.push(eq(galleryImages.status, filters.status));
    }
    
    if (filters.categoryId) {
      conditions.push(eq(galleryImages.categoryId, filters.categoryId));
    }
    
    if (filters.featured !== undefined) {
      conditions.push(eq(galleryImages.featured, filters.featured));
    }
    
    if (filters.search) {
      conditions.push(ilike(galleryImages.title, `%${filters.search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(galleryImages.sortOrder), desc(galleryImages.createdAt));

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const result = await query;
    
    return result.map(row => ({
      ...row.image,
      category: row.category,
      uploader: row.uploader
    }));
  }

  async getGalleryImagesByNursery(nurseryId: number): Promise<GalleryImage[]> {
    return this.getGalleryImages({ nurseryId, status: "published" });
  }

  async createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage> {
    const result = await drizzleDb.insert(galleryImages)
      .values({
        ...insertImage
      })
      .returning();
      
    return result[0];
  }

  async updateGalleryImage(id: number, imageData: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined> {
    const result = await drizzleDb.update(galleryImages)
      .set({
        ...imageData,
        updatedAt: new Date()
      })
      .where(eq(galleryImages.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    const result = await drizzleDb.delete(galleryImages).where(eq(galleryImages.id, id)).returning();
    return result.length > 0;
  }

  async bulkUpdateGalleryImages(ids: number[], updateData: Partial<InsertGalleryImage>): Promise<GalleryImage[]> {
    const result = await drizzleDb.update(galleryImages)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(inArray(galleryImages.id, ids))
      .returning();
      
    return result;
  }

  // Gallery Categories methods
  async getGalleryCategory(id: number): Promise<GalleryCategory | undefined> {
    const result = await drizzleDb.select().from(galleryCategories).where(eq(galleryCategories.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getGalleryCategories(nurseryId?: number): Promise<GalleryCategory[]> {
    let query = drizzleDb.select().from(galleryCategories);
    
    if (nurseryId) {
      query = query.where(or(
        eq(galleryCategories.nurseryId, nurseryId),
        isNull(galleryCategories.nurseryId) // Global categories
      ));
    }
    
    return await query.where(eq(galleryCategories.isActive, true))
      .orderBy(galleryCategories.sortOrder, galleryCategories.name);
  }

  async createGalleryCategory(insertCategory: InsertGalleryCategory): Promise<GalleryCategory> {
    const result = await drizzleDb.insert(galleryCategories)
      .values({
        ...insertCategory
      })
      .returning();
      
    return result[0];
  }

  async updateGalleryCategory(id: number, categoryData: Partial<InsertGalleryCategory>): Promise<GalleryCategory | undefined> {
    const result = await drizzleDb.update(galleryCategories)
      .set({
        ...categoryData,
        updatedAt: new Date()
      })
      .where(eq(galleryCategories.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteGalleryCategory(id: number): Promise<boolean> {
    const result = await drizzleDb.delete(galleryCategories).where(eq(galleryCategories.id, id)).returning();
    return result.length > 0;
  }

  // Newsletter methods
  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    const result = await drizzleDb.select().from(newsletters).where(eq(newsletters.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getNewslettersByNursery(nurseryId: number): Promise<Newsletter[]> {
    return await drizzleDb.select().from(newsletters).where(eq(newsletters.nurseryId, nurseryId));
  }

  async getAllNewsletters(): Promise<Newsletter[]> {
    return await drizzleDb.select().from(newsletters);
  }

  async createNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    const now = new Date();
    const result = await drizzleDb.insert(newsletters)
      .values({
        ...insertNewsletter,
        pdfUrl: insertNewsletter.pdfUrl ?? null,
        publishDate: insertNewsletter.publishDate ?? now,
        tags: insertNewsletter.tags ?? null,
        createdAt: now,
        updatedAt: now
      })
      .returning();
      
    return result[0];
  }

  async updateNewsletter(id: number, newsletterData: Partial<InsertNewsletter>): Promise<Newsletter | undefined> {
    const result = await drizzleDb.update(newsletters)
      .set({
        ...newsletterData,
        updatedAt: new Date()
      })
      .where(eq(newsletters.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteNewsletter(id: number): Promise<boolean> {
    const result = await drizzleDb.delete(newsletters).where(eq(newsletters.id, id)).returning();
    return result.length > 0;
  }

  // Contact methods
  async createContactSubmission(contact: InsertContact): Promise<ContactSubmission> {
    const result = await drizzleDb.insert(contactSubmissions)
      .values({
        ...contact,
        phone: contact.phone ?? null,
        createdAt: new Date().toISOString()
      })
      .returning();
      
    return result[0];
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await drizzleDb.select().from(contactSubmissions);
  }
}