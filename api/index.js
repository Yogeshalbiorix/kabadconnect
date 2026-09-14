import healthHandler from './_routes/health.js';
import ordersHandler from './_routes/orders.js';
import ratesHandler from './_routes/rates.js';
import partnersHandler from './_routes/partners.js';
import marketplaceHandler from './_routes/marketplace.js';
import usersHandler from './_routes/users.js';
import seedHandler from './_routes/seed.js';
import configDbHandler from './_routes/config-db.js';

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

  // Polyfill helper methods if missing
  if (!res.status) {
    res.status = function (code) {
      this.statusCode = code;
      return this;
    };
  }
  if (!res.json) {
    res.json = function (data) {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(data));
      return this;
    };
  }

  // Parse path & query params
  const host = req.headers?.host || 'localhost';
  const url = new URL(req.url, `http://${host}`);
  
  // Extract route after /api/ (e.g., /api/health -> health, /api/orders?id=1 -> orders)
  const cleanPath = url.pathname.replace(/^\/api\/?/, '').split('/')[0].toLowerCase();

  // Populate query params on req object
  req.query = Object.fromEntries(url.searchParams.entries());

  try {
    switch (cleanPath) {
      case 'health':
        return await healthHandler(req, res);
      case 'orders':
        return await ordersHandler(req, res);
      case 'rates':
        return await ratesHandler(req, res);
      case 'partners':
        return await partnersHandler(req, res);
      case 'marketplace':
        return await marketplaceHandler(req, res);
      case 'users':
        return await usersHandler(req, res);
      case 'seed':
        return await seedHandler(req, res);
      case 'config-db':
        return await configDbHandler(req, res);
      case '':
        // Default root /api ping
        return await healthHandler(req, res);
      default:
        return res.status(404).json({ error: `API endpoint '/api/${cleanPath}' not found.` });
    }
  } catch (err) {
    console.error(`[API Router Error] Route /api/${cleanPath}:`, err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
