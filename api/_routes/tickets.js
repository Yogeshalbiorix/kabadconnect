import { connectToDatabase, isDbConfigured } from '../_lib/dbConnect.js';
import Ticket from '../_models/Ticket.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const configured = isDbConfigured();

  // ----------------------------------------------------
  // GET /api/tickets: Retrieve support tickets
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
      const { email, userId, category, status } = req.query || {};
      const filter = {};
      if (email) filter.email = email.toLowerCase().trim();
      if (userId) filter.userId = userId.trim();
      if (category) filter.category = category;
      if (status) filter.status = status;

      const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).lean();

      return res.status(200).json({
        success: true,
        source: 'mongodb',
        count: tickets.length,
        data: tickets
      });
    } catch (err) {
      console.warn('[API Tickets] MongoDB error:', err.message);
      return res.status(500).json({
        success: false,
        error: err.message,
        data: []
      });
    }
  }

  // ----------------------------------------------------
  // POST /api/tickets: Submit a new support ticket
  // ----------------------------------------------------
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { name, email, phone, category, orderId, subject, message, userId } = body;

      if (!name?.trim() || !email?.trim() || !message?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Name, email, and message are required fields.'
        });
      }

      const ticketId = body.id || `TICKET-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTicketData = {
        id: ticketId,
        userId: userId || '',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: (phone || '').trim(),
        category: category || 'Pickup Issue',
        orderId: (orderId || '').trim(),
        subject: (subject || 'Support Inquiry').trim(),
        message: message.trim(),
        status: 'OPEN',
        priority: 'MEDIUM',
        estimatedResolution: 'Under 15 minutes',
        createdAt: new Date().toISOString()
      };

      if (!configured) {
        return res.status(201).json({
          success: true,
          source: 'local_fallback',
          message: 'Support ticket saved in client session (configure MONGODB_URI for cloud storage).',
          data: newTicketData
        });
      }

      await connectToDatabase();
      const savedTicket = await Ticket.create(newTicketData);

      console.log(`[API Tickets] New support ticket #${ticketId} created in MongoDB for ${email}`);

      return res.status(201).json({
        success: true,
        source: 'mongodb',
        message: 'Support ticket saved to MongoDB Atlas database successfully!',
        data: savedTicket
      });
    } catch (err) {
      console.error('[API Tickets] Create ticket error:', err);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
