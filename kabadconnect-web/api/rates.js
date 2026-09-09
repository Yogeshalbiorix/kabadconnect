import { connectToDatabase, isDbConfigured } from './lib/dbConnect.js';
import ScrapRate from './models/ScrapRate.js';
import { DEFAULT_SCRAP_ITEMS } from './lib/seedData.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const configured = isDbConfigured();

  // ----------------------------------------------------
  // GET /api/rates: Retrieve live rates
  // ----------------------------------------------------
  if (req.method === 'GET') {
    if (!configured) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        count: DEFAULT_SCRAP_ITEMS.length,
        data: DEFAULT_SCRAP_ITEMS
      });
    }

    try {
      await connectToDatabase();
      let rates = await ScrapRate.find({}).sort({ category: 1, rate: -1 }).lean();

      // Auto-seed if database collection is empty
      if (!rates || rates.length === 0) {
        try {
          await ScrapRate.insertMany(DEFAULT_SCRAP_ITEMS);
          rates = DEFAULT_SCRAP_ITEMS;
        } catch (seedErr) {
          rates = DEFAULT_SCRAP_ITEMS;
        }
      }

      return res.status(200).json({
        success: true,
        source: 'mongodb',
        count: rates.length,
        data: rates
      });
    } catch (err) {
      console.warn('[API Rates] MongoDB error, returning fallback:', err.message);
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        count: DEFAULT_SCRAP_ITEMS.length,
        data: DEFAULT_SCRAP_ITEMS,
        error: err.message
      });
    }
  }

  // ----------------------------------------------------
  // PUT /api/rates: Update rate for an item (Admin)
  // ----------------------------------------------------
  if (req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { id, rate, trend, trendType } = body;

    if (!id || rate === undefined) {
      return res.status(400).json({ success: false, error: 'Item ID and rate are required' });
    }

    if (!configured) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        data: body,
        message: 'Rate updated in local state.'
      });
    }

    try {
      await connectToDatabase();
      const updated = await ScrapRate.findOneAndUpdate(
        { id },
        { $set: { rate: Number(rate), trend: trend || 'Stable', trendType: trendType || 'stable' } },
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
