/**
 * Script to add sample events data to the database
 */
import pg from 'pg';
const { Pool } = pg;

async function addSampleEvents() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log("Adding sample events...");

    // Get nursery IDs
    const nurseryResult = await pool.query(`
      SELECT id, name FROM nurseries
    `);
    
    const nurseries = nurseryResult.rows;
    console.log(`Found ${nurseries.length} nurseries`);

    // Admin user ID for created_by field
    const adminId = 1; // Assuming user ID 1 is the admin

    // Sample event titles and descriptions
    const eventTemplates = [
      {
        title: "Parent's Evening",
        description: "Join us for an informative evening where you can meet with your child's key worker and discuss their progress.",
        location: "Main Hall"
      },
      {
        title: "Summer Fair",
        description: "Our annual summer fair with games, food, and activities for the whole family. All proceeds go to nursery improvements.",
        location: "Nursery Grounds"
      },
      {
        title: "Children's Art Exhibition",
        description: "A showcase of our children's amazing artwork from throughout the year. Refreshments will be provided.",
        location: "Activity Room"
      },
      {
        title: "Graduation Ceremony",
        description: "A special ceremony to celebrate our preschoolers moving on to primary school. Parents and family members welcome.",
        location: "Main Hall"
      },
      {
        title: "Holiday Club Registration",
        description: "Register your child for our holiday club during the school break. Limited spaces available.",
        location: "Reception Area"
      }
    ];

    // Insert sample events for each nursery
    for (const nursery of nurseries) {
      console.log(`Adding events for ${nursery.name} (ID: ${nursery.id})`);
      
      for (const template of eventTemplates) {
        // Create random future dates
        const today = new Date();
        const randomDays = Math.floor(Math.random() * 60) + 1; // 1-60 days in the future
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + randomDays);
        
        // Event duration between 1-3 hours
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + Math.floor(Math.random() * 3) + 1);
        
        await pool.query(`
          INSERT INTO events (
            title, description, location, start_date, end_date, 
            all_day, nursery_id, created_by, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
          )
        `, [
          template.title,
          template.description,
          template.location,
          startDate.toISOString(),
          endDate.toISOString(),
          false, // all_day
          nursery.id,
          adminId
        ]);
        
        console.log(`  - Added event: ${template.title}`);
      }
    }

    console.log("Sample events added successfully!");
  } catch (error) {
    console.error("Error adding sample events:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

addSampleEvents()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });