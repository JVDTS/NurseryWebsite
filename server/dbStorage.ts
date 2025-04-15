import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import session from 'express-session';
import {
  users, User, InsertUser,
  nurseries, Nursery, InsertNursery,
  events, Event, InsertEvent,
  galleryImages, GalleryImage, InsertGalleryImage,
  newsletters, Newsletter, InsertNewsletter,
  contactSubmissions, ContactSubmission, InsertContact,
  activityLogs, ActivityLog, InsertActivityLog
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
    // Convert location string to the enum type
    const validLocations = ['hayes', 'uxbridge', 'hounslow'];
    if (!validLocations.includes(location)) {
      return undefined;
    }
    
    // Use SQL query with parameterized value for enum column
    const result = await drizzleDb.select().from(nurseries)
      .where(sql`location = ${location}`);
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
    const now = new Date();
    const result = await drizzleDb.insert(events)
      .values({
        ...insertEvent,
        createdAt: now,
        updatedAt: now
      })
      .returning();
      
    return result[0];
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await drizzleDb.update(events)
      .set({
        ...eventData,
        updatedAt: new Date()
      })
      .where(eq(events.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await drizzleDb.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  // Gallery methods
  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    const result = await drizzleDb.select().from(galleryImages).where(eq(galleryImages.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getGalleryImagesByNursery(nurseryId: number): Promise<GalleryImage[]> {
    return await drizzleDb.select().from(galleryImages).where(eq(galleryImages.nurseryId, nurseryId));
  }

  async createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage> {
    const result = await drizzleDb.insert(galleryImages)
      .values({
        ...insertImage,
        caption: insertImage.caption ?? null,
        createdAt: new Date()
      })
      .returning();
      
    return result[0];
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    const result = await drizzleDb.delete(galleryImages).where(eq(galleryImages.id, id)).returning();
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

  // Get all users for admin user management
  async getAllUsers(): Promise<User[]> {
    return await drizzleDb.select().from(users);
  }
  
  // Activity log methods
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const result = await drizzleDb.insert(activityLogs)
      .values({
        ...activity,
        resourceId: activity.resourceId || null,
        nurseryId: activity.nurseryId || null,
        nurseryName: activity.nurseryName || null,
        createdAt: new Date()
      })
      .returning();
      
    return result[0];
  }
  
  async getActivityLogs(): Promise<ActivityLog[]> {
    return await drizzleDb.select().from(activityLogs)
      .orderBy(sql`${activityLogs.createdAt} DESC`);
  }
  
  async getActivityLogsByUser(userId: number): Promise<ActivityLog[]> {
    return await drizzleDb.select().from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(sql`${activityLogs.createdAt} DESC`);
  }
  
  async getActivityLogsByNursery(nurseryId: number): Promise<ActivityLog[]> {
    return await drizzleDb.select().from(activityLogs)
      .where(eq(activityLogs.nurseryId, nurseryId))
      .orderBy(sql`${activityLogs.createdAt} DESC`);
  }
}