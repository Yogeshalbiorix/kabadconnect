import { connectToDatabase, isDbConfigured } from '../_lib/dbConnect.js';
import User, { hashPassword, verifyPassword } from '../_models/User.js';
import Otp from '../_models/Otp.js';
import { sendOtpEmail } from '../_lib/emailService.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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
        message: 'MongoDB URI not configured.',
        data: []
      });
    }

    try {
      await connectToDatabase();
      let query = {};
      if (id) query.id = id;
      else if (email) query.email = email.toLowerCase().trim();
      else if (phone) query.phone = phone.trim();

      if (id || email || phone) {
        const user = await User.findOne(query).select('-password').lean();
        if (!user) {
          return res.status(404).json({ success: false, error: 'User not found in MongoDB database.' });
        }
        return res.status(200).json({
          success: true,
          source: 'mongodb',
          data: user
        });
      }

      const users = await User.find({}).select('-password').sort({ createdAt: -1 }).limit(100).lean();
      return res.status(200).json({
        success: true,
        source: 'mongodb',
        count: users.length,
        data: users
      });
    } catch (err) {
      console.warn('[API Users] MongoDB error:', err.message);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  // ----------------------------------------------------
  // POST /api/users: Register, Login, or Create User
  // ----------------------------------------------------
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const action = req.query?.action || body?.action || 'register';

    if (!configured) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB Atlas is not configured. Please check MONGODB_URI in .env.'
      });
    }

    // ==========================================
    // ACTION: SEND OTP (Email verification)
    // ==========================================
    if (action === 'send-otp') {
      const email = (body.email || '').toLowerCase().trim();
      const purpose = body.purpose === 'register' ? 'register' : 'login';

      if (!email || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid email address.'
        });
      }

      try {
        await connectToDatabase();

        const user = await User.findOne({ email }).lean();

        if (purpose === 'register' && user) {
          return res.status(409).json({
            success: false,
            error: `An account already exists with ${email}. Please sign in instead.`
          });
        }

        // Generate 6-digit numeric OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        await Otp.findOneAndUpdate(
          { email, purpose },
          { otp: otpCode, expiresAt },
          { upsert: true, returnDocument: 'after' }
        );

        const emailResult = await sendOtpEmail({ to: email, otp: otpCode, purpose });

        if (!emailResult.success) {
          return res.status(500).json({
            success: false,
            error: emailResult.error || 'Failed to deliver OTP email. Please check your email address.'
          });
        }

        return res.status(200).json({
          success: true,
          message: `Verification code sent to ${email}. Please check your inbox or spam folder.`,
          email,
          purpose
        });
      } catch (err) {
        console.error('[API Send OTP Error]:', err);
        return res.status(500).json({ success: false, error: err.message || 'Failed to send OTP.' });
      }
    }

    // ==========================================
    // ACTION: VERIFY OTP FOR SIGN IN / LOGIN
    // ==========================================
    if (action === 'verify-otp-login') {
      const email = (body.email || '').toLowerCase().trim();
      const otp = (body.otp || '').trim();

      if (!email || !otp) {
        return res.status(400).json({ success: false, error: 'Email and 6-digit OTP are required.' });
      }

      try {
        await connectToDatabase();

        const otpRecord = await Otp.findOne({
          email,
          purpose: 'login',
          expiresAt: { $gt: new Date() }
        });

        if (!otpRecord || otpRecord.otp !== otp) {
          return res.status(400).json({
            success: false,
            error: 'Invalid or expired OTP. Please check your code or request a new one.'
          });
        }

        // Delete used OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        let user = await User.findOne({ email }).lean();
        if (!user) {
          // Passwordless Auto-Provisioning: create new user account
          const id = 'usr_' + Date.now();
          const cleanName = email.split('@')[0].replace(/[._-]/g, ' ').trim();
          const capitalizedName = cleanName.length > 0
            ? cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : 'Eco Recycler';

          const createdUser = await User.create({
            id,
            name: capitalizedName,
            email,
            role: 'user',
            city: 'Delhi NCR'
          });
          user = createdUser.toObject();
        }

        if (user.password) {
          delete user.password;
        }

        return res.status(200).json({
          success: true,
          source: 'mongodb',
          message: `Welcome back, ${user.name}!`,
          data: user
        });
      } catch (err) {
        console.error('[API Verify OTP Login Error]:', err);
        return res.status(500).json({ success: false, error: err.message || 'OTP verification failed.' });
      }
    }

    // ==========================================
    // ACTION: VERIFY OTP FOR REGISTRATION (Pre-check)
    // ==========================================
    if (action === 'verify-otp-register') {
      const email = (body.email || '').toLowerCase().trim();
      const otp = (body.otp || '').trim();

      if (!email || !otp) {
        return res.status(400).json({ success: false, error: 'Email and 6-digit OTP are required.' });
      }

      try {
        await connectToDatabase();

        const otpRecord = await Otp.findOne({
          email,
          purpose: 'register',
          expiresAt: { $gt: new Date() }
        });

        if (!otpRecord || otpRecord.otp !== otp) {
          return res.status(400).json({
            success: false,
            error: 'Invalid or expired OTP. Please check your code or request a new one.'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Email successfully verified!'
        });
      } catch (err) {
        console.error('[API Verify OTP Register Error]:', err);
        return res.status(500).json({ success: false, error: err.message || 'OTP verification failed.' });
      }
    }

    // ==========================================
    // ACTION: LOGIN
    // ==========================================
    if (action === 'login') {
      const identifier = (body.emailOrPhone || body.email || body.phone || '').trim().toLowerCase();
      const rawPassword = (body.password || '').trim();

      if (!identifier) {
        return res.status(400).json({ success: false, error: 'Please provide your email or phone number.' });
      }
      if (!rawPassword) {
        return res.status(400).json({ success: false, error: 'Please enter your password.' });
      }

      try {
        await connectToDatabase();
        const isEmail = identifier.includes('@');
        const query = isEmail ? { email: identifier } : { phone: identifier };

        const user = await User.findOne(query).select('+password').lean();
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'No account found with this email or mobile number. Please check or register a new account.'
          });
        }

        // Verify password
        const passwordMatches = verifyPassword(rawPassword, user.password);
        if (!passwordMatches) {
          return res.status(401).json({
            success: false,
            error: 'Incorrect password. Please try again.'
          });
        }

        // Strip password before returning
        delete user.password;

        return res.status(200).json({
          success: true,
          source: 'mongodb',
          message: `Welcome back, ${user.name}!`,
          data: user
        });
      } catch (err) {
        console.error('[API Users Login Error]:', err);
        return res.status(500).json({ success: false, error: err.message || 'Login failed.' });
      }
    }

    // ==========================================
    // ACTION: REGISTER / CREATE NEW USER
    // ==========================================
    if (!body || (!body.email && !body.phone)) {
      return res.status(400).json({ success: false, error: 'User email and name are required.' });
    }

    const email = (body.email || '').toLowerCase().trim();
    const name = (body.name || '').trim();
    const rawPassword = (body.password || '').trim();

    if (!name) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }
    if (!rawPassword) {
      return res.status(400).json({ success: false, error: 'Password is required to secure your account.' });
    }

    try {
      await connectToDatabase();

      // Check if user already exists
      const existing = await User.findOne({ email }).lean();
      if (existing) {
        return res.status(409).json({
          success: false,
          error: `An account with email "${email}" already exists. Please sign in instead.`
        });
      }

      // If OTP is provided, verify against the OTP record
      if (body.otp) {
        const otpRecord = await Otp.findOne({
          email,
          purpose: 'register',
          expiresAt: { $gt: new Date() }
        });

        if (!otpRecord || otpRecord.otp !== body.otp.toString().trim()) {
          return res.status(400).json({
            success: false,
            error: 'Invalid or expired OTP. Please verify your email before registering.'
          });
        }

        // Cleanup used OTP
        await Otp.deleteOne({ _id: otpRecord._id });
      }

      // Hash password
      const hashedPassword = hashPassword(rawPassword);

      const isAgent = (body.role || 'user') === 'agent';
      const isPartner = (body.role || 'user') === 'partner';

      const newUserData = {
        id: body.id || `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name,
        email,
        password: hashedPassword,
        phone: (body.phone || '').trim(),
        role: body.role || 'user',
        avatar: body.avatar || (isAgent 
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
          : isPartner 
            ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'),
        city: body.city || 'Delhi NCR',
        pincode: (body.pincode || '').trim(),
        address: (body.address || '').trim(),
        upiId: (body.upiId || '').trim(),
        totalEarned: 0,
        totalRecycledKg: 0,
        co2SavedKg: 0,
        treesSaved: 0,
        // Agent Specific Fields (clean real data)
        ...(isAgent ? {
          agentCode: body.agentCode || `AG-${Math.floor(1000 + Math.random() * 9000)}`,
          dutyStatus: body.dutyStatus || 'Online',
          vehicleType: body.vehicleType || 'Electric 3-Wheeler Cargo',
          vehicleRegNo: body.vehicleRegNo || '',
          scaleCertificationNo: body.scaleCertificationNo || `NABL-QC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          rating: 5.0,
          completedPickups: 0,
          todaysEarnings: 0,
          monthlyEarnings: 0,
          currentPayloadKg: 0,
          maxPayloadKg: 500,
          assignedRoutes: []
        } : {}),
        // Partner Specific Fields (clean real data)
        ...(isPartner ? {
          businessName: body.businessName || `${name}'s Recycling Hub`,
          partnerTier: body.partnerTier || 'Certified Merchant Hub',
          gstin: body.gstin || '',
          tradeLicense: body.tradeLicense || 'Pending Verification',
          currentStockTons: 0,
          monthlyCapacityTons: body.monthlyCapacityTons || 100,
          totalProcuredTons: 0,
          totalDisbursedLakhs: 0,
          activeContractVehicles: body.activeContractVehicles || 0,
          directMillTieups: [],
          bankAccount: body.bankAccount || null
        } : {}),
        savedAddresses: body.address ? [
          { id: 'addr-1', label: 'Home', address: body.address, city: body.city || 'Delhi NCR', pincode: body.pincode || '', isDefault: true }
        ] : []
      };

      const createdUser = await User.create(newUserData);
      const userResponse = createdUser.toObject();
      delete userResponse.password;

      return res.status(201).json({
        success: true,
        source: 'mongodb',
        message: 'Account created directly in MongoDB Atlas!',
        data: userResponse
      });
    } catch (err) {
      console.error('[API Users Register Error]:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to create user account in database.'
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
      return res.status(400).json({ success: false, error: 'User ID or Email is required.' });
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
      const filter = identifier.includes('@') ? { email: identifier.toLowerCase().trim() } : { id: identifier };

      // If updating password, hash it
      const updateData = { ...body };
      if (updateData.password) {
        updateData.password = hashPassword(updateData.password);
      } else {
        delete updateData.password;
      }

      const updated = await User.findOneAndUpdate(
        filter,
        { $set: updateData },
        { returnDocument: 'after' }
      ).select('-password').lean();

      return res.status(200).json({
        success: true,
        source: 'mongodb',
        message: 'Profile updated in MongoDB Atlas successfully!',
        data: updated
      });
    } catch (err) {
      console.error('[API Users Update Error]:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to update user profile.'
      });
    }
  }

  return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
}
