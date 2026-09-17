import { connectToDatabase, isDbConfigured } from '../_lib/dbConnect.js';
import Order from '../_models/Order.js';
import { sendOtpEmail } from '../_lib/emailService.js';

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
  // GET /api/orders: Fetch orders (filtered by user or agent if requested)
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
      const { status, userId, email, phone, city, assignedAgentId, unassignedCity } = req.query || {};
      const filter = {};

      if (status) {
        if (status.includes(',')) {
          filter.status = { $in: status.split(',').map(s => s.trim()) };
        } else {
          filter.status = status;
        }
      }
      if (userId) filter.userId = userId;
      if (email) filter['customer.email'] = email.toLowerCase().trim();
      if (phone) filter['customer.phone'] = phone.trim();
      if (city) filter['customer.city'] = new RegExp(city.trim(), 'i');
      if (assignedAgentId) {
        filter.$or = [
          { assignedAgentId: assignedAgentId },
          { agentId: assignedAgentId },
          { 'kabadwala.id': assignedAgentId }
        ];
      }
      if (unassignedCity) {
        filter['customer.city'] = new RegExp(unassignedCity.trim(), 'i');
        filter.status = { $in: ['pending', 'scheduled', 'confirmed'] };
        filter.assignedAgentId = { $in: [null, ''] };
      }

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

    // Ensure status defaults to 'pending'
    if (!body.status) {
      body.status = 'pending';
    }

    // Auto-generate 4-digit secure Doorstep Verification OTP
    const generatedOtp = body.doorstepVerification?.otp || body.otp || Math.floor(1000 + Math.random() * 9000).toString();
    body.doorstepVerification = {
      otp: generatedOtp,
      otpExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      isVerified: false,
      paymentStatus: 'locked',
      paidAmount: 0,
      ...(body.doorstepVerification || {})
    };

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
  // PUT /api/orders: Update order status, agent assignment, doorstep verification, or cancellation
  // ----------------------------------------------------
  if (req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const orderId = req.query?.id || body?.id;
    const action = req.query?.action || body?.action;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    // Optional email dispatch for Doorstep OTP
    const targetEmail = body.customerEmail || body.customer?.email;
    const doorstepOtp = body.doorstepVerification?.otp;
    if (body.sendDoorstepOtpEmail && targetEmail && doorstepOtp) {
      sendOtpEmail({
        to: targetEmail,
        otp: doorstepOtp,
        purpose: 'doorstep_verification',
        orderId: orderId,
        amount: body.totalPaid || body.doorstepVerification?.paidAmount || ''
      }).catch(e => console.warn('[Orders API] Doorstep OTP Email dispatch error:', e.message));
    }

    // Handle Field Agent Acceptance Action
    if (action === 'accept-pickup') {
      body.status = 'assigned';
      body.acceptedAt = new Date();
      if (body.agent) {
        const vReg = body.agent.vehicleRegNo || body.agent.vehicleNumber || 'Unregistered';
        const vType = body.agent.vehicleType || 'Electric 3-Wheeler Cargo';
        body.assignedAgentId = body.agent.id || body.agent._id;
        body.assignedAgentEmail = body.agent.email;
        body.agentName = body.agent.name;
        body.agentPhone = body.agent.phone;
        body.agentCode = body.agent.agentCode || body.agent.badgeNumber || 'AGT-7749';
        body.agentVehicle = `${vType} • Reg: ${vReg}`;
        body.agentAvatar = body.agent.avatar;
        // Also sync to kabadwala object for backward compatibility
        body.kabadwala = {
          id: body.agent.id || body.agent._id,
          name: body.agent.name,
          phone: body.agent.phone,
          rating: Number(body.agent.rating) || 5.0,
          vehicle: `${vType} • Reg: ${vReg}`,
          avatar: body.agent.avatar,
          photo: body.agent.avatar
        };
      }
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
