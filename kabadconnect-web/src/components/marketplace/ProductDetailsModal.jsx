import React from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  HeartHandshake, 
  Sparkles,
  Truck,
  Eye,
  Share2,
  Trash2,
  Check
} from 'lucide-react';

export const ProductDetailsModal = ({
  isOpen,
  onClose,
  product,
  onMarkAsSold,
  onDeleteProduct,
  currentUser
}) => {
  if (!isOpen || !product) return null;

  const isOwner = currentUser && (
    product.seller?.id === currentUser.id ||
    currentUser.role === 'admin'
  );

  const discountPercent = product.originalPrice && Number(product.originalPrice) > Number(product.price)
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : 0;

  const formattedPhone = product.seller?.phone || '+91 98100 00000';
  const cleanPhone = product.seller?.whatsapp || formattedPhone.replace(/[^0-9]/g, '');

  const whatsappMessage = encodeURIComponent(
    `Hi ${product.seller?.name || 'there'}, I found your listing for "${product.title}" on KabadConnect Bazaar priced at ₹${product.price}. Is this item still available for inspection and pickup in ${product.locality || product.city}?`
  );

  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${whatsappMessage}`;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '800px',
          maxHeight: '94dvh'
        }}
      >
        {/* Header Bar */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
              {product.category}
            </span>
            {product.status === 'sold' ? (
              <span className="badge" style={{ background: '#DC2626', color: '#FFFFFF' }}>
                SOLD OUT
              </span>
            ) : (
              <span className="badge badge-warning">
                {product.condition ? product.condition.replace('_', ' ') : 'Verified'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#E2E8F0',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            {/* Product Image */}
            <div>
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                height: '300px',
                border: '1px solid #E2E8F0',
                background: '#F1F5F9'
              }}>
                <img
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80'}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {discountPercent > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: '#DC2626',
                    color: '#FFFFFF',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {discountPercent}% OFF
                  </div>
                )}

                {product.status === 'sold' && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    letterSpacing: '0.1em'
                  }}>
                    SOLD
                  </div>
                )}
              </div>

              {/* Safety banner */}
              <div style={{
                marginTop: '1rem',
                padding: '0.85rem',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.775rem',
                color: '#166534',
                lineHeight: 1.4
              }}>
                <div style={{ fontWeight: 800, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Hyperlocal Direct Pickup Tip:
                </div>
                Inspect product in person before completing UPI or cash payment. Pick up directly from seller's address.
              </div>
            </div>

            {/* Product Details */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {product.title}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <MapPin size={15} color="var(--color-primary)" />
                  <span>{product.locality ? `${product.locality}, ` : ''}{product.city}</span>
                </div>

                {/* Price Display */}
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  background: 'rgba(13, 92, 58, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(13, 92, 58, 0.15)'
                }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                    ₹{product.price?.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && (
                    <span style={{ fontSize: '1rem', color: '#94A3B8', textDecoration: 'line-through', fontWeight: 600 }}>
                      ₹{product.originalPrice?.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '4px' }}>
                      Save ₹{(Number(product.originalPrice) - Number(product.price)).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    About This Product:
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                    {product.description || 'Pre-loved good condition item maintained cleanly and ready for immediate handover.'}
                  </p>
                </div>

                {/* Upcycled specs if any */}
                {product.materialsUsed && (
                  <div style={{
                    padding: '0.75rem',
                    background: '#ECFDF5',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #34D399',
                    fontSize: '0.8rem',
                    color: '#065F46',
                    marginBottom: '1rem'
                  }}>
                    <strong>♻️ Recycled Material:</strong> {product.materialsUsed} | <strong>CO₂ Saved:</strong> {product.co2Saved}
                  </div>
                )}

                {/* Seller Profile Card */}
                <div style={{
                  padding: '1rem',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', marginBottom: '0.35rem' }}>
                    Seller Information
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                        {product.seller?.name || 'Local Citizen'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Verified KabadConnect Member
                      </div>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                      Verified Contact
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }}>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      background: '#16A34A',
                      borderColor: '#16A34A'
                    }}
                  >
                    <MessageCircle size={17} />
                    <span>WhatsApp Seller</span>
                  </a>

                  <a
                    href={`tel:${cleanPhone}`}
                    className="btn btn-outline"
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      padding: '0.75rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <Phone size={17} />
                    <span>Call Seller</span>
                  </a>
                </div>

                {/* Owner controls: Mark Sold or Delete */}
                {isOwner && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: '#FEF3C7',
                    borderRadius: 'var(--radius-sm)',
                    marginTop: '0.5rem',
                    border: '1px solid #FCD34D'
                  }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E' }}>
                      ⚙️ Your Listing Controls:
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {product.status !== 'sold' && onMarkAsSold && (
                        <button
                          type="button"
                          onClick={() => {
                            onMarkAsSold(product.id);
                            onClose();
                          }}
                          style={{
                            padding: '4px 8px',
                            background: '#059669',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Mark as Sold
                        </button>
                      )}
                      {onDeleteProduct && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this listing?')) {
                              onDeleteProduct(product.id);
                              onClose();
                            }
                          }}
                          style={{
                            padding: '4px 8px',
                            background: '#DC2626',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
