import React from 'react';
import { TrendingUp, ShieldCheck, Clock, CheckCircle2, ChevronRight, Scale, ArrowLeft } from 'lucide-react';
import { RateCardCatalog } from '../components/rates/RateCardCatalog';

export const RatesPage = ({
  onAddScrapItem,
  selectedItems = [],
  onOpenBooking,
  onOpenPickupList,
  scrapItems = [],
  onNavigate
}) => {
  return (
    <div style={{ background: '#F8FAFC', minHeight: '80vh', paddingBottom: '4rem' }}>
      {/* Page Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #072e1c 0%, #0D5C3A 60%, #10B981 100%)',
        color: '#FFFFFF',
        padding: '3rem 1.5rem 3.5rem 1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.1)',
          pointerEvents: 'none'
        }} />

        <div className="container">
          {/* Breadcrumbs & Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.85)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8rem'
                }}
              >
                <ArrowLeft size={14} /> Home
              </button>
              <span>/</span>
              <span style={{ color: '#34D399', fontWeight: 700 }}>Today's Scrap Rate Card</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="btn btn-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)'
              }}
            >
              <ArrowLeft size={13} /> Return to Main Page
            </button>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(16, 185, 129, 0.25)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            color: '#34D399',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}>
            <Clock size={13} /> Updated Today at 9:00 AM • Live Wholesale Index
          </div>

          <h1 style={{
            color: '#FFFFFF',
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '0.75rem',
            maxWidth: '780px'
          }}>
            Today's Doorstep Scrap Rates
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '680px',
            lineHeight: 1.6,
            marginBottom: '1.5rem'
          }}>
            Guaranteed transparent rates per kg with 100% digital scale accuracy. Select your scrap items, estimate total payout, and book verified doorstep pickup.
          </p>

          {/* Quick Value Pillars */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.95)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <ShieldCheck size={17} color="#34D399" />
              <span>Certified ISO Digital Scales</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CheckCircle2 size={17} color="#34D399" />
              <span>Zero Hidden Deductions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <TrendingUp size={17} color="#34D399" />
              <span>Instant UPI Payout on Weighing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog View */}
      <div style={{ marginTop: '-1.5rem', position: 'relative', zIndex: 10 }}>
        <RateCardCatalog
          onAddScrapItem={onAddScrapItem}
          selectedItems={selectedItems}
          onOpenBooking={onOpenBooking}
          onOpenPickupList={onOpenPickupList}
          scrapItems={scrapItems}
          onNavigate={onNavigate}
          isHomePage={false}
          hideHeader={true}
        />
      </div>

      {/* Information Section: Rate Transparency */}
      <div className="container" style={{ marginTop: '3.5rem' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0F172A' }}>
            How KabadConnect Fixes Scrap Rates
          </h3>
          <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '850px' }}>
            Unlike unorganized local kabadwalas who artificially deflate weights by 20–30% with faulty mechanical spring scales, KabadConnect benchmarks daily wholesale recycling commodity prices directly from paper mills, metal smelting plants, and authorized plastic recycling hubs.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
                1. Mill-Linked Daily Index
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                Rates are refreshed every morning based on national recycling market trends for metals, paper, and polymers.
              </p>
            </div>

            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
                2. Calibrated Tare Weight Scales
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                Our partners carry bluetooth-enabled digital scales that display exact gram-level weights on your smartphone screen.
              </p>
            </div>

            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
                3. Direct-to-Consumer Advantage
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                By cutting out 3 layers of middlemen, we pass on up to 40% higher cash returns directly into your bank account.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation CTA */}
        <div style={{
          marginTop: '2.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="btn btn-secondary btn-lg"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Main Page</span>
          </button>

          <button
            type="button"
            onClick={onOpenBooking}
            className="btn btn-primary btn-lg"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>Book Doorstep Pickup Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
