import dotenv from 'dotenv';
dotenv.config();

import { connectToDatabase } from '../api/_lib/dbConnect.js';
import Order from '../api/_models/Order.js';
import ScrapRate from '../api/_models/ScrapRate.js';
import Partner from '../api/_models/Partner.js';
import MarketplaceItem from '../api/_models/MarketplaceItem.js';
import User from '../api/_models/User.js';
import { 
  DEFAULT_SCRAP_ITEMS, 
  DEFAULT_PARTNERS, 
  DEFAULT_MARKETPLACE_ITEMS, 
  DEFAULT_ORDERS, 
  DEFAULT_USERS 
} from '../api/_lib/seedData.js';

async function seed() {
  console.log('Connecting to MongoDB Atlas to seed data...');
  const conn = await connectToDatabase();
  if (!conn) {
    console.error('Failed to connect to database.');
    process.exit(1);
  }

  console.log('Connected! Seeding collections...');

  // 1. Rates
  await ScrapRate.deleteMany({});
  await ScrapRate.insertMany(DEFAULT_SCRAP_ITEMS);
  console.log(`✓ Seeded ${DEFAULT_SCRAP_ITEMS.length} scrap rate items`);

  // 2. Partners
  await Partner.deleteMany({});
  await Partner.insertMany(DEFAULT_PARTNERS);
  console.log(`✓ Seeded ${DEFAULT_PARTNERS.length} verified kabadwala partners`);

  // 3. Marketplace
  await MarketplaceItem.deleteMany({});
  await MarketplaceItem.insertMany(DEFAULT_MARKETPLACE_ITEMS);
  console.log(`✓ Seeded ${DEFAULT_MARKETPLACE_ITEMS.length} marketplace items`);

  // 4. Orders
  await Order.deleteMany({});
  await Order.insertMany(DEFAULT_ORDERS);
  console.log(`✓ Seeded ${DEFAULT_ORDERS.length} pickup orders`);

  // 5. Users
  await User.deleteMany({});
  await User.insertMany(DEFAULT_USERS);
  console.log(`✓ Seeded ${DEFAULT_USERS.length} users`);

  console.log('\nAll 5 collections seeded successfully in MongoDB Atlas!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
