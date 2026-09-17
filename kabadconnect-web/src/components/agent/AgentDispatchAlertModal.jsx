import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  X, 
  Sparkles, 
  AlertCircle,
  Navigation,
  Volume2,
  ShieldCheck
} from 'lucide-react';

/**
 * Audio chime for incoming dispatch alert using Web Audio API
 */
function playDispatchChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.15); // A5
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.55);
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

export const AgentDispatchAlertModal = ({
  order,
  agentUser,
  onAccept,
  onDecline
}) => {
  if (!order || !agentUser || agentUser.role !== 'agent' || agentUser.dutyStatus === 'Offline') {
    return null;
  }

  const [timeLeft, setTimeLeft] = useState(60);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    playDispatchChime();
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onDecline(order.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [order.id]);

  const customerName = order.customer?.name || order.userName || 'Verified Household';
  const customerAddress = order.customer?.address || order.address || `${agentUser.city || 'Nearby'} Area`;
  const customerCity = order.customer?.city || agentUser.city || 'Local Area';
  const customerPhone = order.customer?.phone || order.phone || '';
  const estPayout = order.totalEstimatedPayout || order.estimatedAmount || order.totalPayout || 250;
  const timeSlot = order.pickupSlot || order.timeSlot || 'Today (Immediate)';

  const itemsList = order.items && Array.isArray(order.items) && order.items.length > 0
    ? order.items.map(it => `${it.name || it.category} (${it.estimatedWeight || it.quantity || 1}kg)`).join(', ')
    : (order.categories ? order.categories.join(', ') : 'Scrap Materials');

  const handleAcceptClick = async () => {
    setIsAccepting(true);
    try {
      await onAccept(order.id, agentUser);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div 
      className="modal-overlay" 
      style={{ 
        zIndex: 1400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '1rem',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)'
      }}
    >
      <div 
        className="modal-content animate-in"
        style={{
          maxWidth: '520px',
          width: '100%',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.4)',
          border: '2px solid #2563EB',
          position: 'relative'
        }}
      >
        {/* Animated Dispatch Pulse Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 70%, #3B82F6 100%)',
          color: '#FFFFFF',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.4)',
              animation: 'pulse 1.5s infinite'
            }}>
              <Truck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="badge" style={{ background: '#FEF08A', color: '#854D0E', fontWeight: 800, fontSize: '0.7rem', padding: '2px 8px' }}>
                  🚨 LIVE DISPATCH ALERT
                </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Order #{order.id}</span>
              </div>
              <h3 style={{ margin: '3px 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                New Doorstep Pickup Request
              </h3>
            </div>
          </div>

          {/* Countdown Timer Badge */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '999px',
            padding: '0.35rem 0.75rem',
            textAlign: 'center',
            minWidth: '55px'
          }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Time Left</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: timeLeft <= 15 ? '#FCA5A5' : '#FEF08A' }}>
              {timeLeft}s
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Customer & Location Box */}
          <div style={{
            padding: '1rem',
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                {customerName}
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem', background: '#DCFCE7', color: '#166534' }}>
                <ShieldCheck size={11} style={{ display: 'inline', marginRight: '3px' }} /> Hyperlocal Verified
              </span>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
              <MapPin size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>{customerAddress}</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>City: {customerCity}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
              <Clock size={13} /> Pickup Slot: {timeSlot}
            </div>
          </div>

          {/* Scrap Details & Payout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div style={{
              padding: '0.85rem 1rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Scrap Items
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '3px', wordBreak: 'break-word' }}>
                {itemsList}
              </div>
            </div>

            <div style={{
              padding: '0.85rem 1rem',
              background: 'rgba(16, 185, 129, 0.08)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#065F46', textTransform: 'uppercase' }}>
                Est. Payout Value
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
                ₹{estPayout}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => onDecline(order.id)}
              className="btn btn-secondary"
              style={{ flex: '1', padding: '0.85rem' }}
            >
              Pass / Decline
            </button>

            <button
              type="button"
              onClick={handleAcceptClick}
              disabled={isAccepting}
              className="btn btn-primary"
              style={{
                flex: '2',
                padding: '0.85rem',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                borderColor: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              <CheckCircle2 size={18} />
              <span>{isAccepting ? 'Assigning to Route...' : 'Accept Pickup Route'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
