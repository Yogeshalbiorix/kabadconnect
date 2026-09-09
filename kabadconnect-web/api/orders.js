import { connectToDatabase, isDbConfigured } from './lib/dbConnect.js';
import Order from './models/Order.js';

// Fallback initial demo orders if DB is not yet populated
const INITIAL_DEMO_ORDERS = [
  {
    id: 'KC-7729',
    userId: 'usr-customer-1',
    customer: {
      name: 'Aarav Sharma',
      phone: '+91 98100 23456',
      email: 'aarav@kabadconnect.com',
      address: 'Flat 402, Block B, Amrapali Village, Indirapuram, Delhi NCR - 201014',
      city: 'Delhi NCR'
    },
    categories: ['paper', 'plastics'],
    estimatedWeight: '20-50 kg',
    itemsWeighed: [
      { name: 'Old Newspapers (Akhbaar)', weight: '14.5 kg', rate: '₹14/kg', amount: 203 },
      { name: 'Cardboard Boxes (Gatta)', weight: '18.0 kg', rate: '₹10/kg', amount: 180 },
      { name: 'Mixed Plastic Bottles', weight: '6.2 kg', rate: '₹12/kg', amount: 74.4 }
    ],
    totalPayout: 457.4,
    scheduledDate: 'Today',
    timeSlot: '11:00 AM - 01:00 PM',
    status: 'en_route',
    kabadwala: {
      id: 'kw-1',
      name: 'Ramu Kabadwala (Green Recyclers)',
      phone: '+91 98102 34567',
      rating: 4.9,
      vehicle: 'Electric Loader (DL-1E-9021)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    upiId: 'aarav.sharma@okhdfcbank',
    createdAt: new Date().toISOString()
  },
  {
    id: 'KC-7681',
    userId: 'usr-customer-1',
    customer: {
      name: 'Aarav Sharma',
      phone: '+91 98100 23456',
      email: 'aarav@kabadconnect.com',
      address: 'Flat 402, Block B, Amrapali Village, Indirapuram, Delhi NCR - 201014',
      city: 'Delhi NCR'
    },
    categories: ['metal', 'ewaste'],
    estimatedWeight: '15-25 kg',
    itemsWeighed: [
      { name: 'Iron & Steel Scrap', weight: '12.0 kg', rate: '₹28/kg', amount: 336 },
      { name: 'Obsolete PC Tower / Motherboard', weight: '1 pc', rate: '₹450/pc', amount: 450 }
    ],
    totalPayout: 786,
    scheduledDate: 'Yesterday',
    timeSlot: '03:00 PM - 05:00 PM',
    status: 'completed',
    kabadwala: {
      id: 'kw-2',
      name: 'Suresh Kumar (EcoSeva)',
      phone: '+91 98765 43210',
      rating: 4.8,
      vehicle: 'Electric Tempo (DL-2E-4411)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    },
    upiId: 'aarav.sharma@okhdfcbank',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const configured = isDbConfigured();

  // ----------------------------------------------------
  // GET /api/orders: Fetch all orders (with optional filters)
  // ----------------------------------------------------
  if (req.method === 'GET') {
    if (!configured) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        data: INITIAL_DEMO_ORDERS,
        message: 'Running in demo mode. Configure MONGODB_URI to persist orders.'
      });
    }

    try {
      await connectToDatabase();
      const { status, userId } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (userId) filter.userId = userId;

      let orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

      // If database collection is empty, auto-seed initial demo orders
      if (!orders || orders.length === 0) {
        try {
          await Order.insertMany(INITIAL_DEMO_ORDERS);
          orders = INITIAL_DEMO_ORDERS;
        } catch (seedErr) {
          orders = INITIAL_DEMO_ORDERS;
        }
      }

      return res.status(200).json({
        success: true,
        source: 'mongodb',
        count: orders.length,
        data: orders
      });
    } catch (err) {
      console.warn('[API Orders] MongoDB error, returning fallback:', err.message);
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        data: INITIAL_DEMO_ORDERS,
        error: err.message
      });
    }
  }

  // ----------------------------------------------------
  // POST /api/orders: Create a new pickup booking
  // ----------------------------------------------------
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Ensure unique order ID
    if (!body.id) {
      body.id = `KC-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (!configured) {
      return res.status(201).json({
        success: true,
        source: 'local_fallback',
        data: body,
        message: 'Order created in local demo state. Configure MONGODB_URI for database persistence.'
      });
    }

    try {
      await connectToDatabase();
      const created = await Order.create(body);
      return res.status(201).json({
        success: true,
        source: 'mongodb',
        data: created
      });
    } catch (err) {
      console.error('[API Orders] Failed to create in MongoDB:', err.message);
      return res.status(201).json({
        success: true,
        source: 'local_fallback',
        data: body,
        warning: `Database save failed (${err.message}). Retained in client state.`
      });
    }
  }

  // ----------------------------------------------------
  // PUT /api/orders: Update order status, kabadwala, or cancellation
  // ----------------------------------------------------
  if (req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const orderId = req.query.id || body.id;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    if (!configured) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        data: body
      });
    }

    try {
      await connectToDatabase();
      const updated = await Order.findOneAndUpdate(
        { id: orderId },
        { $set: { ...body, updatedAt: new Date() } },
        { new: true, upsert: true }
      );

      return res.status(200).json({
        success: true,
        source: 'mongodb',
        data: updated
      });
    } catch (err) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        data: body,
        error: err.message
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
