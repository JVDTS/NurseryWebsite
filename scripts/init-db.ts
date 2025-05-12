import { db } from '../server/db';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';
import { generateSecureToken } from '../server/security';
import { roleEnum } from '../shared/schema';
import bcrypt from 'bcryptjs';

/**
 * Initialize the database with required tables
 */
async function initializeDatabase() {
  console.log('Creating tables if they don\'t exist...');

  // Create sessions table
  console.log('Creating sessions table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "sessions" (
      "sid" varchar NOT NULL PRIMARY KEY,
      "sess" jsonb NOT NULL,
      "expire" timestamp(6) NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");
  `);

  // Create users table
  console.log('Creating users table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" serial PRIMARY KEY,
      "email" varchar NOT NULL UNIQUE,
      "password" varchar NOT NULL,
      "first_name" varchar NOT NULL,
      "last_name" varchar NOT NULL,
      "role" varchar NOT NULL DEFAULT 'editor',
      "nursery_id" integer,
      "profile_image_url" varchar,
      "created_at" timestamp DEFAULT NOW() NOT NULL,
      "updated_at" timestamp DEFAULT NOW() NOT NULL
    );
  `);

  // Create nurseries table
  console.log('Creating nurseries table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "nurseries" (
      "id" serial PRIMARY KEY,
      "name" varchar NOT NULL,
      "location" varchar NOT NULL UNIQUE,
      "address" varchar NOT NULL,
      "phone_number" varchar NOT NULL,
      "email" varchar NOT NULL,
      "description" text NOT NULL,
      "opening_hours" jsonb NOT NULL,
      "hero_image" varchar,
      "created_at" timestamp DEFAULT NOW() NOT NULL,
      "updated_at" timestamp DEFAULT NOW() NOT NULL
    );
  `);

  // Create posts table
  console.log('Creating posts table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts" (
      "id" serial PRIMARY KEY,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL UNIQUE,
      "content" text NOT NULL,
      "excerpt" text,
      "featured_image" varchar,
      "nursery_id" integer NOT NULL,
      "author_id" integer NOT NULL,
      "status" varchar NOT NULL DEFAULT 'draft',
      "published_at" timestamp,
      "created_at" timestamp DEFAULT NOW() NOT NULL,
      "updated_at" timestamp DEFAULT NOW() NOT NULL,
      FOREIGN KEY ("nursery_id") REFERENCES "nurseries"("id") ON DELETE CASCADE,
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
    );
  `);

  // Create newsletters table
  console.log('Creating newsletters table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "newsletters" (
      "id" serial PRIMARY KEY,
      "title" varchar NOT NULL,
      "description" text,
      "pdf_url" varchar,
      "html_content" text,
      "nursery_id" integer NOT NULL,
      "author_id" integer NOT NULL,
      "status" varchar NOT NULL DEFAULT 'draft',
      "scheduled_for" timestamp,
      "sent_at" timestamp,
      "created_at" timestamp DEFAULT NOW() NOT NULL,
      "updated_at" timestamp DEFAULT NOW() NOT NULL,
      FOREIGN KEY ("nursery_id") REFERENCES "nurseries"("id") ON DELETE CASCADE,
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
    );
  `);

  // Create events table
  console.log('Creating events table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "events" (
      "id" serial PRIMARY KEY,
      "title" varchar NOT NULL,
      "description" text NOT NULL,
      "location" varchar NOT NULL,
      "start_date" timestamp NOT NULL,
      "end_date" timestamp NOT NULL,
      "all_day" boolean DEFAULT false,
      "nursery_id" integer NOT NULL,
      "created_by" integer NOT NULL,
      "created_at" timestamp DEFAULT NOW() NOT NULL,
      "updated_at" timestamp DEFAULT NOW() NOT NULL,
      FOREIGN KEY ("nursery_id") REFERENCES "nurseries"("id") ON DELETE CASCADE,
      FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE
    );
  `);

  // Create media_library table
  console.log('Creating media_library table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "media_library" (
      "id" serial PRIMARY KEY,
      "file_name" varchar NOT NULL,
      "file_url" varchar NOT NULL,
      "file_type" varchar NOT NULL,
      "file_size" integer NOT NULL,
      "nursery_id" integer NOT NULL,
      "uploaded_by" integer NOT NULL,
      "created_at" timestamp DEFAULT NOW() NOT NULL,
      FOREIGN KEY ("nursery_id") REFERENCES "nurseries"("id") ON DELETE CASCADE,
      FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE
    );
  `);

  // Create activity_logs table
  console.log('Creating activity_logs table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "activity_logs" (
      "id" serial PRIMARY KEY,
      "user_id" integer NOT NULL,
      "action" varchar NOT NULL,
      "entity_type" varchar,
      "entity_id" integer,
      "details" jsonb,
      "ip_address" varchar,
      "nursery_id" integer,
      "created_at" timestamp DEFAULT NOW() NOT NULL,
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
      FOREIGN KEY ("nursery_id") REFERENCES "nurseries"("id") ON DELETE SET NULL
    );
  `);

  // Create invitations table
  console.log('Creating invitations table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "invitations" (
      "id" serial PRIMARY KEY,
      "email" varchar NOT NULL,
      "role" varchar NOT NULL,
      "nursery_id" integer,
      "token" varchar NOT NULL UNIQUE,
      "invited_by" integer NOT NULL,
      "accepted" boolean DEFAULT false,
      "expires_at" timestamp NOT NULL,
      "created_at" timestamp DEFAULT NOW() NOT NULL,
      FOREIGN KEY ("nursery_id") REFERENCES "nurseries"("id") ON DELETE SET NULL,
      FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE CASCADE
    );
  `);

  // Create contact_submissions table
  console.log('Creating contact_submissions table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "contact_submissions" (
      "id" serial PRIMARY KEY,
      "name" text NOT NULL,
      "email" text NOT NULL,
      "phone" text,
      "nursery_location" text NOT NULL,
      "message" text NOT NULL,
      "created_at" timestamp DEFAULT NOW() NOT NULL
    );
  `);

  // Check if super admin exists
  console.log('Checking if super admin user exists...');
  const [superAdmin] = await db.select()
    .from(schema.users)
    .where(sql`${schema.users.role} = 'super_admin'`);

  // Create super admin user if not exists
  if (!superAdmin) {
    console.log('Creating super admin user...');
    const password = process.env.ADMIN_PASSWORD || generateSecureToken(12);
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(schema.users).values({
      email: 'admin@nurseries.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'super_admin',
    });

    console.log(`Super admin created with password: ${password}`);
    console.log('IMPORTANT: Please change this password immediately after first login!');
  } else {
    console.log('Super admin user already exists');
  }

  // Check if nurseries exist and create default ones if needed
  console.log('Checking if nurseries exist...');
  const [existingNursery] = await db.select()
    .from(schema.nurseries);

  if (!existingNursery) {
    console.log('Creating default nurseries...');
    
    // Create Hayes nursery
    await db.insert(schema.nurseries).values({
      name: 'Coat of Many Colours Nursery - Hayes',
      location: 'Hayes',
      address: '123 Hayes Road, Hayes, UB3 1AB',
      phoneNumber: '020 1234 5678',
      email: 'hayes@nurseries.com',
      description: 'Our Hayes location provides a warm and nurturing environment for children to learn and grow.',
      openingHours: {
        Monday: '7:30 AM - 6:00 PM',
        Tuesday: '7:30 AM - 6:00 PM',
        Wednesday: '7:30 AM - 6:00 PM',
        Thursday: '7:30 AM - 6:00 PM',
        Friday: '7:30 AM - 6:00 PM',
        Saturday: 'Closed',
        Sunday: 'Closed'
      }
    });
    
    // Create Uxbridge nursery
    await db.insert(schema.nurseries).values({
      name: 'Coat of Many Colours Nursery - Uxbridge',
      location: 'Uxbridge',
      address: '456 High Street, Uxbridge, UB8 1JD',
      phoneNumber: '020 2345 6789',
      email: 'uxbridge@nurseries.com',
      description: 'Our Uxbridge location offers state-of-the-art facilities in a safe and engaging environment.',
      openingHours: {
        Monday: '7:30 AM - 6:00 PM',
        Tuesday: '7:30 AM - 6:00 PM',
        Wednesday: '7:30 AM - 6:00 PM',
        Thursday: '7:30 AM - 6:00 PM',
        Friday: '7:30 AM - 6:00 PM',
        Saturday: 'Closed',
        Sunday: 'Closed'
      }
    });
    
    // Create Hounslow nursery
    await db.insert(schema.nurseries).values({
      name: 'Coat of Many Colours Nursery - Hounslow',
      location: 'Hounslow',
      address: '789 Hounslow Road, Hounslow, TW3 3HD',
      phoneNumber: '020 3456 7890',
      email: 'hounslow@nurseries.com',
      description: 'Our Hounslow location specializes in creating a diverse and inclusive learning environment for all children.',
      openingHours: {
        Monday: '7:30 AM - 6:00 PM',
        Tuesday: '7:30 AM - 6:00 PM',
        Wednesday: '7:30 AM - 6:00 PM',
        Thursday: '7:30 AM - 6:00 PM',
        Friday: '7:30 AM - 6:00 PM',
        Saturday: 'Closed',
        Sunday: 'Closed'
      }
    });
    
    console.log('Default nurseries created');
  } else {
    console.log('Nurseries already exist');
  }

  console.log('Database initialization complete!');
}

initializeDatabase()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error setting up database:', err);
    process.exit(1);
  });