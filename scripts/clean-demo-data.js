import dotenv from 'dotenv';
dotenv.config();

import { connectToDatabase } from '../api/_lib/dbConnect.js';
import User from '../api/_models/User.js';
import Order from '../api/_models/Order.js';

async function cleanDemoData() {
  console.log('Connecting to MongoDB Atlas...');
  const conn = await connectToDatabase();
  if (!conn) {
    console.error('Failed to connect to MongoDB Atlas.');
    process.exit(1);
  }

  console.log('Connected! Purging mock demo users and demo orders...');

  // 1. Remove mock demo users
  const deleteUsersResult = await User.deleteMany({
    $or: [
      { email: { $regex: /kabad(connect|collect)\.com$/i } },
      { id: { $in: ['usr-customer-1', 'usr-agent-842', 'usr-partner-104', 'usr-admin-1', 'usr-1', 'usr-2'] } },
      { name: { $in: ['Aarav Sharma', 'Vikram Singhania', 'Priya Verma', 'Rajesh Kumar Verma', 'Rameshwar Dayal Gupta'] } }
    ]
  });
  console.log(`✓ Removed ${deleteUsersResult.deletedCount} demo users from MongoDB Atlas.`);

  // 2. Remove mock demo orders
  const deleteOrdersResult = await Order.deleteMany({
    $or: [
      { id: { $in: ['KC-7729', 'KC-7681', 'KC-DEMO-1', 'KC-DEMO-2'] } },
      { 'customer.email': { $regex: /kabad(connect|collect)\.com$/i } }
    ]
  });
  console.log(`✓ Removed ${deleteOrdersResult.deletedCount} demo orders from MongoDB Atlas.`);

  // List remaining users
  const remainingUsers = await User.find({}, 'name email role phone createdAt').lean();
  console.log(`\nCurrent remaining users in MongoDB Atlas (${remainingUsers.length}):`);
  remainingUsers.forEach(u => console.log(` - ${u.name} (${u.email}) [${u.role}]`));

  // List remaining orders count
  const remainingOrdersCount = await Order.countDocuments();
  console.log(`Current remaining orders in MongoDB Atlas: ${remainingOrdersCount}`);

  console.log('\nDemo data cleanup completed successfully!');
  process.exit(0);
}

cleanDemoData().catch((err) => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
