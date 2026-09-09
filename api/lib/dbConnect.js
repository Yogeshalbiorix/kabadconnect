import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Attempt to load .env from current working directory or subfolder
dotenv.config({ override: true });
try {
  dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
  dotenv.config({ path: path.resolve(process.cwd(), 'kabadconnect-web/.env'), override: true });
  dotenv.config({ path: path.resolve(process.cwd(), '../.env'), override: true });
} catch {}

export function getMongoUri() {
  try {
    dotenv.config({ override: true });
    dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
    dotenv.config({ path: path.resolve(process.cwd(), 'kabadconnect-web/.env'), override: true });
  } catch {}
  return process.env.MONGODB_URI || '';
}

export function setMongoUri(uri) {
  process.env.MONGODB_URI = uri;
}

export async function resetConnection() {
  if (cached && cached.conn) {
    try {
      await mongoose.disconnect();
    } catch {}
  }
  cached.conn = null;
  cached.promise = null;
}

/**
 * Global cached Mongoose connection to prevent connection exhaustion
 * in Vercel Serverless environment.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const uri = getMongoUri();
  if (!uri || !isDbConfigured()) {
    console.warn('[MongoDB] MONGODB_URI is missing or contains placeholder <db_password>.');
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(uri, opts)
      .then((mongooseInstance) => {
        console.log('[MongoDB] Connected successfully to MongoDB Atlas.');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('[MongoDB] Connection error:', err.message);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

export function isDbConfigured() {
  const uri = getMongoUri();
  if (!uri) return false;
  if (uri.includes('<db_password>') || uri.includes('<password>') || /<[^>]+>/.test(uri)) {
    return false;
  }
  return true;
}

