/**
 * KabadCollect Unified API Service
 * Interacts with Vercel Serverless Functions (/api/*) and MongoDB Atlas.

 */

// Base API path (works automatically with Vercel Serverless Functions)
const API_BASE = '/api';

/**
 * Helper to safely perform fetch requests with timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// ----------------------------------------------------
// 1. Health & Database Diagnostic
// ----------------------------------------------------
export async function checkDatabaseHealth() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/health`, { method: 'GET' }, 4000);
    if (res.ok) {
      return await res.json();
    }
    return { status: 'offline', connected: false, message: 'Health check returned non-200 status' };
  } catch (err) {
    return {
      status: 'offline',
      connected: false,
      message: 'Serverless API not reachable locally (use Vercel or local API server). Client-side demo storage active.'
    };
  }
}

export async function apiGetDbConfig() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/config-db`, { method: 'GET' }, 4000);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) { }
  return { configured: false, hasPlaceholder: true };
}

export async function apiUpdateDbConfig(config) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/config-db`, {
      method: 'POST',
      body: JSON.stringify(config)
    }, 15000);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    return { success: false, connected: false, error: e.message };
  }
  return { success: false, connected: false, error: 'Request failed' };
}

// ----------------------------------------------------
// 2. Orders API (Pickup Bookings)
// ----------------------------------------------------
export async function apiFetchOrders() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/orders`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        return { success: true, source: data.source, orders: data.data };
      }
    }
  } catch (err) {
    console.warn('[API Service] Orders fetch failed, using local state:', err.message);
  }
  return { success: false, source: 'local' };
}

export async function apiCreateOrder(orderData) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, order: data.data };
    }
  } catch (err) {
    console.warn('[API Service] Create order API call failed, saving to local state:', err.message);
  }
  return { success: false, source: 'local', order: orderData };
}

export async function apiUpdateOrder(orderId, updates) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/orders?id=${encodeURIComponent(orderId)}`, {
      method: 'PUT',
      body: JSON.stringify({ id: orderId, ...updates })
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, order: data.data };
    }
  } catch (err) {
    console.warn('[API Service] Update order API call failed, using local state:', err.message);
  }
  return { success: false, source: 'local' };
}

export async function apiAcceptPickupOrder(orderId, agentUser) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/orders?id=${encodeURIComponent(orderId)}&action=accept-pickup`, {
      method: 'PUT',
      body: JSON.stringify({ 
        id: orderId, 
        action: 'accept-pickup',
        agent: agentUser 
      })
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, order: data.data };
    }
  } catch (err) {
    console.warn('[API Service] Accept pickup API call failed, using local state:', err.message);
  }
  return { success: false, source: 'local' };
}


// ----------------------------------------------------
// 3. Scrap Rates API (Live Market Rates)
// ----------------------------------------------------
export async function apiFetchRates() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/rates`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        return { success: true, source: data.source, rates: data.data };
      }
    }
  } catch (err) {
    console.warn('[API Service] Rates fetch failed, using bundled rates:', err.message);
  }
  return { success: false, source: 'local' };
}

export async function apiUpdateRate(rateData) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/rates`, {
      method: 'PUT',
      body: JSON.stringify(rateData)
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, rate: data.data };
    }
  } catch (err) {
    console.warn('[API Service] Update rate API call failed:', err.message);
  }
  return { success: false, source: 'local' };
}

// ----------------------------------------------------
// 4. Seed Database (Atlas Helper)
// ----------------------------------------------------
export async function apiSeedDatabase() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/seed`, { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[API Service] Database seed call failed:', err.message);
  }
  return { success: false };
}

// ----------------------------------------------------
// 5. Users API (MongoDB Persistence for User Registration & Profiles)
// ----------------------------------------------------
export async function apiFetchUsers() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/users`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, users: data.data || [] };
    }
  } catch (err) {
    console.warn('[API Service] Fetch users failed:', err.message);
  }
  return { success: false, source: 'local', users: [] };
}

export async function apiFetchUser(identifier) {
  try {
    const param = identifier.includes('@') ? `email=${encodeURIComponent(identifier)}` : `id=${encodeURIComponent(identifier)}`;
    const res = await fetchWithTimeout(`${API_BASE}/users?${param}`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, user: data.data };
    }
  } catch (err) {
    console.warn('[API Service] Fetch user failed:', err.message);
  }
  return { success: false, source: 'local' };
}

export async function apiRegisterUser(userData) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/users?action=register`, {
      method: 'POST',
      body: JSON.stringify(userData)
    }, 10000);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, user: data.data, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to create account in database.' };
  } catch (err) {
    return { success: false, error: err.message || 'Network error connecting to database.' };
  }
}

export async function apiLoginUser(credentials) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/users?action=login`, {
      method: 'POST',
      body: JSON.stringify(credentials)
    }, 10000);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, user: data.data, message: data.message };
    }
    return { success: false, error: data.error || 'Invalid credentials.' };
  } catch (err) {
    return { success: false, error: err.message || 'Network error connecting to database.' };
  }
}

export async function apiSendOtp({ email, purpose = 'login' }) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/users?action=send-otp`, {
      method: 'POST',
      body: JSON.stringify({ email, purpose })
    }, 12000);
    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message,
        email: data.email
      };
    }
    return { success: false, error: data.error || 'Failed to send OTP.' };
  } catch (err) {
    return { success: false, error: err.message || 'Network error sending OTP.' };
  }
}

export async function apiVerifyOtpLogin({ email, otp }) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/users?action=verify-otp-login`, {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    }, 10000);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, user: data.data, message: data.message };
    }
    return { success: false, error: data.error || 'Invalid or expired OTP.' };
  } catch (err) {
    return { success: false, error: err.message || 'Network error verifying OTP.' };
  }
}

export async function apiVerifyOtpRegister({ email, otp }) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/users?action=verify-otp-register`, {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    }, 10000);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Invalid or expired OTP.' };
  } catch (err) {
    return { success: false, error: err.message || 'Network error verifying OTP.' };
  }
}

export async function apiUpdateUserProfile(identifier, updates) {
  try {
    const param = identifier && identifier.includes('@')
      ? `email=${encodeURIComponent(identifier)}`
      : `id=${encodeURIComponent(identifier || '')}`;
    const res = await fetchWithTimeout(`${API_BASE}/users?${param}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, 10000);
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, user: data.data, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to update profile.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function apiCreateOrUpdateUser(userData) {
  return await apiRegisterUser(userData);
}

// ----------------------------------------------------
// 6. Marketplace API (Pre-Loved Goods Bazaar & Recycled Products)
// ----------------------------------------------------
export async function apiFetchMarketplaceItems(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.subcategory && filters.subcategory !== 'all') params.append('subcategory', filters.subcategory);
    if (filters.city && filters.city !== 'all') params.append('city', filters.city);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.sellerId) params.append('sellerId', filters.sellerId);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchWithTimeout(`${API_BASE}/marketplace${queryString}`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        return { success: true, source: data.source, items: data.data };
      }
    }
  } catch (err) {
    console.warn('[API Service] Marketplace items fetch failed, using local cache:', err.message);
  }
  return { success: false, source: 'local', items: [] };
}

export async function apiCreateMarketplaceItem(itemData) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/marketplace`, {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, item: data.data, message: data.message };
    }
  } catch (err) {
    console.warn('[API Service] Create marketplace item API call failed, using local fallback:', err.message);
  }
  return { success: false, source: 'local', item: itemData };
}

export async function apiUpdateMarketplaceItem(itemId, updates) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/marketplace?id=${encodeURIComponent(itemId)}`, {
      method: 'PUT',
      body: JSON.stringify({ id: itemId, ...updates })
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, item: data.data };
    }
  } catch (err) {
    console.warn('[API Service] Update marketplace item failed:', err.message);
  }
  return { success: false, source: 'local' };
}

export async function apiDeleteMarketplaceItem(itemId) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/marketplace?id=${encodeURIComponent(itemId)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, message: data.message };
    }
  } catch (err) {
    console.warn('[API Service] Delete marketplace item failed:', err.message);
  }
  return { success: false, source: 'local' };
}

// ----------------------------------------------------
// 7. Partners API (Hyperlocal Verified Kabadwalas)
// ----------------------------------------------------
export async function apiFetchPartners(city = '') {
  try {
    const query = city ? `?city=${encodeURIComponent(city)}` : '';
    const res = await fetchWithTimeout(`${API_BASE}/partners${query}`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        return { success: true, source: data.source, partners: data.data };
      }
    }
  } catch (err) {
    console.warn('[API Service] Partners fetch failed, using bundled list:', err.message);
  }
  return { success: false, source: 'local' };
}

export async function apiCreatePartner(partnerData) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/partners`, {
      method: 'POST',
      body: JSON.stringify(partnerData)
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, partner: data.data };
    }
  } catch (err) {
    console.warn('[API Service] Create partner failed:', err.message);
  }
  return { success: false, source: 'local', partner: partnerData };
}

// ----------------------------------------------------
// 8. Doorstep Verification & Payment API
// ----------------------------------------------------
export async function apiSendDoorstepOtp(orderId, { customerEmail, otp, inspectedItems, totalPaid }) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/orders?id=${encodeURIComponent(orderId)}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: orderId,
        sendDoorstepOtpEmail: Boolean(customerEmail),
        customerEmail,
        status: 'weighing',
        doorstepVerification: {
          otp,
          otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          isVerified: false,
          paymentStatus: 'locked',
          inspectedItems: inspectedItems || [],
          paidAmount: totalPaid || 0
        },
        itemsWeighed: inspectedItems || [],
        totalPaid: totalPaid || 0
      })
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, order: data.data };
    }
  } catch (err) {
    console.warn('[API Service] Send doorstep OTP failed, fallback to local:', err.message);
  }
  return { success: true, source: 'local' };
}

export async function apiCompleteOrderPayment(orderId, paymentData) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/orders?id=${encodeURIComponent(orderId)}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: orderId,
        status: 'completed',
        doorstepVerification: {
          isVerified: true,
          verifiedAt: new Date().toISOString(),
          paymentStatus: 'completed',
          paymentMethod: paymentData.paymentMethod,
          transactionRef: paymentData.transactionRef,
          paidAmount: paymentData.paidAmount,
          inspectedItems: paymentData.inspectedItems || []
        },
        paymentMethod: paymentData.paymentMethod,
        totalPaid: paymentData.paidAmount,
        paidAt: new Date().toISOString()
      })
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, order: data.data };
    }
  } catch (err) {
    console.warn('[API Service] Complete payment failed, fallback to local:', err.message);
  }
  return { success: true, source: 'local' };
}
// ----------------------------------------------------
// 12. Support Tickets API (MongoDB Atlas Backend)
// ----------------------------------------------------
export async function apiCreateTicket(ticketData) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/tickets`, {
      method: 'POST',
      body: JSON.stringify(ticketData)
    }, 6000);
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, ticket: data.data, message: data.message };
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.error || 'Failed to submit ticket to database' };
  } catch (err) {
    console.warn('[API Service] Submit ticket API error, fallback to local:', err.message);
    return { success: true, source: 'local_fallback', ticket: ticketData };
  }
}

export async function apiGetTickets(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetchWithTimeout(`${API_BASE}/tickets?${query}`, { method: 'GET' }, 5000);
    if (res.ok) {
      const data = await res.json();
      return { success: true, source: data.source, tickets: data.data || [] };
    }
  } catch (err) {
    console.warn('[API Service] Fetch tickets error:', err.message);
  }
  return { success: true, source: 'local_fallback', tickets: [] };
}
