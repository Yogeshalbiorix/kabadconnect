import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const uri = process.env.MONGODB_URI;

console.log('Testing connection to MongoDB Atlas...');
console.log('URI:', uri ? uri.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1••••••••$3') : 'NOT FOUND');

if (!uri) {
  console.error('Error: MONGODB_URI is not set in .env');
  process.exit(1);
}

const startTime = Date.now();

mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 })
  .then(async (conn) => {
    const elapsed = Date.now() - startTime;
    console.log(`\nSUCCESS: Connected to MongoDB Atlas in ${elapsed}ms!`);
    console.log('Database Name:', conn.connection.name);
    console.log('Host:', conn.connection.host);
    
    // Check collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Collections count:', collections.length);
    collections.forEach(c => console.log(' -', c.name));

    await mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nFAILED TO CONNECT:');
    console.error('Error message:', err.message);
    if (err.message.includes('whitelisted') || err.message.includes('alert number 80')) {
      console.log('\n--> FIX REQUIRED: Your IP address is not whitelisted in MongoDB Atlas Network Access.');
      console.log('    1. Go to cloud.mongodb.com -> Network Access');
      console.log('    2. Click "+ Add IP Address"');
      console.log('    3. Click "Allow Access From Anywhere" (0.0.0.0/0) and Confirm.');
    }
    process.exit(1);
  });
