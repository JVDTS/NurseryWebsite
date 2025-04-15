import { 
  users, type User, type InsertUser, 
  contactSubmissions, type InsertContact, type ContactSubmission,
  nurseries, type Nursery, type InsertNursery,
  events, type Event, type InsertEvent,
  galleryImages, type GalleryImage, type InsertGalleryImage,
  newsletters, type Newsletter, type InsertNewsletter,
  activityLogs, type ActivityLog, type InsertActivityLog
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { hashPassword } from "./security";

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
  getAllUsers(): Promise<User[]>; // Added method to get all users
  
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
  
  // Activity Log methods
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(): Promise<ActivityLog[]>;
  getActivityLogsByUser(userId: number): Promise<ActivityLog[]>;
  getActivityLogsByNursery(nurseryId: number): Promise<ActivityLog[]>;
}

// For ESM in TypeScript, we need to handle imports differently
// We'll define a placeholder for DbStorage and try to set it later via dynamic import

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
  public sessionStore: any; // Using any type to avoid express-session typing issues

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
    
    // Initialize sample newsletters
    this.initializeSampleNewsletters();
    
    // Initialize sample gallery images
    this.initializeSampleGalleryImages();
    
    // Initialize sample contact submissions
    this.initializeSampleContactSubmissions();
  }
  
  private initializeSampleContactSubmissions() {
    const contact1: InsertContact = {
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      phone: "077-3456-7890",
      nurseryLocation: "hayes",
      message: "I'm interested in enrolling my 3-year-old daughter in your nursery starting next month. Could you please provide information about your available spots and fees?",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    };
    
    const contact2: InsertContact = {
      name: "Michael Roberts",
      email: "m.roberts@example.com",
      phone: "079-8765-4321",
      nurseryLocation: "uxbridge",
      message: "We're relocating to the area next month and looking for a nursery for our twins (age 4). Do you have availability for two children? I'd also like to arrange a visit if possible.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    };
    
    const contact3: InsertContact = {
      name: "Priya Patel",
      email: "priya.p@example.com",
      phone: null,
      nurseryLocation: "hounslow",
      message: "I'd like to know more about your curriculum and daily activities for toddlers. My son is very active and I'm looking for a program that can challenge him.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    };
    
    this.createContactSubmission(contact1);
    this.createContactSubmission(contact2);
    this.createContactSubmission(contact3);
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
    
    // Hash the password using bcrypt
    const hashedPassword = await hashPassword(insertUser.password);
    
    const user: User = { 
      ...insertUser,
      password: hashedPassword, // Store the hashed password 
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
    
    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await hashPassword(userData.password);
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
      tags: insertNewsletter.tags ?? null, // Ensure tags is not undefined
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
      phone: contact.phone ?? null,  // Ensure phone is not undefined
      createdAt: contact.createdAt || new Date() // Ensure createdAt is not undefined
    };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contacts.values());
  }
  
  // Get all users for admin user management
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Activity log methods
  private activityLogs: Map<number, ActivityLog> = new Map();
  private activityLogCurrentId: number = 1;
  
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogCurrentId++;
    const newActivity: ActivityLog = {
      ...activity,
      id,
      resourceId: activity.resourceId || null,
      nurseryId: activity.nurseryId || null,
      nurseryName: activity.nurseryName || null,
      createdAt: new Date()
    };
    this.activityLogs.set(id, newActivity);
    return newActivity;
  }
  
  async getActivityLogs(): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by date descending
  }
  
  async getActivityLogsByUser(userId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getActivityLogsByNursery(nurseryId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => log.nurseryId === nurseryId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Initialize sample newsletters
  private initializeSampleNewsletters() {
    // Sample newsletters for Hayes nursery
    const hayesJanuaryNewsletter: InsertNewsletter = {
      title: "Hayes January 2025 Newsletter",
      content: "Welcome to the new year at Hayes Nursery! This month we're focusing on winter activities, exploring snow and ice through sensory play, and learning about arctic animals. We'll also be celebrating Chinese New Year with special crafts and food tasting.",
      pdfUrl: "/uploads/1742475619079-5f9576e94fc92b51.pdf",
      nurseryId: 1,
      publishedBy: 2, // Hayes admin
      publishDate: new Date("2025-01-10"),
      createdAt: new Date("2025-01-10"),
      updatedAt: new Date("2025-01-10")
    };

    const hayesFebruaryNewsletter: InsertNewsletter = {
      title: "Hayes February 2025 Newsletter",
      content: "February at Hayes Nursery brings a focus on friendship and kindness as we celebrate Valentine's Day. Children will engage in cooperative play activities, create handmade cards, and participate in our 'Random Acts of Kindness' initiative throughout the month.",
      pdfUrl: "/uploads/1742480655034-ed1648bedca4e49d.pdf",
      nurseryId: 1,
      publishedBy: 2, // Hayes admin
      publishDate: new Date("2025-02-05"),
      createdAt: new Date("2025-02-05"),
      updatedAt: new Date("2025-02-05")
    };

    // Sample newsletters for Uxbridge nursery
    const uxbridgeJanuaryNewsletter: InsertNewsletter = {
      title: "Uxbridge January 2025 Newsletter",
      content: "January at Uxbridge Nursery brings exciting new learning themes including 'Space Exploration' and 'Winter Wildlife'. Our preschoolers will be starting their phonics journey, while toddlers will focus on sensory development through our enhanced winter sensory station.",
      pdfUrl: "/uploads/1742475619079-5f9576e94fc92b51.pdf",
      nurseryId: 2,
      publishedBy: 3, // Uxbridge admin
      publishDate: new Date("2025-01-08"),
      createdAt: new Date("2025-01-08"),
      updatedAt: new Date("2025-01-08")
    };

    // Sample newsletters for Hounslow nursery
    const hounslowJanuaryNewsletter: InsertNewsletter = {
      title: "Hounslow January 2025 Newsletter",
      content: "Happy New Year from Hounslow Nursery! This month we're introducing our 'Growing Green' environmental awareness program. Children will be planting winter vegetables in our greenhouse, learning about recycling, and starting our bird-watching club with new feeding stations in our garden.",
      pdfUrl: "/uploads/1742480655034-ed1648bedca4e49d.pdf",
      nurseryId: 3,
      publishedBy: 4, // Hounslow admin
      publishDate: new Date("2025-01-12"),
      createdAt: new Date("2025-01-12"),
      updatedAt: new Date("2025-01-12")
    };

    const hounslowFebruaryNewsletter: InsertNewsletter = {
      title: "Hounslow February 2025 Newsletter",
      content: "February at Hounslow Nursery focuses on cultural diversity as we explore traditions from around the world. We'll be hosting parent volunteers to share stories, foods, and customs from their cultures, enhancing our understanding of our diverse community.",
      pdfUrl: "/uploads/1742475619079-5f9576e94fc92b51.pdf",
      nurseryId: 3,
      publishedBy: 4, // Hounslow admin
      publishDate: new Date("2025-02-03"),
      createdAt: new Date("2025-02-03"),
      updatedAt: new Date("2025-02-03")
    };

    this.createNewsletter(hayesJanuaryNewsletter);
    this.createNewsletter(hayesFebruaryNewsletter);
    this.createNewsletter(uxbridgeJanuaryNewsletter);
    this.createNewsletter(hounslowJanuaryNewsletter);
    this.createNewsletter(hounslowFebruaryNewsletter);
  }
  
  // Initialize sample gallery images
  private initializeSampleGalleryImages() {
    // Hayes Nursery gallery images
    const hayesGalleryImages: InsertGalleryImage[] = [
      {
        imageUrl: "https://images.unsplash.com/photo-1526634332515-d56c5fd16991?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        caption: "Art and Craft Session - Children creating colorful paintings during our weekly art workshop",
        nurseryId: 1,
        uploadedBy: 2, // Hayes admin
        createdAt: new Date("2025-03-10")
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        caption: "Spring Festival - Our annual celebration with performances by the children",
        nurseryId: 1,
        uploadedBy: 2, // Hayes admin
        createdAt: new Date("2025-03-15")
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1567057419565-4349c49d8a04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        caption: "Story Time - Children engaged in our daily reading circle",
        nurseryId: 1,
        uploadedBy: 2, // Hayes admin
        createdAt: new Date("2025-03-20")
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1555861496-0666c8981751?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        caption: "Music Workshop - Learning rhythm and movement in our music class",
        nurseryId: 1,
        uploadedBy: 2, // Hayes admin
        createdAt: new Date("2025-03-25")
      }
    ];
    
    // Uxbridge Nursery gallery images
    const uxbridgeGalleryImages: InsertGalleryImage[] = [
      {
        imageUrl: "https://images.unsplash.com/photo-1544487660-b86394cba400?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        caption: "Gardening Project - Children planting seeds in our nursery garden",
        nurseryId: 2,
        uploadedBy: 3, // Uxbridge admin
        createdAt: new Date("2025-03-12")
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1571210862729-78a52d3779a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        caption: "Science Experiment Day - Exploring bubbles and reactions",
        nurseryId: 2,
        uploadedBy: 3, // Uxbridge admin
        createdAt: new Date("2025-03-18")
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1541692641319-981cc79ee10a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        caption: "Cooking Class - Making healthy snacks in our kitchen area",
        nurseryId: 2,
        uploadedBy: 3, // Uxbridge admin
        createdAt: new Date("2025-03-22")
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        caption: "Parent's Day - Families joining us for activities and presentations",
        nurseryId: 2,
        uploadedBy: 3, // Uxbridge admin
        createdAt: new Date("2025-03-26")
      }
    ];
    
    // Hounslow Nursery gallery images
    const hounslowGalleryImages: InsertGalleryImage[] = [
      {
        imageUrl: "https://images.unsplash.com/photo-1543248939-4296e1fea89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        caption: "Forest School - Outdoor learning in our local woodland area",
        nurseryId: 3,
        uploadedBy: 4, // Hounslow admin
        createdAt: new Date("2025-03-05")
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1560969184-10fe8719e047?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        caption: "Sports Day - Children participating in fun physical activities",
        nurseryId: 3,
        uploadedBy: 4, // Hounslow admin
        createdAt: new Date("2025-03-14")
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1516214104703-d870798883c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        caption: "Cultural Week - Learning about different countries and traditions",
        nurseryId: 3,
        uploadedBy: 4, // Hounslow admin
        createdAt: new Date("2025-03-19")
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        caption: "Technology Day - Exploring simple coding with our interactive boards",
        nurseryId: 3,
        uploadedBy: 4, // Hounslow admin
        createdAt: new Date("2025-03-24")
      }
    ];
    
    // Add all gallery images to storage
    [...hayesGalleryImages, ...uxbridgeGalleryImages, ...hounslowGalleryImages].forEach(image => {
      this.createGalleryImage(image);
    });
  }
}

// We export a function to get the storage instance
// This will be initialized at startup in index.ts
let storage: IStorage = new MemStorage(); // Default to MemStorage initially

export { storage };

// This function will be called from index.ts to set up storage
export async function initializeStorage(): Promise<IStorage> {
  try {
    // Try a dynamic import which is ESM compatible
    const dbModule = await import('./setupDb');
    
    if (dbModule.initializeDatabase()) {
      try {
        // If the database connection was successful, use DbStorage
        const dbStorage = dbModule.getStorage();
        storage = dbStorage; // Replace the global instance
        return dbStorage;
      } catch (error) {
        console.error('Error initializing database storage:', error);
      }
    }
  } catch (error) {
    console.error('Error importing setupDb:', error);
  }
  
  return storage; // Return existing in-memory storage
}
