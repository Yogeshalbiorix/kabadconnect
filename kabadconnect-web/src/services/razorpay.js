/**
 * Razorpay Standard Web Checkout Integration Service
 * KabadCollect Hyperlocal Recycling Marketplace
 */

// Dynamically load Razorpay SDK if not already loaded
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Step 1: Create Order via Backend API
 * @param {Object} params
 * @param {number} params.amountInRupees or params.amount (in paise)
 * @param {string} params.currency
 * @param {string} params.receipt
 * @param {Object} params.notes
 */
export async function createRazorpayOrder({ amount, amountInRupees, currency = 'INR', receipt, notes = {} }) {
  // Amount in paise (minimum 100 paise = ₹1)
  const finalAmountPaise = amount !== undefined ? Math.round(Number(amount)) : Math.round(Number(amountInRupees || 1) * 100);

  if (isNaN(finalAmountPaise) || finalAmountPaise < 100) {
    throw new Error('Minimum payment amount must be at least ₹1 (100 paise).');
  }

  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: finalAmountPaise,
      currency,
      receipt: receipt || `kabad_${Date.now()}`,
      notes
    })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to create Razorpay payment order.');
  }

  return data;
}

/**
 * Step 3: Verify Payment Signature via Backend API
 * @param {Object} params
 * @param {string} params.razorpay_order_id
 * @param {string} params.razorpay_payment_id
 * @param {string} params.razorpay_signature
 * @param {string} [params.orderId]
 */
export async function verifyRazorpayPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  orderId = null,
  metadata = {}
}) {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      metadata
    })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Payment verification failed. Invalid signature.');
  }

  return data;
}

/**
 * Step 2: Open Razorpay Standard Web Checkout Modal
 * @param {Object} options
 * @param {number} [options.amountInRupees] Amount in INR (e.g. 299)
 * @param {number} [options.amount] Amount in paise (e.g. 29900)
 * @param {string} [options.name] Title shown on checkout
 * @param {string} [options.description] Product / service description
 * @param {Object} [options.prefill] { name, email, contact }
 * @param {Object} [options.notes] Additional metadata
 * @param {string} [options.orderId] Optional KabadCollect internal order id
 * @param {Function} [options.onSuccess] Callback on successful verified payment
 * @param {Function} [options.onError] Callback on error
 * @param {Function} [options.onDismiss] Callback when user closes modal
 */
export async function openRazorpayCheckout({
  amountInRupees,
  amount,
  name = 'KabadCollect Marketplace',
  description = 'Recycling & Circular Economy Order',
  prefill = {},
  notes = {},
  orderId = null,
  onSuccess,
  onError,
  onDismiss
}) {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
    }

    // 1. Create order on backend
    const orderData = await createRazorpayOrder({
      amount,
      amountInRupees,
      currency: 'INR',
      notes
    });

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.key_id;

    if (!keyId) {
      throw new Error('Razorpay Public Key (VITE_RAZORPAY_KEY_ID) is missing.');
    }

    // 2. Open Razorpay modal
    return new Promise((resolve, reject) => {
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: name,
        description: description,
        order_id: orderData.order_id,
        image: 'https://cdn-icons-png.flaticon.com/512/3299/3299946.png',
        prefill: {
          name: prefill.name || '',
          email: prefill.email || '',
          contact: prefill.contact || prefill.phone || ''
        },
        notes: notes,
        theme: {
          color: '#0D5C3A'
        },
        modal: {
          ondismiss: () => {
            console.log('[Razorpay] Modal dismissed by user');
            if (onDismiss) onDismiss();
            resolve({ status: 'dismissed' });
          }
        },
        handler: async function (response) {
          try {
            // 3. Verify signature on backend
            const verification = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
              metadata: notes
            });

            const successPayload = {
              ...response,
              verification,
              amount: orderData.amount,
              currency: orderData.currency
            };

            if (onSuccess) {
              onSuccess(successPayload);
            }
            resolve(successPayload);
          } catch (verifyErr) {
            console.error('[Razorpay Verify Error]:', verifyErr);
            if (onError) onError(verifyErr);
            reject(verifyErr);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('[Razorpay Payment Failed]:', response.error);
        const errObj = new Error(response.error.description || 'Payment Failed');
        errObj.razorpayError = response.error;
        if (onError) onError(errObj);
        reject(errObj);
      });

      rzp.open();
    });
  } catch (err) {
    console.error('[Razorpay Checkout Error]:', err);
    if (onError) onError(err);
    throw err;
  }
}
