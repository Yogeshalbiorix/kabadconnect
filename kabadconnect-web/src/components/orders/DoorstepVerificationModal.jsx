import React, { useState, useEffect } from 'react';
import { 
  X, 
  Scale, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Send, 
  CreditCard, 
  DollarSign, 
  Wallet, 
  Building2, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Clock, 
  Award, 
  Copy, 
  Check, 
  Truck, 
  User, 
  QrCode, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { SCRAP_ITEMS } from '../../data/scrapRates';

export const DoorstepVerificationModal = ({
  isOpen,
  onClose,
  order,
  onUpdateOrder,
  currentUser = null
}) => {
  if (!isOpen || !order) return null;

  // View mode: 'collector' (Kabadwala) vs 'customer' (User) for interactive simulation
  const [activeRole, setActiveRole] = useState('collector');

  // Inspected items state (defaults from order.itemsWeighed or order.items or initial estimates)
  const [inspectedItems, setInspectedItems] = useState(() => {
    if (order.doorstepVerification?.inspectedItems && order.doorstepVerification.inspectedItems.length > 0) {
      return order.doorstepVerification.inspectedItems;
    }
    if (order.itemsWeighed && order.itemsWeighed.length > 0) {
      return order.itemsWeighed.map((it, idx) => ({
        id: `item-${idx}`,
        name: it.name,
        weight: parseFloat(String(it.weight).replace(/[^0-9.]/g, '')) || 10,
        rate: parseFloat(String(it.rate).replace(/[^0-9.]/g, '')) || 14,
        unit: 'kg'
      }));
    }
    if (order.items && order.items.length > 0) {
      return order.items.map((it, idx) => ({
        id: `item-${idx}`,
        name: it.name,
        weight: parseFloat(it.estimatedWeight || it.weight) || 10,
        rate: parseFloat(it.rate) || 15,
        unit: it.unit || 'kg'
      }));
    }
    if (order.categories && order.categories.length > 0) {
      return order.categories.map((cat, idx) => ({
        id: `item-${idx}`,
        name: String(cat).charAt(0).toUpperCase() + String(cat).slice(1) + ' Scrap',
        weight: 10,
        rate: 15,
        unit: 'kg'
      }));
    }
    return [
      { id: 'item-0', name: 'Household Scrap', weight: parseFloat(order.estimatedWeight) || 10, rate: 15, unit: 'kg' }
    ];
  });

  // OTP State
  const [otpCode, setOtpCode] = useState(() => order.doorstepVerification?.otp || '');
  const [otpInput, setOtpInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(() => Boolean(order.doorstepVerification?.otp));
  const [isOtpVerified, setIsOtpVerified] = useState(() => Boolean(order.doorstepVerification?.isVerified));
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds
  const [isCopied, setIsCopied] = useState(false);
  const [showSmsAlert, setShowSmsAlert] = useState(false);

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'cash', 'wallet', 'bank'
  const [upiId, setUpiId] = useState(order.upiId || currentUser?.upiId || '');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(() => {
    if (order.status === 'completed' && order.doorstepVerification?.paymentStatus === 'completed') {
      return {
        transactionRef: order.doorstepVerification?.transactionRef || 'UTR-9821882',
        paidAmount: order.doorstepVerification?.paidAmount || order.totalPaid || 727,
        paymentMethod: order.doorstepVerification?.paymentMethod || 'Instant UPI'
      };
    }
    return null;
  });

  // Calculate live total weight and total payout
  const totalWeight = inspectedItems.reduce((acc, curr) => acc + (parseFloat(curr.weight) || 0), 0);
  const totalAmount = inspectedItems.reduce((acc, curr) => {
    const w = parseFloat(curr.weight) || 0;
    const r = parseFloat(curr.rate) || 0;
    return acc + Math.round(w * r);
  }, 0);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isOtpSent && !isOtpVerified && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, isOtpVerified, otpTimer]);

  // Item inspection handlers
  const handleUpdateItemWeight = (id, newWeight) => {
    if (isOtpVerified) return; // Locked once verified
    setInspectedItems(inspectedItems.map(it => it.id === id ? { ...it, weight: Math.max(0, parseFloat(newWeight) || 0) } : it));
  };

  const handleUpdateItemRate = (id, newRate) => {
    if (isOtpVerified) return;
    setInspectedItems(inspectedItems.map(it => it.id === id ? { ...it, rate: Math.max(0, parseFloat(newRate) || 0) } : it));
  };

  const handleRemoveItem = (id) => {
    if (isOtpVerified) return;
    if (inspectedItems.length <= 1) {
      alert('At least one scrap item is required for doorstep inspection.');
      return;
    }
    setInspectedItems(inspectedItems.filter(it => it.id !== id));
  };

  const handleAddItem = () => {
    if (isOtpVerified) return;
    const randomScrap = SCRAP_ITEMS[Math.floor(Math.random() * SCRAP_ITEMS.length)] || {
      name: 'Mixed Plastics',
      rate: 12,
      unit: 'kg'
    };
    const newItem = {
      id: `item-${Date.now()}`,
      name: randomScrap.name,
      weight: 5.0,
      rate: randomScrap.rate || 15,
      unit: randomScrap.unit || 'kg'
    };
    setInspectedItems([...inspectedItems, newItem]);
  };

  // STEP 2: GENERATE & SEND OTP TO CUSTOMER
  const handleSendOtp = () => {
    // Generate secure 4-digit confirmation OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCode(generatedOtp);
    setIsOtpSent(true);
    setOtpTimer(600);
    setOtpError('');
    setShowSmsAlert(true);

    const formattedWeighed = inspectedItems.map(it => ({
      name: it.name,
      weight: `${it.weight} ${it.unit}`,
      rate: `₹${it.rate}/${it.unit}`,
      subtotal: Math.round(it.weight * it.rate)
    }));

    // Update parent order state
    if (onUpdateOrder) {
      onUpdateOrder(order.id, {
        status: 'weighing',
        doorstepVerification: {
          otp: generatedOtp,
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          isVerified: false,
          paymentStatus: 'locked',
          inspectedItems: formattedWeighed,
          paidAmount: totalAmount
        },
        itemsWeighed: formattedWeighed,
        totalPaid: totalAmount,
        sendDoorstepOtpEmail: true,
        customerEmail: order.customer?.email || order.email
      });
    }
  };

  // STEP 3: VERIFY OTP
  const handleVerifyOtp = (e) => {
    e?.preventDefault?.();
    if (!otpInput.trim()) {
      setOtpError('Please enter the 4-digit OTP received by the customer.');
      return;
    }
    if (otpInput.trim() !== otpCode.trim()) {
      setOtpError('❌ Incorrect OTP. Please check with customer and try again.');
      return;
    }

    // OTP Validated!
    setIsOtpVerified(true);
    setOtpError('');

    const formattedWeighed = inspectedItems.map(it => ({
      name: it.name,
      weight: `${it.weight} ${it.unit}`,
      rate: `₹${it.rate}/${it.unit}`,
      subtotal: Math.round(it.weight * it.rate)
    }));

    if (onUpdateOrder) {
      onUpdateOrder(order.id, {
        doorstepVerification: {
          otp: otpCode,
          isVerified: true,
          verifiedAt: new Date().toISOString(),
          paymentStatus: 'pending', // Unlocked for payment!
          inspectedItems: formattedWeighed,
          paidAmount: totalAmount
        }
      });
    }
  };

  // Copy OTP helper
  const handleCopyOtp = () => {
    if (otpCode) {
      navigator.clipboard.writeText(otpCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // STEP 4: PROCESS UNLOCKED PAYMENT
  const handleDisbursePayment = async () => {
    if (!isOtpVerified) {
      alert('Security Alert: OTP confirmation is required before processing payment.');
      return;
    }

    setIsProcessingPayment(true);

    // Simulate banking / payment settlement latency
    setTimeout(() => {
      const generatedUtr = paymentMethod === 'cash' 
        ? `CASH-${Date.now().toString().slice(-6)}` 
        : `UTR-${Date.now().toString().slice(-8)}`;

      const paymentRecord = {
        transactionRef: generatedUtr,
        paidAmount: totalAmount,
        paymentMethod: paymentMethod === 'upi' ? `Instant UPI (${upiId})` : 
                       paymentMethod === 'cash' ? 'Doorstep Cash Handover' : 
                       paymentMethod === 'wallet' ? 'KabadCollect Eco Wallet' : 'Bank IMPS Transfer',
        paidAt: new Date().toISOString()
      };

      setPaymentSuccessData(paymentRecord);
      setIsProcessingPayment(false);

      const formattedWeighed = inspectedItems.map(it => ({
        name: it.name,
        weight: `${it.weight} ${it.unit}`,
        rate: `₹${it.rate}/${it.unit}`,
        subtotal: Math.round(it.weight * it.rate)
      }));

      if (onUpdateOrder) {
        onUpdateOrder(order.id, {
          status: 'completed',
          doorstepVerification: {
            otp: otpCode,
            isVerified: true,
            verifiedAt: new Date().toISOString(),
            paymentStatus: 'completed',
            paymentMethod: paymentRecord.paymentMethod,
            transactionRef: generatedUtr,
            paidAmount: totalAmount,
            inspectedItems: formattedWeighed
          },
          totalPaid: totalAmount,
          paymentMethod: paymentRecord.paymentMethod,
          itemsWeighed: formattedWeighed,
          carbonOffsetKg: (totalWeight * 1.45).toFixed(1)
        });
      }
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1300 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          width: '96%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          background: '#F8FAFC',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #072e1c 0%, #0D5C3A 65%, #10B981 100%)',
          color: '#FFFFFF',
          padding: '1.25rem 1.75rem',
          position: 'relative'
        }}>
          <div className="flex-between" style={{ alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34D399'
              }}>
                <Scale size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                    Doorstep Scrap Inspection & Payment
                  </h3>
                  <span style={{
                    background: isOtpVerified ? '#10B981' : '#F59E0B',
                    color: '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    {isOtpVerified ? '✓ OTP Verified' : '● Verification Pending'}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: '0.2rem' }}>
                  Booking ID: <strong>{order.id}</strong> • Customer: <strong>{order.customerName || order.customer?.name}</strong> ({order.phone || order.customer?.phone})
                </div>
              </div>
            </div>

            <button 
              onClick={onClose} 
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Interactive Role Switcher Toggle (Collector vs Customer) */}
          <div style={{
            marginTop: '1rem',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: 'var(--radius-full)',
            padding: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <button
              onClick={() => setActiveRole('collector')}
              style={{
                background: activeRole === 'collector' ? '#FFFFFF' : 'transparent',
                color: activeRole === 'collector' ? '#064E3B' : '#E2E8F0',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Truck size={14} />
              <span>Kabadwala (Collector View)</span>
            </button>

            <button
              onClick={() => setActiveRole('customer')}
              style={{
                background: activeRole === 'customer' ? '#FFFFFF' : 'transparent',
                color: activeRole === 'customer' ? '#064E3B' : '#E2E8F0',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
            >
              <User size={14} />
              <span>Customer (User View)</span>
            </button>
          </div>
        </div>

        {/* Live Customer SMS / Push Notification Alert Banner */}
        {showSmsAlert && isOtpSent && !paymentSuccessData && (
          <div style={{
            background: 'linear-gradient(90deg, #1E1B4B 0%, #312E81 100%)',
            color: '#FFFFFF',
            padding: '0.85rem 1.5rem',
            borderBottom: '1px solid #4338CA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Smartphone size={18} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#A5B4FC', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Simulated SMS to {order.phone || order.customer?.phone || '+91 98100 23456'}
                </div>
                <div style={{ fontSize: '0.86rem', color: '#FFFFFF', fontWeight: 500 }}>
                  KabadCollect: Your doorstep pickup OTP for #{order.id} is <strong style={{ color: '#FDE047', fontSize: '1.05rem', letterSpacing: '2px', background: 'rgba(253, 224, 71, 0.2)', padding: '1px 6px', borderRadius: '4px' }}>{otpCode}</strong>. Total inspected payout: ₹{totalAmount}. Share this OTP with collector after verifying scrap weight.
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyOtp}
              style={{
                background: '#4F46E5',
                color: '#FFFFFF',
                border: '1px solid #6366F1',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                flexShrink: 0
              }}
            >
              {isCopied ? <Check size={14} color="#34D399" /> : <Copy size={14} />}
              <span>{isCopied ? 'Copied' : 'Copy OTP'}</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>

          {/* If Payment is already completed, show final receipt & certificate */}
          {paymentSuccessData ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid #34D399',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <span style={{
                background: '#DCFCE7',
                color: '#166534',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                Doorstep Pickup Completed & Settled
              </span>

              <h2 style={{ fontSize: '1.8rem', color: '#0F172A', margin: '0.75rem 0 0.35rem 0', fontWeight: 800 }}>
                ₹{paymentSuccessData.paidAmount.toLocaleString()} Paid
              </h2>

              <p style={{ color: '#64748B', fontSize: '0.88rem', margin: 0 }}>
                Paid to customer via <strong>{paymentSuccessData.paymentMethod}</strong>
              </p>
              <div style={{ fontSize: '0.8rem', color: '#0D5C3A', fontWeight: 700, marginTop: '0.4rem' }}>
                Transaction Ref / UTR: <span style={{ fontFamily: 'monospace' }}>{paymentSuccessData.transactionRef}</span>
              </div>

              {/* Breakdown */}
              <div style={{
                margin: '1.5rem 0',
                background: '#F8FAFC',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                border: '1px solid #E2E8F0',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  Verified Scrap Items Collected ({totalWeight} kg)
                </div>
                {inspectedItems.map(it => (
                  <div key={it.id} className="flex-between" style={{ fontSize: '0.84rem', padding: '0.35rem 0', borderBottom: '1px dashed #E2E8F0' }}>
                    <span>{it.name} ({it.weight} {it.unit} @ ₹{it.rate}/{it.unit})</span>
                    <strong>₹{Math.round(it.weight * it.rate)}</strong>
                  </div>
                ))}
              </div>

              {/* Eco Badge */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ padding: '0.85rem', background: '#ECFDF5', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>CO₂ Diverted</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#065F46' }}>{(totalWeight * 1.45).toFixed(1)} kg</div>
                </div>
                <div style={{ padding: '0.85rem', background: '#FEF3C7', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 700 }}>Eco Green Points</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#92400E' }}>+{Math.round(totalAmount / 10)} Pts</div>
                </div>
              </div>

              <button onClick={onClose} className="btn btn-primary btn-full">
                Done & Close
              </button>
            </div>
          ) : (
            <>
              {/* STEP 1: ITEM INSPECTION & DIGITAL SCALE */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      1
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.98rem' }}>
                      Kabadwala Doorstep Item Inspection & Weighing
                    </span>
                  </div>

                  {!isOtpVerified && (
                    <button
                      onClick={handleAddItem}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={13} /> Add Scrap Item
                    </button>
                  )}
                </div>

                {/* Items Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                        <th style={{ padding: '0.6rem 0.75rem' }}>Scrap Category / Item</th>
                        <th style={{ padding: '0.6rem 0.75rem', width: '130px' }}>Weight (kg)</th>
                        <th style={{ padding: '0.6rem 0.75rem', width: '110px' }}>Rate (₹)</th>
                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Amount</th>
                        {!isOtpVerified && <th style={{ padding: '0.6rem 0.5rem', width: '35px' }}></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {inspectedItems.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#0F172A' }}>
                            {item.name}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem' }}>
                            {isOtpVerified ? (
                              <span style={{ fontWeight: 700 }}>{item.weight} {item.unit}</span>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0.1"
                                  value={item.weight}
                                  onChange={(e) => handleUpdateItemWeight(item.id, e.target.value)}
                                  className="form-input"
                                  style={{ padding: '0.25rem 0.45rem', fontSize: '0.85rem', width: '70px', fontWeight: 700 }}
                                />
                                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.unit}</span>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem' }}>
                            {isOtpVerified ? (
                              <span>₹{item.rate}/{item.unit}</span>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>₹</span>
                                <input
                                  type="number"
                                  step="1"
                                  min="1"
                                  value={item.rate}
                                  onChange={(e) => handleUpdateItemRate(item.id, e.target.value)}
                                  className="form-input"
                                  style={{ padding: '0.25rem 0.45rem', fontSize: '0.85rem', width: '60px' }}
                                />
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                            ₹{Math.round(item.weight * item.rate)}
                          </td>
                          {!isOtpVerified && (
                            <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                                title="Remove item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal Summary Bar */}
                <div className="flex-between" style={{
                  marginTop: '1rem',
                  padding: '0.85rem 1rem',
                  background: 'var(--color-accent-mint-soft)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-mint)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Total Verified Weight
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {totalWeight.toFixed(1)} kg
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-mint)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Calculated Doorstep Payout
                    </span>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      ₹{totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Trigger OTP dispatch button if not yet sent */}
                {!isOtpSent && !isOtpVerified && (
                  <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={handleSendOtp}
                      className="btn btn-primary"
                      style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Send size={15} />
                      <span>Send Confirmation OTP to Customer</span>
                    </button>
                  </div>
                )}
              </div>

              {/* STEP 2: CUSTOMER CONFIRMATION OTP SECTION */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: isOtpVerified ? '2px solid #10B981' : isOtpSent ? '2px solid #3B82F6' : '1px solid var(--color-border)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div className="flex-between" style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isOtpVerified ? '#10B981' : 'var(--color-primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      {isOtpVerified ? <Check size={14} /> : '2'}
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.98rem' }}>
                      Customer Doorstep OTP Verification
                    </span>
                  </div>

                  {isOtpVerified ? (
                    <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={16} /> Verified by Customer
                    </span>
                  ) : isOtpSent ? (
                    <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700 }}>
                      ⏱️ OTP expires in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      Awaiting item inspection
                    </span>
                  )}
                </div>

                {!isOtpSent ? (
                  <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', color: '#64748B', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Info size={18} color="#94A3B8" />
                    <span>Please complete scrap item weighing above and click <strong>"Send Confirmation OTP"</strong>.</span>
                  </div>
                ) : isOtpVerified ? (
                  <div style={{
                    padding: '1rem 1.25rem',
                    background: '#ECFDF5',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #A7F3D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#065F46', fontSize: '0.92rem' }}>
                        ✓ Scrap Inspection Authenticated & Confirmed
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#047857' }}>
                        Customer confirmed {totalWeight} kg scrap for payout of ₹{totalAmount}. Payment gate unlocked.
                      </div>
                    </div>

                    <span style={{
                      background: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      color: '#065F46',
                      border: '1px solid #34D399'
                    }}>
                      OTP: {otpCode}
                    </span>
                  </div>
                ) : (
                  /* OTP Entry Form */
                  <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0 }}>
                      Kabadwala should ask the customer for the 4-digit confirmation OTP sent to their mobile (or displayed above in SMS simulation).
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        maxLength="4"
                        placeholder="Enter 4-digit OTP"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        className="form-input"
                        style={{
                          maxWidth: '180px',
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          letterSpacing: '6px',
                          textAlign: 'center',
                          padding: '0.5rem 0.75rem'
                        }}
                        autoFocus
                      />

                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
                      >
                        <ShieldCheck size={16} />
                        <span>Verify & Confirm OTP</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <RotateCcw size={13} />
                        <span>Resend OTP</span>
                      </button>
                    </div>

                    {otpError && (
                      <div style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={14} />
                        <span>{otpError}</span>
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* STEP 3: PAYMENT GATEWAY (LOCKED UNTIL OTP VERIFIED) */}
              <div style={{
                background: isOtpVerified ? '#FFFFFF' : '#F1F5F9',
                borderRadius: 'var(--radius-lg)',
                border: isOtpVerified ? '2px solid #10B981' : '1px solid #CBD5E1',
                padding: '1.25rem',
                boxShadow: isOtpVerified ? 'var(--shadow-md)' : 'none',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isOtpVerified ? 'var(--color-primary)' : '#94A3B8',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      {isOtpVerified ? <Unlock size={14} /> : <Lock size={14} />}
                    </div>
                    <span style={{
                      fontWeight: 800,
                      color: isOtpVerified ? 'var(--color-primary)' : '#64748B',
                      fontSize: '0.98rem'
                    }}>
                      Step 3: Disburse Payment to Customer (₹{totalAmount})
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: isOtpVerified ? '#DCFCE7' : '#E2E8F0',
                    color: isOtpVerified ? '#166534' : '#64748B'
                  }}>
                    {isOtpVerified ? '🔓 UNLOCKED' : '🔒 LOCKED'}
                  </span>
                </div>

                {!isOtpVerified ? (
                  /* LOCKED STATE NOTICE */
                  <div style={{
                    padding: '1.75rem 1.25rem',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px dashed #CBD5E1'
                  }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#F1F5F9',
                      color: '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.75rem auto'
                    }}>
                      <Lock size={22} />
                    </div>
                    <h4 style={{ color: '#334155', margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>
                      Payment Options Locked
                    </h4>
                    <p style={{ color: '#64748B', fontSize: '0.8rem', maxWidth: '420px', margin: '0 auto' }}>
                      Payment can only be transferred after the customer verifies the scrap weights and confirms the 4-digit OTP.
                    </p>
                  </div>
                ) : (
                  /* UNLOCKED PAYMENT CONTROLS */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '0.65rem'
                    }}>
                      {[
                        { id: 'upi', label: 'Instant UPI', icon: Sparkles, desc: 'GPay, PhonePe, Paytm' },
                        { id: 'cash', label: 'Doorstep Cash', icon: DollarSign, desc: 'Direct cash handover' },
                        { id: 'wallet', label: 'Eco Wallet', icon: Wallet, desc: '+5% Green Coins' },
                        { id: 'bank', label: 'Bank IMPS', icon: Building2, desc: 'Direct Account Payout' }
                      ].map(method => {
                        const Icon = method.icon;
                        const isSelected = paymentMethod === method.id;
                        return (
                          <div
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            style={{
                              padding: '0.85rem',
                              borderRadius: 'var(--radius-md)',
                              border: isSelected ? '2px solid var(--color-primary)' : '1px solid #E2E8F0',
                              background: isSelected ? 'var(--color-accent-mint-soft)' : '#FFFFFF',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Icon size={18} color={isSelected ? 'var(--color-primary)' : '#64748B'} />
                              <div style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                border: isSelected ? '4px solid var(--color-primary)' : '1px solid #CBD5E1',
                                background: '#FFFFFF'
                              }} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A', marginTop: '0.35rem' }}>
                              {method.label}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                              {method.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Method Specific Fields */}
                    {paymentMethod === 'upi' && (
                      <div style={{
                        padding: '1rem',
                        background: '#F8FAFC',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem'
                      }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                          Customer UPI ID (VPA) for Instant Doorstep Credit:
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="e.g. mobile@upi or username@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="form-input"
                            style={{ flex: 1, fontSize: '0.88rem', fontWeight: 600 }}
                          />
                          <button
                            type="button"
                            onClick={() => alert('Customer QR scanner camera activated')}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <QrCode size={15} /> Scan QR
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'cash' && (
                      <div style={{
                        padding: '0.85rem 1rem',
                        background: '#FFFBEB',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #FDE68A',
                        fontSize: '0.82rem',
                        color: '#92400E'
                      }}>
                        💵 Hand over exactly <strong>₹{totalAmount}</strong> physical cash to the customer. A digital confirmation receipt with collector stamp will be generated.
                      </div>
                    )}

                    {paymentMethod === 'wallet' && (
                      <div style={{
                        padding: '0.85rem 1rem',
                        background: '#ECFDF5',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #A7F3D0',
                        fontSize: '0.82rem',
                        color: '#065F46'
                      }}>
                        🌿 Instant transfer of <strong>₹{totalAmount}</strong> + <strong>₹{Math.round(totalAmount * 0.05)} Bonus Green Coins</strong> credited to customer's KabadCollect Wallet.
                      </div>
                    )}

                    {paymentMethod === 'bank' && (
                      <div style={{
                        padding: '0.85rem 1rem',
                        background: '#F8FAFC',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.82rem',
                        color: '#334155'
                      }}>
                        🏦 Direct IMPS payout dispatched to verified bank account ending in <strong>••••4892</strong> (HDFC Bank).
                      </div>
                    )}

                    {/* Final Pay Button */}
                    <button
                      onClick={handleDisbursePayment}
                      disabled={isProcessingPayment}
                      className="btn btn-primary"
                      style={{
                        padding: '0.75rem',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 14px rgba(13, 92, 58, 0.25)'
                      }}
                    >
                      {isProcessingPayment ? (
                        <>Processing Secure Transfer...</>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          <span>Complete & Pay ₹{totalAmount.toLocaleString()} ({paymentMethod.toUpperCase()})</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.85rem 1.5rem',
          background: '#FFFFFF',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            🔒 Verified Doorstep Recycling Protocol • KabadCollect Anti-Fraud Engine
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
