<<<<<<< HEAD
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
=======
import { drizzle } from "drizzle-orm/node-postgres";
import pg from 'pg';
const { Pool } = pg;

// Create the database connection pool with error handling
let pool;
let db;

try {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL is not defined. PostgreSQL database will not be available.');
  } else {
    console.log('Connecting to PostgreSQL database...');
    
    // Create the connection pool
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false // Required for some cloud PostgreSQL providers like Neon
      }
    });
    
    // Set up error handling for the pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
    
    // Test the connection
    pool.query('SELECT 1')
      .then(() => {
        console.log('PostgreSQL database connection successful!');
      })
      .catch((err) => {
        console.error('Error testing PostgreSQL connection:', err);
      });
      
    // Create the Drizzle instance
    db = drizzle(pool);
  }
} catch (error) {
  console.error('Failed to initialize PostgreSQL connection:', error);
>>>>>>> 7466835fb36eb516846077bbd34a23c58e2e4beb
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