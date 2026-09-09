import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Calendar, 
  Scale, 
  Sparkles, 
  Leaf, 
  AlertCircle,
  ArrowRight,
  Package,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export const PickupListDrawer = ({ 
  isOpen, 
  onClose, 
  items = [], 
  onUpdateWeight, 
  onRemoveItem, 
  onClearList, 
  onProceedToBooking,
  onMoveItem = null
}) => {
  if (!isOpen) return null;

  // Calculate totals
  const totalWeight = items.reduce((acc, item) => acc + (Number(item.estimatedWeight) || 5), 0);
  const totalPayout = items.reduce((acc, item) => {
    const weight = Number(item.estimatedWeight) || 5;
    return acc + Math.round(weight * item.rate);
  }, 0);
  const totalCo2 = items.reduce((acc, item) => {
    const weight = Number(item.estimatedWeight) || 5;
    return acc + Number(((item.co2SavedPerKg || 1.5) * weight).toFixed(1));
  }, 0);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Drawer Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--color-accent-mint-soft)',
              color: 'var(--color-accent-mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Doorstep Pickup List
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {items.length} scrap {items.length === 1 ? 'item' : 'items'} selected for sale
              </div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close pickup list">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              color: 'var(--color-text-muted)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                color: 'var(--color-text-muted)'
              }}>
                <Package size={32} />
              </div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                Your Pickup List is Empty
              </h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '340px', margin: '0 auto 1.5rem auto' }}>
                Browse our live Scrap Rate Card and click <strong>"Add to Pickup"</strong> on the items you wish to sell.
              </p>
              <button onClick={onClose} className="btn btn-primary btn-sm">
                Browse Rate Card
              </button>
            </div>
          ) : (
            <>
              {/* Itemized Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {items.map((item, index) => {
                  const weight = Number(item.estimatedWeight) || 5;
                  const itemSubtotal = Math.round(weight * item.rate);

                  return (
                    <div 
                      key={item.id}
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        transition: 'border-color 0.2s ease',
                        boxShadow: 'var(--shadow-xs)'
                      }}
                    >
                      <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.975rem', color: 'var(--color-text-primary)' }}>
                              {item.name}
                            </span>
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                              {item.category}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {item.hindiName} • Rate: <strong style={{ color: 'var(--color-primary)' }}>₹{item.rate}/{item.unit || 'kg'}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          {items.length > 1 && onMoveItem && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--color-bg)', borderRadius: '6px', padding: '2px', border: '1px solid var(--color-border)' }}>
                              <button
                                onClick={() => onMoveItem(index, -1)}
                                disabled={index === 0}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: index === 0 ? '#CBD5E1' : '#475569',
                                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                                  padding: '2px 4px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  lineHeight: 1
                                }}
                                title="Move item up in list"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                onClick={() => onMoveItem(index, 1)}
                                disabled={index === items.length - 1}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: index === items.length - 1 ? '#CBD5E1' : '#475569',
                                  cursor: index === items.length - 1 ? 'not-allowed' : 'pointer',
                                  padding: '2px 4px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  lineHeight: 1
                                }}
                                title="Move item down in list"
                              >
                                <ArrowDown size={13} />
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                            title="Remove from pickup list"
                          >
                            <Trash2 size={15} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Weight Stepper & Subtotal */}
                      <div className="flex-between" style={{
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.65rem 0.85rem',
                        border: '1px solid var(--color-border)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                            Est. Weight:
                          </span>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: '#FFFFFF',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden'
                          }}>
                            <button
                              type="button"
                              onClick={() => onUpdateWeight(item.id, Math.max(1, weight - (weight > 10 ? 5 : 1)))}
                              style={{
                                padding: '4px 8px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: 'var(--color-text-primary)'
                              }}
                              aria-label="Decrease weight"
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={weight}
                              onChange={(e) => onUpdateWeight(item.id, Math.max(1, Number(e.target.value) || 1))}
                              style={{
                                width: '48px',
                                textAlign: 'center',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                color: 'var(--color-primary)'
                              }}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', paddingRight: '4px' }}>
                              {item.unit || 'kg'}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateWeight(item.id, weight + (weight >= 10 ? 5 : 1))}
                              style={{
                                padding: '4px 8px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: 'var(--color-text-primary)'
                              }}
                              aria-label="Increase weight"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Calculated subtotal */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                            EST. PAYOUT
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            ₹{itemSubtotal}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Guarantees Note */}
              <div style={{
                background: 'rgba(13, 92, 58, 0.05)',
                border: '1px solid rgba(13, 92, 58, 0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.8rem',
                color: 'var(--color-primary)'
              }}>
                <Scale size={18} color="var(--color-accent-mint)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Digital Weighing Guarantee:</strong> Final weight is measured in front of you with certified hanging scale. Payment made instantly via UPI/Cash.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer / Summary */}
        {items.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            padding: '1.25rem'
          }}>
            {/* Total Summary Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              padding: '0.85rem 1rem',
              background: 'var(--color-accent-mint-soft)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-mint)' }}>
                  TOTAL ESTIMATED PAYOUT ({totalWeight} kg)
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  ₹{totalPayout.toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-mint)' }}>
                  ENVIRONMENTAL IMPACT
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-accent-mint)' }}>
                  🌱 {totalCo2.toFixed(1)} kg CO₂ Saved
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={onClearList}
                className="btn btn-secondary"
                style={{ flex: '0 0 auto', padding: '0.75rem 1rem' }}
                title="Cancel and clear all items from pickup list"
              >
                <Trash2 size={16} />
                <span>Clear List</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onProceedToBooking({
                    items,
                    totalWeight,
                    totalPayout
                  });
                  onClose();
                }}
                className="btn btn-primary btn-full btn-lg"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                <span>Schedule Doorstep Pickup</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
