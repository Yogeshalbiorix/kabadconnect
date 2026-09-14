import { connectToDatabase, isDbConfigured } from '../_lib/dbConnect.js';
import MarketplaceItem from '../_models/MarketplaceItem.js';
import { DEFAULT_MARKETPLACE_ITEMS } from '../_lib/seedData.js';

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

  // ----------------------------------------------------
  // GET: Fetch marketplace products (Used items + Upcycled)
  // ----------------------------------------------------
  if (req.method === 'GET') {
    const { category, subcategory, city, search, type, status, sellerId, id } = req.query || {};

    if (!configured) {
      let filtered = [...DEFAULT_MARKETPLACE_ITEMS];
      if (id) {
        filtered = filtered.filter(item => item.id === id);
        return res.status(200).json({
          success: true,
          source: 'local_fallback',
          data: filtered[0] || null
        });
      }
      if (type && type !== 'all') {
        filtered = filtered.filter(item => item.itemType === type);
      }
      if (category && category !== 'all') {
        filtered = filtered.filter(item => item.category === category);
      }
      if (subcategory && subcategory !== 'all') {
        filtered = filtered.filter(item => item.subcategory === subcategory);
      }
      if (city && city !== 'all') {
        filtered = filtered.filter(item => item.city?.toLowerCase().includes(city.toLowerCase()));
      }
      if (sellerId) {
        filtered = filtered.filter(item => item.seller?.id === sellerId);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(item => 
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.subcategory?.toLowerCase().includes(q)
        );
      }
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        count: filtered.length,
        data: filtered
      });
    }

    try {
      await connectToDatabase();

      if (id) {
        const item = await MarketplaceItem.findOne({ id }).lean();
        return res.status(200).json({
          success: true,
          source: 'mongodb',
          data: item || null
        });
      }

      const filter = {};
      if (type && type !== 'all') filter.itemType = type;
      if (category && category !== 'all') filter.category = category;
      if (subcategory && subcategory !== 'all') filter.subcategory = subcategory;
      if (city && city !== 'all') filter.city = new RegExp(city, 'i');
      if (sellerId) filter['seller.id'] = sellerId;
      if (status && status !== 'all') filter.status = status;
      if (search) {
        filter.$or = [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { subcategory: new RegExp(search, 'i') }
        ];
      }

      let items = await MarketplaceItem.find(filter).sort({ createdAt: -1 }).lean();

      // Automatically auto-seed with curated default items if collection is empty
      if (!items || items.length === 0) {
        const totalCount = await MarketplaceItem.countDocuments();
        if (totalCount === 0) {
          try {
            await MarketplaceItem.insertMany(DEFAULT_MARKETPLACE_ITEMS);
            items = await MarketplaceItem.find(filter).sort({ createdAt: -1 }).lean();
          } catch (seedErr) {
            items = DEFAULT_MARKETPLACE_ITEMS;
          }
        }
      }

      return res.status(200).json({
        success: true,
        source: 'mongodb',
        count: items.length,
        data: items
      });
    } catch (err) {
      console.warn('[Marketplace API] MongoDB fetch error, falling back:', err.message);
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        count: DEFAULT_MARKETPLACE_ITEMS.length,
        data: DEFAULT_MARKETPLACE_ITEMS,
        error: err.message
      });
    }
  }

  // ----------------------------------------------------
  // POST: Create a new user product listing (Sell Old Goods)
  // ----------------------------------------------------
  if (req.method === 'POST') {
    try {
      const itemData = req.body || {};

      if (!itemData.title || !itemData.price || !itemData.category) {
        return res.status(400).json({
          success: false,
          error: 'Title, category, and price are required fields.'
        });
      }

      const newItem = {
        id: itemData.id || `mkt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: itemData.title.trim(),
        description: itemData.description || '',
        category: itemData.category,
        subcategory: itemData.subcategory || '',
        price: Number(itemData.price),
        originalPrice: Number(itemData.originalPrice) || Number(itemData.price) * 1.5,
        condition: itemData.condition || 'good',
        images: Array.isArray(itemData.images) && itemData.images.length > 0 
          ? itemData.images 
          : ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80'],
        city: itemData.city || 'Delhi NCR',
        locality: itemData.locality || '',
        seller: {
          id: itemData.seller?.id || 'usr-customer-1',
          name: itemData.seller?.name || 'KabadConnect User',
          phone: itemData.seller?.phone || '+91 98100 00000',
          whatsapp: itemData.seller?.whatsapp || itemData.seller?.phone || '919810000000',
          email: itemData.seller?.email || '',
          isVerified: true
        },
        itemType: itemData.itemType || 'second_hand',
        status: 'available',
        badge: itemData.badge || 'New Listing',
        createdAt: new Date().toISOString()
      };

      if (!configured) {
        return res.status(201).json({
          success: true,
          source: 'local_fallback',
          message: 'Item saved successfully to client state (configure MONGODB_URI for Atlas cloud persistence).',
          data: newItem
        });
      }

      await connectToDatabase();
      const savedDoc = await MarketplaceItem.create(newItem);

      return res.status(201).json({
        success: true,
        source: 'mongodb',
        message: 'Product listed successfully in KabadConnect Bazaar!',
        data: savedDoc
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  // ----------------------------------------------------
  // PUT: Update an item (e.g. Mark as Sold, Edit Price)
  // ----------------------------------------------------
  if (req.method === 'PUT') {
    try {
      const { id, ...updates } = req.body || {};
      const itemId = id || req.query?.id;

      if (!itemId) {
        return res.status(400).json({ success: false, error: 'Product id is required.' });
      }

      if (!configured) {
        return res.status(200).json({
          success: true,
          source: 'local_fallback',
          data: { id: itemId, ...updates }
        });
      }

      await connectToDatabase();
      const updated = await MarketplaceItem.findOneAndUpdate(
        { id: itemId },
        { $set: updates },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        source: 'mongodb',
        data: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ----------------------------------------------------
  // DELETE: Remove an item listing
  // ----------------------------------------------------
  if (req.method === 'DELETE') {
    try {
      const itemId = req.query?.id || req.body?.id;
      if (!itemId) {
        return res.status(400).json({ success: false, error: 'Product id is required.' });
      }

      if (!configured) {
        return res.status(200).json({
          success: true,
          source: 'local_fallback',
          message: `Item ${itemId} deleted from local session.`
        });
      }

      await connectToDatabase();
      await MarketplaceItem.deleteOne({ id: itemId });

      return res.status(200).json({
        success: true,
        source: 'mongodb',
        message: `Item ${itemId} deleted from MongoDB Atlas.`
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed.' });
}
