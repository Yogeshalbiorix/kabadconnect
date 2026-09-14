import { connectToDatabase, isDbConfigured } from '../_lib/dbConnect.js';
import Order from '../_models/Order.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const configured = isDbConfigured();

  // ----------------------------------------------------
  // GET /api/orders: Fetch orders (filtered by user if requested)
  // ----------------------------------------------------
  if (req.method === 'GET') {
    if (!configured) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        data: [],
        count: 0
      });
    }

    try {
      await connectToDatabase();
      const { status, userId, email, phone } = req.query || {};
      const filter = {};
      if (status) filter.status = status;
      if (userId) filter.userId = userId;
      if (email) filter['customer.email'] = email.toLowerCase().trim();
      if (phone) filter['customer.phone'] = phone.trim();

      const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

      return res.status(200).json({
        success: true,
        source: 'mongodb',
        count: orders.length,
        data: orders
      });
    } catch (err) {
      console.warn('[API Orders] MongoDB error:', err.message);
      return res.status(500).json({
        success: false,
        error: err.message,
        data: []
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
        message: 'Order created.'
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
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  // ----------------------------------------------------
  // PUT /api/orders: Update order status, kabadwala, or cancellation
  // ----------------------------------------------------
  if (req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const orderId = req.query?.id || body?.id;

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
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  // ----------------------------------------------------
  // DELETE /api/orders: Remove an order
  // ----------------------------------------------------
  if (req.method === 'DELETE') {
    const orderId = req.query?.id;
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    try {
      await connectToDatabase();
      await Order.deleteOne({ id: orderId });
      return res.status(200).json({ success: true, message: `Order ${orderId} deleted` });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
