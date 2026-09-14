import { connectToDatabase, isDbConfigured } from '../_lib/dbConnect.js';
import Partner from '../_models/Partner.js';
import { DEFAULT_PARTNERS } from '../_lib/seedData.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const configured = isDbConfigured();

  // GET: Retrieve list of verified partners
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
      const filter = {};
      if (city && city !== 'all') {
        filter.city = new RegExp(city, 'i');
      }

      let partners = await Partner.find(filter).lean();

      if (!partners || partners.length === 0) {
        const totalCount = await Partner.countDocuments();
        if (totalCount === 0) {
          try {
            await Partner.insertMany(DEFAULT_PARTNERS);
            partners = await Partner.find(filter).lean();
          } catch (seedErr) {
            partners = DEFAULT_PARTNERS;
          }
        }
      }

      return res.status(200).json({
        success: true,
        source: 'mongodb',
        count: partners.length,
        data: partners
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
