import Razorpay from 'razorpay';
import crypto from 'crypto';
import { connectToDatabase, isDbConfigured } from '../_lib/dbConnect.js';
import Order from '../_models/Order.js';

/**
 * Helper to get configured Razorpay client
 */
function getRazorpayInstance() {
  const key_id = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!key_id || !key_secret) {

    const err = new Error('Razorpay credentials are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
    err.statusCode = 401;
    throw err;
  }

  return {
    instance: new Razorpay({ key_id, key_secret }),
    key_id,
    key_secret
  };
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Determine action from query, url pathname, or body
  const host = req.headers?.host || 'localhost';
  const url = new URL(req.url, `http://${host}`);
  const cleanPath = url.pathname.replace(/^\/api\/?/, '').toLowerCase();
  
  let action = req.query?.action;
  if (!action) {
    if (cleanPath.includes('create-order')) action = 'create-order';
    else if (cleanPath.includes('verify-payment') || cleanPath.includes('verify')) action = 'verify-payment';
  }

  // ----------------------------------------------------
  // GET: Health / Status of Razorpay Gateway Config
  // ----------------------------------------------------
  if (req.method === 'GET') {
    const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const isConfigured = Boolean(key_id && key_secret);

    return res.status(200).json({
      success: true,
      service: 'Razorpay Gateway',
      configured: isConfigured,
      key_id: key_id ? `${key_id.slice(0, 8)}...` : null
    });
  }

  // ----------------------------------------------------
  // POST: Create Order or Verify Signature
  // ----------------------------------------------------
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    if (!action && body.action) {
      action = body.action;
    }

    // Default to create-order if amount is provided and no action set
    if (!action) {
      if (body.razorpay_signature || body.razorpay_payment_id) {
        action = 'verify-payment';
      } else {
        action = 'create-order';
      }
    }

    // ====================================================
    // STEP 1: CREATE ORDER
    // ====================================================
    if (action === 'create-order' || action === 'create') {
      try {
        const { instance, key_id } = getRazorpayInstance();

        // Amount must be in paise (1 INR = 100 paise)
        let amount = parseInt(body.amount, 10);
        if (isNaN(amount) || amount < 100) {
          return res.status(400).json({
            success: false,
            error: 'Invalid amount. Minimum amount is 100 paise (₹1.00).'
          });
        }

        const currency = (body.currency || 'INR').toUpperCase();
        const receipt = body.receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const notes = body.notes || {};

        const orderOptions = {
          amount,
          currency,
          receipt,
          notes
        };

        const order = await instance.orders.create(orderOptions);

        return res.status(200).json({
          success: true,
          order_id: order.id,
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          key_id: key_id,
          status: order.status
        });
      } catch (err) {
        console.error('[Razorpay Create Order Error]:', err);
        const statusCode = err.statusCode || (err.error?.code === 'BAD_REQUEST_ERROR' ? 400 : 500);
        return res.status(statusCode).json({
          success: false,
          error: err.error?.description || err.message || 'Failed to create Razorpay order'
        });
      }
    }

    // ====================================================
    // STEP 3: VERIFY PAYMENT SIGNATURE
    // ====================================================
    if (action === 'verify-payment' || action === 'verify') {
      try {
        const { key_secret } = getRazorpayInstance();

        const {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          orderId,
          order_id
        } = body;

        const effectiveOrderId = razorpay_order_id || order_id;

        // Check required fields
        if (!effectiveOrderId || !razorpay_payment_id || !razorpay_signature) {
          return res.status(400).json({
            success: false,
            error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.'
          });
        }

        // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
        const expectedSignature = crypto
          .createHmac('sha256', key_secret)
          .update(`${effectiveOrderId}|${razorpay_payment_id}`)
          .digest('hex');

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (!isSignatureValid) {
          console.warn('[Razorpay Verification] Signature Mismatch:', {
            received: razorpay_signature,
            expected: expectedSignature
          });
          return res.status(400).json({
            success: false,
            error: 'Invalid payment signature. Payment verification failed.'
          });
        }

        // Optional: Update DB order if an internal orderId was provided
        let dbUpdated = false;
        if (orderId && isDbConfigured()) {
          try {
            await connectToDatabase();
            await Order.findOneAndUpdate(
              { id: orderId },
              {
                $set: {
                  status: 'completed',
                  paymentStatus: 'paid',
                  'doorstepVerification.paymentStatus': 'completed',
                  'doorstepVerification.paymentMethod': 'Razorpay Online',
                  'doorstepVerification.transactionRef': razorpay_payment_id,
                  'doorstepVerification.paidAt': new Date().toISOString()
                }
              }
            );
            dbUpdated = true;
          } catch (dbErr) {
            console.warn('[Razorpay DB Update Warning]:', dbErr.message);
          }
        }

        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          order_id: effectiveOrderId,
          payment_id: razorpay_payment_id,
          dbUpdated
        });
      } catch (err) {
        console.error('[Razorpay Verify Error]:', err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
          success: false,
          error: err.error?.description || err.message || 'Payment verification failed'
        });
      }
    }

    return res.status(400).json({
      success: false,
      error: `Unknown action '${action}'. Use 'create-order' or 'verify-payment'.`
    });
  }

  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
