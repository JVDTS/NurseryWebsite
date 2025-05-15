import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create a connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Create drizzle instance with schema
export const db = drizzle(pool);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Handle termination signals to close the pool
process.on('SIGINT', () => {
  pool.end()
    .then(() => {
      console.log('Database pool has ended');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error closing the database pool', err);
      process.exit(-1);
    });
});