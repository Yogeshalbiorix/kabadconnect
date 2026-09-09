import { connectToDatabase, isDbConfigured } from './lib/dbConnect.js';
import Order from './models/Order.js';
import ScrapRate from './models/ScrapRate.js';
import Partner from './models/Partner.js';
import MarketplaceItem from './models/MarketplaceItem.js';
import User from './models/User.js';
import { 
  DEFAULT_SCRAP_ITEMS, 
  DEFAULT_PARTNERS, 
  DEFAULT_MARKETPLACE_ITEMS,
  DEFAULT_ORDERS,
  DEFAULT_USERS
} from './lib/seedData.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  if (!isDbConfigured()) {
    return res.status(400).json({
      success: false,
      error: 'MONGODB_URI is not configured or contains placeholder <db_password>. Using local session fallback.'
    });
  }

  try {
    await connectToDatabase();

    // 1. Seed Rates
    await ScrapRate.deleteMany({});
    await ScrapRate.insertMany(DEFAULT_SCRAP_ITEMS);

    // 2. Seed Partners
    await Partner.deleteMany({});
    await Partner.insertMany(DEFAULT_PARTNERS);

    // 3. Seed Marketplace (User Pre-Loved Goods + Recycled Products)
    await MarketplaceItem.deleteMany({});
    await MarketplaceItem.insertMany(DEFAULT_MARKETPLACE_ITEMS);

    // 4. Seed Orders
    await Order.deleteMany({});
    await Order.insertMany(DEFAULT_ORDERS);

    // 5. Seed Users
    await User.deleteMany({});
    await User.insertMany(DEFAULT_USERS);

    return res.status(200).json({
      success: true,
      message: 'Successfully seeded all 5 collections in MongoDB (Scrap Rates, Partners, Marketplace Goods, Orders, Users)!',
      counts: {
        rates: DEFAULT_SCRAP_ITEMS.length,
        partners: DEFAULT_PARTNERS.length,
        marketplace: DEFAULT_MARKETPLACE_ITEMS.length,
        orders: DEFAULT_ORDERS.length,
        users: DEFAULT_USERS.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
