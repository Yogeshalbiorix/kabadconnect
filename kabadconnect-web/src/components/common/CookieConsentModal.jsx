import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cookie, 
  Check, 
  X, 
  Settings2, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Sparkles,
  MapPin,
  BarChart3
} from 'lucide-react';

const COOKIE_CONSENT_KEY = 'kabadconnect_cookie_consent';

export const CookieConsentModal = ({ onOpenPrivacyPolicy = null }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true & locked
    geolocation: true,
    analytics: true
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!saved) {
        // Small delay for smooth entrance after initial page load
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {}

    // Listen for custom event to re-open cookie preferences from footer or settings
    const handleReopen = () => {
      setIsVisible(true);
      setShowDetails(true);
    };

    window.addEventListener('kabadconnect_open_cookie_settings', handleReopen);
    return () => window.removeEventListener('kabadconnect_open_cookie_settings', handleReopen);
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = {
      essential: true,
      geolocation: true,
      analytics: true,
      timestamp: new Date().toISOString(),
      choice: 'all'
    };
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(fullConsent));
    } catch (e) {}
    setIsVisible(false);
  };

  const handleAcceptEssentialOnly = () => {
    const essentialConsent = {
      essential: true,
      geolocation: false,
      analytics: false,
      timestamp: new Date().toISOString(),
      choice: 'essential_only'
    };
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(essentialConsent));
    } catch (e) {}
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    const customConsent = {
      essential: true,
      geolocation: preferences.geolocation,
      analytics: preferences.analytics,
      timestamp: new Date().toISOString(),
      choice: 'custom'
    };
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(customConsent));
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        right: '24px',
        maxWidth: showDetails ? '560px' : '490px',
        zIndex: 9999,
        background: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(16, 185, 129, 0.25)',
        border: '1.5px solid rgba(16, 185, 129, 0.2)',
        overflow: 'hidden',
        animation: 'slideUpBounce 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)'
      }}
    >
      {/* Decorative top accent bar */}
      <div 
        style={{ 
          height: '4px', 
          width: '100%', 
          background: 'linear-gradient(90deg, #0D5C3A 0%, #10B981 50%, #F59E0B 100%)' 
        }} 
      />

      <div style={{ padding: '1.35rem 1.5rem 1.25rem 1.5rem' }}>
        {/* Header: Icon + Badge + Close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
              }}
            >
              🍪
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                Cookie & Privacy Choices
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> Secure & Transparent Recycling
              </span>
            </div>
          </div>

          <button
            onClick={handleAcceptEssentialOnly}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
            title="Dismiss with essential cookies only"
          >
            <X size={18} />
          </button>
        </div>

        {/* Description Text */}
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
          We use cookies to secure your doorstep scrap pickup requests, remember your active city hub, and provide live nearby collector radar updates. You can manage your preferences below anytime.
        </p>

        {/* Detailed Preferences Accordion */}
        {showDetails && (
          <div 
            style={{
              background: '#F8FAFC',
              borderRadius: '16px',
              padding: '1rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            {/* 1. Essential Cookies */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <Lock size={16} color="#0D5C3A" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                    Strictly Essential Cookies
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.35, marginTop: '2px' }}>
                    Required for doorstep OTP security, login sessions, and recycling cart checkout.
                  </div>
                </div>
              </div>
              <span 
                style={{
                  background: '#E2E8F0',
                  color: '#475569',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  whiteSpace: 'nowrap'
                }}
              >
                Always Active
              </span>
            </div>

            {/* 2. Geolocation & Radar */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <MapPin size={16} color="#10B981" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                    Hyperlocal Radar & GPS
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.35, marginTop: '2px' }}>
                    Remembers your detected doorstep locality and displays verified kabadwalas within ~1.5 km.
                  </div>
                </div>
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={preferences.geolocation}
                  onChange={(e) => setPreferences({ ...preferences, geolocation: e.target.checked })}
                  style={{ accentColor: '#10B981', width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </label>
            </div>

            {/* 3. Analytics & Ecological Offset */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <BarChart3 size={16} color="#0284C7" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                    Eco Analytics & CO₂ Impact
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.35, marginTop: '2px' }}>
                    Helps us aggregate community recycling metrics, trees saved, and water conserved.
                  </div>
                </div>
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  style={{ accentColor: '#10B981', width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {showDetails ? (
            <button
              onClick={handleSaveCustom}
              style={{
                flex: '1 1 auto',
                minWidth: '130px',
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                border: 'none',
                background: '#0D5C3A',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(13, 92, 58, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <Check size={15} /> Save Choices
            </button>
          ) : (
            <button
              onClick={handleAcceptAll}
              style={{
                flex: '1 1 auto',
                minWidth: '130px',
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                border: 'none',
                background: '#0D5C3A',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(13, 92, 58, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <Check size={15} /> Accept All
            </button>
          )}

          <button
            onClick={handleAcceptEssentialOnly}
            style={{
              flex: '1 1 auto',
              minWidth: '120px',
              padding: '0.65rem 0.9rem',
              borderRadius: '12px',
              border: '1.5px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#475569',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            Essential Only
          </button>

          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              color: '#059669',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 0.2s ease'
            }}
          >
            <Settings2 size={14} />
            <span>{showDetails ? 'Simple View' : 'Customize'}</span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};
