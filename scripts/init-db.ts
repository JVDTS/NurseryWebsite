import { db } from '../server/db';
import { hashPassword } from '../server/security';
import {
  nurseries,
  users,
} from '../shared/schema';

async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  try {
    // Create nurseries
    console.log('Creating nurseries...');
    
    const hayesNursery = await db.insert(nurseries)
      .values({
        name: "Hayes Nursery",
        location: "hayes",
        address: "192 Church Road, Hayes, UB3 2LT",
        phoneNumber: "01895 272885",
        email: "hayes@cmcnursery.co.uk",
        description: "Our Hayes nursery provides a warm, welcoming environment with an emphasis on creative expression and arts. Located in a converted church hall, it features bright, airy spaces filled with natural light, a dedicated creative arts studio, a music space, and a secure outdoor play area designed to encourage imaginative play and exploration.",
        heroImage: "https://images.unsplash.com/photo-1567448400815-a6fa3ac9c0ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
      
    const uxbridgeNursery = await db.insert(nurseries)
      .values({
        name: "Uxbridge Nursery",
        location: "uxbridge",
        address: "4 New Windsor Street, Uxbridge, UB8 2TU",
        phoneNumber: "01895 272885",
        email: "uxbridge@cmcnursery.co.uk",
        description: "Our Uxbridge nursery is a cozy, innovative environment with state-of-the-art learning facilities and a dedicated sensory room. We cater to children aged 2-5, providing a nurturing space where curious minds flourish. Our approach focuses on hands-on learning experiences that develop cognitive, social, and emotional skills while celebrating each child's unique personality and learning style.",
        heroImage: "https://images.unsplash.com/photo-1544487660-b86394cba400?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
      
    const hounslowNursery = await db.insert(nurseries)
      .values({
        name: "Hounslow Nursery",
        location: "hounslow",
        address: "488, 490 Great West Rd, Hounslow TW5 0TA",
        phoneNumber: "01895 272885",
        email: "hounslow@cmcnursery.co.uk",
        description: "Our Hounslow nursery is a nature-focused environment with extensive outdoor play areas and forest school activities. Designed for children aged 1-5, our approach emphasizes environmental awareness, exploration, and adventure. Children spend significant time outdoors in all seasons, developing resilience, physical skills, and a deep connection to the natural world, complemented by thoughtful indoor spaces that extend their learning.",
        heroImage: "https://images.unsplash.com/photo-1543248939-4296e1fea89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    console.log('Nurseries created successfully!');
    
    // Create admin users
    console.log('Creating admin users...');
    
    // Hash the passwords
    const superAdminPassword = await hashPassword('superadmin123');
    const hayesAdminPassword = await hashPassword('hayesadmin123');
    const uxbridgeAdminPassword = await hashPassword('uxbridgeadmin123');
    const hounslowAdminPassword = await hashPassword('hounslowadmin123');
    
    await db.insert(users)
      .values({
        username: "superadmin",
        password: superAdminPassword,
        firstName: "Super",
        lastName: "Admin",
        email: "admin@cmcnursery.co.uk",
        role: "super_admin",
        nurseryId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
    await db.insert(users)
      .values({
        username: "hayesadmin",
        password: hayesAdminPassword,
        firstName: "Hayes",
        lastName: "Manager",
        email: "hayes.manager@cmcnursery.co.uk",
        role: "nursery_admin",
        nurseryId: hayesNursery[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
    await db.insert(users)
      .values({
        username: "uxbridgeadmin",
        password: uxbridgeAdminPassword,
        firstName: "Uxbridge",
        lastName: "Manager",
        email: "uxbridge.manager@cmcnursery.co.uk",
        role: "nursery_admin",
        nurseryId: uxbridgeNursery[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
    await db.insert(users)
      .values({
        username: "hounslowadmin",
        password: hounslowAdminPassword,
        firstName: "Hounslow",
        lastName: "Manager",
        email: "hounslow.manager@cmcnursery.co.uk",
        role: "nursery_admin",
        nurseryId: hounslowNursery[0].id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    
    console.log('Admin users created successfully!');
    console.log('Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the initialization
initializeDatabase();