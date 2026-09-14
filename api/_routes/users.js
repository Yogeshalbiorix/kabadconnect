import { connectToDatabase, isDbConfigured } from '../_lib/dbConnect.js';
import User from '../_models/User.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const configured = isDbConfigured();

  // ----------------------------------------------------
  // GET /api/users: Fetch user by email, phone, id, or list all
  // ----------------------------------------------------
  if (req.method === 'GET') {
    const { email, phone, id } = req.query || {};

    if (!configured) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        message: 'Running in client demo mode. MONGODB_URI not yet configured.',
        data: []
      });
    }

    try {
      await connectToDatabase();
      let query = {};
      if (id) query.id = id;
      else if (email) query.email = email.toLowerCase();
      else if (phone) query.phone = phone;

      if (id || email || phone) {
        const user = await User.findOne(query).lean();
        return res.status(200).json({
          success: true,
          source: 'mongodb',
          data: user
        });
      }

      const users = await User.find({}).sort({ createdAt: -1 }).limit(50).lean();
      return res.status(200).json({
        success: true,
        source: 'mongodb',
        count: users.length,
        data: users
      });
    } catch (err) {
      console.warn('[API Users] MongoDB error:', err.message);
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        error: err.message,
        data: []
      });
    }
  }

  // ----------------------------------------------------
  // POST /api/users: Create or Upsert User in MongoDB
  // ----------------------------------------------------
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!body || (!body.email && !body.phone && !body.id)) {
      return res.status(400).json({ success: false, error: 'User email, phone, or id is required' });
    }

    if (!body.id) {
      body.id = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    if (body.email) {
      body.email = body.email.toLowerCase().trim();
    }

    if (!configured) {
      return res.status(201).json({
        success: true,
        source: 'local_fallback',
        data: body,
        message: 'User stored in client state. Configure MONGODB_URI for database persistence.'
      });
    }

    try {
      await connectToDatabase();
      const filter = body.email ? { email: body.email } : { id: body.id };
      const savedUser = await User.findOneAndUpdate(
        filter,
        { $set: body },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();

      return res.status(201).json({
        success: true,
        source: 'mongodb',
        message: 'User saved to MongoDB Atlas successfully!',
        data: savedUser
      });
    } catch (err) {
      console.error('[API Users] Failed to save user in MongoDB:', err.message);
      return res.status(201).json({
        success: true,
        source: 'local_fallback',
        data: body,
        warning: `Database save failed (${err.message}). Retained in client state.`
      });
    }
  }

  // ----------------------------------------------------
  // PUT / PATCH /api/users: Update existing user profile
  // ----------------------------------------------------
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const identifier = req.query?.id || body?.id || req.query?.email || body?.email;

    if (!identifier) {
      return res.status(400).json({ success: false, error: 'User ID or Email is required' });
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
      const filter = identifier.includes('@') ? { email: identifier.toLowerCase() } : { id: identifier };
      const updated = await User.findOneAndUpdate(
        filter,
        { $set: body },
        { new: true }
      ).lean();

      return res.status(200).json({
        success: true,
        source: 'mongodb',
        data: updated
      });
    } catch (err) {
      console.error('[API Users] Failed to update user in MongoDB:', err.message);
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        data: body,
        warning: err.message
      });
    }
  }

  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}
