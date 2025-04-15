import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
const { Pool } = pg;
import session from 'express-session';
import pgSessionStoreFactory from 'connect-pg-simple';
import { 
  users, User, InsertUser,
  nurseries, Nursery, InsertNursery,
  events, Event, InsertEvent,
  galleryImages, GalleryImage, InsertGalleryImage,
  newsletters, Newsletter, InsertNewsletter,
  contactSubmissions, ContactSubmission, InsertContact,
  activityLogs, ActivityLog, InsertActivityLog 
} from '../shared/schema';
import { eq, sql } from 'drizzle-orm';
import { IStorage } from './storage';
import { hashPassword } from './security';
import { MemStorage } from './storage';

// Database connection setup 
let pool: Pool | null = null;
let db: any = null;

// Initialize database connections
export function initializeDatabase() {
  try {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      console.error('DATABASE_URL is not defined. PostgreSQL database will not be available.');
      return false;
    } else {
      console.log('Connecting to PostgreSQL database...');
      
      // Create the connection pool
      pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false // Required for some cloud PostgreSQL providers like Neon
        }
      });
      
      // Set up error handling for the pool
      pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
      });
      
      // Test the connection
      pool.query('SELECT 1')
        .then(async () => {
          console.log('PostgreSQL database connection successful!');
          
          // After successful connection, make sure tables exist
          try {
            await createTablesIfNotExist();
          } catch (err) {
            console.error('Error creating database tables:', err);
          }
        })
        .catch((err) => {
          console.error('Error testing PostgreSQL connection:', err);
        });
        
      // Create the Drizzle instance
      db = drizzle(pool);
      return true;
    }
  } catch (error) {
    console.error('Failed to initialize PostgreSQL connection:', error);
    return false;
  }
}

// Function to create tables if they don't exist
async function createTablesIfNotExist() {
  if (!pool) return;
  
  try {
    // Create session table for connect-pg-simple if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" VARCHAR NOT NULL,
        "sess" JSON NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);
    
    // Check if users table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    // Only run migrations if tables don't exist
    if (!result.rows[0].exists) {
      console.log('Tables do not exist, running database migrations...');
      
      // Create users table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" SERIAL PRIMARY KEY,
          "username" VARCHAR(255) NOT NULL UNIQUE,
          "password" VARCHAR(255) NOT NULL,
          "first_name" VARCHAR(255) NOT NULL,
          "last_name" VARCHAR(255) NOT NULL,
          "email" VARCHAR(255) NOT NULL UNIQUE,
          "role" VARCHAR(50) NOT NULL DEFAULT 'regular',
          "nursery_id" INTEGER,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
      `);
      
      // Create nurseries table
      await pool.query(`
        CREATE TYPE nursery_location AS ENUM ('hayes', 'uxbridge', 'hounslow');
        
        CREATE TABLE IF NOT EXISTS "nurseries" (
          "id" SERIAL PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "location" nursery_location NOT NULL,
          "address" TEXT NOT NULL,
          "phone_number" VARCHAR(50) NOT NULL,
          "email" VARCHAR(255) NOT NULL,
          "description" TEXT NOT NULL,
          "hero_image" TEXT,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
      `);
      
      // Create events table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "events" (
          "id" SERIAL PRIMARY KEY,
          "title" VARCHAR(255) NOT NULL,
          "description" TEXT NOT NULL,
          "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
          "end_date" TIMESTAMP WITH TIME ZONE,
          "location" VARCHAR(255),
          "image_url" TEXT,
          "nursery_id" INTEGER NOT NULL,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          CONSTRAINT "events_nursery_id_fkey" FOREIGN KEY ("nursery_id") REFERENCES "nurseries" ("id")
        )
      `);
      
      // Create gallery_images table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "gallery_images" (
          "id" SERIAL PRIMARY KEY,
          "image_url" VARCHAR(255) NOT NULL,
          "caption" TEXT,
          "nursery_id" INTEGER NOT NULL,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          CONSTRAINT "gallery_images_nursery_id_fkey" FOREIGN KEY ("nursery_id") REFERENCES "nurseries" ("id")
        )
      `);
      
      // Create newsletters table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "newsletters" (
          "id" SERIAL PRIMARY KEY,
          "title" VARCHAR(255) NOT NULL,
          "description" TEXT NOT NULL,
          "pdf_url" TEXT,
          "publish_date" TIMESTAMP WITH TIME ZONE,
          "tags" TEXT,
          "nursery_id" INTEGER NOT NULL,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          CONSTRAINT "newsletters_nursery_id_fkey" FOREIGN KEY ("nursery_id") REFERENCES "nurseries" ("id")
        )
      `);
      
      // Create contact_submissions table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "contact_submissions" (
          "id" SERIAL PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "email" VARCHAR(255) NOT NULL,
          "phone" VARCHAR(50),
          "nursery_location" nursery_location NOT NULL,
          "message" TEXT NOT NULL,
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
      `);
      
      // Create activity_logs table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "activity_logs" (
          "id" SERIAL PRIMARY KEY,
          "user_id" INTEGER NOT NULL,
          "user_name" VARCHAR(255) NOT NULL,
          "action" VARCHAR(255) NOT NULL,
          "resource_type" VARCHAR(255) NOT NULL,
          "resource_id" INTEGER,
          "details" TEXT NOT NULL,
          "nursery_id" INTEGER,
          "nursery_name" VARCHAR(255),
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id")
        )
      `);
      
      console.log('Database tables created successfully!');
    } else {
      console.log('Database tables already exist.');
    }
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
}

// PostgreSQL implementation of storage interface
export class DbStorage implements IStorage {
  // Session store for authentication
  public sessionStore: any; // Using any type to avoid express-session typing issues

  constructor() {
    if (!pool) {
      throw new Error('Database pool not initialized');
    }

    // Initialize the session store using PostgreSQL
    const PgSessionStore = pgSessionStoreFactory(session);
    // Use the imported pool from db.ts
    this.sessionStore = new PgSessionStore({
      pool, 
      tableName: 'session'  // Uses a session table in PostgreSQL
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await hashPassword(insertUser.password);
    
    const result = await db.insert(users)
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
    
    const result = await db.update(users)
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
    const result = await db.select().from(nurseries).where(eq(nurseries.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getNurseryByLocation(location: string): Promise<Nursery | undefined> {
    // Convert location string to the enum type
    const validLocations = ['hayes', 'uxbridge', 'hounslow'];
    if (!validLocations.includes(location)) {
      return undefined;
    }
    
    // Use SQL query with parameterized value for enum column
    const result = await db.select().from(nurseries)
      .where(sql`location = ${location}`);
    return result.length > 0 ? result[0] : undefined;
  }

  async getAllNurseries(): Promise<Nursery[]> {
    return await db.select().from(nurseries);
  }

  async createNursery(insertNursery: InsertNursery): Promise<Nursery> {
    const now = new Date();
    const result = await db.insert(nurseries)
      .values({
        ...insertNursery,
        createdAt: insertNursery.createdAt || now,
        updatedAt: insertNursery.updatedAt || now
      })
      .returning();
      
    return result[0];
  }

  async updateNursery(id: number, nurseryData: Partial<InsertNursery>): Promise<Nursery | undefined> {
    const result = await db.update(nurseries)
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
    const result = await db.select().from(events).where(eq(events.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getEventsByNursery(nurseryId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.nurseryId, nurseryId));
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const now = new Date();
    const result = await db.insert(events)
      .values({
        ...insertEvent,
        createdAt: now,
        updatedAt: now
      })
      .returning();
      
    return result[0];
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events)
      .set({
        ...eventData,
        updatedAt: new Date()
      })
      .where(eq(events.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  // Gallery methods
  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    const result = await db.select().from(galleryImages).where(eq(galleryImages.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getGalleryImagesByNursery(nurseryId: number): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).where(eq(galleryImages.nurseryId, nurseryId));
  }

  async createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage> {
    const result = await db.insert(galleryImages)
      .values({
        ...insertImage,
        caption: insertImage.caption ?? null,
        createdAt: new Date()
      })
      .returning();
      
    return result[0];
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    const result = await db.delete(galleryImages).where(eq(galleryImages.id, id)).returning();
    return result.length > 0;
  }

  // Newsletter methods
  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    const result = await db.select().from(newsletters).where(eq(newsletters.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getNewslettersByNursery(nurseryId: number): Promise<Newsletter[]> {
    return await db.select().from(newsletters).where(eq(newsletters.nurseryId, nurseryId));
  }

  async getAllNewsletters(): Promise<Newsletter[]> {
    return await db.select().from(newsletters);
  }

  async createNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    const now = new Date();
    const result = await db.insert(newsletters)
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
    const result = await db.update(newsletters)
      .set({
        ...newsletterData,
        updatedAt: new Date()
      })
      .where(eq(newsletters.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteNewsletter(id: number): Promise<boolean> {
    const result = await db.delete(newsletters).where(eq(newsletters.id, id)).returning();
    return result.length > 0;
  }

  // Contact methods
  async createContactSubmission(contact: InsertContact): Promise<ContactSubmission> {
    const result = await db.insert(contactSubmissions)
      .values({
        ...contact,
        phone: contact.phone ?? null,
        createdAt: contact.createdAt || new Date()
      })
      .returning();
      
    return result[0];
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions);
  }

  // Get all users for admin user management
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  // Activity log methods
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const result = await db.insert(activityLogs)
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
    return await db.select().from(activityLogs)
      .orderBy(sql`${activityLogs.createdAt} DESC`);
  }
  
  async getActivityLogsByUser(userId: number): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(sql`${activityLogs.createdAt} DESC`);
  }
  
  async getActivityLogsByNursery(nurseryId: number): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs)
      .where(eq(activityLogs.nurseryId, nurseryId))
      .orderBy(sql`${activityLogs.createdAt} DESC`);
  }
}

// Get appropriate storage implementation
export function getStorage(): IStorage {
  if (db && pool) {
    try {
      console.log('Using PostgreSQL database storage');
      return new DbStorage();
    } catch (error) {
      console.error('Error initializing DbStorage, falling back to in-memory storage:', error);
    }
  }
  
  console.log('Using in-memory storage');
  return new MemStorage();
}