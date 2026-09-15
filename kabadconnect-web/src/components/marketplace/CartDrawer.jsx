import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Leaf
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  onUpdateQuantity, 
  onRemoveItem,
  onClearCart
}) => {
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal >= 999 ? 0 : 79;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    setCheckoutComplete(true);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch (err) {}
  };

  const handleDone = () => {
    onClearCart();
    setCheckoutComplete(false);
    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className="drawer-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-bg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShoppingBag size={20} color="var(--color-primary)" />
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              Your Eco Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
            </span>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {checkoutComplete ? (
            <div className="text-center" style={{ padding: '2rem 1rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--color-accent-mint-soft)',
                color: 'var(--color-accent-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.45rem' }}>
                Order Placed Successfully!
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Order #KC-STORE-5812. Your upcycled handcrafted items are packed in 100% plastic-free compostable boxes.
              </p>

              <div style={{
                padding: '1rem',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                textAlign: 'left',
                marginBottom: '1.5rem'
              }}>
                <div>Delivering to: <strong>{shippingAddress}</strong></div>
                <div style={{ marginTop: '0.25rem', color: 'var(--color-accent-mint)', fontWeight: 600 }}>
                  Estimated Delivery: Tomorrow by 5:00 PM
                </div>
              </div>

              <button
                onClick={handleDone}
                className="btn btn-primary btn-full"
              >
                Continue Exploring
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center" style={{ padding: '3rem 1rem' }}>
              <ShoppingBag size={48} color="#CBD5E1" style={{ margin: '0 auto 1rem auto' }} />
              <h4 style={{ marginBottom: '0.35rem', color: 'var(--color-text-secondary)' }}>
                Your Eco Cart is Empty
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Browse our upcycled home decor, handcrafted paper stationery, and circular lifestyle items.
              </p>
              <button onClick={onClose} className="btn btn-outline btn-sm">
                Explore Store
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Free shipping banner */}
              <div style={{
                padding: '0.65rem 0.85rem',
                background: subtotal >= 999 ? 'var(--color-accent-mint-soft)' : 'var(--color-accent-gold-soft)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}>
                <Leaf size={15} color={subtotal >= 999 ? 'var(--color-accent-mint)' : 'var(--color-accent-gold-dark)'} />
                <span>
                  {subtotal >= 999 ? (
                    <strong>Free Eco Delivery Applied! 🚚</strong>
                  ) : (
                    <>Add <strong>₹{999 - subtotal}</strong> more for Free Delivery</>
                  )}
                </span>
              </div>

              {/* Items List */}
              {cartItems.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '0.85rem',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)'
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontWeight: 800,
                      color: 'var(--color-primary)',
                      fontSize: '0.95rem',
                      marginBottom: '0.5rem'
                    }}>
                      ₹{item.price}
                    </div>

                    <div className="flex-between">
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden'
                      }}>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          style={{ padding: '0.2rem 0.5rem', color: 'var(--color-text-secondary)' }}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0 0.4rem' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          style={{ padding: '0.2rem 0.5rem', color: 'var(--color-text-secondary)' }}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        style={{ color: '#EF4444', display: 'flex', alignItems: 'center' }}
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer / Checkout */}
        {!checkoutComplete && cartItems.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <div className="flex-between" style={{ color: 'var(--color-text-secondary)' }}>
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex-between" style={{ color: 'var(--color-text-secondary)' }}>
                <span>Eco Packaging & Delivery:</span>
                <span>{shipping === 0 ? <strong style={{ color: 'var(--color-accent-mint)' }}>FREE</strong> : `₹${shipping}`}</span>
              </div>
              <div className="flex-between" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)', paddingTop: '0.45rem', borderTop: '1px dashed var(--color-border)' }}>
                <span>Total Amount:</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="btn btn-primary btn-full btn-lg"
            >
              <span>Place Order (₹{total})</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
