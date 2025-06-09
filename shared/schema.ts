import { pgTable, text, varchar, integer, timestamp, boolean, serial, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import type { Json } from "drizzle-orm/pg-core";

// Session storage table for express-session
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("admin"), // 'super_admin', 'admin', 'editor'
  nurseryId: integer("nursery_id"), // Can be null for super_admin
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
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

// Nurseries table
export const nurseries = pgTable("nurseries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 100 }).notNull().unique(),
  address: text("address").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  description: text("description"),
  openingHours: json("opening_hours").$type<{
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
  }>(),
  heroImage: varchar("hero_image", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  allDay: boolean("all_day").default(false),
  location: varchar("location", { length: 255 }).notNull(),
  nurseryId: integer("nursery_id").notNull().references(() => nurseries.id, { onDelete: 'cascade' }),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Newsletters table
export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  pdfUrl: varchar("pdf_url", { length: 500 }),
  publishDate: timestamp("publish_date").defaultNow().notNull(),
  nurseryId: integer("nursery_id").references(() => nurseries.id, { onDelete: 'cascade' }),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Gallery Images table
export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }),
  nurseryId: integer("nursery_id").references(() => nurseries.id, { onDelete: 'cascade' }),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity Logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(), // 'create', 'update', 'delete', 'login', etc.
  entityType: varchar("entity_type", { length: 50 }), // 'user', 'nursery', 'event', 'newsletter', etc.
  entityId: integer("entity_id"), // ID of the affected entity
  details: json("details").$type<Json>(), // Additional details about the action
  ipAddress: varchar("ip_address", { length: 45 }),
  nurseryId: integer("nursery_id").references(() => nurseries.id), // For nursery-specific actions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contact Submissions table
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  nurseryLocation: varchar("nursery_location", { length: 100 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UpsertUser = typeof users.$inferInsert;

export type UserNursery = typeof userNurseries.$inferSelect;
export type InsertUserNursery = typeof userNurseries.$inferInsert;

export type Nursery = typeof nurseries.$inferSelect;
export type InsertNursery = typeof nurseries.$inferInsert;

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export type Newsletter = typeof newsletters.$inferSelect;
export type InsertNewsletter = typeof newsletters.$inferInsert;

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContact = typeof contactSubmissions.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertNurserySchema = createInsertSchema(nurseries);
export const selectNurserySchema = createSelectSchema(nurseries);

export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events);

export const insertNewsletterSchema = createInsertSchema(newsletters);
export const selectNewsletterSchema = createSelectSchema(newsletters);

export const insertGalleryImageSchema = createInsertSchema(galleryImages);
export const selectGalleryImageSchema = createSelectSchema(galleryImages);

export const insertActivityLogSchema = createInsertSchema(activityLogs);
export const selectActivityLogSchema = createSelectSchema(activityLogs);

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  nurseryLocation: z.string().min(1, "Nursery location is required"),
  message: z.string().min(1, "Message is required"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;