import React from 'react';
import { 
  ArrowRight, 
  TrendingUp, 
  Calculator, 
  MapPin, 
  ShoppingBag, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles,
  Truck,
  Leaf
} from 'lucide-react';
import { HeroSection } from '../components/home/HeroSection';
import { RateCardCatalog } from '../components/rates/RateCardCatalog';
import { ScrapImpactCalculator } from '../components/calculator/ScrapImpactCalculator';
import { HowItWorks } from '../components/home/HowItWorks';
import { KabadwalaDirectory } from '../components/kabadwala/KabadwalaDirectory';
import { RecycledStore } from '../components/marketplace/RecycledStore';
import { ImpactStats } from '../components/home/ImpactStats';

export const HomePage = ({
  onOpenBooking,
  activeCity,
  userLocation,
  onDetectLocation,
  isDetectingLocation,
  onAddScrapItem,
  selectedScrapItems = [],
  onOpenPickupList,
  scrapItems = [],
  onBookCalculatedScrap,
  onSelectPartnerForBooking,
  onOpenPartnerModal,
  onLocationDetected,
  onAddToCart,
  cartItems = [],
  onOpenCart,
  onNavigate,
  onOpenSellModal = null,
  marketplaceItems = [],
  partners = []
}) => {
  const secondHandItems = marketplaceItems.filter(i => i.itemType === 'second_hand').slice(0, 4);

  return (
    <div>
      {/* 1. Hero Section (Banner) */}
      <HeroSection
        onOpenBooking={onOpenBooking}
        onOpenCalculator={() => onNavigate('calculator')}
        activeCity={activeCity}
        userLocation={userLocation}
        onDetectLocation={onDetectLocation}
        isDetectingLocation={isDetectingLocation}
        partners={partners}
      />

      {/* 2. Live Radar & Verified Kabadwalas Near You */}
      <KabadwalaDirectory
        onSelectPartnerForBooking={onSelectPartnerForBooking}
        onOpenPartnerModal={onOpenPartnerModal}
        activeCity={activeCity}
        userLocation={userLocation}
        onLocationDetected={onLocationDetected}
        partners={partners}
      />

      {/* 3. Today's Scrap Rate Card Catalog */}
      <RateCardCatalog
        onAddScrapItem={onAddScrapItem}
        selectedItems={selectedScrapItems}
        onOpenBooking={onOpenBooking}
        onOpenPickupList={onOpenPickupList}
        scrapItems={scrapItems}
        onNavigate={onNavigate}
        isHomePage={true}
      />

      {/* 4. Value & Environmental Impact Teaser */}
      <section style={{ padding: '3.5rem 0', background: '#FFFFFF' }}>
        <div className="container" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-subtitle">
              <Leaf size={14} /> Instant Earnings & Ecological Offset
            </div>
            <h2 className="section-title" style={{ marginBottom: '0.35rem' }}>
              Estimate Value & Carbon Saved
            </h2>
            <p className="section-desc" style={{ margin: 0, maxWidth: '600px' }}>
              Calculate cash payout and trees saved before scheduling your pickup.
            </p>
          </div>

          <button
            onClick={() => onNavigate('calculator')}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
          >
            <span>Open Interactive Calculator</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <ScrapImpactCalculator
          onBookCalculatedScrap={onBookCalculatedScrap}
          isHomePage={true}
        />
      </section>

      {/* 5. Pre-Loved Goods Bazaar Feature (Sell Almirah, Sofa, AC, Dining Table, Bed, Cycles) */}
      <section style={{
        padding: '3.5rem 0',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #ECFDF5 100%)',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#FEF3C7',
                color: '#92400E',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                marginBottom: '0.5rem'
              }}>
                <Sparkles size={13} /> New Feature: Buy & Sell Usable Goods
              </div>
              <h2 className="section-title" style={{ marginBottom: '0.35rem' }}>
                Pre-Loved Goods Bazaar
              </h2>
              <p className="section-desc" style={{ margin: 0, maxWidth: '650px' }}>
                Don't scrap good furniture or appliances for cheap scrap rates! Sell your <strong>Almirah, Dining Table, Sofa, Bed, Mattress, AC, or Bicycle</strong> directly to neighbors at great prices.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onOpenSellModal}
                className="btn animate-pulse-glow"
                style={{
                  background: '#F59E0B',
                  color: '#0F172A',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
              >
                + Sell Old Goods (Free Ad)
              </button>

              <button
                type="button"
                onClick={() => onNavigate('store')}
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
              >
                <span>Explore Full Bazaar</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* 4 Cards Showcase */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))',
            gap: '1.25rem'
          }}>
            {secondHandItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('store')}
                className="card card-interactive"
                style={{
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer'
                }}
              >
                <div style={{ position: 'relative', height: '170px' }}>
                  <img
                    src={item.images?.[0]}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    className="badge badge-warning"
                    style={{ position: 'absolute', top: '10px', left: '10px', textTransform: 'capitalize' }}
                  >
                    {item.subcategory ? item.subcategory.replace('-', ' ') : item.category}
                  </span>
                </div>
                <div style={{ padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.35rem', lineHeight: 1.3, color: '#0F172A' }}>
                    {item.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                      ₹{item.price?.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      📍 {item.locality ? item.locality.split(',')[0] : item.city}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How It Works Step-by-Step */}
      <HowItWorks onOpenBooking={onOpenBooking} />

      {/* 7. Recycled Goods Store Teaser */}
      <section style={{ padding: '3.5rem 0', background: 'var(--color-bg)' }}>
        <div className="container" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-subtitle">
              <ShoppingBag size={14} /> Circular Economy
            </div>
            <h2 className="section-title" style={{ marginBottom: '0.35rem' }}>
              Upcycled Goods & Eco Products
            </h2>
            <p className="section-desc" style={{ margin: 0, maxWidth: '600px' }}>
              Artisan products crafted 100% from post-consumer recycled materials.
            </p>
          </div>

          <button
            onClick={() => onNavigate('store')}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
          >
            <span>Browse Full Store</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <RecycledStore
          onAddToCart={onAddToCart}
          cartItems={cartItems}
          onOpenCart={onOpenCart}
        />
      </section>

      {/* 7. Environmental Impact & Reviews */}
      <ImpactStats />
    </div>
  );
};
