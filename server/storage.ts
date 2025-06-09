import { db } from './db';
import { eq, and, desc, or, like, isNull, sql } from 'drizzle-orm';
import { 
  users, User, InsertUser,
  userNurseries, UserNursery, InsertUserNursery,
  nurseries, Nursery, InsertNursery,
  events, Event, InsertEvent,
  newsletters, Newsletter, InsertNewsletter,
  galleryImages, GalleryImage, InsertGalleryImage,
  activityLogs, ActivityLog, InsertActivityLog,
  contactSubmissions, ContactSubmission, InsertContact
} from '@shared/schema';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  getUserWithAssignedNurseries(userId: number): Promise<{ user: User | undefined; assignedNurseries: Nursery[] }>;

  // Nursery operations
  getNursery(id: number): Promise<Nursery | undefined>;
  getNurseryByLocation(location: string): Promise<Nursery | undefined>;
  getAllNurseries(): Promise<Nursery[]>;
  createNursery(insertNursery: InsertNursery): Promise<Nursery>;
  updateNursery(id: number, nurseryData: Partial<InsertNursery>): Promise<Nursery | undefined>;

  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByNursery(nurseryId: number): Promise<Event[]>;
  getAllEvents(): Promise<Event[]>;
  createEvent(insertEvent: InsertEvent): Promise<Event>;
  updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Gallery operations
  getGalleryImage(id: number): Promise<GalleryImage | undefined>;
  getGalleryImagesByNursery(nurseryId: number): Promise<GalleryImage[]>;
  createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage>;
  deleteGalleryImage(id: number): Promise<boolean>;

  // Newsletter operations
  getNewsletter(id: number): Promise<Newsletter | undefined>;
  getNewslettersByNursery(nurseryId: number): Promise<Newsletter[]>;
  getAllNewsletters(): Promise<Newsletter[]>;
  createNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter>;
  updateNewsletter(id: number, newsletterData: Partial<InsertNewsletter>): Promise<Newsletter | undefined>;
  deleteNewsletter(id: number): Promise<boolean>;

  // Contact operations
  createContactSubmission(contact: InsertContact): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;

  // Activity logs
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(): Promise<ActivityLog[]>;
}

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getUserWithAssignedNurseries(userId: number): Promise<{ user: User | undefined; assignedNurseries: Nursery[] }> {
    const user = await this.getUser(userId);
    const assignedNurseries = await db
      .select({ nursery: nurseries })
      .from(userNurseries)
      .innerJoin(nurseries, eq(userNurseries.nurseryId, nurseries.id))
      .where(eq(userNurseries.userId, userId));
    
    return {
      user,
      assignedNurseries: assignedNurseries.map(result => result.nursery)
    };
  }

  // Nursery operations
  async getNursery(id: number): Promise<Nursery | undefined> {
    const result = await db.select().from(nurseries).where(eq(nurseries.id, id));
    return result[0];
  }

  async getNurseryByLocation(location: string): Promise<Nursery | undefined> {
    const result = await db.select().from(nurseries).where(eq(nurseries.location, location));
    return result[0];
  }

  async getAllNurseries(): Promise<Nursery[]> {
    return await db.select().from(nurseries).orderBy(nurseries.name);
  }

  async createNursery(insertNursery: InsertNursery): Promise<Nursery> {
    const result = await db.insert(nurseries).values(insertNursery).returning();
    return result[0];
  }

  async updateNursery(id: number, nurseryData: Partial<InsertNursery>): Promise<Nursery | undefined> {
    const result = await db.update(nurseries)
      .set({ ...nurseryData, updatedAt: new Date() })
      .where(eq(nurseries.id, id))
      .returning();
    return result[0];
  }

  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0];
  }

  async getEventsByNursery(nurseryId: number): Promise<Event[]> {
    return await db.select().from(events)
      .where(eq(events.nurseryId, nurseryId))
      .orderBy(desc(events.startDate));
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.startDate));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(insertEvent).returning();
    return result[0];
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events)
      .set({ ...eventData, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return result[0];
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount! > 0;
  }

  // Gallery operations
  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    const result = await db.select().from(galleryImages).where(eq(galleryImages.id, id));
    return result[0];
  }

  async getGalleryImagesByNursery(nurseryId: number): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages)
      .where(eq(galleryImages.nurseryId, nurseryId))
      .orderBy(desc(galleryImages.createdAt));
  }

  async createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage> {
    const result = await db.insert(galleryImages).values(insertImage).returning();
    return result[0];
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    const result = await db.delete(galleryImages).where(eq(galleryImages.id, id));
    return result.rowCount! > 0;
  }

  // Newsletter operations
  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    const result = await db.select().from(newsletters).where(eq(newsletters.id, id));
    return result[0];
  }

  async getNewslettersByNursery(nurseryId: number): Promise<Newsletter[]> {
    return await db.select().from(newsletters)
      .where(eq(newsletters.nurseryId, nurseryId))
      .orderBy(desc(newsletters.createdAt));
  }

  async getAllNewsletters(): Promise<Newsletter[]> {
    return await db.select().from(newsletters).orderBy(desc(newsletters.createdAt));
  }

  async createNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    const result = await db.insert(newsletters).values(insertNewsletter).returning();
    return result[0];
  }

  async updateNewsletter(id: number, newsletterData: Partial<InsertNewsletter>): Promise<Newsletter | undefined> {
    const result = await db.update(newsletters)
      .set({ ...newsletterData, updatedAt: new Date() })
      .where(eq(newsletters.id, id))
      .returning();
    return result[0];
  }

  async deleteNewsletter(id: number): Promise<boolean> {
    const result = await db.delete(newsletters).where(eq(newsletters.id, id));
    return result.rowCount! > 0;
  }

  // Contact operations
  async createContactSubmission(contact: InsertContact): Promise<ContactSubmission> {
    const result = await db.insert(contactSubmissions).values(contact).returning();
    return result[0];
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  // Activity logging
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const result = await db.insert(activityLogs).values(activity).returning();
    return result[0];
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));
  }
}

export const storage = new DbStorage();