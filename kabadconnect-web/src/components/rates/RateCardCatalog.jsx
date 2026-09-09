import React, { useState } from 'react';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  Check, 
  Filter, 
  Sparkles,
  Info,
  Scale,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Eye,
  Package,
  ArrowLeft
} from 'lucide-react';
import { SCRAP_CATEGORIES, SCRAP_ITEMS } from '../../data/scrapRates';

export const RateCardCatalog = ({ 
  onAddScrapItem, 
  selectedItems = [], 
  onOpenBooking,
  onOpenPickupList = null,
  scrapItems = SCRAP_ITEMS,
  onNavigate = null,
  isHomePage = false,
  hideHeader = false
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(!isHomePage);

  const filteredItems = scrapItems.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hindiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // When on Home Page, in 'all' category without search query, show top 8 items unless user clicked 'View All'
  const displayItems = (isHomePage && !showAll && activeCategory === 'all' && !searchQuery.trim())
    ? filteredItems.slice(0, 8)
    : filteredItems;

  return (
    <section id="rates" className="section" style={{ background: '#FFFFFF' }}>
      <div className="container">
        {/* Section Header */}
        {!hideHeader && (
          <div className="section-header" style={{ position: 'relative' }}>
            <div className="section-subtitle">
              <Sparkles size={14} />
              <span>Transparent Live Rates</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
                  Today's Scrap Rate Card
                </h2>
                <p className="section-description" style={{ margin: 0 }}>
                  Transparent, government-benchmarked per-kilogram prices. Zero hidden cuts, certified digital scales guaranteed.
                </p>
              </div>

              {onNavigate && isHomePage && (
                <button
                  type="button"
                  onClick={() => onNavigate('rates')}
                  className="btn btn-outline"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-primary)'
                  }}
                >
                  <span>View Full Rate Card (24+ Items)</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search and Category Filter Bar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          {/* Search Input */}
          <div style={{
            maxWidth: '520px',
            margin: '0 auto',
            width: '100%',
            position: 'relative'
          }}>
            <Search 
              size={18} 
              color="var(--color-text-muted)" 
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Search scrap item (e.g. Copper, Newspaper, Old Laptop, Iron)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '45px',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-xs)'
              }}
            />
          </div>

          {/* Category Tabs */}
          <div className="scroll-touch-x" style={{
            display: 'flex',
            gap: '0.65rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            justifyContent: 'flex-start'
          }}>
            {SCRAP_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.6rem 1.15rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)',
                    background: isActive ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                    border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    boxShadow: isActive ? '0 4px 12px rgba(13, 92, 58, 0.25)' : 'none'
                  }}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rates Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
          gap: '1.5rem',
          marginBottom: displayItems.length === 0 ? '1rem' : '2.5rem'
        }}>
          {displayItems.map((item) => {
            const isSelected = selectedItems.some((s) => s.id === item.id);
            const isUp = item.trendType === 'up';
            const isDown = item.trendType === 'down';

            return (
              <div 
                key={item.id} 
                className="card card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  border: isSelected ? '2px solid var(--color-accent-mint)' : '1px solid var(--color-border)',
                  background: isSelected ? 'rgba(236, 253, 245, 0.35)' : 'var(--color-surface)'
                }}
              >
                <div>
                  {/* Card Top Row: Trend and Category */}
                  <div className="flex-between" style={{ marginBottom: '0.85rem' }}>
                    <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                      {item.category}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isUp ? '#059669' : isDown ? '#DC2626' : '#64748B'
                    }}>
                      {isUp && <TrendingUp size={13} />}
                      {isDown && <TrendingDown size={13} />}
                      {!isUp && !isDown && <Minus size={13} />}
                      <span>{item.trend} today</span>
                    </span>
                  </div>

                  {/* Title & Hindi Name */}
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>
                    {item.name}
                  </h3>
                  <div style={{
                    fontSize: '0.825rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: '0.85rem'
                  }}>
                    {item.hindiName}
                  </div>

                  {/* Rate Display */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.35rem',
                    marginBottom: '0.85rem'
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      color: 'var(--color-primary)'
                    }}>
                      ₹{item.rate}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                      / {item.unit}
                    </span>
                  </div>

                  {/* Description & Min Weight */}
                  <p style={{
                    fontSize: '0.825rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    minHeight: '2.8em'
                  }}>
                    {item.description}
                  </p>
                </div>

                <div>
                  {/* Bottom details row */}
                  <div className="flex-between" style={{
                    paddingTop: '0.85rem',
                    borderTop: '1px dashed var(--color-border)',
                    marginBottom: '1rem',
                    fontSize: '0.775rem',
                    color: 'var(--color-text-muted)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Scale size={13} /> Min pickup: <strong>{item.minWeight}</strong>
                    </span>
                    <span style={{ color: 'var(--color-accent-mint)', fontWeight: 600 }}>
                      ~{item.co2SavedPerKg}kg CO₂/kg
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => onAddScrapItem(item)}
                    className={`btn btn-full btn-sm ${isSelected ? 'btn-accent' : 'btn-secondary'}`}
                  >
                    {isSelected ? (
                      <>
                        <Check size={14} />
                        <span>Added to Pickup List</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>Add to Pickup</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State for Zero Search/Filter Results */}
        {displayItems.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '2px dashed var(--color-border)',
            margin: '0 0 3rem 0'
          }}>
            <Package size={44} color="var(--color-text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--color-text-primary)' }}>
              No scrap items found
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', maxWidth: '400px', margin: '0 auto 1.25rem auto' }}>
              {searchQuery ? `No scrap items match "${searchQuery}".` : 'No items found in this category.'} Try checking another category or clearing your search.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="btn btn-primary btn-sm"
            >
              Reset Filters & Show All
            </button>
          </div>
        )}

        {/* View All & Category Navigation Action Bar */}
        {displayItems.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            margin: '0 0 3rem 0',
            padding: '1.75rem',
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-xl)',
            border: '1px dashed var(--color-border)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.925rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              <Scale size={17} color="var(--color-accent-mint)" />
              <span>
                {isHomePage && !showAll && activeCategory === 'all' && !searchQuery.trim()
                  ? `Showing 8 of ${filteredItems.length} benchmarked scrap items`
                  : `Showing all ${displayItems.length} scrap items in ${activeCategory === 'all' ? 'catalog' : SCRAP_CATEGORIES.find(c => c.id === activeCategory)?.label || activeCategory}`}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--color-text-muted)', maxWidth: '520px' }}>
              All 24+ scrap items across Paper, Plastics, Metals, E-Waste & Batteries include verified ISO digital weighing and instant payout.
            </p>

            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Primary View All Toggle Button */}
              {isHomePage && !showAll && activeCategory === 'all' && !searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.75rem',
                    fontSize: '0.925rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(13, 92, 58, 0.2)'
                  }}
                >
                  <Eye size={17} />
                  <span>View All Scrap Items ({filteredItems.length})</span>
                  <ChevronDown size={17} />
                </button>
              )}

              {/* Show Less Button when expanded on home page */}
              {isHomePage && showAll && activeCategory === 'all' && !searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="btn btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  <span>Show Top 8 Items Only</span>
                  <ChevronUp size={16} />
                </button>
              )}

              {/* Navigate to Dedicated Rate Card Page */}
              {onNavigate && isHomePage && (
                <button
                  type="button"
                  onClick={() => onNavigate('rates')}
                  className="btn btn-outline"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.6rem',
                    fontSize: '0.925rem',
                    fontWeight: 700,
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-primary)',
                    background: '#FFFFFF'
                  }}
                >
                  <span>Dedicated Rate Card Page</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {/* If on RatesPage and onNavigate is passed: Back to Main Page */}
              {!isHomePage && onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="btn btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Main Page</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #072e1c 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.25rem',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-accent-gold)',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.5rem'
            }}>
              <Info size={15} /> Commercial / Bulk Scrap Recycling
            </div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.45rem', marginBottom: '0.5rem' }}>
              Have more than 100 kg or Corporate Waste?
            </h3>
            <p style={{ color: '#E2E8F0', fontSize: '0.95rem' }}>
              We provide dedicated trucks, GST recycling certificates, and special bulk price premiums for offices, warehouses, and factories.
            </p>
          </div>

          <button
            onClick={onOpenBooking}
            className="btn btn-gold btn-lg"
          >
            <span>Book Bulk / B2B Collection</span>
          </button>
        </div>

        {/* Floating Pickup List Action Bar */}
        {selectedItems.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 800,
            background: 'linear-gradient(135deg, #072e1c 0%, #0D5C3A 100%)',
            color: '#FFFFFF',
            padding: '0.75rem 1.35rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 12px 35px rgba(13, 92, 58, 0.5)',
            border: '2px solid #34D399',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            maxWidth: '92vw',
            animation: 'slideUp 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#10B981',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 800,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
              }}>
                {selectedItems.length}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.925rem' }}>
                  {selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'} in Pickup List
                </div>
                <div style={{ fontSize: '0.75rem', color: '#A7F3D0' }}>
                  Est. Payout: ~₹{selectedItems.reduce((acc, it) => acc + Math.round(it.rate * (it.estimatedWeight || 5)), 0)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={onOpenPickupList}
                className="btn btn-gold btn-sm"
                style={{ padding: '0.5rem 0.95rem', fontSize: '0.825rem', fontWeight: 700 }}
              >
                <span>View & Edit List</span>
              </button>

              <button
                type="button"
                onClick={onOpenBooking}
                className="btn btn-sm"
                style={{
                  background: '#FFFFFF',
                  color: '#0D5C3A',
                  padding: '0.5rem 0.95rem',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  border: 'none'
                }}
              >
                <span>Schedule Pickup</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
