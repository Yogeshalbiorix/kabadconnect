import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Scale, 
  Wallet, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Locate,
  Loader2
} from 'lucide-react';

export const HeroSection = ({ 
  onOpenBooking, 
  onOpenCalculator, 
  activeCity,
  userLocation = null,
  onDetectLocation = null,
  isDetectingLocation = false
}) => {
  const [pincode, setPincode] = useState('');
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [matchedCollectors, setMatchedCollectors] = useState(6);
  const [isGpsActive, setIsGpsActive] = useState(false);

  const isAhmedabad = activeCity?.toLowerCase().includes('ahmedabad') || userLocation?.city?.toLowerCase().includes('ahmedabad');

  const previewAgent = isAhmedabad ? {
    name: 'Jignesh Patel',
    businessName: 'Sabarmati Clean Recyclers',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    vehicle: 'Electric E-Rickshaw (GJ-01)',
    rating: 4.92,
    pickups: '1,680+'
  } : {
    name: 'Ramesh Kumar',
    businessName: 'GreenEarth Scrap',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=120&q=80',
    vehicle: 'E-Rickshaw (DL-5ER)',
    rating: 4.9,
    pickups: '1,420+'
  };

  // Auto-populate if userLocation exists
  useEffect(() => {
    if (userLocation) {
      const locText = [userLocation.locality, userLocation.city, userLocation.pincode]
        .filter(Boolean)
        .join(', ');
      setPincode(locText || userLocation.fullAddress || '');
      setPincodeChecked(true);
      setIsGpsActive(true);
      setMatchedCollectors(7);
    }
  }, [userLocation]);

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.trim().length >= 3) {
      setPincodeChecked(true);
      // Random dynamic number between 5 and 9
      setMatchedCollectors(Math.floor(Math.random() * 4) + 6);
    }
  };

  const handleUseCurrentLocationClick = async () => {
    if (onDetectLocation) {
      const geo = await onDetectLocation();
      if (geo) {
        setIsGpsActive(true);
        const locText = [geo.locality, geo.city, geo.pincode].filter(Boolean).join(', ');
        setPincode(locText || geo.fullAddress);
        setPincodeChecked(true);
        setMatchedCollectors(8);
      }
    }
  };

  return (
    <section style={{
      position: 'relative',
      padding: '4.5rem 0 3.5rem 0',
      background: 'linear-gradient(180deg, rgba(236, 253, 245, 0.5) 0%, rgba(248, 250, 252, 1) 100%)',
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Orbs */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-50px',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-50px',
        left: '-50px',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero-grid">
          {/* Left Column: Hero Copy & Pincode Checker */}
          <div>
            {/* Top Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.75rem',
              background: '#FFFFFF',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-xs)',
              marginBottom: '1.25rem',
              maxWidth: '100%',
              flexWrap: 'wrap'
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--color-accent-mint)',
                boxShadow: '0 0 8px var(--color-accent-mint)',
                flexShrink: 0
              }} />
              <span style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', fontWeight: 700, color: 'var(--color-primary)' }}>
                Hyperlocal Doorstep Scrap Marketplace
              </span>
              <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', flexShrink: 0 }}>
                60-Min
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              marginBottom: '1.25rem',
              fontSize: 'clamp(1.65rem, 4.2vw, 3.25rem)',
              lineHeight: 1.2,
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              Turn Your Scrap into <span className="text-gradient">Instant Cash</span>. Doorstep Pickup in Minutes.
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2rem',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              Connect with certified local kabadwalas across <strong>{activeCity}</strong>. 
              Enjoy 100% accurate digital weighing, guaranteed transparent rates, and instant UPI payment.
            </p>

            {/* Hyperlocal Pincode Checker Widget */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(0.85rem, 2.5vw, 1.25rem)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '1.75rem',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              <form onSubmit={handleCheckPincode} className="hero-pincode-form" style={{
                display: 'flex',
                gap: '0.65rem',
                flexWrap: 'wrap',
                width: '100%'
              }}>
                <div style={{
                  flex: '1 1 200px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--color-bg)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.65rem',
                  minWidth: 0,
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}>
                  <MapPin size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder={isAhmedabad ? "Pincode or Locality (e.g. 380015 or Prahlad Nagar)" : "Pincode or Locality (e.g. 201014 or Indirapuram)"}
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value);
                      setPincodeChecked(false);
                      setIsGpsActive(false);
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      flex: '1 1 0',
                      width: '100%',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      outline: 'none',
                      minWidth: 0
                    }}
                  />

                  {/* 1-Click GPS Locate Button */}
                  <button
                    type="button"
                    onClick={handleUseCurrentLocationClick}
                    disabled={isDetectingLocation}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      background: isGpsActive ? 'var(--color-accent-mint-soft)' : '#FFFFFF',
                      border: `1px solid ${isGpsActive ? 'var(--color-accent-mint)' : 'var(--color-border)'}`,
                      color: isGpsActive ? 'var(--color-text-mint)' : 'var(--color-primary)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: isDetectingLocation ? 'wait' : 'pointer',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      boxShadow: 'var(--shadow-xs)',
                      transition: 'all 0.2s ease'
                    }}
                    title="Detect your exact doorstep location using GPS"
                  >
                    {isDetectingLocation ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Locate size={13} color="var(--color-accent-mint)" />
                    )}
                    <span>{isDetectingLocation ? 'Locating...' : isGpsActive ? 'GPS Active' : 'Use GPS'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary hero-check-btn"
                  style={{ padding: '0.65rem 1.35rem', whiteSpace: 'nowrap' }}
                >
                  <Zap size={16} />
                  <span>Check Availability</span>
                </button>
              </form>

              {pincodeChecked && (
                <div style={{
                  marginTop: '0.85rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--color-accent-mint-soft)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <CheckCircle2 size={18} color="var(--color-accent-mint)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-mint)', fontWeight: 600 }}>
                    {isGpsActive ? '🎯 Live GPS Verified: ' : '⚡ Great news! '}
                    <strong>{matchedCollectors} verified scrap dealers</strong> are active around "<strong>{pincode}</strong>". Next doorstep pickup available in <strong>35-45 mins</strong>!
                  </span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={onOpenBooking}
                className="btn btn-primary btn-lg"
                style={{ flex: '1 1 auto', minWidth: '180px' }}
              >
                <Calendar size={18} />
                <span>Schedule Doorstep Pickup</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={onOpenCalculator}
                className="btn btn-secondary btn-lg"
                style={{ flex: '1 1 auto', minWidth: '170px' }}
              >
                <Sparkles size={18} color="var(--color-accent-gold)" />
                <span>Calculate Scrap Value</span>
              </button>
            </div>

            {/* Value Badges */}
            <div style={{
              display: 'flex',
              gap: 'clamp(0.6rem, 1.8vw, 1.5rem)',
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--color-border)',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Scale size={18} color="var(--color-accent-mint)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Digital Scale Guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Wallet size={18} color="var(--color-accent-gold)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Instant UPI / Cash</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ShieldCheck size={18} color="var(--color-primary)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>KYC Verified Kabadwalas</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Visual Hero Card */}
          <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
            <div className="hero-radar-card" style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(1.15rem, 2.8vw, 2rem)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)',
              position: 'relative',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {/* Card Header */}
              <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    HYPERLOCAL LIVE RADAR
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                    Nearest Pickup Agent
                  </div>
                </div>
                <span className="badge badge-success">
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                  Live & Online
                </span>
              </div>

              {/* Mock Agent Profile snippet */}
              <div style={{
                display: 'flex',
                gap: 'clamp(0.6rem, 2vw, 1rem)',
                alignItems: 'center',
                padding: '0.85rem clamp(0.65rem, 2vw, 1rem)',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginBottom: '1.5rem'
              }}>
                <img
                  src={previewAgent.photo}
                  alt={previewAgent.name}
                  style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {previewAgent.name}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {previewAgent.businessName} • {previewAgent.vehicle}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.85rem' }}>★ {previewAgent.rating}</span>
                    <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>({previewAgent.pickups} Pickups)</span>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Digital Scale</span>
                  </div>
                </div>
              </div>

              {/* Live Pickup Snapshot list */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                  gap: '0.5rem'
                }}>
                  <span style={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>Newspaper (Akhbaar) 18 kg</span>
                  <strong style={{ color: 'var(--color-primary)', flexShrink: 0 }}>₹252.00</strong>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                  gap: '0.5rem'
                }}>
                  <span style={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>Iron & Steel Scrap 12 kg</span>
                  <strong style={{ color: 'var(--color-primary)', flexShrink: 0 }}>₹384.00</strong>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                  gap: '0.5rem'
                }}>
                  <span style={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>Corrugated Cardboard 10 kg</span>
                  <strong style={{ color: 'var(--color-primary)', flexShrink: 0 }}>₹100.00</strong>
                </div>
              </div>

              {/* Total Summary Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                background: 'var(--color-accent-mint-soft)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-mint)', fontWeight: 600 }}>
                    ESTIMATED PAYOUT
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    ₹736.00
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-mint)', fontWeight: 600 }}>
                    CARBON AVOIDED
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent-mint)' }}>
                    62.8 kg CO₂ ♻️
                  </div>
                </div>
              </div>

              {/* Direct Quick Action */}
              <button
                onClick={onOpenBooking}
                className="btn btn-accent btn-full"
                style={{ padding: '0.85rem' }}
              >
                <span>Request Instant Pickup Now</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Floating Trust Pill Badge */}
            <div className="hero-trust-pill" style={{
              position: 'absolute',
              bottom: '-18px',
              right: '25px',
              background: '#FFFFFF',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--color-primary)'
            }}>
              <CheckCircle2 size={16} color="var(--color-accent-mint)" />
              <span>₹42 Lakhs+ Earned by Households</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 3.5rem;
          align-items: center;
          width: 100%;
          min-width: 0;
        }
        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 2.25rem;
          }
        }
        @media (max-width: 860px) {
          .hero-radar-card {
            padding: 1.15rem !important;
          }
          .hero-trust-pill {
            position: static !important;
            margin: 1rem auto 0 !important;
            width: fit-content !important;
            max-width: 100% !important;
            justify-content: center !important;
            box-shadow: var(--shadow-sm) !important;
          }
        }
        @media (max-width: 540px) {
          .hero-pincode-form > div {
            flex: 1 1 100% !important;
          }
          .hero-check-btn {
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
};
