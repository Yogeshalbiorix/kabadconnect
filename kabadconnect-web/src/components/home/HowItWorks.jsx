import React from 'react';
import {
  Calendar,
  Scale,
  Wallet,
  ShieldCheck,
  ArrowRight,
  Check,
  X as XIcon,
  Sparkles
} from 'lucide-react';

export const HowItWorks = ({ onOpenBooking }) => {
  const [mobileView, setMobileView] = React.useState('cards');

  const steps = [
    {
      num: '01',
      icon: <Calendar size={28} color="var(--color-primary)" />,
      title: 'Schedule Free Doorstep Pickup',
      desc: 'Select scrap categories and choose a preferred time slot (Today express or weekend). Zero doorstep charges.'
    },
    {
      num: '02',
      icon: <Scale size={28} color="var(--color-accent-mint)" />,
      title: '100% Transparent Digital Weighing',
      desc: 'A background-checked local kabadwala arrives at your doorstep with certified digital scales. No manual tampering.'
    },
    {
      num: '03',
      icon: <Wallet size={28} color="var(--color-accent-gold-dark)" />,
      title: 'Instant Cash / UPI Payout',
      desc: 'Get paid instantly via Google Pay, PhonePe, Paytm, or Cash. Receive a digital green recycling certificate.'
    }
  ];

  const comparisonRows = [
    {
      feature: 'Doorstep Pickup Booking',
      kc: 'Instant online booking in 60 seconds with live slot tracking',
      trad: 'Uncertain waiting for street calls'
    },
    {
      feature: 'Weighing Accuracy',
      kc: '100% Certified ISO Digital Scales with zero discrepancy guarantee',
      trad: 'Manual spring scales prone to 15-30% weight cuts'
    },
    {
      feature: 'Pricing Transparency',
      kc: 'Published daily market benchmark rates per kilogram',
      trad: 'Arbitrary verbal negotiation'
    },
    {
      feature: 'Payment Methods',
      kc: 'Instant UPI (GPay, PhonePe, Paytm) or Cash receipt',
      trad: 'Cash only, often running out of change'
    },
    {
      feature: 'Collector Background',
      kc: 'Police-verified Aadhaar KYC & verified uniforms',
      trad: 'Unverified stranger visiting home'
    },
    {
      feature: 'Environmental Tracking',
      kc: 'CO₂ offset & trees saved green certification',
      trad: 'No tracking, mixed landfill dumping'
    }
  ];

  return (
    <section id="how-it-works" className="section" style={{ background: 'var(--color-bg)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-subtitle">
            <Sparkles size={14} />
            <span>Simple & Hassle-Free</span>
          </div>
          <h2 className="section-title">
            How KabadCollect Works
          </h2>
          <p className="section-description">
            Selling household scrap shouldn't involve shouting on the street or haggling over arbitrary weights.
          </p>
        </div>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem',
          position: 'relative'
        }}>
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="card"
              style={{
                padding: 'clamp(1.25rem, 3vw, 2.25rem) clamp(1rem, 2.5vw, 1.75rem)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-xs)',
                    flexShrink: 0
                  }}>
                    {step.icon}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: '#E2E8F0',
                    lineHeight: 1
                  }}>
                    {step.num}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                <span>Verified Process</span>
                <ShieldCheck size={16} color="var(--color-accent-mint)" />
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Section: Traditional Kabadwala vs KabadCollect */}
        <div className="card" style={{ padding: 'clamp(1.15rem, 2.8vw, 2.25rem)', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)', marginBottom: '0.4rem', wordBreak: 'break-word' }}>
              Why Thousands of Households Choose KabadCollect
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              A guaranteed fair, transparent, and eco-friendly doorstep experience
            </p>
          </div>

          {/* Mobile View Toggle (Visible only on mobile/tablets < 768px) */}
          <div className="hide-on-desktop" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem'
          }}>
            <button
              type="button"
              onClick={() => setMobileView('cards')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: mobileView === 'cards' ? 'var(--color-primary)' : 'var(--color-bg)',
                color: mobileView === 'cards' ? '#FFFFFF' : 'var(--color-text-secondary)',
                border: `1px solid ${mobileView === 'cards' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                boxShadow: mobileView === 'cards' ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📱 Card View (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setMobileView('table')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: mobileView === 'table' ? 'var(--color-primary)' : 'var(--color-bg)',
                color: mobileView === 'table' ? '#FFFFFF' : 'var(--color-text-secondary)',
                border: `1px solid ${mobileView === 'table' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                boxShadow: mobileView === 'table' ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📊 Side-by-Side Table
            </button>
          </div>

          {/* 1. Mobile Cards View (Rendered on mobile when mobileView === 'cards') */}
          <div className={`comparison-cards-wrapper ${mobileView === 'cards' ? 'show-on-mobile' : 'hide-on-mobile-always'}`} style={{
            display: mobileView === 'cards' ? 'flex' : 'none',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            {comparisonRows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.75rem'
                }}>
                  {row.feature}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* KabadCollect Advantage */}
                  <div style={{
                    background: 'rgba(236, 253, 245, 0.85)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                      <Check size={15} color="var(--color-accent-mint)" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        🌿 KabadCollect
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', paddingLeft: '1.25rem', lineHeight: 1.45 }}>
                      {row.kc}
                    </div>
                  </div>

                  {/* Traditional Kabadwala */}
                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                      <XIcon size={15} color="#EF4444" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Traditional Kabadwala
                      </span>
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', paddingLeft: '1.25rem', lineHeight: 1.45 }}>
                      {row.trad}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Full Table View (Always on desktop; on mobile when mobileView === 'table') */}
          <div className={`comparison-table-wrapper ${mobileView === 'table' ? 'force-show' : ''}`} style={{ width: '100%' }}>
            {/* Mobile swipe hint */}
            <div className="hide-on-desktop" style={{
              textAlign: 'center',
              marginBottom: '0.75rem',
              fontSize: '0.75rem',
              color: 'var(--color-text-mint)',
              background: 'var(--color-accent-mint-soft)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              width: 'fit-content',
              margin: '0 auto 0.85rem auto',
              fontWeight: 600
            }}>
              👉 Swipe table horizontally to see all columns
            </div>

            <div className="" style={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              width: '100%',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}>
              <table style={{
                width: '100%',
                minWidth: '580px',
                borderCollapse: 'collapse',
                fontSize: '0.88rem'
              }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg)', borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-secondary)', width: '28%' }}>Feature</th>
                    <th style={{ padding: '0.85rem 1rem', color: 'var(--color-primary)', background: 'var(--color-accent-mint-soft)', width: '38%' }}>
                      🌿 KabadCollect
                    </th>
                    <th style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)', width: '34%' }}>Traditional Kabadwala</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{row.feature}</td>
                      <td style={{ padding: '0.85rem 1rem', background: 'rgba(236, 253, 245, 0.4)', color: 'var(--color-primary)', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                          <Check size={16} color="var(--color-accent-mint)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{row.kc}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                          <XIcon size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{row.trad}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .comparison-cards-wrapper {
            display: none !important;
          }
          .comparison-table-wrapper {
            display: block !important;
          }
        }
        @media (max-width: 768px) {
          .comparison-table-wrapper:not(.force-show) {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};
