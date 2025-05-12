import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';

/**
 * Script to create the PostgreSQL session table for express-session
 */
async function createSessionsTable() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }

  // Configure websocket for Neon DB
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('Creating sessions table if it doesn\'t exist...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "sessions" (
      "sid" varchar NOT NULL PRIMARY KEY,
      "sess" jsonb NOT NULL,
      "expire" timestamp(6) NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");
  `);

  console.log('Sessions table created successfully!');
  await pool.end();
}

createSessionsTable()
  .then(() => {
    console.log('Sessions table setup complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error creating sessions table:', err);
    process.exit(1);
  });