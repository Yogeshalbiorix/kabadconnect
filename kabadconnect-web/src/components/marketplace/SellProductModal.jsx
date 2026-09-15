import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  Tag, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  DollarSign, 
  Image as ImageIcon, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRODUCT_SUBCATEGORY_PRESETS } from '../../data/marketplaceItems';

export const SellProductModal = ({
  isOpen,
  onClose,
  onSubmitProduct,
  currentUser,
  activeCity = 'Delhi NCR',
  onOpenAuth = null
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('furniture');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [condition, setCondition] = useState('good');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState(currentUser?.city || activeCity || 'Delhi NCR');
  const [locality, setLocality] = useState(currentUser?.address || '');
  const [sellerName, setSellerName] = useState(currentUser?.name || '');
  const [sellerPhone, setSellerPhone] = useState(currentUser?.phone || '');
  const [sellerWhatsapp, setSellerWhatsapp] = useState(currentUser?.phone ? currentUser.phone.replace(/[^0-9]/g, '') : '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Gatekeeper: User must be logged in to sell products
  if (!currentUser) {
    return (
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', textAlign: 'center', padding: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#FEF3C7',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <ShieldCheck size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0F172A' }}>
            Login Required to Sell
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Without logging in, you cannot sell scrap or pre-loved goods. Please sign in or create an account to start selling.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button 
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }} 
              className="btn btn-primary"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Preset Click
  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setTitle(preset.defaultTitle);
    setCategory(preset.category);
    setSubcategory(preset.id);
    setPrice(String(preset.defaultPrice));
    setOriginalPrice(String(Math.round(preset.defaultPrice * 3)));
    setImageUrl(preset.defaultImage);
    setDescription(preset.description);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a product title.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMsg('Please enter a valid selling price.');
      return;
    }
    if (!sellerPhone.trim()) {
      setErrorMsg('Please enter your contact phone number so buyers can reach you.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const productPayload = {
      id: `mkt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: title.trim(),
      category,
      subcategory,
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price) * 1.5,
      condition,
      images: [imageUrl],
      description: description.trim(),
      city,
      locality: locality.trim(),
      seller: {
        id: currentUser?.id || `usr-${Date.now()}`,
        name: sellerName.trim() || 'Verified Seller',
        phone: sellerPhone.trim(),
        whatsapp: sellerWhatsapp.trim() || sellerPhone.replace(/[^0-9]/g, ''),
        email: currentUser?.email || '',
        isVerified: true
      },
      itemType: 'second_hand',
      status: 'available',
      badge: 'User Listed',
      createdAt: new Date().toISOString()
    };

    try {
      if (onSubmitProduct) {
        await onSubmitProduct(productPayload);
      }
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to list product. Please try again.');
    }
  };

  // Calculate discount percentage
  const discountPercent = originalPrice && Number(originalPrice) > Number(price)
    ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          maxHeight: '94dvh'
        }}
      >
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #0D5C3A 60%, #10B981 100%)',
          color: '#FFFFFF',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6EE7B7' }}>
              <Sparkles size={14} /> Sell Pre-Loved Usable Goods
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '2px 0 0 0', color: '#FFFFFF' }}>
              Sell Your Old Good Products
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.825rem', color: 'rgba(255,255,255,0.85)' }}>
              Almirah, Tables, AC, Dining Tables, Sofa, Bed, Mattress, Cycles & more — Set your own price!
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
          {errorMsg && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #F87171',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: '#B91C1C',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Preset Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              ⚡ 1-Click Fast Fill for Popular Items:
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              maxHeight: '120px',
              overflowY: 'auto',
              padding: '0.25rem'
            }}>
              {PRODUCT_SUBCATEGORY_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid #CBD5E1',
                      background: isSelected ? '#ECFDF5' : '#F8FAFC',
                      color: isSelected ? 'var(--color-primary)' : '#475569',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{preset.label}</span>
                    {isSelected && <span style={{ color: '#10B981' }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
            {/* Left Column: Product Details */}
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1E293B' }}>
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Solid Sheesham Wood 3-Door Almirah"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1E293B' }}>
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="furniture">Furniture</option>
                    <option value="appliances">Home Appliances</option>
                    <option value="cycles">Cycles & Bicycles</option>
                    <option value="electronics">Electronics</option>
                    <option value="other">Other Goods</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1E293B' }}>
                    Item Condition *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="like_new">Like New / Mint (9/10)</option>
                    <option value="excellent">Excellent Condition</option>
                    <option value="good">Good Working Condition</option>
                    <option value="fair">Fair / Functional</option>
                  </select>
                </div>
              </div>

              {/* Price Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1E293B' }}>
                    Your Selling Price (₹) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--color-primary)' }}>₹</span>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="4500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 1.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--color-primary)',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: 'var(--color-primary)'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1E293B' }}>
                    Original MRP (₹) (Optional)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#94A3B8' }}>₹</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="18000"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem 0.65rem 1.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#64748B'
                      }}
                    />
                  </div>
                  {discountPercent > 0 && (
                    <span style={{ fontSize: '0.725rem', color: '#059669', fontWeight: 700, marginTop: '2px', display: 'block' }}>
                      🔥 Shows {discountPercent}% OFF badge
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1E293B' }}>
                  Description & Item Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention age of item, wood type, brand, dimensions, any flaws, and reason for selling..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.85rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Right Column: Photo & Seller Contact */}
            <div>
              {/* Image Preview & Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1E293B' }}>
                  Product Photo *
                </label>
                <div style={{
                  position: 'relative',
                  height: '160px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1.5px dashed #94A3B8',
                  background: '#F8FAFC',
                  marginBottom: '0.5rem'
                }}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                      <ImageIcon size={32} />
                      <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>No photo selected</span>
                    </div>
                  )}

                  <label
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: '#FFFFFF',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Upload size={12} /> Upload File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Or paste image URL here..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.75rem'
                  }}
                />
              </div>

              {/* Seller Contact Info */}
              <div style={{
                background: '#F1F5F9',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} color="#059669" /> Seller Contact & Location
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.65rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>Your Name</label>
                    <input
                      type="text"
                      required
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.825rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98100..."
                      value={sellerPhone}
                      onChange={(e) => {
                        setSellerPhone(e.target.value);
                        setSellerWhatsapp(e.target.value.replace(/[^0-9]/g, ''));
                      }}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.825rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>City Hub</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.825rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                    >
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Gurugram">Gurugram</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Mumbai">Mumbai</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>Local Area / Sector</label>
                    <input
                      type="text"
                      placeholder="e.g. Indirapuram, SG Highway"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.825rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sell-modal-footer" style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                padding: '0.65rem 1.5rem',
                fontSize: '0.925rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Listing Product...' : 'Publish Product to Bazaar (Free)'}</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 540px) {
          .sell-modal-footer {
            flex-direction: column-reverse !important;
            gap: 0.5rem !important;
          }
          .sell-modal-footer > button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
};
