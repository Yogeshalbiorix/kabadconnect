import fs from 'fs';
import path from 'path';
import { connectToDatabase, resetConnection, setMongoUri, getMongoUri, isDbConfigured } from '../_lib/dbConnect.js';
import ScrapRate from '../_models/ScrapRate.js';
import Partner from '../_models/Partner.js';
import MarketplaceItem from '../_models/MarketplaceItem.js';
import Order from '../_models/Order.js';
import User from '../_models/User.js';
import {
  DEFAULT_SCRAP_ITEMS,
  DEFAULT_PARTNERS,
  DEFAULT_MARKETPLACE_ITEMS,
  DEFAULT_ORDERS,
  DEFAULT_USERS
} from '../_lib/seedData.js';

function updateEnvFile(filePath, key, value) {
  try {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}\n`;
    }
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (err) {
    console.warn(`[config-db] Could not update ${filePath}:`, err.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET: Return current connection configuration info (with masked credentials)
  if (req.method === 'GET') {
    const uri = getMongoUri();
    const hasPlaceholder = uri.includes('<db_password>') || uri.includes('<password>') || /<[^>]+>/.test(uri);
    
    // Mask password in URI
    let maskedUri = uri;
    if (uri && !hasPlaceholder) {
      maskedUri = uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1••••••••$3');
    }

    return res.status(200).json({
      configured: isDbConfigured(),
      hasPlaceholder,
      maskedUri,
      currentUri: uri
    });
  }

  // POST: Update connection credentials and verify live connection
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { password, uri, databaseName = 'kabadconnect' } = body;

    let targetUri = '';

    if (uri && uri.trim()) {
      targetUri = uri.trim();
    } else if (password && password.trim()) {
      const trimmedPass = password.trim();
      targetUri = `mongodb+srv://yogeshalbiorix_db_user:${encodeURIComponent(trimmedPass)}@cluster0.xzdc97o.mongodb.net/${databaseName}?retryWrites=true&w=majority&appName=Cluster0`;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please provide either a database user password or a full MongoDB URI.'
      });
    }

    // 1. Update .env files in both project root and kabadconnect-web
    try {
      const rootEnv = path.resolve(process.cwd(), '../.env');
      const webEnv = path.resolve(process.cwd(), '.env');
      const directWebEnv = path.resolve(process.cwd(), 'kabadconnect-web/.env');
      const directRootEnv = path.resolve(process.cwd(), '.env');

      updateEnvFile(rootEnv, 'MONGODB_URI', targetUri);
      updateEnvFile(webEnv, 'MONGODB_URI', targetUri);
      updateEnvFile(directWebEnv, 'MONGODB_URI', targetUri);
      updateEnvFile(directRootEnv, 'MONGODB_URI', targetUri);
    } catch (e) {
      console.warn('[config-db] Error writing .env files:', e.message);
    }

    // 2. Set environment variable in running process & reset Mongoose
    setMongoUri(targetUri);
    await resetConnection();

    // 3. Test the connection
    const startTime = Date.now();
    try {
      const conn = await connectToDatabase();
      if (!conn) {
        throw new Error('Database connection returned null.');
      }

      await conn.connection.db.admin().ping();
      const pingMs = Date.now() - startTime;

      // 4. Auto-seed if collections are empty so user gets instant working data
      let ratesCount = await ScrapRate.countDocuments();
      if (ratesCount === 0) {
        await ScrapRate.insertMany(DEFAULT_SCRAP_ITEMS);
        ratesCount = DEFAULT_SCRAP_ITEMS.length;
      }

      let partnersCount = await Partner.countDocuments();
      if (partnersCount === 0) {
        await Partner.insertMany(DEFAULT_PARTNERS);
        partnersCount = DEFAULT_PARTNERS.length;
      }

      let marketplaceCount = await MarketplaceItem.countDocuments();
      if (marketplaceCount === 0) {
        await MarketplaceItem.insertMany(DEFAULT_MARKETPLACE_ITEMS);
        marketplaceCount = DEFAULT_MARKETPLACE_ITEMS.length;
      }

      let ordersCount = await Order.countDocuments();
      if (ordersCount === 0) {
        await Order.insertMany(DEFAULT_ORDERS);
        ordersCount = DEFAULT_ORDERS.length;
      }

      let usersCount = await User.countDocuments();
      if (usersCount === 0) {
        await User.insertMany(DEFAULT_USERS);
        usersCount = DEFAULT_USERS.length;
      }

      return res.status(200).json({
        success: true,
        connected: true,
        pingMs,
        dbName: conn.connection.name,
        host: conn.connection.host,
        message: 'Successfully connected to MongoDB Atlas! All 5 collections are active and managed by MongoDB.',
        counts: {
          rates: ratesCount,
          partners: partnersCount,
          marketplace: marketplaceCount,
          orders: ordersCount,
          users: usersCount
        }
      });
    } catch (err) {
      console.error('[config-db] Connection verification error:', err.message);
      return res.status(200).json({
        success: false,
        connected: false,
        error: err.message,
        message: `Failed to connect to MongoDB Atlas (${err.message}). Please verify that your password is correct and that MongoDB Atlas Network Access allows 0.0.0.0/0 (all IPs).`
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
