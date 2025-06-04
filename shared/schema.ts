import { pgTable, text, serial, varchar, timestamp, pgEnum, jsonb, integer, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export Zod for use in other modules
export { z };

// User role enum
export const roleEnum = pgEnum('role', ['super_admin', 'admin', 'editor']);

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  role: roleEnum("role").notNull().default('editor'),
  // nurseryId remains for backward compatibility but will be phased out
  // in favor of the user_nurseries mapping table
  nurseryId: integer("nursery_id"),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User-Nursery mapping table for multi-nursery assignments
export const userNurseries = pgTable("user_nurseries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  nurseryId: integer("nursery_id").notNull().references(() => nurseries.id, { onDelete: 'cascade' }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  assignedBy: integer("assigned_by").notNull(), // ID of the super_admin who made the assignment
});

export type User = typeof users.$inferSelect;
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
}).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserNursery = typeof userNurseries.$inferSelect;
export const insertUserNurserySchema = createInsertSchema(userNurseries, {
  userId: z.number().int().positive("User ID is required"),
  nurseryId: z.number().int().positive("Nursery ID is required"),
  assignedBy: z.number().int().positive("Assigner ID is required"),
}).omit({ id: true, assignedAt: true });
export type InsertUserNursery = z.infer<typeof insertUserNurserySchema>;

// Nursery schema
export const nurseries = pgTable("nurseries", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  location: varchar("location").notNull().unique(),
  address: varchar("address").notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  email: varchar("email").notNull(),
  description: text("description").notNull(),
  openingHours: jsonb("opening_hours").notNull(),
  heroImage: varchar("hero_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Nursery = typeof nurseries.$inferSelect;
export const insertNurserySchema = createInsertSchema(nurseries, {
  name: z.string().min(2, "Nursery name is required"),
  location: z.string().min(2, "Location is required"),
  address: z.string().min(5, "Address is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  openingHours: z.record(z.string(), z.string()),
}).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNursery = z.infer<typeof insertNurserySchema>;

// Posts schema
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  featuredImage: varchar("featured_image"),
  nurseryId: integer("nursery_id").notNull(),
  authorId: integer("author_id").notNull(),
  status: varchar("status").notNull().default("draft"), // draft, published
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export const insertPostSchema = createInsertSchema(posts, {
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  nurseryId: z.number().int().positive("Nursery must be selected"),
}).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;

// Newsletters schema
export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  filename: varchar("filename").notNull(), // Required field
  file: varchar("file"), // Optional field
  month: varchar("month").notNull(),
  year: integer("year").notNull(),
  nurseryId: integer("nursery_id").notNull(),
  authorId: integer("author_id").notNull(),
  status: varchar("status").notNull().default("published"), // draft, published, etc
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Newsletter = typeof newsletters.$inferSelect;
export const insertNewsletterSchema = createInsertSchema(newsletters, {
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  file: z.string().min(1, "File is required"),
  month: z.string().min(1, "Month is required"),
  year: z.number().int().min(2000, "Valid year is required"),
  nurseryId: z.number().int().positive("Nursery must be selected"),
}).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;

// Events schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  location: varchar("location").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  allDay: boolean("all_day").default(false),
  nurseryId: integer("nursery_id").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export const insertEventSchema = createInsertSchema(events, {
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Location is required"),
  startDate: z.date(),
  endDate: z.date(),
  nurseryId: z.number().int().positive("Nursery must be selected"),
}).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;

// Gallery Images schema - Enhanced for Strapi-like functionality
export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  filename: varchar("filename").notNull(),
  altText: varchar("alt_text"), // For accessibility
  fileSize: integer("file_size"), // File size in bytes
  mimeType: varchar("mime_type"), // image/jpeg, image/png, etc.
  dimensions: jsonb("dimensions"), // {width: number, height: number}
  nurseryId: integer("nursery_id").notNull(),
  categoryId: integer("category_id"),
  tags: text("tags").array(), // Array of tags for better organization
  status: varchar("status").notNull().default("published"), // draft, published, archived
  featured: boolean("featured").default(false), // Mark images as featured
  sortOrder: integer("sort_order").default(0), // For custom ordering
  uploadedBy: integer("uploaded_by").notNull(),
  approvedBy: integer("approved_by"), // For approval workflow
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  nurseryIdIdx: index("gallery_images_nursery_id_idx").on(table.nurseryId),
  categoryIdIdx: index("gallery_images_category_id_idx").on(table.categoryId),
  statusIdx: index("gallery_images_status_idx").on(table.status),
  featuredIdx: index("gallery_images_featured_idx").on(table.featured),
}));

export type GalleryImage = typeof galleryImages.$inferSelect;
export const insertGalleryImageSchema = createInsertSchema(galleryImages, {
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  filename: z.string().min(1, "Filename is required"),
  altText: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
  dimensions: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive()
  }).optional(),
  nurseryId: z.number().int().positive("Nursery must be selected"),
  categoryId: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
}).omit({ id: true, createdAt: true, updatedAt: true, approvedBy: true, approvedAt: true });
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;

// Gallery Categories schema - Enhanced with nursery-specific categories
export const galleryCategories = pgTable("gallery_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  nurseryId: integer("nursery_id"), // null means global category available to all nurseries
  color: varchar("color"), // Hex color for UI theming
  icon: varchar("icon"), // Icon name for UI
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  nurseryIdIdx: index("gallery_categories_nursery_id_idx").on(table.nurseryId),
  activeIdx: index("gallery_categories_active_idx").on(table.isActive),
}));

export type GalleryCategory = typeof galleryCategories.$inferSelect;
export const insertGalleryCategorySchema = createInsertSchema(galleryCategories, {
  name: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
  nurseryId: z.number().int().positive().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color").optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
}).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGalleryCategory = z.infer<typeof insertGalleryCategorySchema>;

// Media Library schema
export const mediaLibrary = pgTable("media_library", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileType: varchar("file_type").notNull(), // image, document, video
  fileSize: integer("file_size").notNull(),
  nurseryId: integer("nursery_id").notNull(),
  uploadedBy: integer("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MediaItem = typeof mediaLibrary.$inferSelect;
export const insertMediaItemSchema = createInsertSchema(mediaLibrary, {
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Valid URL is required"),
  fileType: z.string().min(1, "File type is required"),
  fileSize: z.number().int().positive("File size must be positive"),
  nurseryId: z.number().int().positive("Nursery must be selected"),
}).omit({ id: true, createdAt: true });
export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;

// Activity logs schema
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: varchar("action").notNull(), // login, create_post, update_user, etc.
  entityType: varchar("entity_type"), // user, post, newsletter, etc.
  entityId: integer("entity_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  nurseryId: integer("nursery_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export const insertActivityLogSchema = createInsertSchema(activityLogs, {
  userId: z.number().int().positive("User ID is required"),
  action: z.string().min(1, "Action is required"),
}).omit({ id: true, createdAt: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// User invitations schema
export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  role: roleEnum("role").notNull(),
  nurseryId: integer("nursery_id"),
  token: varchar("token").notNull().unique(),
  invitedBy: integer("invited_by").notNull(),
  accepted: boolean("accepted").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Invitation = typeof invitations.$inferSelect;
export const insertInvitationSchema = createInsertSchema(invitations, {
  email: z.string().email("Please enter a valid email"),
  role: z.enum(['super_admin', 'admin', 'editor']),
  nurseryId: z.number().int().positive("Nursery must be selected").optional(),
  token: z.string().min(20, "Valid token required"),
  expiresAt: z.date(),
}).omit({ id: true, createdAt: true, accepted: true });
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  nurseryLocation: z.string().min(2, { 
    message: "Please select a nursery location" 
  }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" })
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  nurseryLocation: text("nursery_location").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export type InsertContact = z.infer<typeof contactFormSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// Session storage table for express-session
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Relations
export const relations = {
  users: {
    // Keeping the old one-to-one relation for backward compatibility
    nursery: (users) => ({
      one: (nurseries, { eq }) => eq(users.nurseryId, nurseries.id),
    }),
    // New many-to-many relation through userNurseries table
    nurseries: (users) => ({
      many: (userNurseries, { eq }) => eq(userNurseries.userId, users.id),
      through: {
        table: userNurseries,
        references: [userNurseries.nurseryId, nurseries.id],
      }
    }),
  },
  // UserNurseries relations
  userNurseries: {
    user: (userNurseries) => ({
      one: (users, { eq }) => eq(userNurseries.userId, users.id),
    }),
    nursery: (userNurseries) => ({
      one: (nurseries, { eq }) => eq(userNurseries.nurseryId, nurseries.id),
    }),
    assigner: (userNurseries) => ({
      one: (users, { eq }) => eq(userNurseries.assignedBy, users.id),
    }),
  },
  nurseries: {
    users: (nurseries) => ({
      many: (users, { eq }) => eq(users.nurseryId, nurseries.id),
    }),
    posts: (nurseries) => ({
      many: (posts, { eq }) => eq(posts.nurseryId, nurseries.id),
    }),
    events: (nurseries) => ({
      many: (events, { eq }) => eq(events.nurseryId, nurseries.id),
    }),
    newsletters: (nurseries) => ({
      many: (newsletters, { eq }) => eq(newsletters.nurseryId, nurseries.id),
    }),
    media: (nurseries) => ({
      many: (mediaLibrary, { eq }) => eq(mediaLibrary.nurseryId, nurseries.id),
    }),
    galleryImages: (nurseries) => ({
      many: (galleryImages, { eq }) => eq(galleryImages.nurseryId, nurseries.id),
    }),
  },
  posts: {
    nursery: (posts) => ({
      one: (nurseries, { eq }) => eq(posts.nurseryId, nurseries.id),
    }),
    author: (posts) => ({
      one: (users, { eq }) => eq(posts.authorId, users.id),
    }),
  },
  newsletters: {
    nursery: (newsletters) => ({
      one: (nurseries, { eq }) => eq(newsletters.nurseryId, nurseries.id),
    }),
    author: (newsletters) => ({
      one: (users, { eq }) => eq(newsletters.authorId, users.id),
    }),
  },
  events: {
    nursery: (events) => ({
      one: (nurseries, { eq }) => eq(events.nurseryId, nurseries.id),
    }),
    creator: (events) => ({
      one: (users, { eq }) => eq(events.createdBy, users.id),
    }),
  },
  mediaLibrary: {
    nursery: (mediaLibrary) => ({
      one: (nurseries, { eq }) => eq(mediaLibrary.nurseryId, nurseries.id),
    }),
    uploader: (mediaLibrary) => ({
      one: (users, { eq }) => eq(mediaLibrary.uploadedBy, users.id),
    }),
  },
  activityLogs: {
    user: (activityLogs) => ({
      one: (users, { eq }) => eq(activityLogs.userId, users.id),
    }),
    nursery: (activityLogs) => ({
      one: (nurseries, { eq }) => eq(activityLogs.nurseryId, nurseries.id),
    }),
  },
  invitations: {
    nursery: (invitations) => ({
      one: (nurseries, { eq }) => eq(invitations.nurseryId, nurseries.id),
    }),
    inviter: (invitations) => ({
      one: (users, { eq }) => eq(invitations.invitedBy, users.id),
    }),
  },
  galleryImages: {
    nursery: (galleryImages) => ({
      one: (nurseries, { eq }) => eq(galleryImages.nurseryId, nurseries.id),
    }),
    category: (galleryImages) => ({
      one: (galleryCategories, { eq }) => eq(galleryImages.categoryId, galleryCategories.id),
    }),
    uploader: (galleryImages) => ({
      one: (users, { eq }) => eq(galleryImages.uploadedBy, users.id),
    }),
  },
  galleryCategories: {
    images: (galleryCategories) => ({
      many: (galleryImages, { eq }) => eq(galleryImages.categoryId, galleryCategories.id),
    }),
  },
};