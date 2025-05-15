import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createTables() {
  try {
    // Get schema SQL from shared/schema.ts
    const schemaPath = path.join(__dirname, '../shared/schema.ts');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        profile_image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR(255) PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions ("expire");
    `);
    
    // Create nurseries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS nurseries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL UNIQUE,
        address VARCHAR(255) NOT NULL,
        phone VARCHAR(255),
        email VARCHAR(255),
        description TEXT,
        opening_hours VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create newsletters table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletters (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        filename VARCHAR(255) NOT NULL,
        month VARCHAR(255),
        year VARCHAR(255),
        nursery_id INTEGER REFERENCES nurseries(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create gallery_categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create gallery_images table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        filename VARCHAR(255) NOT NULL,
        nursery_id INTEGER REFERENCES nurseries(id),
        category_id INTEGER REFERENCES gallery_categories(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

// Insert initial data
async function insertInitialData() {
  const client = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    // Insert default nursery if none exists
    const nurseryResult = await client.query('SELECT * FROM nurseries LIMIT 1');
    if (nurseryResult.rows.length === 0) {
      await client.query(`
        INSERT INTO nurseries (name, location, address, phone, email, description)
        VALUES 
        ('Hayes Nursery', 'hayes', '123 Hayes Road, Hayes', '01234567890', 'hayes@nurseries.com', 'A wonderful nursery in Hayes'),
        ('Uxbridge Nursery', 'uxbridge', '456 Uxbridge Road, Uxbridge', '01234567891', 'uxbridge@nurseries.com', 'A wonderful nursery in Uxbridge'),
        ('Hounslow Nursery', 'hounslow', '789 Hounslow Road, Hounslow', '01234567892', 'hounslow@nurseries.com', 'A wonderful nursery in Hounslow')
      `);
      console.log('Default nurseries added');
    }
    
    // Insert default gallery categories if none exist
    const categoryResult = await client.query('SELECT * FROM gallery_categories LIMIT 1');
    if (categoryResult.rows.length === 0) {
      await client.query(`
        INSERT INTO gallery_categories (name)
        VALUES 
        ('Activities'),
        ('Events'),
        ('Celebrations'),
        ('Playtime')
      `);
      console.log('Default gallery categories added');
    }
    
    console.log('Initial data inserted successfully!');
  } catch (error) {
    console.error('Error inserting initial data:', error);
  } finally {
    await client.end();
  }
}

// Run the initialization
async function init() {
  await createTables();
  await insertInitialData();
  console.log('Database initialization completed.');
}

init();