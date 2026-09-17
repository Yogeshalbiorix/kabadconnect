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
  HelpCircle,
  Camera,
  Trash2,
  Star,
  Plus
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
  const [images, setImages] = useState([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [urlInput, setUrlInput] = useState('');
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
    const presetImages = Array.isArray(preset.defaultImages) && preset.defaultImages.length > 0
      ? preset.defaultImages
      : (preset.defaultImage ? [preset.defaultImage] : []);
    setImages(presetImages);
    setActivePreviewIndex(0);
    setDescription(preset.description);
  };

  // Multiple File Upload Handler (Up to 6 photos)
  const handleMultipleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 6 - images.length;
    if (remainingSlots <= 0) {
      setErrorMsg('You can upload up to 6 photos maximum per product.');
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const newImagesList = [];
    let processedCount = 0;

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          newImagesList.push(reader.result);
        }
        processedCount++;
        if (processedCount === filesToProcess.length) {
          setImages(prev => [...prev, ...newImagesList]);
          setErrorMsg('');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Add Image via URL
  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (images.length >= 6) {
      setErrorMsg('Maximum 6 photos allowed.');
      return;
    }
    setImages(prev => [...prev, urlInput.trim()]);
    setUrlInput('');
    setErrorMsg('');
  };

  // Remove specific photo from gallery
  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (activePreviewIndex >= next.length) {
        setActivePreviewIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  // Set selected photo as main cover photo
  const handleSetCoverPhoto = (index) => {
    if (index === 0) return;
    setImages(prev => {
      const item = prev[index];
      const remaining = prev.filter((_, idx) => idx !== index);
      return [item, ...remaining];
    });
    setActivePreviewIndex(0);
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

    const finalImages = images.length > 0 
      ? images 
      : ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80'];

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
      images: finalImages,
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

            {/* Right Column: Multi-Photo Gallery & Seller Contact */}
            <div>
              {/* Pro Seller Real Photo Tip */}
              <div style={{
                background: '#ECFDF5',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '12px',
                padding: '0.65rem 0.85rem',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.78rem',
                color: '#065F46',
                lineHeight: 1.35
              }}>
                <Camera size={18} color="#10B981" style={{ flexShrink: 0 }} />
                <span>
                  <strong>📸 Real & Unedited Photos:</strong> Upload multiple clear photos of your actual item (front, sides, interior & flaws). Authentic listings sell 4x faster!
                </span>
              </div>

              {/* Product Photos Gallery (Up to 6 Photos) */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B' }}>
                    Product Photos ({images.length}/6) *
                  </label>
                  {images.length > 0 && (
                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                      ⭐ 1st photo is Cover Photo
                    </span>
                  )}
                </div>

                {/* Main Selected Photo Preview Box */}
                <div style={{
                  position: 'relative',
                  height: '175px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1.5px dashed #94A3B8',
                  background: '#F8FAFC',
                  marginBottom: '0.5rem'
                }}>
                  {images.length > 0 && images[activePreviewIndex] ? (
                    <>
                      <img
                        src={images[activePreviewIndex]}
                        alt={`Product preview ${activePreviewIndex + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Photo Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: activePreviewIndex === 0 ? 'rgba(13, 92, 58, 0.9)' : 'rgba(15, 23, 42, 0.8)',
                        color: '#FFFFFF',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backdropFilter: 'blur(4px)'
                      }}>
                        {activePreviewIndex === 0 ? (
                          <>
                            <Star size={11} fill="#F59E0B" color="#F59E0B" /> Cover Photo
                          </>
                        ) : (
                          <>Angle {activePreviewIndex + 1} of {images.length}</>
                        )}
                      </div>

                      {/* Delete Current Photo Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(activePreviewIndex)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(239, 68, 68, 0.9)',
                          border: 'none',
                          color: '#FFFFFF',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                        }}
                        title="Remove this photo"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* Make Cover Photo CTA if not already cover */}
                      {activePreviewIndex !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetCoverPhoto(activePreviewIndex)}
                          style={{
                            position: 'absolute',
                            bottom: '8px',
                            left: '8px',
                            background: 'rgba(15, 23, 42, 0.85)',
                            border: 'none',
                            color: '#FFFFFF',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Star size={11} /> Set as Cover
                        </button>
                      )}
                    </>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                      <Camera size={36} color="#CBD5E1" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '6px', color: '#64748B' }}>
                        No product photos added
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        Click below to upload real photos from your phone or camera
                      </span>
                    </div>
                  )}

                  {/* Multi-File Upload Button */}
                  <label
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: '#0D5C3A',
                      color: '#FFFFFF',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 4px 10px rgba(13, 92, 58, 0.3)'
                    }}
                  >
                    <Upload size={13} /> + Upload Photos
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {/* Thumbnails Row (Up to 6 images) */}
                {images.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '0.45rem',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                    marginBottom: '0.5rem'
                  }}>
                    {images.map((img, idx) => {
                      const isSelected = activePreviewIndex === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setActivePreviewIndex(idx)}
                          style={{
                            position: 'relative',
                            width: '54px',
                            height: '54px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: isSelected ? '2.5px solid #10B981' : '1.5px solid #CBD5E1',
                            cursor: 'pointer',
                            flexShrink: 0,
                            boxShadow: isSelected ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <img
                            src={img}
                            alt={`Thumb ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {idx === 0 && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'rgba(13, 92, 58, 0.9)',
                              color: '#FFFFFF',
                              fontSize: '8px',
                              fontWeight: 800,
                              textAlign: 'center',
                              padding: '1px 0'
                            }}>
                              COVER
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add More Slot */}
                    {images.length < 6 && (
                      <label
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '8px',
                          border: '1.5px dashed #94A3B8',
                          background: '#F1F5F9',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#64748B',
                          fontSize: '9px',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        <Plus size={16} />
                        <span>Add</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleMultipleImageUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                )}

                {/* Optional URL Paste Bar */}
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <input
                    type="text"
                    placeholder="Or paste photo URL..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl(e);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.75rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: '#334155'
                    }}
                  >
                    + Add URL
                  </button>
                </div>
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
