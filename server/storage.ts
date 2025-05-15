import { db } from './db';
import { eq, and, desc, or, like, isNull } from 'drizzle-orm';
import { 
  users, User, InsertUser,
  nurseries, Nursery, InsertNursery,
  events, Event, InsertEvent,
  newsletters, Newsletter, InsertNewsletter,
  posts, Post, InsertPost,
  mediaLibrary, MediaItem, InsertMediaItem,
  galleryImages, GalleryImage, InsertGalleryImage,
  galleryCategories, GalleryCategory, InsertGalleryCategory,
  activityLogs, ActivityLog, InsertActivityLog,
  invitations, Invitation, InsertInvitation,
  contactSubmissions, ContactSubmission, InsertContact
} from '../shared/schema';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// Interface for storage operations
export interface IStorage {
  // Session store for express-session
  sessionStore: any;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByNursery(nurseryId: number): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;

  // Nursery operations
  getNursery(id: number): Promise<Nursery | undefined>;
  getNurseryByLocation(location: string): Promise<Nursery | undefined>;
  getAllNurseries(): Promise<Nursery[]>;
  createNursery(nursery: InsertNursery): Promise<Nursery>;
  updateNursery(id: number, nurseryData: Partial<Nursery>): Promise<Nursery | undefined>;
  deleteNursery(id: number): Promise<boolean>;

  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByNursery(nurseryId: number): Promise<Event[]>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Newsletter operations
  getNewsletter(id: number): Promise<Newsletter | undefined>;
  getNewslettersByNursery(nurseryId: number): Promise<Newsletter[]>;
  getAllNewsletters(): Promise<Newsletter[]>;
  createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  updateNewsletter(id: number, newsletterData: Partial<Newsletter>): Promise<Newsletter | undefined>;
  deleteNewsletter(id: number): Promise<boolean>;

  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  getPostsByNursery(nurseryId: number): Promise<Post[]>;
  getAllPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, postData: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;

  // Gallery operations
  getGalleryImage(id: number): Promise<GalleryImage | undefined>;
  getGalleryImagesByNursery(nurseryId: number): Promise<GalleryImage[]>;
  getAllGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: number, imageData: Partial<GalleryImage>): Promise<GalleryImage | undefined>;
  deleteGalleryImage(id: number): Promise<boolean>;
  
  // Gallery categories
  getGalleryCategory(id: number): Promise<GalleryCategory | undefined>;
  getAllGalleryCategories(): Promise<GalleryCategory[]>;
  createGalleryCategory(category: InsertGalleryCategory): Promise<GalleryCategory>;
  deleteGalleryCategory(id: number): Promise<boolean>;
  
  // Media operations
  getMediaItem(id: number): Promise<MediaItem | undefined>;
  getMediaByNursery(nurseryId: number): Promise<MediaItem[]>;
  getAllMedia(): Promise<MediaItem[]>;
  createMediaItem(mediaItem: InsertMediaItem): Promise<MediaItem>;
  deleteMediaItem(id: number): Promise<boolean>;

  // Activity log operations
  logActivity(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogsByUser(userId: number): Promise<ActivityLog[]>;
  getActivityLogsByNursery(nurseryId: number): Promise<ActivityLog[]>;
  getRecentActivityLogs(limit?: number): Promise<ActivityLog[]>;

  // Invitation operations
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  getInvitationByToken(token: string): Promise<Invitation | undefined>;
  getInvitationsByNursery(nurseryId: number): Promise<Invitation[]>;
  acceptInvitation(token: string): Promise<boolean>;
  deleteInvitation(id: number): Promise<boolean>;

  // Contact submissions
  createContactSubmission(contact: InsertContact): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any; // Using any type to avoid express-session typing issues

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [user] = await db.insert(users).values({
      ...userData,
      password: hashedPassword
    }).returning();
    
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.lastName);
  }

  async getUsersByNursery(nurseryId: number): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.nurseryId, nurseryId))
      .orderBy(users.lastName);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Nursery operations
  async getNursery(id: number): Promise<Nursery | undefined> {
    const [nursery] = await db.select().from(nurseries).where(eq(nurseries.id, id));
    return nursery;
  }

  async getNurseryByLocation(location: string): Promise<Nursery | undefined> {
    const [nursery] = await db
      .select()
      .from(nurseries)
      .where(eq(nurseries.location, location));
    
    return nursery;
  }

  async getAllNurseries(): Promise<Nursery[]> {
    return db.select().from(nurseries).orderBy(nurseries.name);
  }

  async createNursery(nurseryData: InsertNursery): Promise<Nursery> {
    const [nursery] = await db
      .insert(nurseries)
      .values(nurseryData)
      .returning();
    
    return nursery;
  }

  async updateNursery(id: number, nurseryData: Partial<Nursery>): Promise<Nursery | undefined> {
    const [nursery] = await db
      .update(nurseries)
      .set({
        ...nurseryData,
        updatedAt: new Date()
      })
      .where(eq(nurseries.id, id))
      .returning();
    
    return nursery;
  }

  async deleteNursery(id: number): Promise<boolean> {
    const result = await db.delete(nurseries).where(eq(nurseries.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventsByNursery(nurseryId: number): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(eq(events.nurseryId, nurseryId))
      .orderBy(desc(events.startDate));
  }

  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(desc(events.startDate));
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(eventData)
      .returning();
    
    return event;
  }

  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set({
        ...eventData,
        updatedAt: new Date()
      })
      .where(eq(events.id, id))
      .returning();
    
    return event;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Newsletter operations
  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    const [newsletter] = await db.select().from(newsletters).where(eq(newsletters.id, id));
    return newsletter;
  }

  async getNewslettersByNursery(nurseryId: number): Promise<Newsletter[]> {
    return db
      .select()
      .from(newsletters)
      .where(eq(newsletters.nurseryId, nurseryId))
      .orderBy(desc(newsletters.createdAt));
  }

  async getAllNewsletters(): Promise<Newsletter[]> {
    return db.select().from(newsletters).orderBy(desc(newsletters.createdAt));
  }

  async createNewsletter(newsletterData: InsertNewsletter): Promise<Newsletter> {
    const [newsletter] = await db
      .insert(newsletters)
      .values(newsletterData)
      .returning();
    
    return newsletter;
  }

  async updateNewsletter(id: number, newsletterData: Partial<Newsletter>): Promise<Newsletter | undefined> {
    const [newsletter] = await db
      .update(newsletters)
      .set({
        ...newsletterData,
        updatedAt: new Date()
      })
      .where(eq(newsletters.id, id))
      .returning();
    
    return newsletter;
  }

  async deleteNewsletter(id: number): Promise<boolean> {
    const result = await db.delete(newsletters).where(eq(newsletters.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    return post;
  }

  async getPostsByNursery(nurseryId: number): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(eq(posts.nurseryId, nurseryId))
      .orderBy(desc(posts.createdAt));
  }

  async getAllPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.createdAt));
  }

  async createPost(postData: InsertPost): Promise<Post> {
    // Generate slug from title if not provided
    if (!postData.slug) {
      const slug = this.slugify(postData.title);
      postData = { ...postData, slug };
    }
    
    const [post] = await db
      .insert(posts)
      .values(postData)
      .returning();
    
    return post;
  }

  async updatePost(id: number, postData: Partial<Post>): Promise<Post | undefined> {
    // Update slug if title is changing and slug isn't explicitly set
    if (postData.title && !postData.slug) {
      postData.slug = this.slugify(postData.title);
    }
    
    const [post] = await db
      .update(posts)
      .set({
        ...postData,
        updatedAt: new Date()
      })
      .where(eq(posts.id, id))
      .returning();
    
    return post;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Media Library operations
  async getMediaItem(id: number): Promise<MediaItem | undefined> {
    const [item] = await db.select().from(mediaLibrary).where(eq(mediaLibrary.id, id));
    return item;
  }

  async getMediaByNursery(nurseryId: number): Promise<MediaItem[]> {
    return db
      .select()
      .from(mediaLibrary)
      .where(eq(mediaLibrary.nurseryId, nurseryId))
      .orderBy(desc(mediaLibrary.createdAt));
  }

  async getAllMedia(): Promise<MediaItem[]> {
    return db.select().from(mediaLibrary).orderBy(desc(mediaLibrary.createdAt));
  }

  async createMediaItem(mediaItemData: InsertMediaItem): Promise<MediaItem> {
    const [mediaItem] = await db
      .insert(mediaLibrary)
      .values(mediaItemData)
      .returning();
    
    return mediaItem;
  }

  async deleteMediaItem(id: number): Promise<boolean> {
    const result = await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Gallery operations
  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    const [image] = await db.select().from(galleryImages).where(eq(galleryImages.id, id));
    return image;
  }

  async getGalleryImagesByNursery(nurseryId: number): Promise<GalleryImage[]> {
    return db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.nurseryId, nurseryId))
      .orderBy(desc(galleryImages.createdAt));
  }

  async getAllGalleryImages(): Promise<GalleryImage[]> {
    return db.select().from(galleryImages).orderBy(desc(galleryImages.createdAt));
  }

  async createGalleryImage(imageData: InsertGalleryImage): Promise<GalleryImage> {
    const [image] = await db
      .insert(galleryImages)
      .values(imageData)
      .returning();
    
    return image;
  }

  async updateGalleryImage(id: number, imageData: Partial<GalleryImage>): Promise<GalleryImage | undefined> {
    const [image] = await db
      .update(galleryImages)
      .set({
        ...imageData,
        updatedAt: new Date()
      })
      .where(eq(galleryImages.id, id))
      .returning();
    
    return image;
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    const result = await db.delete(galleryImages).where(eq(galleryImages.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Gallery categories operations
  async getGalleryCategory(id: number): Promise<GalleryCategory | undefined> {
    const [category] = await db.select().from(galleryCategories).where(eq(galleryCategories.id, id));
    return category;
  }

  async getAllGalleryCategories(): Promise<GalleryCategory[]> {
    return db.select().from(galleryCategories).orderBy(galleryCategories.name);
  }

  async createGalleryCategory(categoryData: InsertGalleryCategory): Promise<GalleryCategory> {
    const [category] = await db
      .insert(galleryCategories)
      .values(categoryData)
      .returning();
    
    return category;
  }

  async deleteGalleryCategory(id: number): Promise<boolean> {
    const result = await db.delete(galleryCategories).where(eq(galleryCategories.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Activity logging
  async logActivity(logData: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLogs)
      .values(logData)
      .returning();
    
    return log;
  }

  async getActivityLogsByUser(userId: number): Promise<ActivityLog[]> {
    return db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt));
  }

  async getActivityLogsByNursery(nurseryId: number): Promise<ActivityLog[]> {
    return db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.nurseryId, nurseryId))
      .orderBy(desc(activityLogs.createdAt));
  }

  async getRecentActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  // Invitation management
  async createInvitation(invitationData: InsertInvitation): Promise<Invitation> {
    // Generate a unique token if not provided
    if (!invitationData.token) {
      invitationData.token = randomBytes(32).toString('hex');
    }
    
    // Set default expiration if not provided (48 hours)
    if (!invitationData.expiresAt) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      invitationData.expiresAt = expiresAt;
    }
    
    const [invitation] = await db
      .insert(invitations)
      .values(invitationData)
      .returning();
    
    return invitation;
  }

  async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, token));
    
    return invitation;
  }

  async getInvitationsByNursery(nurseryId: number): Promise<Invitation[]> {
    return db
      .select()
      .from(invitations)
      .where(eq(invitations.nurseryId, nurseryId))
      .orderBy(desc(invitations.createdAt));
  }

  async acceptInvitation(token: string): Promise<boolean> {
    const [invitation] = await db
      .update(invitations)
      .set({ accepted: true })
      .where(eq(invitations.token, token))
      .returning();
    
    return !!invitation;
  }

  async deleteInvitation(id: number): Promise<boolean> {
    const result = await db.delete(invitations).where(eq(invitations.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Contact form submissions
  async createContactSubmission(contactData: InsertContact): Promise<ContactSubmission> {
    const [submission] = await db
      .insert(contactSubmissions)
      .values(contactData)
      .returning();
    
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt));
  }

  // Helper methods
  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')          // Replace spaces with -
      .replace(/[^\w\-]+/g, '')      // Remove all non-word chars
      .replace(/\-\-+/g, '-')        // Replace multiple - with single -
      .replace(/^-+/, '')            // Trim - from start of text
      .replace(/-+$/, '');           // Trim - from end of text
  }
}

export const storage = new DatabaseStorage();