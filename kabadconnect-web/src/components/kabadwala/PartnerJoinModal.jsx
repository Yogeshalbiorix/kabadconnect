import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  Truck, 
  Scale, 
  ShieldCheck, 
  Wallet, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PartnerJoinModal = ({ isOpen, onClose, activeCity }) => {
  const [pickupsPerDay, setPickupsPerDay] = useState(6);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    businessName: '',
    locality: activeCity,
    vehicleType: 'Electric E-Rickshaw',
    hasDigitalScale: true
  });

  if (!isOpen) return null;

  // Estimated monthly earnings
  // Avg scrap commission/margin per pickup ~₹220-₹280
  const estimatedMonthly = Math.round(pickupsPerDay * 250 * 26); // 26 working days

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert('Please fill your name and phone number');
      return;
    }
    setSubmitted(true);
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {}
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '600px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--color-accent-gold-soft)',
              color: 'var(--color-accent-gold-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={18} />
            </div>
            <span>Join as Verified Kabadwala Partner</span>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {submitted ? (
            <div className="text-center" style={{ padding: '1.5rem 0.5rem' }}>
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

              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.45rem' }}>
                Application Received, {form.name}!
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Our field operations manager in <strong>{form.locality}</strong> will call you on <strong>+91 {form.phone}</strong> within 24 hours to verify your digital scale and activate your pickup account.
              </p>

              <div style={{
                padding: '1rem',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'left',
                marginBottom: '1.5rem',
                fontSize: '0.85rem'
              }}>
                <div><strong>What happens next?</strong></div>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  <li>Free KYC verification & Digital Scale stamp check.</li>
                  <li>Receive official KabadConnect digital weight bag & ID badge.</li>
                  <li>Start receiving high-paying household pickup orders on your smartphone.</li>
                </ul>
              </div>

              <button onClick={onClose} className="btn btn-primary btn-full">
                Done
              </button>
            </div>
          ) : (
            <div>
              {/* Earnings Calculator Card */}
              <div style={{
                background: 'linear-gradient(135deg, #072e1c 0%, #0D5C3A 100%)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div className="flex-between" style={{ marginBottom: '0.45rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-accent-mint-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Monthly Earning Potential
                  </span>
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                    Guaranteed Orders
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: 800 }}>
                    ₹{estimatedMonthly.toLocaleString('en-IN')}
                  </span>
                  <span style={{ color: '#CBD5E1', fontSize: '0.85rem' }}>/ month</span>
                </div>

                <div className="range-slider-container" style={{ marginBottom: 0 }}>
                  <div className="flex-between" style={{ fontSize: '0.8rem', color: '#E2E8F0', marginBottom: '0.2rem' }}>
                    <span>Pickups per day:</span>
                    <strong>{pickupsPerDay} Pickups</strong>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="1"
                    value={pickupsPerDay}
                    onChange={(e) => setPickupsPerDay(Number(e.target.value))}
                    className="range-slider"
                  />
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      className="form-input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98112 34567"
                      className="form-input"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Shop / Business Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Green Scrap Traders"
                    className="form-input"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Vehicle Type</label>
                    <select
                      className="form-select"
                      value={form.vehicleType}
                      onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                    >
                      <option>Electric E-Rickshaw</option>
                      <option>3-Wheeler Tempo (Piaggio/Bajaj)</option>
                      <option>Mini Truck (Tata Ace/Bolero)</option>
                      <option>Cycle Rickshaw</option>
                      <option>Two-Wheeler Loader</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Operating Locality</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.locality}
                      onChange={(e) => setForm({ ...form, locality: e.target.value })}
                    />
                  </div>
                </div>

                {/* Digital Scale Checkbox */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.75rem',
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem'
                }}>
                  <input
                    type="checkbox"
                    id="scaleCheck"
                    checked={form.hasDigitalScale}
                    onChange={(e) => setForm({ ...form, hasDigitalScale: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                  />
                  <label htmlFor="scaleCheck" style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                    I have a working <strong>Digital Weighing Scale</strong> (or need KabadConnect assistance to acquire one).
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-gold btn-full btn-lg"
                >
                  <Sparkles size={16} />
                  <span>Submit Partner Application</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
