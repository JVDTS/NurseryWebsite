import { 
  users, type User, type InsertUser, 
  contactSubmissions, type InsertContact, type ContactSubmission,
  nurseries, type Nursery, type InsertNursery,
  events, type Event, type InsertEvent,
  galleryImages, type GalleryImage, type InsertGalleryImage,
  newsletters, type Newsletter, type InsertNewsletter
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Storage interface for all CRUD operations
export interface IStorage {
  // Session store for authentication
  sessionStore: any; // Using any type to avoid express-session typing issues
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Nursery methods
  getNursery(id: number): Promise<Nursery | undefined>;
  getNurseryByLocation(location: string): Promise<Nursery | undefined>;
  getAllNurseries(): Promise<Nursery[]>;
  createNursery(nursery: InsertNursery): Promise<Nursery>;
  updateNursery(id: number, nurseryData: Partial<InsertNursery>): Promise<Nursery | undefined>;
  
  // Event methods
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByNursery(nurseryId: number): Promise<Event[]>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Gallery methods
  getGalleryImage(id: number): Promise<GalleryImage | undefined>;
  getGalleryImagesByNursery(nurseryId: number): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  deleteGalleryImage(id: number): Promise<boolean>;
  
  // Newsletter methods
  getNewsletter(id: number): Promise<Newsletter | undefined>;
  getNewslettersByNursery(nurseryId: number): Promise<Newsletter[]>;
  getAllNewsletters(): Promise<Newsletter[]>;
  createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  updateNewsletter(id: number, newsletterData: Partial<InsertNewsletter>): Promise<Newsletter | undefined>;
  deleteNewsletter(id: number): Promise<boolean>;
  
  // Contact methods
  createContactSubmission(contact: InsertContact): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
}

// In-memory storage implementation for development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private nurseries: Map<number, Nursery>;
  private events: Map<number, Event>;
  private galleryImages: Map<number, GalleryImage>;
  private newsletters: Map<number, Newsletter>;
  private contacts: Map<number, ContactSubmission>;
  
  private userCurrentId: number;
  private nurseryCurrentId: number;
  private eventCurrentId: number;
  private galleryImageCurrentId: number;
  private newsletterCurrentId: number;
  private contactCurrentId: number;
  
  // Add session store for authentication
  public sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.nurseries = new Map();
    this.events = new Map();
    this.galleryImages = new Map();
    this.newsletters = new Map();
    this.contacts = new Map();
    
    this.userCurrentId = 1;
    this.nurseryCurrentId = 1;
    this.eventCurrentId = 1;
    this.galleryImageCurrentId = 1;
    this.newsletterCurrentId = 1;
    this.contactCurrentId = 1;
    
    // Initialize the session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with three nursery locations
    this.initializeNurseries();
    
    // Create admin users
    this.initializeAdminUsers();
  }
  
  private initializeNurseries() {
    const hayesNursery: InsertNursery = {
      name: "Hayes Nursery",
      location: "hayes",
      address: "192 Church Road, Hayes, UB3 2LT",
      phoneNumber: "01895 272885",
      email: "hayes@cmcnursery.co.uk",
      description: "Our Hayes nursery provides a warm, welcoming environment with an emphasis on creative expression and arts. Located in a converted church hall, it features bright, airy spaces filled with natural light, a dedicated creative arts studio, a music space, and a secure outdoor play area designed to encourage imaginative play and exploration.",
      heroImage: "https://images.unsplash.com/photo-1567448400815-a6fa3ac9c0ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const uxbridgeNursery: InsertNursery = {
      name: "Uxbridge Nursery",
      location: "uxbridge",
      address: "4 New Windsor Street, Uxbridge, UB8 2TU",
      phoneNumber: "01895 272885",
      email: "uxbridge@cmcnursery.co.uk",
      description: "Our Uxbridge nursery is a cozy, innovative environment with state-of-the-art learning facilities and a dedicated sensory room. We cater to children aged 2-5, providing a nurturing space where curious minds flourish. Our approach focuses on hands-on learning experiences that develop cognitive, social, and emotional skills while celebrating each child's unique personality and learning style.",
      heroImage: "https://images.unsplash.com/photo-1544487660-b86394cba400?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const hounslowNursery: InsertNursery = {
      name: "Hounslow Nursery",
      location: "hounslow",
      address: "488, 490 Great West Rd, Hounslow TW5 0TA",
      phoneNumber: "01895 272885",
      email: "hounslow@cmcnursery.co.uk",
      description: "Our Hounslow nursery is a nature-focused environment with extensive outdoor play areas and forest school activities. Designed for children aged 1-5, our approach emphasizes environmental awareness, exploration, and adventure. Children spend significant time outdoors in all seasons, developing resilience, physical skills, and a deep connection to the natural world, complemented by thoughtful indoor spaces that extend their learning.",
      heroImage: "https://images.unsplash.com/photo-1543248939-4296e1fea89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.createNursery(hayesNursery);
    this.createNursery(uxbridgeNursery);
    this.createNursery(hounslowNursery);
  }
  
  private initializeAdminUsers() {
    // Super admin
    const superAdmin: InsertUser = {
      username: "superadmin",
      password: "superadmin123", // In a real app, this would be hashed
      firstName: "Super",
      lastName: "Admin",
      email: "admin@cmcnursery.co.uk",
      role: "super_admin",
      nurseryId: null
    };
    
    // Nursery admins - one for each location
    const hayesAdmin: InsertUser = {
      username: "hayesadmin",
      password: "hayesadmin123", // In a real app, this would be hashed
      firstName: "Hayes",
      lastName: "Manager",
      email: "hayes.manager@cmcnursery.co.uk",
      role: "nursery_admin",
      nurseryId: 1
    };
    
    const uxbridgeAdmin: InsertUser = {
      username: "uxbridgeadmin",
      password: "uxbridgeadmin123", // In a real app, this would be hashed
      firstName: "Uxbridge",
      lastName: "Manager",
      email: "uxbridge.manager@cmcnursery.co.uk",
      role: "nursery_admin",
      nurseryId: 2
    };
    
    const hounslowAdmin: InsertUser = {
      username: "hounslowadmin",
      password: "hounslowadmin123", // In a real app, this would be hashed
      firstName: "Hounslow",
      lastName: "Manager",
      email: "hounslow.manager@cmcnursery.co.uk",
      role: "nursery_admin",
      nurseryId: 3
    };
    
    this.createUser(superAdmin);
    this.createUser(hayesAdmin);
    this.createUser(uxbridgeAdmin);
    this.createUser(hounslowAdmin);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role ?? 'regular', // Ensure role is not undefined
      nurseryId: insertUser.nurseryId ?? null, // Ensure nurseryId is not undefined
      createdAt: now, 
      updatedAt: now 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = { 
      ...user, 
      ...userData, 
      updatedAt: new Date() 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Nursery methods
  async getNursery(id: number): Promise<Nursery | undefined> {
    return this.nurseries.get(id);
  }
  
  async getNurseryByLocation(location: string): Promise<Nursery | undefined> {
    return Array.from(this.nurseries.values()).find(
      (nursery) => nursery.location === location,
    );
  }
  
  async getAllNurseries(): Promise<Nursery[]> {
    return Array.from(this.nurseries.values());
  }
  
  async createNursery(insertNursery: InsertNursery): Promise<Nursery> {
    const id = this.nurseryCurrentId++;
    const now = new Date();
    const nursery: Nursery = { 
      ...insertNursery, 
      id,
      createdAt: insertNursery.createdAt || now,
      updatedAt: insertNursery.updatedAt || now
    };
    this.nurseries.set(id, nursery);
    return nursery;
  }
  
  async updateNursery(id: number, nurseryData: Partial<InsertNursery>): Promise<Nursery | undefined> {
    const nursery = await this.getNursery(id);
    if (!nursery) {
      return undefined;
    }
    
    const updatedNursery: Nursery = { 
      ...nursery, 
      ...nurseryData, 
      updatedAt: new Date() 
    };
    this.nurseries.set(id, updatedNursery);
    return updatedNursery;
  }
  
  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getEventsByNursery(nurseryId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.nurseryId === nurseryId
    );
  }
  
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventCurrentId++;
    const now = new Date();
    const event: Event = { 
      ...insertEvent, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = await this.getEvent(id);
    if (!event) {
      return undefined;
    }
    
    const updatedEvent: Event = { 
      ...event, 
      ...eventData, 
      updatedAt: new Date() 
    };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Gallery methods
  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    return this.galleryImages.get(id);
  }
  
  async getGalleryImagesByNursery(nurseryId: number): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values()).filter(
      (image) => image.nurseryId === nurseryId
    );
  }
  
  async createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage> {
    const id = this.galleryImageCurrentId++;
    const galleryImage: GalleryImage = { 
      ...insertImage, 
      id,
      caption: insertImage.caption ?? null, // Ensure caption is not undefined
      createdAt: new Date()
    };
    this.galleryImages.set(id, galleryImage);
    return galleryImage;
  }
  
  async deleteGalleryImage(id: number): Promise<boolean> {
    return this.galleryImages.delete(id);
  }
  
  // Newsletter methods
  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    return this.newsletters.get(id);
  }
  
  async getNewslettersByNursery(nurseryId: number): Promise<Newsletter[]> {
    return Array.from(this.newsletters.values()).filter(
      (newsletter) => newsletter.nurseryId === nurseryId
    );
  }
  
  async getAllNewsletters(): Promise<Newsletter[]> {
    return Array.from(this.newsletters.values());
  }
  
  async createNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    const id = this.newsletterCurrentId++;
    const now = new Date();
    const newsletter: Newsletter = { 
      ...insertNewsletter, 
      id,
      pdfUrl: insertNewsletter.pdfUrl ?? null, // Ensure pdfUrl is not undefined
      publishDate: insertNewsletter.publishDate ?? now, // Ensure publishDate is not undefined
      createdAt: now,
      updatedAt: now
    };
    this.newsletters.set(id, newsletter);
    return newsletter;
  }
  
  async updateNewsletter(id: number, newsletterData: Partial<InsertNewsletter>): Promise<Newsletter | undefined> {
    const newsletter = await this.getNewsletter(id);
    if (!newsletter) {
      return undefined;
    }
    
    const updatedNewsletter: Newsletter = { 
      ...newsletter, 
      ...newsletterData, 
      updatedAt: new Date() 
    };
    this.newsletters.set(id, updatedNewsletter);
    return updatedNewsletter;
  }
  
  async deleteNewsletter(id: number): Promise<boolean> {
    return this.newsletters.delete(id);
  }

  // Contact methods
  async createContactSubmission(contact: InsertContact): Promise<ContactSubmission> {
    const id = this.contactCurrentId++;
    const newContact: ContactSubmission = { 
      ...contact, 
      id,
      phone: contact.phone ?? null  // Ensure phone is not undefined
    };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contacts.values());
  }
}

export const storage = new MemStorage();
