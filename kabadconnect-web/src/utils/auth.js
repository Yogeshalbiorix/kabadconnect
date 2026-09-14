/**
 * Authentication Utility for KabadConnect
 * Supports Customer and Administrator roles with persistent localStorage sessions
 * and quick-login presets for demonstration.
 */

export const DEMO_USERS = {
  customer: {
    id: 'usr-customer-1',
    name: 'Aarav Sharma',
    email: 'aarav@kabadconnect.com',
    phone: '+91 98100 23456',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    address: 'Flat 402, Block B, Amrapali Village, Indirapuram',
    city: 'Delhi NCR',
    pincode: '201014',
    upiId: 'aarav.sharma@okhdfcbank',
    memberSince: 'Jan 2025',
    greenTier: 'Platinum Green Guardian',
    totalEarned: 14850,
    totalRecycledKg: 420,
    co2SavedKg: 780,
    treesSaved: 7.2,
    waterSavedLiters: 11200,
    savedAddresses: [
      { id: 'addr-1', label: 'Home', address: 'Flat 402, Block B, Amrapali Village, Indirapuram', city: 'Delhi NCR', pincode: '201014', isDefault: true },
      { id: 'addr-2', label: 'Office', address: 'Plot 18, Sector 18, Electronic City', city: 'Gurgaon', pincode: '122015', isDefault: false }
    ]
  },
  agent: {
    id: 'usr-agent-842',
    name: 'Rajesh Kumar Verma',
    agentCode: 'AG-842',
    email: 'rajesh.agent@kabadconnect.com',
    phone: '+91 98765 43210',
    role: 'agent',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    address: 'KabadConnect Operational Depot, Sector 43',
    city: 'Gurgaon',
    pincode: '122002',
    operatingZones: ['Sector 42', 'Sector 43', 'Sector 54', 'Golf Course Road'],
    vehicleType: 'Electric 3-Wheeler Cargo Loader (e-Tempo)',
    vehicleRegNo: 'HR 26 DQ 8841',
    maxPayloadKg: 650,
    currentPayloadKg: 185,
    rating: 4.92,
    totalReviews: 348,
    completedPickups: 348,
    scaleCertificationNo: 'ISO-CAL-2026-981',
    policeVerificationId: 'POL-HR-2025-4421',
    dutyStatus: 'Online',
    todaysEarnings: 2450,
    monthlyEarnings: 38200,
    onTimeRate: '98.4%',
    assignedRoutes: [
      { id: 'rte-1', customerName: 'Neha Malhotra', address: 'Tower 4, DLF Phase 5, Gurgaon', timeSlot: '11:00 AM - 12:00 PM', items: 'Old Laptop, Paper (20kg)', status: 'In Progress', payoutEst: 950 },
      { id: 'rte-2', customerName: 'Sanjay Rawat', address: 'B-12, Sector 43, Gurgaon', timeSlot: '02:00 PM - 03:00 PM', items: 'AC Outdoor Unit, Copper', status: 'Scheduled', payoutEst: 3200 },
      { id: 'rte-3', customerName: 'Pooja Agarwal', address: 'Villa 19, South City 1, Gurgaon', timeSlot: '04:30 PM - 05:30 PM', items: 'Cardboard cartons (40kg)', status: 'Pending', payoutEst: 400 }
    ]
  },
  partner: {
    id: 'usr-partner-104',
    name: 'Rameshwar Dayal Gupta',
    businessName: 'Mateshwari Metal & Circular Scrap Yard',
    partnerTier: 'Certified Gold Hub',
    email: 'rameshwar@mateshwarirecycling.com',
    phone: '+91 99201 11223',
    role: 'partner',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    address: 'Plot 44-A, Recycling Industrial Corridor, Manesar',
    city: 'Gurgaon',
    pincode: '122050',
    gstin: '07AAAAA0000A1Z5',
    tradeLicense: 'DL-IND-2024-8891',
    monthlyCapacityTons: 35.0,
    currentStockTons: 18.4,
    acceptedCategories: ['Metals (Iron, Copper, Brass)', 'E-Waste & Appliances', 'Industrial Corrugated Paper', 'Lead-Acid Batteries'],
    directMillTieups: ['Jindal Steel & Strips Ltd', 'Star Paper Mills Ltd', 'Exide Industrial Smelters'],
    bankAccount: {
      bankName: 'HDFC Bank Ltd',
      accountNo: '••••••••8492',
      ifsc: 'HDFC0001042',
      branch: 'Industrial Estate, Manesar'
    },
    totalProcuredTons: 420.5,
    totalDisbursedLakhs: 84.6,
    activeContractVehicles: 6
  },
  admin: {
    id: 'usr-admin-1',
    name: 'Vikram Singhania',
    email: 'admin@kabadconnect.com',
    phone: '+91 98000 00001',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    address: 'KabadConnect HQ, SG Highway',
    city: 'Ahmedabad',
    pincode: '380015'
  }
};

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
    // If not explicitly authenticated, clear any legacy default demo session
    if (raw && isAuthenticated !== 'true') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Error reading auth user from storage:', err);
  }
  // Default to null: logged out by default
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
 * Perform login with validation
 */
export const loginUser = (emailOrPhone, password, requestedRole = 'user') => {
  const trimmed = emailOrPhone?.trim()?.toLowerCase();

  // Admin login check
  if (requestedRole === 'admin' || trimmed.includes('admin')) {
    if (password === 'admin123' || password === 'admin' || trimmed === 'admin@kabadconnect.com') {
      const user = DEMO_USERS.admin;
      saveAuthUser(user);
      return { success: true, user };
    }
    return { success: false, error: 'Invalid admin credentials. (Hint: admin@kabadconnect.com / admin123)' };
  }

  // Agent login check
  if (requestedRole === 'agent' || trimmed.includes('agent')) {
    const user = DEMO_USERS.agent;
    saveAuthUser(user);
    return { success: true, user };
  }

  // Partner login check
  if (requestedRole === 'partner' || trimmed.includes('partner') || trimmed.includes('scrap')) {
    const user = DEMO_USERS.partner;
    saveAuthUser(user);
    return { success: true, user };
  }

  // Customer login check
  const user = {
    ...DEMO_USERS.customer,
    name: trimmed.split('@')[0] || 'Aarav Sharma',
    email: trimmed.includes('@') ? trimmed : DEMO_USERS.customer.email,
    phone: !trimmed.includes('@') ? trimmed : DEMO_USERS.customer.phone
  };
  saveAuthUser(user);
  return { success: true, user };
};

/**
 * Switch active role profile (customer | agent | partner | admin)
 */
export const switchUserRole = (roleKey) => {
  const target = DEMO_USERS[roleKey] || DEMO_USERS.customer;
  saveAuthUser(target);
  return target;
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

