import React, { useState, useEffect } from 'react';
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

// Initial data & utilities
import { INITIAL_ORDERS } from './data/mockOrders';
import { SCRAP_ITEMS } from './data/scrapRates';
import { INITIAL_MARKETPLACE_ITEMS } from './data/marketplaceItems';
import { KABADWALA_PARTNERS } from './data/kabadwalas';
import { getUserCoordinates, reverseGeocodeMapbox } from './utils/geolocation';
import { getMapboxToken } from './utils/mapboxConfig';
import { getCurrentUser, saveAuthUser, logoutUser } from './utils/auth';
import { 
  apiFetchOrders, 
  apiCreateOrder, 
  apiUpdateOrder, 
  apiFetchRates, 
  apiUpdateRate, 
  checkDatabaseHealth,
  apiCreateOrUpdateUser,
  apiFetchMarketplaceItems,
  apiCreateMarketplaceItem,
  apiUpdateMarketplaceItem,
  apiDeleteMarketplaceItem,
  apiFetchPartners
} from './services/api';
import { initSmoothScroll, destroySmoothScroll, getLenis } from './utils/smoothScroll';

export default function App() {
  const [currentRoute, navigateTo] = useHashRoute();
  const [activeCity, setActiveCity] = useState('Delhi NCR (Indirapuram / Noida)');
  const [userLocation, setUserLocation] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Database Connection Health State (MongoDB Atlas / Vercel Serverless)
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    status: 'checking',
    message: 'Checking MongoDB Atlas connection...'
  });

  // Authentication state
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // Centralized Orders State (initialized from localStorage or INITIAL_ORDERS)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('kabadconnect_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_ORDERS;
  });

  // Centralized Scrap Rates State (allows Admin live editing)
  const [scrapItems, setScrapItems] = useState(SCRAP_ITEMS);

  // Centralized Marketplace State (Almirahs, Tables, AC, Sofa, Bed, Mattress, Cycles, etc.)
  const [marketplaceItems, setMarketplaceItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kabadconnect_marketplace');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_MARKETPLACE_ITEMS;
  });

  // Centralized Partners State (backed by MongoDB /api/partners)
  const [partners, setPartners] = useState(() => {
    try {
      const saved = localStorage.getItem('kabadconnect_partners');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
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

  // Dynamic booking state & pickup list
  const [selectedScrapItems, setSelectedScrapItems] = useState([]);
  const [calculatedScrapData, setCalculatedScrapData] = useState(null);
  const [activeOrder, setActiveOrder] = useState(orders[0] || INITIAL_ORDERS[0]);

  // Shopping cart for recycled products (empty by default)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kabadconnect_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kabadconnect_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kabadconnect_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  // Sync marketplace items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kabadconnect_marketplace', JSON.stringify(marketplaceItems));
    } catch (e) {}
  }, [marketplaceItems]);

  // Sync partners to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kabadconnect_partners', JSON.stringify(partners));
    } catch (e) {}
  }, [partners]);

  // Initial load: Verify MongoDB connection & load live records from database
  useEffect(() => {
    // 1. Health check
    checkDatabaseHealth().then((health) => {
      setDbStatus(health);
    }).catch(() => {});

    // 2. Fetch live orders from MongoDB
    apiFetchOrders().then((res) => {
      if (res && res.success && Array.isArray(res.orders) && res.orders.length > 0) {
        setOrders(res.orders);
      }
    }).catch(() => {});

    // 3. Fetch live rates from MongoDB
    apiFetchRates().then((res) => {
      if (res && res.success && Array.isArray(res.rates) && res.rates.length > 0) {
        setScrapItems(res.rates);
      }
    }).catch(() => {});

    // 4. Fetch live marketplace items from MongoDB Atlas
    apiFetchMarketplaceItems().then((res) => {
      if (res && res.success && Array.isArray(res.items) && res.items.length > 0) {
        setMarketplaceItems(res.items);
      }
    }).catch(() => {});

    // 5. Fetch live verified partners from MongoDB Atlas
    apiFetchPartners().then((res) => {
      if (res && res.success && Array.isArray(res.partners) && res.partners.length > 0) {
        setPartners(res.partners);
      }
    }).catch(() => {});
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
      isCartOpen || isPickupListOpen || isAuthModalOpen || isMyPickupsOpen || isAdminPanelOpen || isSellModalOpen;
    
    const lenis = getLenis();
    if (lenis) {
      if (isAnyModalOpen) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }
  }, [isBookingOpen, isTrackerOpen, isPartnerModalOpen, isCartOpen, isPickupListOpen, isAuthModalOpen, isMyPickupsOpen, isAdminPanelOpen, isSellModalOpen]);

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

  const handleProceedToBookingFromPickupList = (pickupData) => {
    setCalculatedScrapData({
      estimatedRupees: pickupData.totalPayout,
      totalWeight: pickupData.totalWeight,
      items: pickupData.items
    });
    setIsBookingOpen(true);
  };

  // ----------------------------------------------------
  // Order Operations (Cancel, Update / Reschedule, Create, Reorder)
  // ----------------------------------------------------
  const handleBookingSuccess = (newOrder) => {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    setActiveOrder(newOrder);
    setSelectedScrapItems([]); // clear pickup list once scheduled
    setIsBookingOpen(false);
    setIsTrackerOpen(true);

    // Persist booking directly to MongoDB Atlas
    apiCreateOrder(newOrder).catch(() => {});
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
    }).catch(() => {});
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

    // Persist updates to MongoDB Atlas
    apiUpdateOrder(orderId, updatedFields).catch(() => {});
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
    apiUpdateOrder(orderId, { status: newStatus }).catch(() => {});
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
    apiUpdateOrder(orderId, { kabadwala: partner, status: 'assigned' }).catch(() => {});
  };

  const handleUpdateScrapRate = (itemId, newRate, newTrend) => {
    setScrapItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              rate: newRate,
              trendType: newTrend || it.trendType
            }
          : it
      )
    );

    // Persist live rate change to MongoDB Atlas
    apiUpdateRate({ id: itemId, rate: newRate, trendType: newTrend }).catch(() => {});
  };

  // ----------------------------------------------------
  // Authentication Handlers & MongoDB User Persistence
  // ----------------------------------------------------
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    saveAuthUser(user);
    // Persist new user or login session directly into MongoDB Atlas
    apiCreateOrUpdateUser(user).catch(() => {});
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    saveAuthUser(updatedUser);
    // Persist profile updates (address, city, state, pincode, upiId) into MongoDB Atlas
    apiCreateOrUpdateUser(updatedUser).catch(() => {});
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

  // Location detection
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const coords = await getUserCoordinates();
      const token = getMapboxToken();
      const geo = await reverseGeocodeMapbox(coords.longitude, coords.latitude, token);
      setUserLocation(geo);

      if (geo.city?.toLowerCase().includes('ahmedabad')) {
        setActiveCity('Ahmedabad (SG Highway / Prahlad Nagar)');
      } else if (geo.city?.toLowerCase().includes('delhi') || geo.state?.toLowerCase().includes('delhi')) {
        setActiveCity('Delhi NCR (Indirapuram / Noida)');
      } else if (geo.city?.toLowerCase().includes('bengaluru') || geo.city?.toLowerCase().includes('bangalore')) {
        setActiveCity('Bengaluru (Koramangala / HSR)');
      } else if (geo.city?.toLowerCase().includes('mumbai')) {
        setActiveCity('Mumbai (Bandra / Andheri)');
      } else if (geo.city?.toLowerCase().includes('gurugram') || geo.city?.toLowerCase().includes('gurgaon')) {
        setActiveCity('Gurugram (Cyber City / Sohna Rd)');
      } else if (geo.city) {
        setActiveCity(`${geo.city} (${geo.locality || 'Doorstep Area'})`);
      }

      return geo;
    } catch (err) {
      console.error('Location detection failed:', err);
      alert(err.message || 'Could not detect your current location. Please check browser permissions.');
      return null;
    } finally {
      setIsDetectingLocation(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header & Navigation */}
      <Navbar
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSellModal={() => setIsSellModalOpen(true)}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        activeCity={activeCity}
        setActiveCity={setActiveCity}
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
        ordersCount={orders.length}
        currentPage={currentRoute}
        onNavigate={navigateTo}
      />

      {/* Live Scrap Market Rate Marquee Ticker */}
      <LiveRateTicker />

      {/* Main Content (Multi-Page Routed) */}
      <main style={{ flex: 1 }}>
        {currentRoute === 'rates' && (
          <RatesPage
            onAddScrapItem={handleAddScrapItem}
            selectedItems={selectedScrapItems}
            onOpenBooking={() => setIsBookingOpen(true)}
            onOpenPickupList={() => setIsPickupListOpen(true)}
            scrapItems={scrapItems}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === 'calculator' && (
          <CalculatorPage
            onBookCalculatedScrap={(calcData) => {
              setCalculatedScrapData(calcData);
              setIsBookingOpen(true);
            }}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === 'kabadwalas' && (
          <KabadwalasPage
            onSelectPartnerForBooking={() => setIsBookingOpen(true)}
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
            onOpenSellModal={() => setIsSellModalOpen(true)}
            marketplaceItems={marketplaceItems}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            currentUser={currentUser}
            activeCity={activeCity}
          />
        )}

        {currentRoute === 'how-it-works' && (
          <HowItWorksPage
            onOpenBooking={() => setIsBookingOpen(true)}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            orders={orders}
            onCancelOrder={handleCancelOrder}
            onReorder={handleReorder}
            onUpdateOrder={handleUpdateOrder}
            onOpenBooking={() => setIsBookingOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
            onLogout={handleLogout}
            onNavigate={navigateTo}
            dbStatus={dbStatus}
          />
        )}

        {(currentRoute === 'home' || !['rates', 'calculator', 'kabadwalas', 'store', 'how-it-works', 'profile'].includes(currentRoute)) && (
          <HomePage
            onOpenBooking={() => setIsBookingOpen(true)}
            activeCity={activeCity}
            userLocation={userLocation}
            onDetectLocation={handleDetectLocation}
            isDetectingLocation={isDetectingLocation}
            onAddScrapItem={handleAddScrapItem}
            selectedScrapItems={selectedScrapItems}
            onOpenPickupList={() => setIsPickupListOpen(true)}
            scrapItems={scrapItems}
            onBookCalculatedScrap={(calcData) => {
              setCalculatedScrapData(calcData);
              setIsBookingOpen(true);
            }}
            onSelectPartnerForBooking={() => setIsBookingOpen(true)}
            onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
            onLocationDetected={(geo) => setUserLocation(geo)}
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
            onOpenCart={() => setIsCartOpen(true)}
            onNavigate={navigateTo}
            onOpenSellModal={() => setIsSellModalOpen(true)}
            marketplaceItems={marketplaceItems}
            partners={partners}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
        onNavigate={navigateTo}
      />

      {/* Modals & Drawers */}
      <BookingWizardModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialScrapData={calculatedScrapData}
        onBookingSuccess={handleBookingSuccess}
        activeCity={activeCity}
        userLocation={userLocation}
        onLocationDetected={(geo) => setUserLocation(geo)}
      />

      <LiveOrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        activeOrder={activeOrder}
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
        orders={orders}
        onCancelOrder={handleCancelOrder}
        onUpdateOrder={handleUpdateOrder}
        onTrackOrder={(order) => {
          setActiveOrder(order);
          setIsTrackerOpen(true);
        }}
        onOpenBooking={() => setIsBookingOpen(true)}
        onReorder={handleReorder}
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
        currentUser={currentUser}
        onReorder={handleReorder}
        dbStatus={dbStatus}
        onRefreshDbHealth={() => {
          checkDatabaseHealth().then(setDbStatus).catch(() => {});
        }}
        marketplaceItems={marketplaceItems}
        onDeleteProduct={handleDeleteProduct}
        partners={partners}
      />

      {/* NEW: Sell Product Modal (C2C Pre-Loved Goods Bazaar) */}
      <SellProductModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onSubmitProduct={handleCreateProduct}
        currentUser={currentUser}
        activeCity={activeCity}
      />
    </div>
  );
}
