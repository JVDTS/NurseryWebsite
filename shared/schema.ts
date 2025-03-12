import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export Zod for use in other modules
export { z };

// User role enum
export const roleEnum = pgEnum('role', ['super_admin', 'nursery_admin', 'staff', 'regular']);

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull().default('regular'),
  nurseryId: integer("nursery_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Nursery locations enum
export const nurseryLocationsEnum = pgEnum('nursery_location', ['hayes', 'uxbridge', 'hounslow']);

// Nursery schema for locations
export const nurseries = pgTable("nurseries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: nurseryLocationsEnum("location").notNull(),
  address: text("address").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email").notNull(),
  description: text("description").notNull(),
  heroImage: text("hero_image").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Event schema for upcoming events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  nurseryId: integer("nursery_id").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Gallery images schema
export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  nurseryId: integer("nursery_id").notNull(),
  uploadedBy: integer("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Newsletter schema
export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  pdfUrl: text("pdf_url"),
  nurseryId: integer("nursery_id").notNull(),
  publishedBy: integer("published_by").notNull(),
  publishDate: timestamp("publish_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User input schema
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  nurseryId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Nursery input schema
export const insertNurserySchema = createInsertSchema(nurseries);
export type InsertNursery = z.infer<typeof insertNurserySchema>;
export type Nursery = typeof nurseries.$inferSelect;

// Event input schema
export const insertEventSchema = createInsertSchema(events);
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Gallery image input schema
export const insertGalleryImageSchema = createInsertSchema(galleryImages);
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;

// Newsletter input schema
export const insertNewsletterSchema = createInsertSchema(newsletters);
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Newsletter = typeof newsletters.$inferSelect;

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters" })
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull()
});

export const insertContactSchema = createInsertSchema(contactSubmissions);

export type InsertContact = z.infer<typeof insertContactSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
