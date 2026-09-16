import dbConnect from '../_lib/dbConnect.js';
import Ticket from '../_models/Ticket.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const method = req.method;

  // GET: Fetch tickets
  if (method === 'GET') {
    try {
      const { email, userId, ticketId } = req.query || {};

      const isConfigured = !!(process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb'));
      if (!isConfigured) {
        return res.status(200).json({
          success: true,
          source: 'demo_fallback',
          message: 'MongoDB URI not set, demo storage active.',
          data: []
        });
      }

      await dbConnect();

      let filter = {};
      if (ticketId) {
        filter.ticketId = ticketId;
      } else if (email) {
        filter.email = email.toLowerCase().trim();
      } else if (userId) {
        filter.userId = userId;
      }

      const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).lean();

      return res.status(200).json({
        success: true,
        source: 'mongodb',
        count: tickets.length,
        data: tickets
      });
    } catch (err) {
      console.error('[API /api/tickets GET error]:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST: Create a new support ticket in MongoDB Atlas
  if (method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { name, email, phone, category, orderId, subject, message, userId } = body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Name is required.' });
      }
      if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, error: 'Valid email address is required.' });
      }
      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, error: 'Detailed message is required.' });
      }

      const generatedTicketId = `TICKET-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newTicketData = {
        ticketId: generatedTicketId,
        userId: userId || '',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: (phone || '').trim(),
        category: category || 'Pickup Issue',
        orderId: (orderId || '').trim(),
        subject: (subject || 'Support Ticket').trim(),
        message: message.trim(),
        status: 'OPEN',
        estimatedResolution: 'Under 15 minutes',
        createdAt: new Date()
      };

      const isConfigured = !!(process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb'));
      
      if (!isConfigured) {
        return res.status(201).json({
          success: true,
          source: 'local_fallback',
          message: 'Ticket created in demo state. (Configure MONGODB_URI for cloud persistence).',
          data: newTicketData
        });
      }

      await dbConnect();
      const savedTicket = await Ticket.create(newTicketData);

      console.log(`[API /api/tickets] Saved ticket ${savedTicket.ticketId} to MongoDB Atlas for ${savedTicket.email}`);

      return res.status(201).json({
        success: true,
        source: 'mongodb',
        message: `Support ticket #${savedTicket.ticketId} saved directly to MongoDB Atlas database!`,
        data: savedTicket
      });
    } catch (err) {
      console.error('[API /api/tickets POST error]:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
}
