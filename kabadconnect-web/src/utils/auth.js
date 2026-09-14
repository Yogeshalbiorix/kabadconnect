/**
 * Authentication Utility for KabadConnect
 * Backed directly by MongoDB Atlas (/api/users?action=login and /api/users?action=register).
 * Persists authenticated session in localStorage.
 */

import {
  apiLoginUser,
  apiRegisterUser,
  apiSendOtp,
  apiVerifyOtpLogin,
  apiVerifyOtpRegister
} from '../services/api';

const AUTH_STORAGE_KEY = 'kabadconnect_auth_user';
const AUTH_IS_LOGGED_IN_KEY = 'kabadconnect_is_authenticated';

/**
 * Retrieve current logged-in user from localStorage.
 * Defaults to null (logged out) so guest users browse as guests until they explicitly sign in.
 */
export const getCurrentUser = () => {
  try {
    const isAuthenticated = localStorage.getItem(AUTH_IS_LOGGED_IN_KEY);
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (isAuthenticated === 'true' && raw) {
      return JSON.parse(raw);
    }
    // If not explicitly authenticated, clear any legacy session
    if (raw && isAuthenticated !== 'true') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Error reading auth user from storage:', err);
  }
  return null;
};

/**
 * Save user to localStorage
 */
export const saveAuthUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_IS_LOGGED_IN_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_IS_LOGGED_IN_KEY);
    }
  } catch (err) {
    console.warn('Error saving auth user:', err);
  }
};

/**
 * Perform login against MongoDB Atlas
 */
export const loginUser = async (emailOrPhone, password) => {
  const trimmedIdentifier = emailOrPhone?.trim()?.toLowerCase();
  const trimmedPassword = password?.trim();

  if (!trimmedIdentifier) {
    return { success: false, error: 'Please enter your email address or mobile number.' };
  }
  if (!trimmedPassword) {
    return { success: false, error: 'Please enter your password.' };
  }

  const result = await apiLoginUser({
    emailOrPhone: trimmedIdentifier,
    password: trimmedPassword
  });

  if (result.success && result.user) {
    saveAuthUser(result.user);
    return { success: true, user: result.user, message: result.message };
  }

  return { success: false, error: result.error || 'Invalid credentials. Please check your details.' };
};

/**
 * Send OTP for login or registration via Gmail / Yopmail / SMTP
 */
export const sendAuthOtp = async (email, purpose = 'login') => {
  const trimmed = (email || '').trim().toLowerCase();
  if (!trimmed || !trimmed.includes('@')) {
    return { success: false, error: 'Please provide a valid email address (e.g. Gmail or Yopmail).' };
  }
  return await apiSendOtp({ email: trimmed, purpose });
};

/**
 * Login using 6-digit OTP
 */
export const loginWithOtp = async (email, otp) => {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedOtp = (otp || '').trim();

  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    return { success: false, error: 'Please provide a valid email address.' };
  }
  if (!trimmedOtp || trimmedOtp.length !== 6) {
    return { success: false, error: 'Please enter the complete 6-digit OTP.' };
  }

  const result = await apiVerifyOtpLogin({ email: trimmedEmail, otp: trimmedOtp });
  if (result.success && result.user) {
    saveAuthUser(result.user);
    return { success: true, user: result.user, message: result.message };
  }
  return { success: false, error: result.error || 'Failed to verify OTP.' };
};

/**
 * Verify OTP for registration pre-check
 */
export const verifyRegisterOtp = async (email, otp) => {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedOtp = (otp || '').trim();
  if (!trimmedEmail || !trimmedOtp) {
    return { success: false, error: 'Email and 6-digit OTP are required.' };
  }
  return await apiVerifyOtpRegister({ email: trimmedEmail, otp: trimmedOtp });
};

/**
 * Register a new user directly in MongoDB Atlas
 */
export const registerUser = async (userData) => {
  if (!userData.name?.trim()) {
    return { success: false, error: 'Full name is required.' };
  }
  if (!userData.email?.trim()) {
    return { success: false, error: 'Email address is required.' };
  }
  if (!userData.password?.trim()) {
    return { success: false, error: 'Password is required to secure your account.' };
  }

  const result = await apiRegisterUser(userData);
  if (result.success && result.user) {
    saveAuthUser(result.user);
    return { success: true, user: result.user, message: result.message };
  }

  return { success: false, error: result.error || 'Failed to create account.' };
};

/**
 * Logout current user
 */
export const logoutUser = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_IS_LOGGED_IN_KEY);
  } catch (err) {}
};

/**
 * Fallback empty profile values for guests
 */
export const DEMO_USERS = {
  customer: {
    name: 'Guest User',
    email: 'guest@kabadconnect.com',
    phone: '',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    address: 'Not logged in',
    city: 'Delhi NCR',
    pincode: '',
    upiId: '',
    totalEarned: 0,
    totalRecycledKg: 0,
    co2SavedKg: 0,
    treesSaved: 0,
    savedAddresses: []
  },
  agent: {
    name: 'Pickup Agent',
    agentCode: 'AG-ONLINE',
    email: '',
    phone: '',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    city: 'Delhi NCR',
    assignedRoutes: []
  },
  partner: {
    name: 'Recycling Merchant',
    businessName: 'Verified Yard Hub',
    partnerTier: 'Certified Merchant Hub',
    email: '',
    phone: '',
    role: 'partner',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    currentStockTons: 0
  },
  admin: {
    name: 'System Admin',
    email: 'admin@kabadconnect.com',
    role: 'admin'
  }
};
