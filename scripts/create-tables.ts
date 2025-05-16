/**
 * Script to create any missing tables in the database
 */
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/pg-pool";
import { sql } from "drizzle-orm";

async function createTables() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  // Initialize database connection
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    console.log("Creating events table if it doesn't exist...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        all_day BOOLEAN DEFAULT FALSE,
        nursery_id INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Events table created successfully!");

    // Add more table creation statements here if needed
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

createTables()
  .then(() => {
    console.log("Database tables created successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to create database tables:", error);
    process.exit(1);
  });