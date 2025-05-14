import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function initializeTables() {
  try {
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

    // Create default Hayes nursery
    console.log('Creating default nursery...');
    await db.execute(sql`
      INSERT INTO nurseries (
        name, location, address, phone_number, email, description, opening_hours
      ) VALUES (
        'Coat of Many Colours Nursery - Hayes',
        'Hayes',
        '123 Hayes Road, Hayes, UB3 1AB',
        '020 1234 5678',
        'hayes@nurseries.com',
        'Our Hayes location provides a warm and nurturing environment for children to learn and grow.',
        '{"Monday":"7:30 AM - 6:00 PM","Tuesday":"7:30 AM - 6:00 PM","Wednesday":"7:30 AM - 6:00 PM","Thursday":"7:30 AM - 6:00 PM","Friday":"7:30 AM - 6:00 PM","Saturday":"Closed","Sunday":"Closed"}'
      )
      ON CONFLICT (location) DO NOTHING;
    `);

    // Create default admin user
    console.log('Creating admin user...');
    await db.execute(sql`
      INSERT INTO users (
        email, password, first_name, last_name, role
      ) VALUES (
        'admin@nurseries.com',
        '$2a$10$XHNHBFmYdT7HJhIXlXkX1u2y9L6BC3dS97jDqcKJ0cJ8kCpK.dIaO', -- password: admin123
        'System',
        'Administrator',
        'super_admin'
      )
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('Database initialized successfully!');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    process.exit(0);
  }
}

initializeTables();