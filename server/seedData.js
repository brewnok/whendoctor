import Doctor from './models/Doctor.js';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedDatabase() {
  try {
    // Check if the collection exists, create it if it doesn't
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('doctors')) {
      console.log('Creating doctors collection...');
      await mongoose.connection.db.createCollection('doctors');
      console.log('Doctors collection created successfully');
    } else {
      console.log('Doctors collection already exists');
    }
    
    // Log the number of existing doctors (for information purposes)
    const count = await Doctor.countDocuments();
    console.log(`Database contains ${count} doctors`);
    console.log('No seeding performed - data will be added through admin interface');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}