import React, { useState, useEffect } from 'react';
import { Truck, X, Bell } from 'lucide-react';
import { Navbar } from './components/common/Navbar';

import { LiveRateTicker } from './components/home/LiveRateTicker';
import { Footer } from './components/common/Footer';

// Router & Dedicated Pages
import { useHashRoute } from './utils/router';
import { HomePage } from './pages/HomePage';
import { RatesPage } from './pages/RatesPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { KabadwalasPage } from './pages/KabadwalasPage';
import { StorePage } from './pages/StorePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ContactPage } from './pages/ContactPage';
import { ProfilePage } from './pages/ProfilePage';

// Modals & Drawers
import { BookingWizardModal } from './components/booking/BookingWizardModal';
import { LiveOrderTrackerModal } from './components/tracking/LiveOrderTrackerModal';
import { PartnerJoinModal } from './components/kabadwala/PartnerJoinModal';
import { CartDrawer } from './components/marketplace/CartDrawer';
import { PickupListDrawer } from './components/pickup/PickupListDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { MyPickupsModal } from './components/orders/MyPickupsModal';
import { AdminPanelModal } from './components/admin/AdminPanelModal';
import { SellProductModal } from './components/marketplace/SellProductModal';
import { DoorstepVerificationModal } from './components/orders/DoorstepVerificationModal';
import { AgentDispatchAlertModal } from './components/agent/AgentDispatchAlertModal';
import { GeminiChatbot } from './components/common/GeminiChatbot';
import { CookieConsentModal } from './components/common/CookieConsentModal';

// Initial data & utilities
import { INITIAL_ORDERS } from './data/mockOrders';
import { SCRAP_ITEMS } from './data/scrapRates';
import { INITIAL_MARKETPLACE_ITEMS } from './data/marketplaceItems';
import { KABADWALA_PARTNERS } from './data/kabadwalas';
import { getUserCoordinates, reverseGeocodeMapbox, fetchIpLocation, resolveCityFullName } from './utils/geolocation';
import { getMapboxToken } from './utils/mapboxConfig';
import { getCurrentUser, saveAuthUser, logoutUser } from './utils/auth';
import {
  apiFetchOrders,
  apiCreateOrder,
  apiUpdateOrder,
  apiAcceptPickupOrder,
  apiFetchRates,
  apiUpdateRate,
  apiCreateRate,
  apiDeleteRate,
  apiBulkUpdateRates,
  apiSeedDatabase,
  checkDatabaseHealth,
  apiCreateOrUpdateUser,
  apiUpdateUserProfile,
  apiFetchMarketplaceItems,
  apiCreateMarketplaceItem,
  apiUpdateMarketplaceItem,
  apiDeleteMarketplaceItem,
  apiFetchPartners
} from './services/api';
import { initSmoothScroll, destroySmoothScroll, getLenis } from './utils/smoothScroll';

export default function App() {
  const [currentRoute, navigateTo] = useHashRoute();
  const [activeCity, setActiveCity] = useState(() => {
    try {
      const saved = localStorage.getItem('kabadcollect_active_city') || localStorage.getItem('kabadconnect_active_city');
      if (saved) return saved;
    } catch (e) { }
    return 'Delhi NCR (Indirapuram / Noida)';
  });
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('kabadcollect_user_location') || localStorage.getItem('kabadconnect_user_location');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return null;
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleSetActiveCity = (city) => {
    setActiveCity(city);
    try {
      localStorage.setItem('kabadcollect_active_city', city);
    } catch (e) { }
  };

  // Database Connection Health State (MongoDB Atlas / Vercel Serverless)
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    status: 'checking',
    message: 'Checking MongoDB Atlas connection...'
  });

  // Authentication state
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // Centralized Orders State (initialized from localStorage or fresh empty state)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('kabadcollect_orders') || localStorage.getItem('kabadconnect_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(o => !['KC-7729', 'KC-7681', 'KC-DEMO-1', 'KC-DEMO-2', 'KC-8842', 'KC-8721'].includes(o.id));
          localStorage.setItem('kabadcollect_orders', JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch (e) { }
    return [];
  });

  // Filter orders strictly for the active user
  const userOrders = currentUser
    ? orders.filter(o => {
      if (['KC-7729', 'KC-7681', 'KC-DEMO-1', 'KC-DEMO-2', 'KC-8842', 'KC-8721'].includes(o.id)) return false;
      if (o.userId && o.userId === currentUser.id) return true;
      if (currentUser.email && o.customer?.email && o.customer.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
      if (currentUser.phone && o.customer?.phone && o.customer.phone === currentUser.phone) return true;
      if (currentUser.role === 'admin') return true;
      return false;
    })
    : [];

  // Centralized Scrap Rates State (allows Admin live editing, persisted in localStorage & MongoDB)
  const [scrapItems, setScrapItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kabadcollect_scrap_rates') || localStorage.getItem('kabadconnect_scrap_rates');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return SCRAP_ITEMS;
  });

  // Centralized Marketplace State (Almirahs, Tables, AC, Sofa, Bed, Mattress, Cycles, etc.)
  const [marketplaceItems, setMarketplaceItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kabadcollect_marketplace') || localStorage.getItem('kabadconnect_marketplace');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return INITIAL_MARKETPLACE_ITEMS;
  });

  // Centralized Partners State (backed by MongoDB /api/partners)
  const [partners, setPartners] = useState(() => {
    try {
      const saved = localStorage.getItem('kabadcollect_partners') || localStorage.getItem('kabadconnect_partners');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return KABADWALA_PARTNERS;
  });

  // Modal & Drawer visibility states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPickupListOpen, setIsPickupListOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMyPickupsOpen, setIsMyPickupsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isDoorstepModalOpen, setIsDoorstepModalOpen] = useState(false);
  const [doorstepOrder, setDoorstepOrder] = useState(null);
  const [agentNotification, setAgentNotification] = useState(null);

  // Dynamic booking state & pickup list

  const [selectedScrapItems, setSelectedScrapItems] = useState([]);
  const [calculatedScrapData, setCalculatedScrapData] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  // Shopping cart for recycled products (empty by default)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kabadcollect_cart') || localStorage.getItem('kabadconnect_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return [];
  });

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kabadcollect_cart', JSON.stringify(cartItems));
    } catch (e) { }
  }, [cartItems]);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kabadcollect_orders', JSON.stringify(orders));
    } catch (e) { }
  }, [orders]);

  // Sync marketplace items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kabadcollect_marketplace', JSON.stringify(marketplaceItems));
    } catch (e) { }
  }, [marketplaceItems]);

  // Sync partners to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kabadcollect_partners', JSON.stringify(partners));
    } catch (e) { }
  }, [partners]);

  // Sync scrap items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kabadcollect_scrap_rates', JSON.stringify(scrapItems));
    } catch (e) { }
  }, [scrapItems]);

  // Initial load: Verify MongoDB connection & load live records from database
  useEffect(() => {
    // 1. Health check
    checkDatabaseHealth().then((health) => {
      setDbStatus(health);
    }).catch(() => { });

    // 2. Fetch live orders from MongoDB
    apiFetchOrders().then((res) => {
      if (res && res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
        if (res.orders.length > 0 && !activeOrder) {
          setActiveOrder(res.orders[0]);
        }
      }
    }).catch(() => { });

    // 3. Fetch live rates from MongoDB
    apiFetchRates().then((res) => {
      if (res && res.success && Array.isArray(res.rates) && res.rates.length > 0) {
        setScrapItems(res.rates);
      }
    }).catch(() => { });

    // 4. Fetch live marketplace items from MongoDB Atlas
    apiFetchMarketplaceItems().then((res) => {
      if (res && res.success && Array.isArray(res.items) && res.items.length > 0) {
        setMarketplaceItems(res.items);
      }
    }).catch(() => { });

    // 5. Fetch live verified partners from MongoDB Atlas
    apiFetchPartners().then((res) => {
      if (res && res.success && Array.isArray(res.partners) && res.partners.length > 0) {
        setPartners(res.partners);
      }
    }).catch(() => { });
  }, []);

  // Declined dispatch orders state for field agents
  const [declinedOrderIds, setDeclinedOrderIds] = useState([]);

  // Dynamic incoming dispatch order for online field agents
  const isAgentOnline = currentUser?.role === 'agent' && (currentUser?.dutyStatus === 'Online' || currentUser?.dutyStatus === 'On Duty' || !currentUser?.dutyStatus);
  const incomingDispatchOrder = isAgentOnline
    ? orders.find((o) => {
        if (!o || !o.id) return false;
        if (['KC-7729', 'KC-7681', 'KC-DEMO-1', 'KC-DEMO-2', 'KC-8842', 'KC-8721'].includes(o.id)) return false;
        if (declinedOrderIds.includes(o.id)) return false;
        if (o.assignedAgentId || o.status === 'assigned' || o.status === 'completed' || o.status === 'cancelled') return false;
        return o.status === 'pending' || !o.status;
      })
    : null;

  // Live background sync: Poll orders every 3 seconds so customers and field agents stay synchronized
  useEffect(() => {
    const pollInterval = setInterval(() => {
      apiFetchOrders().then((res) => {
        if (res && res.success && Array.isArray(res.orders)) {
          setOrders(res.orders);
          // Keep activeOrder reactive to live status, agent acceptance, and OTP changes
          setActiveOrder((prevActive) => {
            if (!prevActive) return prevActive;
            const fresh = res.orders.find((o) => o.id === prevActive.id);
            return fresh || prevActive;
          });
        }
      }).catch(() => { });
    }, 3000);
    return () => clearInterval(pollInterval);
  }, []);

  // 1. Initialize Lenis Smooth Scrolling Engine
  useEffect(() => {
    const lenis = initSmoothScroll();
    return () => {
      destroySmoothScroll();
    };
  }, []);

  // 2. Pause Lenis smooth scroll while modals or drawers are open so background page stays fixed
  useEffect(() => {
    const isAnyModalOpen = isBookingOpen || isTrackerOpen || isPartnerModalOpen ||
      isCartOpen || isPickupListOpen || isAuthModalOpen || isMyPickupsOpen || isAdminPanelOpen || isSellModalOpen || isDoorstepModalOpen || Boolean(incomingDispatchOrder);

    const lenis = getLenis();
    if (lenis) {
      if (isAnyModalOpen) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }
  }, [isBookingOpen, isTrackerOpen, isPartnerModalOpen, isCartOpen, isPickupListOpen, isAuthModalOpen, isMyPickupsOpen, isAdminPanelOpen, isSellModalOpen, isDoorstepModalOpen, incomingDispatchOrder]);

  // 3. Reset scroll position to top on route change
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [currentRoute]);

  // Marketplace Operations (Create, Update/Mark Sold, Delete)
  const handleCreateProduct = async (productData) => {
    setMarketplaceItems((prev) => [productData, ...prev]);
    const res = await apiCreateMarketplaceItem(productData);
    if (res && res.success && res.item) {
      setMarketplaceItems((prev) => prev.map((p) => p.id === productData.id ? res.item : p));
    }
  };

  const handleUpdateProduct = async (productId, updates) => {
    setMarketplaceItems((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
    await apiUpdateMarketplaceItem(productId, updates);
  };

  const handleDeleteProduct = async (productId) => {
    setMarketplaceItems((prev) => prev.filter((p) => p.id !== productId));
    await apiDeleteMarketplaceItem(productId);
  };

  // ----------------------------------------------------
  // Pickup List Operations (Add, Remove, Update Weight, Clear)
  // ----------------------------------------------------
  const handleAddScrapItem = (item) => {
    const existingIndex = selectedScrapItems.findIndex((s) => s.id === item.id);
    if (existingIndex > -1) {
      // Toggle off if already selected
      setSelectedScrapItems(selectedScrapItems.filter((s) => s.id !== item.id));
    } else {
      const newItem = {
        ...item,
        estimatedWeight: 10 // default 10kg
      };
      setSelectedScrapItems([...selectedScrapItems, newItem]);
    }
  };

  const handleUpdatePickupItemWeight = (itemId, newWeight) => {
    setSelectedScrapItems(
      selectedScrapItems.map((item) =>
        item.id === itemId ? { ...item, estimatedWeight: newWeight } : item
      )
    );
  };

  const handleMovePickupItem = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= selectedScrapItems.length) return;
    const reordered = [...selectedScrapItems];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);
    setSelectedScrapItems(reordered);
  };

  const handleRemovePickupItem = (itemId) => {
    setSelectedScrapItems(selectedScrapItems.filter((item) => item.id !== itemId));
  };

  const handleClearPickupList = () => {
    setSelectedScrapItems([]);
    setIsPickupListOpen(false);
  };

  const handleOpenBookingProtected = (scrapData = null) => {
    if (!currentUser) {
      if (scrapData) setCalculatedScrapData(scrapData);
      setIsAuthModalOpen(true);
      return;
    }
    if (scrapData) setCalculatedScrapData(scrapData);
    setIsBookingOpen(true);
  };

  const handleOpenSellProtected = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsSellModalOpen(true);
  };

  const handleProceedToBookingFromPickupList = (pickupData) => {
    handleOpenBookingProtected({
      estimatedRupees: pickupData.totalPayout,
      totalWeight: pickupData.totalWeight,
      items: pickupData.items
    });
  };


  // ----------------------------------------------------
  // Order Operations (Cancel, Update / Reschedule, Create, Reorder)
  // ----------------------------------------------------
  const handleBookingSuccess = (newOrder) => {
    const enrichedOrder = {
      ...newOrder,
      userId: currentUser?.id || newOrder.userId || `usr-${Date.now()}`,
      customer: {
        ...newOrder.customer,
        name: currentUser?.name || newOrder.customer?.name || 'Customer',
        email: currentUser?.email || newOrder.customer?.email || '',
        phone: currentUser?.phone || newOrder.customer?.phone || ''
      }
    };
    const updated = [enrichedOrder, ...orders];
    setOrders(updated);
    setActiveOrder(enrichedOrder);
    setSelectedScrapItems([]); // clear pickup list once scheduled
    setCalculatedScrapData(null); // clear scrap calculation
    setIsBookingOpen(false);
    setIsTrackerOpen(true);

    // Persist booking directly to MongoDB Atlas
    apiCreateOrder(enrichedOrder).catch(() => { });
  };

  const handleReorder = (order) => {
    // 1. Reconstruct scrap items from past order
    let reorderedItems = [];
    if (order.itemsWeighed && order.itemsWeighed.length > 0) {
      reorderedItems = order.itemsWeighed.map((it, idx) => {
        const match = scrapItems.find(s =>
          s.name.toLowerCase().includes(it.name.toLowerCase()) ||
          it.name.toLowerCase().includes(s.name.toLowerCase())
        );
        const weightNum = parseFloat(it.weight) || 10;
        if (match) {
          return { ...match, estimatedWeight: weightNum };
        }
        return {
          id: `reorder-${Date.now()}-${idx}`,
          name: it.name,
          hindiName: '',
          category: order.categories?.[idx] || order.categories?.[0] || 'paper',
          rate: parseFloat(String(it.rate).replace(/[^0-9.]/g, '')) || 15,
          unit: 'kg',
          estimatedWeight: weightNum
        };
      });
    } else if (order.categories && order.categories.length > 0) {
      order.categories.forEach(cat => {
        const match = scrapItems.find(s => s.category === cat);
        if (match && !reorderedItems.find(r => r.id === match.id)) {
          reorderedItems.push({ ...match, estimatedWeight: 15 });
        }
      });
    }

    if (reorderedItems.length > 0) {
      setSelectedScrapItems(reorderedItems);
    }

    // 2. Set up pre-filled booking wizard data
    setCalculatedScrapData({
      categories: order.categories || ['paper'],
      items: reorderedItems,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      pincode: order.pincode,
      estimatedWeight: order.estimatedWeight,
      totalPayout: order.estimatedAmount || order.totalPaid || 500,
      totalWeight: reorderedItems.reduce((acc, curr) => acc + (curr.estimatedWeight || 10), 0),
      isReorder: true,
      reorderedFromId: order.id
    });

    setIsMyPickupsOpen(false);
    setIsAdminPanelOpen(false);
    setIsBookingOpen(true);
  };

  const handleCancelOrder = (orderId, reason) => {
    const cancelReasonText = reason || 'Cancelled by customer';
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
          ...o,
          status: 'cancelled',
          cancelReason: cancelReasonText,
          cancelledAt: new Date().toISOString()
        }
        : o
    );
    setOrders(updated);
    if (activeOrder?.id === orderId) {
      setActiveOrder({ ...activeOrder, status: 'cancelled' });
    }

    // Persist status change to MongoDB Atlas
    apiUpdateOrder(orderId, {
      status: 'cancelled',
      cancelReason: cancelReasonText,
      cancelledAt: new Date().toISOString()
    }).catch(() => { });
  };

  const handleUpdateOrder = (orderId, updatedFields) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
          ...o,
          ...updatedFields,
          updatedAt: new Date().toISOString()
        }
        : o
    );
    setOrders(updated);
    if (activeOrder?.id === orderId) {
      setActiveOrder({ ...activeOrder, ...updatedFields });
    }
    if (doorstepOrder?.id === orderId) {
      setDoorstepOrder({ ...doorstepOrder, ...updatedFields });
    }

    // Auto-credit user's wallet or agent's commission and stats upon order payment / completion
    const isNowPaid = updatedFields.status === 'completed' || 
      updatedFields.doorstepVerification?.paymentStatus === 'completed' || 
      updatedFields.doorstepVerification?.paymentStatus === 'paid' ||
      updatedFields.paymentStatus === 'paid';

    if (currentUser && isNowPaid) {
      const addedCash = parseFloat(
        updatedFields.doorstepVerification?.paidAmount || 
        updatedFields.totalPaid || 
        updatedFields.paidAmount || 
        0
      );
      const addedKg = parseFloat(
        updatedFields.doorstepVerification?.verifiedWeight || 
        (Array.isArray(updatedFields.itemsWeighed) ? updatedFields.itemsWeighed.reduce((acc, it) => acc + (parseFloat(it.weight) || 0), 0) : 0) || 
        updatedFields.totalWeight || 
        0
      );

      if (currentUser.role === 'agent') {
        const curEarned = parseFloat(currentUser.todayEarnings || 0);
        const curPickups = parseInt(currentUser.todayPickupsCount || 0, 10);
        const curLoad = parseFloat(currentUser.currentLoadKg || 0);
        const agentComm = Math.round(addedCash * 0.15) || 120;
        const updatedAgent = {
          ...currentUser,
          todayEarnings: curEarned + agentComm,
          todayPickupsCount: curPickups + 1,
          currentLoadKg: curLoad + addedKg,
          walletBalance: (parseFloat(currentUser.walletBalance || 0) + agentComm)
        };
        handleUpdateUser(updatedAgent);
      } else {
        const curWallet = parseFloat(currentUser.walletBalance ?? currentUser.totalEarned ?? 0);
        const curKg = parseFloat(currentUser.totalRecycledKg || 0);
        const newWallet = curWallet + addedCash;
        const newKg = curKg + addedKg;
        const updatedUser = {
          ...currentUser,
          walletBalance: newWallet,
          totalEarned: newWallet,
          totalRecycledKg: newKg,
          co2SavedKg: (newKg * 1.85).toFixed(1),
          treesSaved: (newKg / 58).toFixed(1)
        };
        handleUpdateUser(updatedUser);
      }
    }

    // Persist updates to MongoDB Atlas
    apiUpdateOrder(orderId, updatedFields).catch(() => { });
  };

  // ----------------------------------------------------
  // Field Agent Dispatch Handlers (Accept / Decline Live Route)
  // ----------------------------------------------------
  const handleAcceptPickupByAgent = async (orderId) => {
    if (!currentUser || !orderId) return;

    const vReg = currentUser.vehicleRegNo || currentUser.vehicleNumber || 'Unregistered';
    const vType = currentUser.vehicleType || 'Electric 3-Wheeler Cargo';
    const fullVehicle = `${vType} • Reg: ${vReg}`;
    const agentBadge = currentUser.agentCode || currentUser.badgeNumber || 'AGT-7749';

    const agentInfo = {
      id: currentUser.id,
      name: currentUser.name || 'Field Agent',
      phone: currentUser.phone || '',
      agentCode: agentBadge,
      vehicleNumber: fullVehicle,
      vehicleType: vType,
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=120&q=80'
    };

    const updatedFields = {
      assignedAgentId: currentUser.id,
      assignedAgent: agentInfo,
      agentName: currentUser.name,
      agentPhone: currentUser.phone,
      agentCode: agentBadge,
      agentVehicle: fullVehicle,
      agentAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=120&q=80',
      kabadwala: {
        id: currentUser.id,
        name: currentUser.name,
        phone: currentUser.phone,
        rating: Number(currentUser.rating) || 5.0,
        vehicle: fullVehicle,
        photo: currentUser.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=120&q=80',
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=120&q=80'
      },
      status: 'assigned',
      assignedAt: new Date().toISOString()
    };

    handleUpdateOrder(orderId, updatedFields);

    const existingOrder = orders.find((o) => o.id === orderId) || { id: orderId };
    const fullMergedOrder = { ...existingOrder, ...updatedFields };

    // 1. Instant Notification / Message for Field Agent
    setAgentNotification({
      title: '✅ Pickup Order Assigned!',
      message: `Pickup Order #${orderId} (${existingOrder.customer?.name || existingOrder.userName || 'Customer'}) is assigned to you. Opening Doorstep Weighing & Inspection Terminal...`,
      orderId: orderId
    });

    setTimeout(() => {
      setAgentNotification(null);
    }, 7000);

    // 2. Open Doorstep Weighing & Inspection Modal DIRECTLY (no need to open Profile)
    setDoorstepOrder(fullMergedOrder);
    setIsDoorstepModalOpen(true);

    try {
      await apiAcceptPickupOrder(orderId, currentUser);
    } catch (e) {
      console.warn('Failed to sync agent pickup acceptance to MongoDB Atlas:', e);
    }
  };


  const handleDeclinePickupByAgent = (orderId) => {
    setDeclinedOrderIds((prev) => [...prev, orderId]);
  };

  const handleOpenDoorstepVerification = (order) => {
    setDoorstepOrder(order);
    setIsDoorstepModalOpen(true);
  };

  // ----------------------------------------------------
  // Admin Operations (Status change, Partner assignment, Rate update)
  // ----------------------------------------------------
  const handleAdminUpdateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    if (activeOrder?.id === orderId) {
      setActiveOrder({ ...activeOrder, status: newStatus });
    }

    // Persist status change to MongoDB Atlas
    apiUpdateOrder(orderId, { status: newStatus }).catch(() => { });
  };

  const handleAssignKabadwala = (orderId, partner) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, kabadwala: partner, status: o.status === 'pending' ? 'assigned' : o.status } : o
    );
    setOrders(updated);
    if (activeOrder?.id === orderId) {
      setActiveOrder({ ...activeOrder, kabadwala: partner });
    }

    // Persist kabadwala assignment to MongoDB Atlas
    apiUpdateOrder(orderId, { kabadwala: partner, status: 'assigned' }).catch(() => { });
  };

  // ----------------------------------------------------
  // Scrap Rates & Catalog Operations (CRUD & Bulk Adjustment)
  // ----------------------------------------------------
  const handleCreateScrapItem = async (newItemData) => {
    const item = {
      ...newItemData,
      id: newItemData.id || `${newItemData.category || 'scrap'}-${Date.now().toString(36)}`
    };
    setScrapItems((prev) => [item, ...prev]);
    const res = await apiCreateRate(item);
    if (res && res.success && res.item) {
      setScrapItems((prev) => prev.map((p) => p.id === item.id ? res.item : p));
    }
  };

  const handleUpdateScrapRate = (itemId, updatesOrRate, newTrend) => {
    const isObject = typeof updatesOrRate === 'object' && updatesOrRate !== null;
    const updates = isObject ? updatesOrRate : { rate: Number(updatesOrRate), trendType: newTrend };

    setScrapItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
            ...it,
            ...updates,
            rate: updates.rate !== undefined ? Number(updates.rate) : it.rate
          }
          : it
      )
    );

    // Persist live rate change to MongoDB Atlas
    apiUpdateRate({ id: itemId, ...updates }).catch(() => { });
  };

  const handleDeleteScrapItem = async (itemId) => {
    setScrapItems((prev) => prev.filter((it) => it.id !== itemId));
    await apiDeleteRate(itemId);
  };

  const handleBulkUpdateScrapRates = async (category, deltaPercent = null, deltaAmount = null) => {
    setScrapItems((prev) =>
      prev.map((item) => {
        if (category !== 'all' && item.category !== category) return item;
        let newRate = item.rate;
        if (deltaPercent) {
          newRate = Math.max(1, Math.round(item.rate * (1 + Number(deltaPercent) / 100)));
        } else if (deltaAmount) {
          newRate = Math.max(1, item.rate + Number(deltaAmount));
        }
        const trendT = newRate > item.rate ? 'up' : newRate < item.rate ? 'down' : 'stable';
        const trendTxt = newRate > item.rate ? `+₹${newRate - item.rate}.00` : newRate < item.rate ? `-₹${item.rate - newRate}.00` : 'Stable';
        return {
          ...item,
          rate: newRate,
          trend: trendTxt,
          trendType: trendT
        };
      })
    );

    await apiBulkUpdateRates(category, deltaPercent, deltaAmount);
  };

  const handleResetScrapRates = async () => {
    setScrapItems(SCRAP_ITEMS);
    try {
      localStorage.setItem('kabadcollect_scrap_rates', JSON.stringify(SCRAP_ITEMS));
      await apiSeedDatabase();
    } catch (e) { }
  };

  // ----------------------------------------------------
  // Authentication Handlers & MongoDB User Persistence
  // ----------------------------------------------------
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    saveAuthUser(user);
    setIsAuthModalOpen(false);
  };

  const handleUpdateUser = async (updatedUser) => {
    setCurrentUser(updatedUser);
    saveAuthUser(updatedUser);
    // Persist profile updates (address, city, state, pincode, upiId) into MongoDB Atlas
    try {
      await apiUpdateUserProfile(updatedUser.email || updatedUser.id, updatedUser);
    } catch (e) {
      console.warn('Failed to sync profile update to MongoDB Atlas:', e);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsAdminPanelOpen(false);
  };

  // Cart operations
  const handleAddToCart = (product) => {
    const existing = cartItems.find((item) => item.id === product.id);
    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(productId);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveCartItem = (productId) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Auto-detect user current location on startup (GPS if permitted, or instant IP fallback)
  useEffect(() => {
    const autoDetect = async () => {
      const savedCity = localStorage.getItem('kabadcollect_active_city') || localStorage.getItem('kabadconnect_active_city');
      // If user hasn't explicitly chosen a city or if it's the default Delhi, auto-detect actual location!
      if (!savedCity || savedCity === 'Delhi NCR (Indirapuram / Noida)') {
        await handleDetectLocation({ silent: true });
      }
    };
    autoDetect();
  }, []);

  // Location detection (GPS with instant IP fallback)
  const handleDetectLocation = async (opts = {}) => {
    const { silent = false } = typeof opts === 'object' && opts !== null ? opts : {};
    setIsDetectingLocation(true);
    try {
      let geo = null;

      // 1. Try Browser GPS first if permission is already granted or user clicked explicitly
      let canUseGps = false;
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const status = await navigator.permissions.query({ name: 'geolocation' });
          if (status.state === 'granted') {
            canUseGps = true;
          } else if (!silent && status.state === 'prompt') {
            canUseGps = true;
          }
        } catch (e) {
          if (!silent) canUseGps = true;
        }
      } else if (!silent) {
        canUseGps = true;
      }

      if (canUseGps) {
        try {
          const coords = await getUserCoordinates();
          const token = getMapboxToken();
          geo = await reverseGeocodeMapbox(coords.longitude, coords.latitude, token);
        } catch (gpsErr) {
          console.log('[Location] GPS detection skipped or unavailable, falling back to IP:', gpsErr.message);
        }
      }

      // 2. If GPS didn't return a location, fallback to fast IP Geolocation (e.g. Ahmedabad)
      if (!geo) {
        geo = await fetchIpLocation();
      }

      // 3. Update state & localStorage if location resolved
      if (geo && geo.city) {
        setUserLocation(geo);
        try {
          localStorage.setItem('kabadcollect_user_location', JSON.stringify(geo));
        } catch (e) { }

        const hubCity = resolveCityFullName(geo.city, geo.state, geo.locality);
        setActiveCity(hubCity);
        try {
          localStorage.setItem('kabadcollect_active_city', hubCity);
        } catch (e) { }

        return geo;
      }

      if (!silent) {
        alert('Could not detect your current location. Please check browser permissions.');
      }
      return null;
    } catch (err) {
      console.error('Location detection failed:', err);
      if (!silent) {
        alert(err.message || 'Could not detect your current location. Please check browser permissions.');
      }
      return null;
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Calculate dynamic wallet balance from user's completed/paid orders + explicit balance
  const completedUserPickups = userOrders.filter(o =>
    o.status === 'completed' ||
    o.doorstepVerification?.paymentStatus === 'completed' ||
    o.doorstepVerification?.paymentStatus === 'paid' ||
    o.paymentStatus === 'paid'
  );

  const dynamicOrdersCash = completedUserPickups.reduce((sum, o) => {
    const val = parseFloat(o.paidAmount || o.totalPaid || o.doorstepVerification?.paidAmount || o.doorstepVerification?.finalAmount || o.estimatedAmount || 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const dynamicWalletBalance = currentUser?.walletBalance !== undefined && currentUser?.walletBalance !== null
    ? Number(currentUser.walletBalance)
    : (Number(currentUser?.totalEarned || 0) + dynamicOrdersCash);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header & Navigation */}
      <Navbar
        onOpenBooking={() => handleOpenBookingProtected()}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSellModal={handleOpenSellProtected}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        activeCity={activeCity}
        setActiveCity={handleSetActiveCity}
        userLocation={userLocation}
        onDetectLocation={handleDetectLocation}
        isDetectingLocation={isDetectingLocation}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenMyPickups={() => setIsMyPickupsOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenPickupList={() => setIsPickupListOpen(true)}
        pickupCount={selectedScrapItems.length}
        ordersCount={userOrders.length}
        currentPage={currentRoute}
        onNavigate={navigateTo}
        walletBalance={dynamicWalletBalance}
      />

      {/* Live Scrap Market Rate Marquee Ticker */}
      <LiveRateTicker />

      {/* Main Content (Multi-Page Routed) */}
      <main style={{ flex: 1 }}>
        {currentRoute === 'rates' && (
          <RatesPage
            onAddScrapItem={handleAddScrapItem}
            selectedItems={selectedScrapItems}
            onOpenBooking={() => handleOpenBookingProtected()}
            onOpenPickupList={() => setIsPickupListOpen(true)}
            scrapItems={scrapItems}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === 'calculator' && (
          <CalculatorPage
            onBookCalculatedScrap={(calcData) => handleOpenBookingProtected(calcData)}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === 'kabadwalas' && (
          <KabadwalasPage
            onSelectPartnerForBooking={() => handleOpenBookingProtected()}
            onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
            activeCity={activeCity}
            userLocation={userLocation}
            onLocationDetected={(geo) => setUserLocation(geo)}
            onNavigate={navigateTo}
            partners={partners}
          />
        )}

        {currentRoute === 'store' && (
          <StorePage
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
            onOpenCart={() => setIsCartOpen(true)}
            onNavigate={navigateTo}
            onOpenSellModal={handleOpenSellProtected}
            marketplaceItems={marketplaceItems}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            currentUser={currentUser}
            activeCity={activeCity}
          />
        )}

        {currentRoute === 'how-it-works' && (
          <HowItWorksPage
            onOpenBooking={() => handleOpenBookingProtected()}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === 'contact' && (
          <ContactPage
            onOpenBooking={() => handleOpenBookingProtected()}
            onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
            currentUser={currentUser}
            orders={userOrders}
          />
        )}

        {currentRoute === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            orders={orders}
            userOrders={userOrders}
            onCancelOrder={handleCancelOrder}
            onReorder={handleReorder}
            onUpdateOrder={handleUpdateOrder}
            onOpenDoorstepVerification={handleOpenDoorstepVerification}
            onOpenBooking={() => handleOpenBookingProtected()}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
            onLogout={handleLogout}
            onNavigate={navigateTo}
            dbStatus={dbStatus}
          />
        )}

        {(currentRoute === 'home' || !['rates', 'calculator', 'kabadwalas', 'store', 'how-it-works', 'contact', 'profile'].includes(currentRoute)) && (
          <HomePage
            onOpenBooking={() => handleOpenBookingProtected()}
            activeCity={activeCity}
            userLocation={userLocation}
            onDetectLocation={handleDetectLocation}
            isDetectingLocation={isDetectingLocation}
            onAddScrapItem={handleAddScrapItem}
            selectedScrapItems={selectedScrapItems}
            onOpenPickupList={() => setIsPickupListOpen(true)}
            scrapItems={scrapItems}
            onBookCalculatedScrap={(calcData) => handleOpenBookingProtected(calcData)}
            onSelectPartnerForBooking={() => handleOpenBookingProtected()}
            onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
            onLocationDetected={(geo) => setUserLocation(geo)}
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
            onOpenCart={() => setIsCartOpen(true)}
            onNavigate={navigateTo}
            onOpenSellModal={handleOpenSellProtected}
            marketplaceItems={marketplaceItems}
            partners={partners}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={() => handleOpenBookingProtected()}
        onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
        onNavigate={navigateTo}
      />


      {/* Modals & Drawers */}
      <BookingWizardModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setCalculatedScrapData(null);
        }}
        initialScrapData={calculatedScrapData}
        onBookingSuccess={handleBookingSuccess}
        activeCity={activeCity}
        userLocation={userLocation}
        onLocationDetected={(geo) => setUserLocation(geo)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <LiveOrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        activeOrder={activeOrder}
        onOpenDoorstepVerification={handleOpenDoorstepVerification}
        onUpdateOrder={handleUpdateOrder}
      />

      <PartnerJoinModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        activeCity={activeCity}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* NEW: Pickup List Drawer */}
      <PickupListDrawer
        isOpen={isPickupListOpen}
        onClose={() => setIsPickupListOpen(false)}
        items={selectedScrapItems}
        onUpdateWeight={handleUpdatePickupItemWeight}
        onRemoveItem={handleRemovePickupItem}
        onClearList={handleClearPickupList}
        onProceedToBooking={handleProceedToBookingFromPickupList}
        onMoveItem={handleMovePickupItem}
      />

      {/* NEW: Customer & Admin Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* NEW: My Pickups Modal (Cancel, Update & Reorder Orders) */}
      <MyPickupsModal
        isOpen={isMyPickupsOpen}
        onClose={() => setIsMyPickupsOpen(false)}
        orders={userOrders}
        onCancelOrder={handleCancelOrder}
        onUpdateOrder={handleUpdateOrder}
        onTrackOrder={(order) => {
          setActiveOrder(order);
          setIsTrackerOpen(true);
        }}
        onOpenBooking={() => setIsBookingOpen(true)}
        onReorder={handleReorder}
        onOpenDoorstepVerification={handleOpenDoorstepVerification}
      />

      {/* NEW: Admin Panel Modal (All Orders, Rates Editor, Partners, Reorder, MongoDB Status, Marketplace) */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        orders={orders}
        onUpdateOrderStatus={handleAdminUpdateOrderStatus}
        onAssignKabadwala={handleAssignKabadwala}
        onCancelOrder={handleCancelOrder}
        scrapItems={scrapItems}
        onUpdateScrapRate={handleUpdateScrapRate}
        onCreateScrapItem={handleCreateScrapItem}
        onDeleteScrapItem={handleDeleteScrapItem}
        onBulkUpdateScrapRates={handleBulkUpdateScrapRates}
        onResetScrapRates={handleResetScrapRates}
        currentUser={currentUser}
        onReorder={handleReorder}
        dbStatus={dbStatus}
        onRefreshDbHealth={() => {
          checkDatabaseHealth().then(setDbStatus).catch(() => { });
        }}
        marketplaceItems={marketplaceItems}
        onDeleteProduct={handleDeleteProduct}
        partners={partners}
        onOpenDoorstepVerification={handleOpenDoorstepVerification}
      />

      {/* NEW: Sell Product Modal (C2C Pre-Loved Goods Bazaar) */}
      <SellProductModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onSubmitProduct={handleCreateProduct}
        currentUser={currentUser}
        activeCity={activeCity}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* NEW: Doorstep Scrap Item Inspection, Customer OTP & Payment Modal */}
      <DoorstepVerificationModal
        isOpen={isDoorstepModalOpen}
        onClose={() => setIsDoorstepModalOpen(false)}
        order={doorstepOrder}
        onUpdateOrder={handleUpdateOrder}
        currentUser={currentUser}
      />

      {/* Real-Time Doorstep Pickup Dispatch Alert Modal for Field Agents */}
      <AgentDispatchAlertModal
        isOpen={Boolean(incomingDispatchOrder)}
        order={incomingDispatchOrder}
        onAccept={handleAcceptPickupByAgent}
        onDecline={handleDeclinePickupByAgent}
        agentUser={currentUser}
      />

      {/* Global Google Gemini Real-Time AI Recycling Chatbot */}
      <GeminiChatbot
        onOpenBooking={() => handleOpenBookingProtected()}
        onNavigate={navigateTo}
        currentUser={currentUser}
      />

      {/* Global Hyperlocal Cookie Consent Banner & Preferences Modal */}
      <CookieConsentModal />

      {/* Real-time Agent Dispatch / Acceptance Notification Toast */}
      {agentNotification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #0D5C3A 0%, #16A34A 100%)',
          color: '#FFFFFF',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.28)',
          maxWidth: '440px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem',
          border: '1px solid rgba(255, 255, 255, 0.25)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.22)',
            borderRadius: '50%',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Truck size={22} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '0.96rem', marginBottom: '3px' }}>
              {agentNotification.title}
            </div>
            <div style={{ fontSize: '0.835rem', opacity: 0.95, lineHeight: 1.4 }}>
              {agentNotification.message}
            </div>
          </div>
          <button
            onClick={() => setAgentNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              opacity: 0.8,
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

