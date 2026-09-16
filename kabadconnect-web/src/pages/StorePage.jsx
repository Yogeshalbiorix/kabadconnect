import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Sparkles, 
  RefreshCw, 
  Truck, 
  HeartHandshake, 
  PlusCircle, 
  Search, 
  Filter, 
  MapPin, 
  Tag, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Star, 
  Package, 
  Trash2,
  Armchair,
  Tv,
  Bike,
  Leaf
} from 'lucide-react';
import { RecycledStore } from '../components/marketplace/RecycledStore';
import { ProductDetailsModal } from '../components/marketplace/ProductDetailsModal';

export const StorePage = ({
  onAddToCart,
  cartItems = [],
  onOpenCart,
  onNavigate,
  onOpenSellModal,
  marketplaceItems = [],
  onUpdateProduct,
  onDeleteProduct,
  currentUser,
  activeCity = 'Delhi NCR'
}) => {
  const [activeTab, setActiveTab] = useState('second_hand'); // 'second_hand', 'upcycled', 'my_listings'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price_asc', 'price_desc'
  const [activeProductForDetails, setActiveProductForDetails] = useState(null);

  // Categories list
  const CATEGORIES = [
    { id: 'all', label: 'All Items' },
    { id: 'furniture', label: 'Almirahs & Furniture' },
    { id: 'appliances', label: 'AC & Appliances' },
    { id: 'cycles', label: 'Cycles & Bicycles' },
    { id: 'upcycled', label: 'Eco Upcycled Store' }
  ];

  const SUBCATEGORIES = [
    { id: 'all', label: 'All Types' },
    { id: 'almirah', label: 'Almirah / Wardrobe' },
    { id: 'sofa', label: 'Sofa / Couch' },
    { id: 'bed', label: 'Bed' },
    { id: 'mattress', label: 'Mattress' },
    { id: 'dining-table', label: 'Dining Table' },
    { id: 'study-table', label: 'Study Table' },
    { id: 'table', label: 'Center Table' },
    { id: 'ac', label: 'AC (Air Conditioner)' },
    { id: 'cycle', label: 'Bicycle / Cycle' }
  ];

  // Filter items based on activeTab, category, subcategory, search, city
  const filteredItems = useMemo(() => {
    return marketplaceItems.filter((item) => {
      // Tab filter
      if (activeTab === 'second_hand' && item.itemType !== 'second_hand') return false;
      if (activeTab === 'upcycled' && item.itemType !== 'upcycled') return false;
      if (activeTab === 'my_listings') {
        const isOwner = currentUser && item.seller?.id === currentUser.id;
        if (!isOwner) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Subcategory filter
      if (selectedSubcategory !== 'all' && item.subcategory !== selectedSubcategory) {
        return false;
      }

      // City filter
      if (selectedCity !== 'all' && !item.city?.toLowerCase().includes(selectedCity.toLowerCase())) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesSubcat = item.subcategory?.toLowerCase().includes(q);
        const matchesLocality = item.locality?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSubcat && !matchesLocality) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [marketplaceItems, activeTab, selectedCategory, selectedSubcategory, selectedCity, searchQuery, sortBy, currentUser]);

  const handleMarkAsSold = (productId) => {
    if (onUpdateProduct) {
      onUpdateProduct(productId, { status: 'sold' });
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '85vh', paddingBottom: '4rem' }}>
      {/* Page Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #072e1c 0%, #0D5C3A 55%, #10B981 100%)',
        color: '#FFFFFF',
        padding: '2.5rem 1rem 3.75rem 1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.12)',
          pointerEvents: 'none'
        }} />

        <div className="container">
          {/* Breadcrumbs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem'
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
              <span style={{ color: '#34D399', fontWeight: 700 }}>Pre-Loved Bazaar & Marketplace</span>
            </div>

            {/* Sell Product Primary CTA Button */}
            <button
              type="button"
              onClick={onOpenSellModal}
              className="animate-pulse-glow"
              style={{
                background: '#F59E0B',
                color: '#0F172A',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)'
              }}
            >
              <PlusCircle size={18} />
              <span>+ Sell Your Old Goods (Post Free)</span>
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
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={13} /> Circular Economy & Second-Life Marketplace
          </div>

          <h1 style={{
            color: '#FFFFFF',
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '0.75rem',
            maxWidth: '850px'
          }}>
            Pre-Loved Bazaar & Upcycled Store
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '740px',
            lineHeight: 1.6,
            marginBottom: '1.5rem'
          }}>
            Give good usable items a second life before scrapping! Buy & sell pre-owned <strong>Almirahs, Tables, ACs, Dining Sets, Study Desks, Sofas, Beds, Mattresses, and Bicycles</strong> directly with verified local citizens at fair prices.
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.95)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <RefreshCw size={16} color="#34D399" />
              <span>Direct Peer-to-Peer Resale</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <HeartHandshake size={16} color="#34D399" />
              <span>Zero Scrap Waste — 100% Usable</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Truck size={16} color="#34D399" />
              <span>Hyperlocal Pickup from Your City</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ marginTop: '-1.75rem', position: 'relative', zIndex: 10 }}>
        {/* Navigation Tabs */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '0.75rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            maxWidth: '100%',
            paddingBottom: '2px'
          }} className="scroll-touch-x">
            <button
              type="button"
              onClick={() => {
                setActiveTab('second_hand');
                setSelectedCategory('all');
                setSelectedSubcategory('all');
              }}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: activeTab === 'second_hand' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'second_hand' ? '#FFFFFF' : 'var(--color-text-primary)',
                fontWeight: activeTab === 'second_hand' ? 800 : 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span>🛋️ Pre-Loved Used Goods Bazaar</span>
              <span style={{
                background: activeTab === 'second_hand' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                padding: '1px 7px',
                borderRadius: '999px',
                fontSize: '0.725rem'
              }}>
                {marketplaceItems.filter(i => i.itemType === 'second_hand').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('upcycled');
                setSelectedCategory('upcycled');
                setSelectedSubcategory('all');
              }}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: activeTab === 'upcycled' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'upcycled' ? '#FFFFFF' : 'var(--color-text-primary)',
                fontWeight: activeTab === 'upcycled' ? 800 : 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span>♻️ Upcycled Eco Store</span>
              <span style={{
                background: activeTab === 'upcycled' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                padding: '1px 7px',
                borderRadius: '999px',
                fontSize: '0.725rem'
              }}>
                {marketplaceItems.filter(i => i.itemType === 'upcycled').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('my_listings');
                setSelectedCategory('all');
                setSelectedSubcategory('all');
              }}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: activeTab === 'my_listings' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'my_listings' ? '#FFFFFF' : 'var(--color-text-primary)',
                fontWeight: activeTab === 'my_listings' ? 800 : 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span>👤 My Listed Items</span>
              <span style={{
                background: activeTab === 'my_listings' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                padding: '1px 7px',
                borderRadius: '999px',
                fontSize: '0.725rem'
              }}>
                {marketplaceItems.filter(i => currentUser && i.seller?.id === currentUser.id).length}
              </span>
            </button>
          </div>

          {/* Post item quick trigger button */}
          <button
            type="button"
            onClick={onOpenSellModal}
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <PlusCircle size={15} />
            <span>List an Item</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-xs)',
          border: '1px solid var(--color-border)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search Almirah, Sofa, Bed, AC, Cycle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* City Filter */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                <option value="all">📍 All Indian City Hubs</option>
                <option value="Delhi NCR">Delhi NCR & Noida</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Gurugram">Gurugram</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                <option value="newest">🕒 Sort: Newly Listed</option>
                <option value="price_asc">💰 Price: Low to High</option>
                <option value="price_desc">💎 Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Subcategory Pills (Almira, Table, AC, Dining Table, Study Table, Sofa, Bed, Mattress, Cycle) */}
          <div className="scroll-touch-x" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Quick Filter:
            </span>
            {SUBCATEGORIES.map((sub) => {
              const isSelected = selectedSubcategory === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid #CBD5E1',
                    background: isSelected ? 'var(--color-accent-mint-soft)' : '#F8FAFC',
                    color: isSelected ? 'var(--color-primary)' : '#475569',
                    fontSize: '0.775rem',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s'
                  }}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredItems.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <Package size={48} color="#94A3B8" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
              No products found matching your filters
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
              Be the first to list an item in this category or try clearing your search filters!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                  setSelectedCity('all');
                  setSearchQuery('');
                }}
                className="btn btn-outline btn-sm"
              >
                Clear All Filters
              </button>
              <button
                type="button"
                onClick={onOpenSellModal}
                className="btn btn-primary btn-sm"
              >
                + List an Old Product Now
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {filteredItems.map((product) => {
              const discountPercent = product.originalPrice && Number(product.originalPrice) > Number(product.price)
                ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
                : 0;

              const isOwner = currentUser && product.seller?.id === currentUser.id;

              return (
                <div
                  key={product.id}
                  className="card card-interactive"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onClick={() => setActiveProductForDetails(product)}
                >
                  <div>
                    {/* Photo with Badges */}
                    <div style={{ position: 'relative', height: '210px', overflow: 'hidden', background: '#F1F5F9' }}>
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80'}
                        alt={product.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease'
                        }}
                      />

                      {/* Condition Badge */}
                      <span
                        className="badge badge-warning"
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          boxShadow: 'var(--shadow-sm)',
                          textTransform: 'capitalize'
                        }}
                      >
                        {product.condition ? product.condition.replace('_', ' ') : 'Good Condition'}
                      </span>

                      {/* Discount Badge */}
                      {discountPercent > 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: '#DC2626',
                            color: '#FFFFFF',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                          }}
                        >
                          {discountPercent}% OFF
                        </span>
                      )}

                      {/* Sold Overlay if sold */}
                      {product.status === 'sold' && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.65)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: '1.35rem',
                          fontWeight: 900,
                          letterSpacing: '0.05em'
                        }}>
                          SOLD OUT
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '1.25rem 1.25rem 0.5rem 1.25rem' }}>
                      <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
                        <span style={{
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          color: 'var(--color-primary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          {product.subcategory ? product.subcategory.replace('-', ' ') : product.category}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#64748B' }}>
                          <MapPin size={13} color="var(--color-primary)" />
                          <span>{product.locality ? product.locality.split(',')[0] : product.city}</span>
                        </span>
                      </div>

                      <h3 style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: '#0F172A',
                        lineHeight: 1.35,
                        marginBottom: '0.45rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {product.title}
                      </h3>

                      <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.45,
                        marginBottom: '0.75rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {product.description || 'Pre-loved good item in verified condition.'}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Price & Contact Button */}
                  <div style={{
                    padding: '0.85rem 1.25rem 1.15rem 1.25rem',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>
                        ₹{product.price?.toLocaleString('en-IN')}
                      </div>
                      {product.originalPrice && (
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through', marginTop: '2px' }}>
                          MRP ₹{product.originalPrice?.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProductForDetails(product);
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.775rem', fontWeight: 700 }}
                      >
                        Details
                      </button>

                      <a
                        href={`https://wa.me/${product.seller?.whatsapp || '919810023456'}?text=${encodeURIComponent(`Hi, I am interested in buying "${product.title}" listed on KabadCollect for ₹${product.price}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: '#16A34A',
                          color: '#FFFFFF',
                          padding: '0.45rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.775rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          textDecoration: 'none'
                        }}
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={14} />
                        <span>Chat</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {activeProductForDetails && (
        <ProductDetailsModal
          isOpen={!!activeProductForDetails}
          onClose={() => setActiveProductForDetails(null)}
          product={activeProductForDetails}
          onMarkAsSold={handleMarkAsSold}
          onDeleteProduct={onDeleteProduct}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
