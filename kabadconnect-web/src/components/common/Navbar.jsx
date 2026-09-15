import React, { useState, useRef, useEffect } from 'react';
import { 
  Recycle, 
  MapPin, 
  Calendar, 
  Search, 
  ShoppingBag, 
  ShoppingCart,
  Plus,
  Truck, 
  UserPlus, 
  Menu, 
  X,
  ShieldCheck,
  ChevronDown,
  Locate,
  Loader2,
  User,
  LogOut,
  Package,
  KeyRound,
  ChevronRight
} from 'lucide-react';

export const Navbar = ({ 
  onOpenBooking, 
  onOpenTracker, 
  onOpenPartnerModal, 
  onOpenCart, 
  cartCount = 0,
  activeCity,
  setActiveCity,
  userLocation = null,
  onDetectLocation = null,
  isDetectingLocation = false,
  currentUser = null,
  onUpdateUser = null,
  onOpenAuth = null,
  onLogout = null,
  onOpenMyPickups = null,
  onOpenAdminPanel = null,
  onOpenPickupList = null,
  pickupCount = 0,
  ordersCount = 0,
  currentPage = 'home',
  onNavigate = () => {},
  onOpenSellModal = null
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cityDropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns when clicking outside on the body
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setCityDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (cityDropdownOpen || userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [cityDropdownOpen, userMenuOpen]);

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCityDropdownOpen(false);
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const CITIES = [
    { code: 'DEL', name: 'Delhi NCR', zone: 'Indirapuram / Noida', fullName: 'Delhi NCR (Indirapuram / Noida)' },
    { code: 'DEL', name: 'South & Central Delhi', zone: 'South & Central', fullName: 'Delhi (South & Central)' },
    { code: 'AMD', name: 'Ahmedabad', zone: 'SG Highway / Prahlad Nagar', fullName: 'Ahmedabad (SG Highway / Prahlad Nagar)' },
    { code: 'GGN', name: 'Gurugram', zone: 'Cyber City / Sohna Rd', fullName: 'Gurugram (Cyber City / Sohna Rd)' },
    { code: 'GZB', name: 'Ghaziabad', zone: 'Indirapuram / Vaishali', fullName: 'Ghaziabad & Vaishali' },
    { code: 'BLR', name: 'Bengaluru', zone: 'Koramangala / HSR', fullName: 'Bengaluru (Koramangala / HSR)' },
    { code: 'BOM', name: 'Mumbai', zone: 'Bandra / Andheri', fullName: 'Mumbai (Bandra / Andheri)' }
  ];

  const getCityShortCode = (cityName) => {
    if (!cityName) return 'DEL';
    const lower = cityName.toLowerCase();
    if (lower.includes('ahmedabad')) return 'AMD';
    if (lower.includes('gurugram') || lower.includes('gurgaon')) return 'GGN';
    if (lower.includes('ghaziabad')) return 'GZB';
    if (lower.includes('bengaluru') || lower.includes('bangalore')) return 'BLR';
    if (lower.includes('mumbai') || lower.includes('bombay')) return 'BOM';
    if (lower.includes('delhi') || lower.includes('noida') || lower.includes('ncr')) return 'DEL';
    if (lower.includes('pune')) return 'PNQ';
    if (lower.includes('hyderabad')) return 'HYD';
    if (lower.includes('kolkata')) return 'CCU';
    if (lower.includes('chennai')) return 'MAA';
    if (lower.includes('jaipur')) return 'JAI';
    return cityName.trim().slice(0, 3).toUpperCase();
  };

  const activeShortCode = getCityShortCode(userLocation?.city || userLocation?.locality || activeCity);

  return (
    <>
      {/* Top Notification Announcement Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #072e1c 0%, #0D5C3A 50%, #072e1c 100%)',
        color: '#FFFFFF',
        padding: '0.4rem clamp(0.75rem, 2vw, 2rem)',
        fontSize: '0.825rem',
        borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
        width: '100%',
        maxWidth: '100vw',
        position: 'relative',
        zIndex: 950
      }}>
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'rgba(16, 185, 129, 0.25)',
              color: '#34D399',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.725rem',
              fontWeight: 700,
              flexShrink: 0
            }}>
              ⚡ LIVE HYPERLOCAL
            </span>
            <span style={{ fontSize: 'clamp(0.72rem, 2.4vw, 0.825rem)' }}>
              Verified pickups active in <strong style={{ color: '#34D399', letterSpacing: '0.04em' }}>{activeShortCode}</strong> • 100% Digital Scales
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'nowrap' }}>
            {/* City Locality Dropdown Selector moved to Topbar */}
            <div ref={cityDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setCityDropdownOpen(prev => !prev);
                  setUserMenuOpen(false);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.22rem 0.65rem',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(52, 211, 153, 0.45)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
                title={`Active Region: ${activeCity}`}
                aria-label={`City Short Code: ${activeShortCode}`}
              >
                <MapPin size={13} color="#34D399" />
                <span style={{ letterSpacing: '0.04em', color: '#34D399' }}>
                  {activeShortCode}
                </span>
                <ChevronDown size={12} color="#E2E8F0" />
              </button>

              {cityDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '125%',
                  right: 0,
                  width: '290px',
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  border: '1px solid var(--color-border)',
                  padding: '0.65rem',
                  zIndex: 1100,
                  animation: 'scaleUp 0.15s ease',
                  color: 'var(--color-text-primary)'
                }}>
                  {/* Auto-Detect Location Button */}
                  <button
                    onClick={async () => {
                      if (onDetectLocation) {
                        await onDetectLocation({ silent: false });
                      }
                      setCityDropdownOpen(false);
                    }}
                    disabled={isDetectingLocation}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #0D5C3A 0%, #10B981 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.65rem',
                      boxShadow: 'var(--shadow-xs)',
                      cursor: isDetectingLocation ? 'wait' : 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isDetectingLocation ? <Loader2 size={15} className="animate-spin" /> : <Locate size={15} />}
                      <span>{isDetectingLocation ? 'Detecting GPS...' : 'Use Current Location'}</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: '4px' }}>
                      LIVE GPS
                    </span>
                  </button>

                  <div style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    padding: '0.25rem 0.5rem',
                    textTransform: 'uppercase'
                  }}>
                    Select City Hub
                  </div>
                  {CITIES.map((city) => {
                    const isSelected = activeCity === city.fullName;
                    return (
                      <button
                        key={city.fullName}
                        onClick={() => {
                          setActiveCity(city.fullName);
                          setCityDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.5rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.825rem',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                          fontWeight: isSelected ? 700 : 500,
                          background: isSelected ? 'var(--color-accent-mint-soft)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: 'none',
                          cursor: 'pointer',
                          margin: '2px 0',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: isSelected ? 'var(--color-primary)' : '#E2E8F0',
                            color: isSelected ? '#FFFFFF' : '#334155',
                            letterSpacing: '0.04em'
                          }}>
                            {city.code}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{city.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{city.zone}</div>
                          </div>
                        </div>
                        {isSelected && <span style={{ color: 'var(--color-accent-mint)', fontWeight: 800 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <span style={{ opacity: 0.4 }} className="hide-on-mobile">|</span>

            {/* My Pickups Shortcut */}
            <button 
              onClick={onOpenMyPickups}
              className="hide-on-mobile"
              style={{ 
                color: '#34D399', 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none'
              }}
            >
              <Truck size={14} /> My Pickups ({ordersCount})
            </button>

            {/* Pickup List Shortcut */}
            {pickupCount > 0 && (
              <>
                <span style={{ opacity: 0.4 }}>|</span>
                <button 
                  onClick={onOpenPickupList}
                  style={{ 
                    color: '#F59E0B', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: 'transparent',
                    border: 'none'
                  }}
                >
                  <Package size={14} /> Pickup List ({pickupCount})
                </button>
              </>
            )}

            {/* Admin shortcut if admin */}
            {currentUser?.role === 'admin' && (
              <>
                <span style={{ opacity: 0.4 }}>|</span>
                <button 
                  onClick={onOpenAdminPanel}
                  style={{ 
                    color: '#FBBF24', 
                    fontWeight: 800, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: 'transparent',
                    border: 'none'
                  }}
                >
                  <ShieldCheck size={14} /> Admin Portal
                </button>
              </>
            )}

            <span style={{ opacity: 0.4 }}>|</span>
            <button 
              onClick={onOpenPartnerModal}
              style={{ 
                color: '#E2E8F0', 
                fontWeight: 500, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none'
              }}
            >
              <UserPlus size={14} /> Partner Onboarding
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
        transition: 'box-shadow var(--transition-fast)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '100vw',
          padding: '0 clamp(0.75rem, 1.2vw, 1.5rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--header-height)',
          gap: 'clamp(0.35rem, 0.8vw, 1rem)',
          flexWrap: 'nowrap',
          overflowX: 'clip'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.35rem, 1vw, 1.25rem)', flexShrink: 0 }}>
            <a 
              href="#/" 
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('home');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.35rem, 0.8vw, 0.65rem)', textDecoration: 'none' }}
            >
              <div style={{
                width: 'clamp(34px, 4vw, 42px)',
                height: 'clamp(34px, 4vw, 42px)',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0D5C3A 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                flexShrink: 0
              }}>
                <Recycle size={20} />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)',
                  lineHeight: 1.1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ color: 'var(--color-primary)' }}>Kabad</span>
                  <span style={{ color: 'var(--color-accent-mint)' }}>Connect</span>
                </div>
                <div className="hide-on-small" style={{
                  fontSize: '0.68rem',
                  color: 'var(--color-accent-mint)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap'
                }}>
                  Save Environment ♻️
                </div>
              </div>
            </a>

          </div>

          {/* Desktop Navigation Links (Multi-Page Routed) */}
          <nav style={{ display: 'none', alignItems: 'center' }} className="desktop-nav">
            {[
              { id: 'rates', label: 'Live Rates' },
              { id: 'calculator', label: 'Scrap Calculator' },
              { id: 'kabadwalas', label: 'Find Kabadwalas' },
              { id: 'store', label: 'Pre-Loved Bazaar', badge: 'Sell & Buy' },
              { id: 'how-it-works', label: 'How It Works', isSecondary: true },
              { id: 'profile', label: 'Profiles', isSecondary: true }
            ].map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate && onNavigate(item.id)}
                  className={`nav-link-btn ${item.isSecondary ? 'nav-link-secondary' : ''}`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: 'clamp(0.8rem, 0.84vw, 0.9rem)',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    cursor: 'pointer',
                    padding: '0.4rem 0',
                    borderBottom: isActive ? '2.5px solid var(--color-accent-mint)' : '2.5px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="badge badge-warning nav-badge-sellbuy" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.35rem, 0.9vw, 0.75rem)' }}>
            {/* Pickup List Button */}
            <button
              onClick={onOpenPickupList}
              style={{
                position: 'relative',
                width: 'clamp(36px, 4vw, 42px)',
                height: 'clamp(36px, 4vw, 42px)',
                borderRadius: '50%',
                background: pickupCount > 0 ? 'var(--color-accent-mint-soft)' : 'var(--color-bg)',
                border: `1.5px solid ${pickupCount > 0 ? 'var(--color-accent-mint)' : 'var(--color-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: pickupCount > 0 ? 'var(--color-primary)' : 'var(--color-text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              aria-label="Pickup List"
              title="View items added to scrap pickup list"
            >
              <Package size={18} />
              {pickupCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--color-accent-mint)',
                  color: '#FFFFFF',
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                  {pickupCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              style={{
                position: 'relative',
                width: 'clamp(36px, 4vw, 42px)',
                height: 'clamp(36px, 4vw, 42px)',
                borderRadius: '50%',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                flexShrink: 0
              }}
              aria-label="Shopping Cart"
              title="Recycled products shopping bag"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--color-accent-gold)',
                  color: '#FFFFFF',
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Portal Fast Trigger (if Admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAdminPanel}
                className="nav-btn-admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  color: '#FFFFFF',
                  border: '1.5px solid #F59E0B',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
                  cursor: 'pointer'
                }}
                title="Open Super Admin Control Room"
              >
                <ShieldCheck size={16} color="#F59E0B" />
                <span>Admin Portal</span>
              </button>
            )}

            {/* User Auth Login Button (Icon Only) */}
            {!currentUser ? (
              <button
                onClick={onOpenAuth}
                className="btn btn-outline nav-btn-signin"
                style={{ 
                  width: 'clamp(36px, 4vw, 42px)', 
                  height: 'clamp(36px, 4vw, 42px)', 
                  borderRadius: '50%',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0 
                }}
                aria-label="Sign In"
                title="Sign In to Your Account"
              >
                <User size={18} />
              </button>
            ) : (
              <div ref={userMenuRef} className="nav-user-dropdown" style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setUserMenuOpen(prev => !prev);
                    setCityDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    padding: '0.35rem 0.75rem 0.35rem 0.4rem',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser.name}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} color="var(--color-text-muted)" />
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    width: '240px',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--color-border)',
                    padding: '0.65rem',
                    zIndex: 999,
                    animation: 'scaleUp 0.15s ease'
                  }}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>{currentUser.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{currentUser.email || currentUser.phone}</div>
                      <span className={`badge ${
                        currentUser.role === 'admin' ? 'badge-warning' : 
                        currentUser.role === 'agent' ? 'badge-primary' : 
                        currentUser.role === 'partner' ? 'badge-warning' : 'badge-primary'
                      }`} style={{ marginTop: '4px', fontSize: '0.65rem' }}>
                        {currentUser.role === 'admin' ? 'Super Admin' : 
                         currentUser.role === 'agent' ? 'Field Pickup Agent' : 
                         currentUser.role === 'partner' ? 'Recycling Partner' : 'Verified Customer'}
                      </span>
                    </div>

                    {/* My Profile Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('profile');
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.55rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: 'rgba(13, 92, 58, 0.08)',
                        fontSize: '0.85rem',
                        color: 'var(--color-primary)',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        marginBottom: '6px'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <User size={15} color="var(--color-primary)" />
                        <span>My Profile</span>
                      </span>
                      <ChevronRight size={14} />
                    </button>

                    {/* Secure Switch Account / Role Item */}
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onOpenAuth) onOpenAuth();
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.55rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        background: '#F8FAFC',
                        fontSize: '0.825rem',
                        color: '#334155',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        marginBottom: '6px'
                      }}
                      title="Securely sign in as another role (Agent, Partner, Admin)"
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <KeyRound size={15} color="var(--color-primary)" />
                        <span>Switch Account / Role</span>
                      </span>
                      <ChevronRight size={13} color="#94A3B8" />
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenMyPickups();
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '0.85rem',
                        color: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Truck size={15} color="var(--color-accent-mint)" />
                        <span>My Pickups</span>
                      </span>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{ordersCount}</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenAdminPanel();
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.5rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          background: '#F1F5F9',
                          fontSize: '0.85rem',
                          color: '#0F172A',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          cursor: 'pointer',
                          margin: '4px 0'
                        }}
                      >
                        <ShieldCheck size={15} color="#F59E0B" />
                        <span>Admin Control Room</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenPickupList();
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '0.85rem',
                        color: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Package size={15} color="var(--color-primary)" />
                        <span>Pickup Scrap List</span>
                      </span>
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{pickupCount}</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onOpenSellModal) onOpenSellModal();
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.55rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #FCD34D',
                        background: '#FEF3C7',
                        fontSize: '0.825rem',
                        color: '#92400E',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        margin: '4px 0'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span>🏷️</span>
                        <span>+ Sell Old Goods (Free Ad)</span>
                      </span>
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>New</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onNavigate('store');
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '0.825rem',
                        color: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        cursor: 'pointer'
                      }}
                    >
                      <span>📦</span>
                      <span>My Listed Products</span>
                    </button>

                    <hr style={{ borderColor: 'var(--color-border)', margin: '0.4rem 0' }} />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: '#FEF2F2',
                        color: '#DC2626',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sell Good Product Button (+ Icon and Sell Text) */}
            <button
              onClick={onOpenSellModal}
              className="nav-btn-sell btn animate-pulse-glow"
              style={{
                background: '#F59E0B',
                color: '#0F172A',
                border: 'none',
                padding: '0.48rem 0.85rem',
                fontSize: '0.84rem',
                fontWeight: 800,
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              title="Sell Usable Goods (Almirahs, ACs, Sofas, Beds, Cycles & more)"
              aria-label="Sell Goods"
            >
              <Plus size={15} strokeWidth={2.8} />
              <span>Sell</span>
            </button>

            {/* Schedule Pickup CTA (Cart Icon and Book Text) */}
            <button
              onClick={onOpenBooking}
              className="nav-btn-book btn btn-primary"
              style={{ 
                padding: '0.48rem 0.95rem', 
                fontSize: '0.84rem', 
                fontWeight: 700,
                whiteSpace: 'nowrap', 
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Schedule Doorstep Scrap Pickup"
              aria-label="Book Doorstep Pickup"
            >
              <ShoppingCart size={15} />
              <span>Book</span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              style={{
                display: 'none',
                width: 'clamp(36px, 4vw, 40px)',
                height: 'clamp(36px, 4vw, 40px)',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-primary)',
                flexShrink: 0
              }}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div style={{
            background: '#FFFFFF',
            borderTop: '1px solid var(--color-border)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: 'calc(90dvh - 76px)',
            overflowY: 'auto'
          }}>
            {/* Primary Mobile Action: Book Pickup */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="btn btn-primary btn-full"
              style={{ padding: '0.85rem', fontSize: '1rem', fontWeight: 800 }}
            >
              <Calendar size={18} /> Book Doorstep Pickup
            </button>

            {/* Sell Old Goods Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenSellModal) onOpenSellModal();
              }}
              className="btn btn-full"
              style={{
                background: '#F59E0B',
                color: '#0F172A',
                fontWeight: 800,
                border: 'none',
                padding: '0.8rem',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
              }}
            >
              🏷️ + Sell Old Goods (Post Free Ad)
            </button>

            <hr style={{ borderColor: 'var(--color-border)', margin: '0.25rem 0' }} />

            {[
              { id: 'rates', label: '📊 Live Scrap Rate Card' },
              { id: 'calculator', label: '🧮 Value & Carbon Calculator' },
              { id: 'kabadwalas', label: '📍 Nearby Verified Kabadwalas' },
              { id: 'store', label: '🛋️ Pre-Loved Bazaar & Store' },
              { id: 'how-it-works', label: '❓ How It Works' },
              { id: 'profile', label: '👤 My Profile & Account' }
            ].map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigate) onNavigate(link.id);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: isActive ? 'var(--color-accent-mint-soft)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : '#0F172A',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.95rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {link.label}
                </button>
              );
            })}

            <hr style={{ borderColor: 'var(--color-border)', margin: '0.25rem 0' }} />

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTracker();
              }}
              className="btn btn-secondary btn-full"
            >
              <Truck size={16} /> Track My Pickup Order
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPartnerModal();
              }}
              className="btn btn-outline btn-full"
            >
              <UserPlus size={16} /> Join as Kabadwala Partner
            </button>

            {/* Mobile Auth / Profile Info */}
            {!currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuth) onOpenAuth();
                }}
                className="btn btn-secondary btn-full"
                style={{ marginTop: '0.25rem' }}
              >
                <User size={16} /> Sign In / Register
              </button>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: '#F8FAFC',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginTop: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser.name}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '0.725rem', color: '#64748B' }}>
                      {currentUser.role === 'admin' ? 'Super Admin' : 'Verified Member'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  style={{
                    color: '#DC2626',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem'
                  }}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Embedded CSS for responsive navbar */}
      <style>{`
        /* 1. Large Desktops (1400px and above) */
        @media (min-width: 1400px) {
          .desktop-nav {
            display: flex !important;
            gap: 1.15rem;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .nav-btn-sell {
            display: inline-flex !important;
          }
          .nav-btn-book {
            display: inline-flex !important;
          }
          .nav-btn-admin {
            display: inline-flex !important;
          }
          .nav-btn-signin {
            display: inline-flex !important;
          }
          .nav-user-dropdown {
            display: block !important;
          }
        }

        /* 2. Standard Laptops (1120px to 1399px) - Clean, spacious layout */
        @media (max-width: 1399px) and (min-width: 1120px) {
          .desktop-nav {
            display: flex !important;
            gap: clamp(0.5rem, 0.9vw, 1rem) !important;
          }
          .nav-badge-sellbuy {
            display: none !important; /* Hides Sell & Buy badge to save space */
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .nav-btn-sell {
            display: inline-flex !important;
            padding: 0.45rem 0.8rem !important;
            font-size: 0.82rem !important;
          }
          .nav-btn-book {
            display: inline-flex !important;
            padding: 0.45rem 0.85rem !important;
            font-size: 0.82rem !important;
          }
          .nav-btn-admin {
            display: none !important;
          }
          .nav-btn-signin {
            display: inline-flex !important;
          }
          .nav-user-dropdown {
            display: block !important;
          }
        }

        /* 3. Small Laptops & Tablets (860px to 1119px) - Clean Hamburger layout */
        @media (max-width: 1119px) and (min-width: 860px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .nav-btn-sell {
            display: inline-flex !important;
            padding: 0.42rem 0.75rem !important;
            font-size: 0.8rem !important;
          }
          .nav-btn-admin {
            display: none !important;
          }
          .nav-btn-book {
            display: inline-flex !important;
            padding: 0.45rem 0.8rem !important;
            font-size: 0.82rem !important;
          }
          .nav-btn-signin {
            display: inline-flex !important;
          }
          .nav-user-dropdown {
            display: block !important;
          }
        }

        /* 4. Mobile Screens (under 860px) */
        @media (max-width: 859px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .nav-btn-sell {
            display: none !important;
          }
          .nav-btn-book {
            display: none !important;
          }
          .nav-btn-admin {
            display: none !important;
          }
          .nav-btn-signin {
            display: none !important;
          }
          .nav-user-dropdown {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
