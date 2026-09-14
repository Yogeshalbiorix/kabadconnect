import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Scale, 
  User, 
  Phone, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  Truck,
  ShieldCheck,
  Locate,
  Loader2,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { KABADWALA_PARTNERS } from '../../data/kabadwalas';
import { getUserCoordinates, reverseGeocodeMapbox, fetchLocationByPincode, detectCurrentLocationWithAddress } from '../../utils/geolocation';
import { getMapboxToken } from '../../utils/mapboxConfig';

export const BookingWizardModal = ({ 
  isOpen, 
  onClose, 
  initialScrapData = null,
  onBookingSuccess,
  activeCity = 'Delhi NCR',
  userLocation = null,
  onLocationDetected = null,
  currentUser = null
}) => {
  const [step, setStep] = useState(1);
  const [isLocatingAddress, setIsLocatingAddress] = useState(false);
  const [gpsAutoFilled, setGpsAutoFilled] = useState(false);
  
  // Step 1: Scrap items & estimated weight
  const [selectedCategories, setSelectedCategories] = useState(['paper', 'plastic']);
  const [weightBracket, setWeightBracket] = useState('20-50 kg');
  const [notes, setNotes] = useState('');

  // Step 2: Address & User Info
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    landmark: '',
    pincode: currentUser?.pincode || (activeCity.includes('Delhi') ? '201014' : ''),
    city: currentUser?.city || activeCity,
    hasLift: true,
    floor: '1'
  });

  // Step 3: Slot selection
  const [selectedSlot, setSelectedSlot] = useState('Today Express (Within 2 Hours)');

  // Step 4: Assigned partner
  const [assignedPartner, setAssignedPartner] = useState(KABADWALA_PARTNERS[0]);
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        phone: currentUser.phone || prev.phone,
        address: currentUser.address || prev.address,
        pincode: currentUser.pincode || prev.pincode,
        city: currentUser.city || prev.city
      }));
    } else if (userLocation) {
      setFormData(prev => ({
        ...prev,
        address: userLocation.street || userLocation.fullAddress?.split(',')[0] || prev.address,
        landmark: userLocation.locality ? `Near ${userLocation.locality}` : prev.landmark,
        pincode: userLocation.pincode || prev.pincode,
        city: userLocation.city || prev.city
      }));
      setGpsAutoFilled(true);
    }
  }, [activeCity, isOpen, userLocation, currentUser]);

  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [pincodeFeedback, setPincodeFeedback] = useState('');

  const handleBookingPincodeChange = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: clean }));

    if (clean.length === 6) {
      setIsFetchingPincode(true);
      setPincodeFeedback('Looking up postal data...');
      try {
        const res = await fetchLocationByPincode(clean);
        if (res.success) {
          setFormData(prev => ({
            ...prev,
            city: res.city ? `${res.area ? res.area + ', ' : ''}${res.city}` : prev.city,
            landmark: prev.landmark ? prev.landmark : (res.area ? `Near ${res.area}` : prev.landmark)
          }));
          setPincodeFeedback(`✓ ${res.area ? res.area + ', ' : ''}${res.city}, ${res.state}`);
        } else {
          setPincodeFeedback('⚠️ Pincode not found in postal database');
        }
      } catch (err) {
        setPincodeFeedback('');
      } finally {
        setIsFetchingPincode(false);
      }
    } else {
      setPincodeFeedback('');
    }
  };

  const handleUseCurrentLocationInBooking = async () => {
    setIsLocatingAddress(true);
    try {
      const token = getMapboxToken();
      const geo = await detectCurrentLocationWithAddress(token);
      if (geo && geo.success) {
        setFormData(prev => ({
          ...prev,
          address: geo.address || prev.address,
          landmark: geo.locality ? `Near ${geo.locality}` : prev.landmark,
          pincode: geo.pincode || prev.pincode,
          city: geo.city || prev.city
        }));
        setGpsAutoFilled(true);
        if (geo.pincode) {
          setPincodeFeedback(`✓ GPS: ${geo.city}${geo.state ? ', ' + geo.state : ''}`);
        }
        onLocationDetected?.(geo);
      }
    } catch (e) {
      alert('Could not detect location: ' + e.message);
    } finally {
      setIsLocatingAddress(false);
    }
  };

  useEffect(() => {
    if (initialScrapData) {
      const cats = [];
      if (initialScrapData.categories && Array.isArray(initialScrapData.categories)) {
        cats.push(...initialScrapData.categories);
      }
      if (initialScrapData.items && Array.isArray(initialScrapData.items)) {
        initialScrapData.items.forEach(it => {
          if (it.category && !cats.includes(it.category)) {
            cats.push(it.category);
          }
        });
      }
      if (initialScrapData.paperWeight > 0 && !cats.includes('paper')) cats.push('paper');
      if (initialScrapData.plasticWeight > 0 && !cats.includes('plastic')) cats.push('plastic');
      if (initialScrapData.metalWeight > 0 && !cats.includes('metal')) cats.push('metal');
      if (initialScrapData.ewasteUnits > 0 && !cats.includes('ewaste')) cats.push('ewaste');
      if (cats.length > 0) setSelectedCategories([...new Set(cats)]);

      if (initialScrapData.address || initialScrapData.pincode) {
        setFormData(prev => ({
          ...prev,
          name: initialScrapData.customerName || prev.name,
          phone: initialScrapData.phone || prev.phone,
          address: initialScrapData.address || prev.address,
          pincode: initialScrapData.pincode || prev.pincode
        }));
      }

      if (initialScrapData.estimatedWeight) {
        const ew = initialScrapData.estimatedWeight;
        if (typeof ew === 'string' && (ew.includes('20') || ew.includes('50') || ew.includes('100') || ew.includes('<'))) {
          setWeightBracket(ew);
        }
      } else if (initialScrapData.totalWeight) {
        const tw = initialScrapData.totalWeight;
        if (tw < 20) setWeightBracket('< 20 kg');
        else if (tw <= 50) setWeightBracket('20-50 kg');
        else if (tw <= 100) setWeightBracket('50-100 kg');
        else setWeightBracket('100+ kg Bulk');
      }
    }
  }, [initialScrapData]);

  if (!isOpen) return null;

  const toggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== catId));
      }
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      // Generate Booking
      const newId = `KC-${Math.floor(1000 + Math.random() * 9000)}`;
      setBookingId(newId);
      setAssignedPartner(KABADWALA_PARTNERS[0]);
      setStep(4);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Fallback gracefully
      }
    }
  };

  const handleFinish = () => {
    const newOrder = {
      id: bookingId,
      customerName: formData.name,
      phone: `+91 ${formData.phone}`,
      address: `${formData.address}, ${formData.city}`,
      pincode: formData.pincode,
      scheduledSlot: selectedSlot,
      status: 'in_transit',
      createdAt: new Date().toISOString(),
      categories: selectedCategories,
      estimatedWeight: weightBracket,
      estimatedAmount: initialScrapData?.estimatedRupees || 750,
      kabadwala: assignedPartner,
      userCoords: userLocation?.coords || null
    };

    onBookingSuccess(newOrder);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '640px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--color-accent-mint-soft)',
              color: 'var(--color-text-mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Truck size={18} />
            </div>
            <span>Schedule Doorstep Pickup</span>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Stepper Progression Bar */}
        <div style={{ padding: '1rem 1.25rem 0.5rem 1.25rem', background: 'var(--color-bg)' }}>
          <div className="stepper-container">
            <div className="stepper-line">
              <div 
                className="stepper-line-fill" 
                style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : step === 3 ? '85%' : '100%' }}
              />
            </div>

            {[
              { num: 1, label: 'Items' },
              { num: 2, label: 'Address' },
              { num: 3, label: 'Slot' },
              { num: 4, label: 'Confirmed' }
            ].map((s) => {
              const isCompleted = step > s.num;
              const isActive = step === s.num;
              return (
                <div 
                  key={s.num} 
                  className={`step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="step-circle">
                    {isCompleted ? <Check size={16} /> : s.num}
                  </div>
                  <span className="step-label">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body: Steps */}
        <div className="modal-body">
          {/* STEP 1: Scrap Categories & Estimated Weight */}
          {step === 1 && (
            <div className="animate-fade-in">
              {initialScrapData?.isReorder && (
                <div style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.85rem',
                  color: '#065F46'
                }}>
                  <RotateCcw size={16} color="#059669" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Reordering pickup ({initialScrapData.reorderedFromId})!</strong> Your scrap categories and doorstep address have been pre-filled.
                  </span>
                </div>
              )}
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.45rem' }}>
                What type of scrap do you want to sell?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                Select all that apply. Our partner brings appropriate digital scales and vehicle capacity.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                {[
                  { id: 'paper', label: '📄 Paper & Cardboard', desc: 'Newspaper, books, boxes' },
                  { id: 'plastic', label: '🧴 Plastics', desc: 'Bottles, containers, cans' },
                  { id: 'metal', label: '🔩 Metals (Iron, Copper)', desc: 'Pipes, utensils, grills' },
                  { id: 'ewaste', label: '💻 E-Waste & Appliances', desc: 'Old electronics, AC, fridge' },
                  { id: 'battery', label: '🔋 Vehicle & Battery', desc: 'Inverter battery, cycle scrap' },
                  { id: 'other', label: '📦 Mixed Dry Waste', desc: 'Other recyclable dry items' }
                ].map((item) => {
                  const isChecked = selectedCategories.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCategory(item.id)}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: isChecked ? '2px solid var(--color-accent-mint)' : '1px solid var(--color-border)',
                        background: isChecked ? 'var(--color-accent-mint-soft)' : 'var(--color-surface)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isChecked ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                          {item.label}
                        </span>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: isChecked ? 'none' : '1.5px solid #94A3B8',
                          background: isChecked ? 'var(--color-accent-mint)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF'
                        }}>
                          {isChecked && <Check size={12} />}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {item.desc}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimated Weight Bracket */}
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                Estimated Total Weight:
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
                marginBottom: '1.25rem'
              }}>
                {['< 20 kg', '20-50 kg', '50-100 kg', '100+ kg Bulk'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeightBracket(w)}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      background: weightBracket === w ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: weightBracket === w ? '#FFFFFF' : 'var(--color-text-primary)',
                      border: `1px solid ${weightBracket === w ? 'var(--color-primary)' : 'var(--color-border)'}`
                    }}
                  >
                    {w}
                  </button>
                ))}
              </div>

              {/* Special notes */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notes for Collector (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Please bring extra bags, 4th floor, buzzer 402"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Location & Address */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.45rem' }}>
                Where should the kabadwala arrive?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Pickup is 100% free at your doorstep. No lifting or carrying needed.
              </p>

              {/* GPS Auto-Fill Quick Action Banner */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 0.95rem',
                background: gpsAutoFilled ? 'var(--color-accent-mint-soft)' : 'rgba(16, 185, 129, 0.08)',
                border: `1.5px solid ${gpsAutoFilled ? 'var(--color-accent-mint)' : 'rgba(16, 185, 129, 0.3)'}`,
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  <MapPin size={16} color="var(--color-accent-mint)" />
                  <span>{gpsAutoFilled ? `✓ Doorstep populated from Live GPS` : `Detect exact doorstep via GPS:`}</span>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocationInBooking}
                  disabled={isLocatingAddress}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: isLocatingAddress ? 'wait' : 'pointer',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  {isLocatingAddress ? <Loader2 size={13} className="animate-spin" /> : <Locate size={13} />}
                  <span>{isLocatingAddress ? 'Locating...' : 'Auto-fill Current Location'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ paddingLeft: '36px' }}
                    />
                    <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (For OTP/Call)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 98100 23456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ paddingLeft: '36px' }}
                    />
                    <Phone size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">House / Flat No., Apartment / Building Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Flat 402, Block B, Society Name"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Locality / Landmark</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Near Metro Station / Landmark"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Pincode</label>
                    {isFetchingPincode && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Loader2 size={10} className="animate-spin" /> Looking up...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    className="form-input"
                    value={formData.pincode}
                    onChange={(e) => handleBookingPincodeChange(e.target.value)}
                    placeholder="e.g. 201014"
                  />
                  {pincodeFeedback && (
                    <div style={{
                      fontSize: '0.72rem',
                      marginTop: '0.25rem',
                      color: pincodeFeedback.startsWith('✓') ? '#0D5C3A' : '#DC2626',
                      fontWeight: 600
                    }}>
                      {pincodeFeedback}
                    </div>
                  )}
                </div>
              </div>

              {/* Lift and floor details */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Building2 size={20} color="var(--color-primary)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Service Lift Available?</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Helps agent bring heavy-duty trolley</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasLift: !formData.hasLift })}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: formData.hasLift ? 'var(--color-accent-mint-soft)' : 'var(--color-bg-alt)',
                    color: formData.hasLift ? 'var(--color-text-mint)' : 'var(--color-text-muted)',
                    border: `1px solid ${formData.hasLift ? 'var(--color-accent-mint)' : 'var(--color-border)'}`
                  }}
                >
                  {formData.hasLift ? '✓ Yes, Lift Available' : 'No Lift (Stairs)'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Time Slot Selection */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.45rem' }}>
                Select Preferred Pickup Time Slot
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                Our nearby partner will call 15 minutes prior to arrival.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {[
                  {
                    title: 'Today Express (Within 2 Hours)',
                    badge: 'Fastest ⚡',
                    desc: 'Nearest verified collector will arrive between 45 - 90 minutes'
                  },
                  {
                    title: 'Tomorrow Morning (9:00 AM - 12:00 PM)',
                    badge: 'Popular',
                    desc: 'Ideal for weekend deep cleaning & newspaper piles'
                  },
                  {
                    title: 'Tomorrow Afternoon (2:00 PM - 5:00 PM)',
                    badge: 'Convenient',
                    desc: 'Afternoon doorstep service with instant weighing'
                  },
                  {
                    title: 'Upcoming Sunday Slot (10:00 AM - 1:00 PM)',
                    badge: 'Weekend',
                    desc: 'Full family cleanout schedule'
                  }
                ].map((slot) => {
                  const isSelected = selectedSlot === slot.title;
                  return (
                    <div
                      key={slot.title}
                      onClick={() => setSelectedSlot(slot.title)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--color-accent-mint)' : '1px solid var(--color-border)',
                        background: isSelected ? 'var(--color-accent-mint-soft)' : 'var(--color-surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '6px solid var(--color-accent-mint)' : '2px solid #CBD5E1',
                          background: '#FFFFFF'
                        }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>{slot.title}</span>
                            <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{slot.badge}</span>
                          </div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                            {slot.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Zero fee guarantee notice */}
              <div style={{
                padding: '0.85rem 1rem',
                background: 'rgba(13, 92, 58, 0.05)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(13, 92, 58, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}>
                <ShieldCheck size={20} color="var(--color-primary)" />
                <span style={{ fontSize: '0.825rem', color: 'var(--color-primary)' }}>
                  <strong>Zero Convenience Charge:</strong> Doorstep pickup and weighing are 100% free. You only receive payment for your scrap.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation & Partner Match */}
          {step === 4 && (
            <div className="animate-fade-in text-center" style={{ padding: '1rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--color-accent-mint-soft)',
                color: 'var(--color-accent-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.15)'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontSize: '1.45rem', marginBottom: '0.35rem' }}>
                Pickup Scheduled Successfully!
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Booking ID: <strong style={{ color: 'var(--color-primary)' }}>{bookingId}</strong>
              </p>

              {/* Matched Partner Card */}
              <div style={{
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: '1px solid var(--color-border)',
                textAlign: 'left',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Assigned Scrap Collection Partner
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={assignedPartner.photo}
                    alt={assignedPartner.name}
                    style={{ width: '60px', height: '60px', borderRadius: '14px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{assignedPartner.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      {assignedPartner.businessName} • {assignedPartner.vehicle}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center' }}>
                      <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.85rem' }}>★ {assignedPartner.rating}</span>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Digital Scale Verified</span>
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>ETA: ~35 Mins</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary snippet */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                fontSize: '0.85rem',
                textAlign: 'left',
                marginBottom: '1.5rem'
              }}>
                <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Pickup Slot:</div>
                  <strong>{selectedSlot.split('(')[0]}</strong>
                </div>
                <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Location:</div>
                  <strong>{formData.landmark}, {formData.pincode}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {step > 1 && step < 4 && (
            <button
              onClick={() => setStep(step - 1)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          {step < 3 && (
            <button
              onClick={handleNext}
              className="btn btn-primary"
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleNext}
              className="btn btn-accent btn-lg"
            >
              <Sparkles size={17} />
              <span>Confirm Doorstep Pickup</span>
            </button>
          )}

          {step === 4 && (
            <button
              onClick={handleFinish}
              className="btn btn-primary btn-full btn-lg"
            >
              <span>View Live Order Tracker & Receipt</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
