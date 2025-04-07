import { drizzle } from "drizzle-orm/node-postgres";

// Use require for importing pg
const pg = require('pg');
const Pool = pg.Pool;

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
}

// Export the pool and db instances
export { pool, db };