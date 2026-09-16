import React from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Leaf, 
  Star, 
  Plus, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import { RECYCLED_PRODUCTS } from '../../data/recycledItems';

export const RecycledStore = ({ onAddToCart, cartItems = [], onOpenCart }) => {
  return (
    <section id="store" className="section" style={{
      background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(236, 253, 245, 0.45) 100%)'
    }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="section-subtitle">
            <Leaf size={14} />
            <span>Circular Economy Marketplace</span>
          </div>
          <h2 className="section-title">
            Upcycled & Recycled Goods Store
          </h2>
          <p className="section-description">
            Complete the circle. Beautiful, artisan-crafted lifestyle products made 100% from segregated scrap collected by KabadCollect partners.
          </p>
        </div>

        {/* Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {RECYCLED_PRODUCTS.map((product) => {
            const inCart = cartItems.some(item => item.id === product.id);

            return (
              <div 
                key={product.id}
                className="card card-interactive"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  {/* Image with Tag */}
                  <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
                    <img
                      src={product.image}
                      alt={product.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                      }}
                    />
                    <span 
                      className="badge badge-warning"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {product.badge}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '1.25rem 1.25rem 0.5rem 1.25rem' }}>
                    <div className="flex-between" style={{ marginBottom: '0.45rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                        {product.category}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700 }}>
                        <Star size={12} fill="#F59E0B" /> {product.rating} ({product.reviewsCount})
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                      {product.title}
                    </h3>

                    {/* Upcycling Story */}
                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: '0.85rem'
                    }}>
                      {product.story}
                    </p>

                    {/* Scrap used pill */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.65rem',
                      background: 'var(--color-accent-mint-soft)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.725rem',
                      color: 'var(--color-text-mint)',
                      fontWeight: 600,
                      marginBottom: '1rem'
                    }}>
                      <Sparkles size={12} /> {product.materialsUsed} • Saved {product.co2Saved}
                    </div>
                  </div>
                </div>

                {/* Footer Price & Add to Cart */}
                <div style={{
                  padding: '1rem 1.25rem 1.25rem 1.25rem',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: 'var(--color-primary)',
                      lineHeight: 1
                    }}>
                      ₹{product.price}
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      textDecoration: 'line-through'
                    }}>
                      ₹{product.originalPrice}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onOpenCart();
                    }}
                    className={`btn btn-sm ${inCart ? 'btn-accent' : 'btn-primary'}`}
                  >
                    {inCart ? (
                      <>
                        <Check size={14} /> Added
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
