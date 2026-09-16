import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Scale, 
  Wallet, 
  Award, 
  Truck, 
  AlertCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  FileCheck,
  Lock
} from 'lucide-react';
import { INITIAL_ORDERS } from '../../data/mockOrders';
import { OrderRouteMap } from './OrderRouteMap';

export const LiveOrderTrackerModal = ({ 
  isOpen, 
  onClose, 
  activeOrder = null,
  onOpenDoorstepVerification = null 
}) => {
  const [currentOrder, setCurrentOrder] = useState(activeOrder || null);
  const [searchId, setSearchId] = useState('');
  const [simulatedStage, setSimulatedStage] = useState(() => {
    if (activeOrder?.status === 'completed') return 4;
    if (activeOrder?.status === 'weighing') return 3;
    return 2;
  });
  const [showCertificate, setShowCertificate] = useState(false);

  // Dynamic extraction of user's selected items and weights
  const displayItems = React.useMemo(() => {
    if (!currentOrder) return [];
    if (currentOrder.itemsWeighed && currentOrder.itemsWeighed.length > 0) {
      return currentOrder.itemsWeighed.map(it => {
        const wtNum = parseFloat(String(it.weight).replace(/[^0-9.]/g, '')) || 10;
        const rtNum = parseFloat(String(it.rate).replace(/[^0-9.]/g, '')) || 15;
        const sub = it.subtotal || Math.round(wtNum * rtNum);
        return {
          name: it.name,
          weightStr: typeof it.weight === 'string' && it.weight.includes('kg') ? it.weight : `${wtNum} kg`,
          rateStr: typeof it.rate === 'string' && it.rate.includes('₹') ? it.rate : `₹${rtNum}/kg`,
          subtotal: sub
        };
      });
    }
    if (currentOrder.doorstepVerification?.inspectedItems && currentOrder.doorstepVerification.inspectedItems.length > 0) {
      return currentOrder.doorstepVerification.inspectedItems.map(it => ({
        name: it.name,
        weightStr: `${it.weight} ${it.unit || 'kg'}`,
        rateStr: `₹${it.rate}/${it.unit || 'kg'}`,
        subtotal: Math.round((parseFloat(it.weight) || 0) * (parseFloat(it.rate) || 0))
      }));
    }
    if (currentOrder.items && currentOrder.items.length > 0) {
      return currentOrder.items.map(it => {
        const wtNum = parseFloat(it.estimatedWeight || it.weight) || 10;
        const rtNum = parseFloat(it.rate) || 15;
        return {
          name: it.name,
          weightStr: `${wtNum} ${it.unit || 'kg'}`,
          rateStr: `₹${rtNum}/${it.unit || 'kg'}`,
          subtotal: Math.round(wtNum * rtNum)
        };
      });
    }
    if (currentOrder.categories && currentOrder.categories.length > 0) {
      return currentOrder.categories.map(cat => ({
        name: String(cat).charAt(0).toUpperCase() + String(cat).slice(1) + ' Scrap',
        weightStr: '10 kg',
        rateStr: '₹15/kg',
        subtotal: 150
      }));
    }
    return [];
  }, [currentOrder]);

  const displayTotalAmount = currentOrder
    ? (currentOrder.doorstepVerification?.paidAmount || 
       currentOrder.totalPaid || 
       currentOrder.estimatedAmount || 
       currentOrder.estimatedRupees || 
       displayItems.reduce((acc, it) => acc + (it.subtotal || 0), 0))
    : 0;

  useEffect(() => {
    if (activeOrder) {
      setCurrentOrder(activeOrder);
      if (activeOrder.status === 'completed') setSimulatedStage(4);
      else if (activeOrder.status === 'weighing') setSimulatedStage(3);
      else if (activeOrder.status === 'in_transit' || activeOrder.status === 'en_route') setSimulatedStage(2);
      else if (activeOrder.status === 'assigned') setSimulatedStage(1);
      else setSimulatedStage(0);
    }
  }, [activeOrder]);

  if (!isOpen) return null;

  const stages = [
    { title: 'Booking Confirmed', desc: 'Order verified by KabadCollect' },
    { title: 'Partner Assigned', desc: 'Nearest dealer accepted your pickup' },
    { title: 'Agent En Route', desc: 'Collector is traveling to your location' },
    { title: 'Digital Weighing', desc: 'Live weight verification & calculation' },
    { title: 'Payment Completed', desc: 'Instant UPI / Cash payout transferred' }
  ];

  const handleSearchOrder = (e) => {
    e.preventDefault();
    const found = INITIAL_ORDERS.find(o => o.id.toLowerCase() === searchId.trim().toLowerCase());
    if (found) {
      setCurrentOrder(found);
      setSimulatedStage(found.status === 'completed' ? 4 : 2);
    } else {
      alert(`Booking ID "${searchId}" not found. Please verify your order ID.`);
    }
  };

  const isOtpVerified = Boolean(
    currentOrder?.doorstepVerification?.isVerified || 
    currentOrder?.doorstepVerification?.isConfirmed || 
    currentOrder?.doorstepVerification?.paymentStatus === 'paid' || 
    currentOrder?.status === 'completed'
  );

  const isNextDisabled = simulatedStage === 4 || (simulatedStage === 3 && !isOtpVerified);

  const handleNextStage = () => {
    if (simulatedStage === 3 && !isOtpVerified) {
      return;
    }
    if (simulatedStage < 4) {
      setSimulatedStage(simulatedStage + 1);
    }
  };

  const handlePrevStage = () => {
    if (simulatedStage > 0) {
      setSimulatedStage(simulatedStage - 1);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '680px' }} 
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
            <span>Live Scrap Pickup Tracker</span>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tracker Body */}
        <div className="modal-body">
          {/* Search Order Bar */}
          <div style={{
            display: 'flex',
            gap: '0.65rem',
            marginBottom: '1.25rem',
            background: 'var(--color-bg)',
            padding: '0.65rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <input
              type="text"
              placeholder="Search by Booking ID (e.g. KC-8842)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{
                border: 'none',
                background: '#FFFFFF',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                flex: 1,
                fontSize: '0.875rem'
              }}
            />
            <button 
              onClick={handleSearchOrder} 
              className="btn btn-primary btn-sm"
            >
              <Search size={14} /> Search
            </button>
          </div>

          {/* Active Order Summary Header */}
          <div className="flex-between" style={{
            padding: '1rem',
            background: 'var(--color-accent-mint-soft)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-mint)', textTransform: 'uppercase' }}>
                Active Tracking ID
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {currentOrder.id}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${simulatedStage === 4 ? 'badge-success' : 'badge-warning'}`}>
                {simulatedStage === 4 ? '✓ Completed' : '● In Progress'}
              </span>
              <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                Slot: {currentOrder.scheduledSlot}
              </div>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative'
            }}>
              {stages.map((stg, index) => {
                const isCompleted = simulatedStage > index;
                const isCurrent = simulatedStage === index;
                return (
                  <div 
                    key={stg.title} 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 2,
                      width: '20%'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isCompleted ? 'var(--color-primary)' : isCurrent ? 'var(--color-accent-mint)' : '#E2E8F0',
                      color: isCompleted || isCurrent ? '#FFFFFF' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.25)' : 'none',
                      transition: 'all 0.25s ease'
                    }}>
                      {isCompleted ? <CheckCircle2 size={16} /> : index + 1}
                    </div>

                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      textAlign: 'center',
                      marginTop: '0.4rem',
                      lineHeight: 1.2
                    }}>
                      {stg.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Content based on current simulated stage */}
          <div style={{
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            border: '1px solid var(--color-border)',
            marginBottom: '1.25rem'
          }}>
            {/* Stage 1 or 2: Partner Profile & Live Status */}
            {(simulatedStage <= 2) && (
              <div>
                <div className="flex-between" style={{ marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Collector Details & ETA
                  </div>
                  <span className="badge badge-primary">
                    ETA: ~14 Mins (0.8 km)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={currentOrder.kabadwala?.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=120&q=80'}
                    alt="Collector"
                    style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                      {currentOrder.kabadwala?.name || 'Ramesh Kumar'}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                      Vehicle: {currentOrder.kabadwala?.vehicle || 'E-Rickshaw (DL-5ER-8921)'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', alignItems: 'center' }}>
                      <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.8rem' }}>★ 4.9</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Verified Aadhaar & Digital Scale</span>
                    </div>
                  </div>

                  <a
                    href={`tel:${currentOrder.kabadwala?.phone || '9811234567'}`}
                    className="btn btn-sm btn-outline"
                    style={{ borderRadius: 'var(--radius-full)' }}
                  >
                    <Phone size={14} /> Call Agent
                  </a>
                </div>

                {/* Interactive Leaflet Route Map */}
                <OrderRouteMap order={currentOrder} />
              </div>
            )}

            {/* Stage 3: Live Digital Weighing & OTP Verification in progress */}
            {simulatedStage === 3 && (
              <div>
                <div className="flex-between" style={{ marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Doorstep Item Inspection & Scale Feed
                  </div>
                  <span className="badge badge-success">
                    Digital Scale Connected ⚖️
                  </span>
                </div>

                {/* Items preview */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {displayItems.length > 0 ? (
                    displayItems.map((it, idx) => (
                      <div key={idx} className="flex-between" style={{ padding: '0.65rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                        <span>{it.name} — {it.weightStr} @ {it.rateStr}</span>
                        <strong>₹{(it.subtotal || 0).toLocaleString()}</strong>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      Scrap items pending digital scale weighing at doorstep
                    </div>
                  )}
                </div>

                <div className="flex-between" style={{
                  padding: '0.85rem 1rem',
                  background: 'var(--color-accent-mint-soft)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  marginBottom: '1rem'
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Verified Final Total:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    ₹{displayTotalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Customer OTP Box if OTP exists */}
                {currentOrder.doorstepVerification?.otp && (
                  <div style={{
                    padding: '0.85rem 1rem',
                    background: '#FEF3C7',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #F59E0B',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 800, textTransform: 'uppercase' }}>
                        Customer Doorstep Confirmation OTP
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#78350F' }}>
                        Share this code with collector after inspecting scrap weight
                      </div>
                    </div>
                    <span style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      letterSpacing: '4px',
                      color: '#92400E',
                      background: '#FFFFFF',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      border: '1px solid #FDE68A'
                    }}>
                      {currentOrder.doorstepVerification.otp}
                    </span>
                  </div>
                )}

                {/* Doorstep Verification Launch Button */}
                {onOpenDoorstepVerification && (
                  <button
                    onClick={() => {
                      onOpenDoorstepVerification(currentOrder);
                      onClose();
                    }}
                    className="btn btn-primary btn-full"
                    style={{
                      padding: '0.75rem',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    <Scale size={18} />
                    <span>Open Doorstep Weighing, OTP & Payment Terminal</span>
                  </button>
                )}
              </div>
            )}

            {/* Stage 4: Pickup Complete & Payout */}
            {simulatedStage === 4 && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: 'var(--color-accent-mint)',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    marginBottom: '0.25rem'
                  }}>
                    <CheckCircle2 size={20} /> Pickup Completed & Paid
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    {(() => {
                      const amt = parseFloat(
                        currentOrder?.doorstepVerification?.paidAmount || 
                        currentOrder?.totalPaid || 
                        currentOrder?.paidAmount || 
                        currentOrder?.estimatedAmount || 
                        displayTotalAmount || 
                        0
                      );
                      const formattedAmt = `₹${amt > 0 ? amt.toLocaleString('en-IN') : '0'}`;
                      const method = currentOrder?.doorstepVerification?.paymentMethod || 
                                     currentOrder?.paymentMethod || 
                                     'Doorstep Cash Handover';
                      const txRef = currentOrder?.doorstepVerification?.transactionRef || 
                                    currentOrder?.transactionRef || 
                                    (currentOrder?.id ? `REF-${currentOrder.id}` : 'CONFIRMED');

                      if (method.toLowerCase().includes('cash')) {
                        return `${formattedAmt} collected via Doorstep Cash Handover`;
                      }
                      if (method.toLowerCase().includes('wallet')) {
                        return `${formattedAmt} credited to KabadCollect Eco Wallet (Tx: ${txRef})`;
                      }
                      if (method.toLowerCase().includes('bank') || method.toLowerCase().includes('imps')) {
                        return `${formattedAmt} disbursed via Bank IMPS Transfer (Ref: ${txRef})`;
                      }
                      return `${formattedAmt} transferred via ${method} (Ref: ${txRef})`;
                    })()}
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ padding: '0.85rem', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>CO₂ Avoided</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-accent-mint)' }}>
                      {currentOrder?.carbonOffsetKg ? `${currentOrder.carbonOffsetKg} kg` : '64.5 kg'}
                    </div>
                  </div>
                  <div style={{ padding: '0.85rem', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Green Credits</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-accent-gold-dark)' }}>
                      +{Math.round(parseFloat(currentOrder?.carbonOffsetKg || 64.5) * 1.2)} Pts
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowCertificate(!showCertificate)}
                  className="btn btn-outline btn-full btn-sm"
                >
                  <Award size={15} />
                  <span>{showCertificate ? 'Hide Eco Certificate' : 'View Green Recycling Certificate'}</span>
                </button>

                {showCertificate && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1.25rem',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '2px dashed var(--color-accent-mint)',
                    textAlign: 'center',
                    animation: 'fadeIn 0.25s ease'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Official Clean India Recycling Certificate
                    </div>
                    <h4 style={{ color: 'var(--color-primary)', margin: '0.4rem 0' }}>
                      Certificate of Environmental Contribution
                    </h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                      Awarded to <strong>{currentOrder?.customerName || currentOrder?.customer?.name || 'Customer'}</strong> for diverting <strong>{currentOrder?.estimatedWeight || `${currentOrder?.carbonOffsetKg || 45} kg`}</strong> of recyclable waste from landfills.
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-accent-mint)', fontWeight: 700, marginTop: '0.5rem' }}>
                      Verified by KabadCollect Hyperlocal Recycling Network 🌿
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Simulation Controls Bar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            padding: '0.75rem 1rem',
            background: 'var(--color-bg-alt)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                PICKUP STAGE CONTROLS:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handlePrevStage}
                  disabled={simulatedStage === 0}
                  className="btn btn-sm btn-secondary"
                  style={{ opacity: simulatedStage === 0 ? 0.5 : 1 }}
                >
                  ◀ Prev Stage
                </button>
                <button
                  onClick={handleNextStage}
                  disabled={isNextDisabled}
                  className="btn btn-sm btn-primary"
                  style={{ 
                    opacity: isNextDisabled ? 0.55 : 1,
                    cursor: isNextDisabled ? 'not-allowed' : 'pointer',
                    background: simulatedStage === 3 && !isOtpVerified ? '#64748B' : undefined,
                    borderColor: simulatedStage === 3 && !isOtpVerified ? '#64748B' : undefined
                  }}
                  title={simulatedStage === 3 && !isOtpVerified ? "Customer confirmation OTP is required before advancing to Payment" : undefined}
                >
                  {simulatedStage === 3 && !isOtpVerified ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Lock size={13} />
                      <span>Next Stage (OTP Required)</span>
                    </span>
                  ) : (
                    <span>Next Stage ▶</span>
                  )}
                </button>
              </div>
            </div>

            {simulatedStage === 3 && !isOtpVerified && (
              <div style={{
                fontSize: '0.75rem',
                color: '#92400E',
                background: '#FEF3C7',
                border: '1px solid #F59E0B',
                borderRadius: '6px',
                padding: '0.45rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                lineHeight: 1.4
              }}>
                <AlertCircle size={14} color="#D97706" style={{ flexShrink: 0 }} />
                <span>
                  <strong>OTP Required:</strong> Without verifying the customer doorstep OTP, the next step (Payment Completed) cannot be reached. Please click <em>"Open Doorstep Weighing, OTP & Payment Terminal"</em> above to confirm scrap items & OTP.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
