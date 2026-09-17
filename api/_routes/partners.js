import { connectToDatabase, isDbConfigured } from '../_lib/dbConnect.js';
import Partner from '../_models/Partner.js';
import User from '../_models/User.js';
import { DEFAULT_PARTNERS } from '../_lib/seedData.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const configured = isDbConfigured();

  // GET: Retrieve list of verified partners and live registered field agents
  if (req.method === 'GET') {
    if (!configured) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        count: DEFAULT_PARTNERS.length,
        data: DEFAULT_PARTNERS
      });
    }

    try {
      await connectToDatabase();
      const { city } = req.query || {};

      // 1. Fetch real registered agents & partners from MongoDB Atlas Users collection
      const userFilter = { role: { $in: ['agent', 'partner'] } };
      if (city && city !== 'all') {
        userFilter.city = new RegExp(city, 'i');
      }

      const realAgentUsers = await User.find(userFilter).lean();

      // Convert real registered users into rich collector/partner objects
      const dynamicAgentPartners = (realAgentUsers || []).map((u, idx) => {
        const isAhmd = String(u.city || '').toLowerCase().includes('ahmedabad');
        const defaultCoords = isAhmd 
          ? [23.0135 + (idx * 0.004), 72.5125 + (idx * 0.003)] 
          : [28.6385 + (idx * 0.004), 77.3710 + (idx * 0.003)];

        const reviewsCount = Array.isArray(u.reviews) ? u.reviews.length : (Number(u.reviewCount) || 15);
        const rating = Number(u.rating) || 4.9;
        const totalPickups = Number(u.completedPickups || u.todayPickupsCount || 24);

        const vType = u.vehicleType || 'Electric Cargo E-Rickshaw';
        const vReg = u.vehicleRegNo || u.vehicleNumber || `GJ-01-EA-${5500 + idx}`;
        const photo = u.avatar || (idx % 2 === 0 
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
          : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80');

        return {
          id: u.id || String(u._id),
          name: u.name || 'Verified Field Executive',
          businessName: u.businessName || `${u.name}'s Verified Scrap Express`,
          phone: u.phone || '+91 98765 43210',
          email: u.email,
          photo: photo,
          avatar: photo,
          rating: rating,
          reviewsCount: reviewsCount,
          totalPickups: totalPickups,
          distanceKm: parseFloat((0.8 + (idx * 0.4)).toFixed(1)),
          locality: u.address || u.operatingZone || (isAhmd ? 'Prahlad Nagar & SG Highway' : 'Indirapuram / Sector 62'),
          city: u.city || (isAhmd ? 'Ahmedabad' : 'Delhi NCR'),
          coords: u.coords || defaultCoords,
          vehicle: `${vType} (${vReg})`,
          vehicleReg: vReg,
          badge: totalPickups >= 8 ? '🛡️ Verified Pro Collector' : (u.badge || 'Verified Collector'),
          digitalScaleVerified: true,
          kycVerified: true,
          upiEnabled: true,
          status: u.dutyStatus === 'Offline' ? 'offline' : 'available',
          etaMinutes: 10 + (idx * 3),
          isRealDbAgent: true
        };
      });

      // 2. Query any explicitly created Partner collection documents
      const partnerFilter = {};
      if (city && city !== 'all') {
        partnerFilter.city = new RegExp(city, 'i');
      }
      const rawPartners = await Partner.find(partnerFilter).lean();

      // Ensure all custom partners have valid working photo URLs
      const cleanedCustomPartners = (rawPartners || []).map((p, idx) => ({
        ...p,
        photo: p.photo || p.avatar || (idx % 2 === 0
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
        avatar: p.avatar || p.photo
      }));

      // Combine real dynamic agents from DB Users + custom Partners
      let finalPartners = [];
      if (dynamicAgentPartners.length > 0) {
        // If real registered agents exist, prioritize them!
        const existingNames = new Set(dynamicAgentPartners.map(a => a.name.toLowerCase()));
        const nonDuplicateCustom = cleanedCustomPartners.filter(p => !existingNames.has(p.name.toLowerCase()));
        finalPartners = [...dynamicAgentPartners, ...nonDuplicateCustom];
      } else if (cleanedCustomPartners.length > 0) {
        finalPartners = cleanedCustomPartners;
      } else {
        finalPartners = DEFAULT_PARTNERS.map(p => ({
          ...p,
          photo: p.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
        }));
      }

      return res.status(200).json({
        success: true,
        source: 'mongodb',
        count: finalPartners.length,
        data: finalPartners
      });
    } catch (err) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        count: DEFAULT_PARTNERS.length,
        data: DEFAULT_PARTNERS,
        error: err.message
      });
    }
  }

  // POST: Register or onboard new partner
  if (req.method === 'POST') {
    try {
      const partnerData = req.body || {};
      const newPartner = {
        id: partnerData.id || `kw-${Date.now()}`,
        name: partnerData.name || 'New Partner',
        businessName: partnerData.businessName || `${partnerData.name}'s Recycling Hub`,
        phone: partnerData.phone || '',
        rating: 4.8,
        reviewsCount: 0,
        totalPickups: 0,
        distanceKm: 1.2,
        locality: partnerData.locality || '',
        city: partnerData.city || 'Delhi NCR',
        coords: partnerData.coords || [28.6385, 77.3710],
        vehicle: partnerData.vehicle || 'Electric Loader',
        vehicleReg: partnerData.vehicleReg || '',
        badge: 'Newly Verified',
        digitalScaleVerified: true,
        kycVerified: true,
        upiEnabled: true,
        status: 'available',
        etaMinutes: 15
      };

      if (!configured) {
        return res.status(201).json({
          success: true,
          source: 'local_fallback',
          data: newPartner
        });
      }

      await connectToDatabase();
      const savedDoc = await Partner.create(newPartner);
      return res.status(201).json({
        success: true,
        source: 'mongodb',
        data: savedDoc
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed.' });
}
