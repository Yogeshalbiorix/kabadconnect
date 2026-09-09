import { connectToDatabase, isDbConfigured, getMongoUri } from './lib/dbConnect.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const startTime = Date.now();
  const uri = getMongoUri();

  if (uri && (uri.includes('<db_password>') || uri.includes('<password>') || /<[^>]+>/.test(uri))) {
    return res.status(200).json({
      status: 'placeholder_password',
      database: 'offline',
      connected: false,
      message: 'MONGODB_URI still contains "<db_password>" placeholder! Please replace "<db_password>" with your actual MongoDB Atlas database user password in .env or Vercel Environment Variables.',
      environment: process.env.NODE_ENV || 'development',
      vercelDeployment: Boolean(process.env.VERCEL),
      timestamp: new Date().toISOString()
    });
  }

  const configured = isDbConfigured();

  if (!configured) {
    return res.status(200).json({
      status: 'demo_fallback',
      database: 'offline',
      connected: false,
      message: 'MONGODB_URI is not configured. The app is running in client/local demo mode. To connect real MongoDB Atlas, set MONGODB_URI in Vercel Environment Variables or .env.',
      environment: process.env.NODE_ENV || 'development',
      vercelDeployment: Boolean(process.env.VERCEL),
      timestamp: new Date().toISOString()
    });
  }

  try {
    const conn = await connectToDatabase();
    if (!conn) {
      throw new Error('Database connection failed.');
    }

    // Ping the database
    await conn.connection.db.admin().ping();
    const pingMs = Date.now() - startTime;

    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      connected: true,
      pingMs,
      dbName: conn.connection.name,
      host: conn.connection.host,
      message: 'Successfully connected to MongoDB Atlas cluster.',
      environment: process.env.NODE_ENV || 'development',
      vercelDeployment: Boolean(process.env.VERCEL),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(200).json({
      status: 'connection_error',
      database: 'disconnected',
      connected: false,
      error: err.message,
      message: 'Could not connect to MongoDB. Check Atlas network access whitelist (0.0.0.0/0) and credentials.',
      timestamp: new Date().toISOString()
    });
  }
}
