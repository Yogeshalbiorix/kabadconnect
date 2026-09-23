import { connectToDatabase, isDbConfigured } from '../_lib/dbConnect.js';
import ScrapRate from '../_models/ScrapRate.js';
import { DEFAULT_SCRAP_ITEMS } from '../_lib/seedData.js';

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
  // POST /api/rates: Add a new scrap item (Admin)
  // ----------------------------------------------------
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      name,
      hindiName = '',
      category = 'paper',
      rate,
      unit = 'kg',
      trend = 'Stable',
      trendType = 'stable',
      minWeight = '5 kg',
      description = '',
      co2SavedPerKg = 1.5,
      waterSavedPerKg = 20,
      treesSavedPerKg = 0.015
    } = body;

    if (!name || rate === undefined) {
      return res.status(400).json({ success: false, error: 'Name and rate are required' });
    }

    const newItem = {
      id: body.id || `${category}-${Date.now().toString(36)}`,
      name: name.trim(),
      hindiName: hindiName.trim(),
      category: category.toLowerCase(),
      rate: Number(rate),
      unit: unit || 'kg',
      trend: trend || 'Stable',
      trendType: trendType || 'stable',
      minWeight: minWeight || (unit === 'unit' ? '1 unit' : '5 kg'),
      description: description.trim(),
      co2SavedPerKg: Number(co2SavedPerKg) || 1.5,
      waterSavedPerKg: Number(waterSavedPerKg) || 20,
      treesSavedPerKg: Number(treesSavedPerKg) || 0.015
    };

    if (!configured) {
      return res.status(201).json({
        success: true,
        source: 'local_fallback',
        data: newItem,
        message: 'Item created in local state.'
      });
    }

    try {
      await connectToDatabase();
      const created = await ScrapRate.create(newItem);
      return res.status(201).json({
        success: true,
        source: 'mongodb',
        data: created
      });
    } catch (err) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        data: newItem,
        error: err.message
      });
    }
  }

  // ----------------------------------------------------
  // PUT /api/rates: Update rate or full scrap item (Admin)
  // ----------------------------------------------------
  if (req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { action, id, rate, trend, trendType, category, deltaPercent, deltaAmount } = body;

    // 1. Bulk Category Adjustment
    if (action === 'bulk_category_update' && category) {
      if (!configured) {
        return res.status(200).json({
          success: true,
          source: 'local_fallback',
          message: 'Bulk rate adjustment processed locally.'
        });
      }

      try {
        await connectToDatabase();
        const items = await ScrapRate.find(category === 'all' ? {} : { category }).lean();
        const updates = items.map(async (item) => {
          let newRate = item.rate;
          if (deltaPercent) {
            newRate = Math.max(1, Math.round(item.rate * (1 + Number(deltaPercent) / 100)));
          } else if (deltaAmount) {
            newRate = Math.max(1, item.rate + Number(deltaAmount));
          }
          const trendT = newRate > item.rate ? 'up' : newRate < item.rate ? 'down' : 'stable';
          const trendTxt = newRate > item.rate ? `+₹${newRate - item.rate}.00` : newRate < item.rate ? `-₹${item.rate - newRate}.00` : 'Stable';
          return ScrapRate.updateOne({ id: item.id }, { $set: { rate: newRate, trend: trendTxt, trendType: trendT } });
        });
        await Promise.all(updates);
        const updatedList = await ScrapRate.find({}).sort({ category: 1, rate: -1 }).lean();
        return res.status(200).json({ success: true, source: 'mongodb', data: updatedList });
      } catch (err) {
        return res.status(200).json({ success: true, source: 'local_fallback', error: err.message });
      }
    }

    // 2. Single Item Rate or Full Details Update
    if (!id) {
      return res.status(400).json({ success: false, error: 'Item ID is required' });
    }

    const updatePayload = {};
    if (rate !== undefined) updatePayload.rate = Number(rate);
    if (trend !== undefined) updatePayload.trend = trend;
    if (trendType !== undefined) updatePayload.trendType = trendType;
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.hindiName !== undefined) updatePayload.hindiName = body.hindiName;
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.unit !== undefined) updatePayload.unit = body.unit;
    if (body.minWeight !== undefined) updatePayload.minWeight = body.minWeight;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.co2SavedPerKg !== undefined) updatePayload.co2SavedPerKg = Number(body.co2SavedPerKg);
    if (body.waterSavedPerKg !== undefined) updatePayload.waterSavedPerKg = Number(body.waterSavedPerKg);
    if (body.treesSavedPerKg !== undefined) updatePayload.treesSavedPerKg = Number(body.treesSavedPerKg);

    if (!configured) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        data: { id, ...updatePayload },
        message: 'Rate updated in local state.'
      });
    }

    try {
      await connectToDatabase();
      const updated = await ScrapRate.findOneAndUpdate(
        { id },
        { $set: updatePayload },
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
        data: { id, ...updatePayload },
        error: err.message
      });
    }
  }

  // ----------------------------------------------------
  // DELETE /api/rates: Delete a scrap item (Admin)
  // ----------------------------------------------------
  if (req.method === 'DELETE') {
    const url = new URL(req.url, 'http://localhost');
    const id = url.searchParams.get('id') || req.query?.id;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Item ID is required' });
    }

    if (!configured) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        id,
        message: 'Item deleted from local state.'
      });
    }

    try {
      await connectToDatabase();
      await ScrapRate.findOneAndDelete({ id });
      return res.status(200).json({
        success: true,
        source: 'mongodb',
        id,
        message: 'Scrap item deleted successfully.'
      });
    } catch (err) {
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        id,
        error: err.message
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
