import React from 'react';
import { HelpCircle, ArrowLeft, ShieldCheck, CheckCircle2, Clock, Truck, Sparkles, Scale, Smartphone, DollarSign } from 'lucide-react';
import { HowItWorks } from '../components/home/HowItWorks';

export const HowItWorksPage = ({
  onOpenBooking,
  onNavigate
}) => {
  return (
    <div style={{ background: '#F8FAFC', minHeight: '80vh', paddingBottom: '4rem' }}>
      {/* Page Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #072e1c 0%, #0D5C3A 60%, #10B981 100%)',
        color: '#FFFFFF',
        padding: '3rem 1.5rem 3.5rem 1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.12)',
          pointerEvents: 'none'
        }} />

        <div className="container">
          {/* Breadcrumbs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => onNavigate('home')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.85)',
                cursor: 'pointer',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8rem'
              }}
            >
              <ArrowLeft size={14} /> Home
            </button>
            <span>/</span>
            <span style={{ color: '#34D399', fontWeight: 700 }}>How It Works</span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(16, 185, 129, 0.25)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            color: '#34D399',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}>
            <HelpCircle size={13} /> Seamless 3-Step Experience
          </div>

          <h1 style={{
            color: '#FFFFFF',
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '0.75rem',
            maxWidth: '820px'
          }}>
            How Doorstep Recycling Works
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '700px',
            lineHeight: 1.6,
            marginBottom: '1.5rem'
          }}>
            Selling household and office scrap has never been this transparent. See how KabadCollect connects you to certified collectors, eliminates weight cheating, and deposits instant UPI cash into your account.
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.95)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Clock size={16} color="#34D399" />
              <span>Book Online in 60 Seconds</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Scale size={16} color="#34D399" />
              <span>Calibrated ISO Digital Scales</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <DollarSign size={16} color="#34D399" />
              <span>Instant Bank UPI or Cash Payout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main How It Works Component with Timeline & Comparison Matrix */}
      <div style={{ marginTop: '-1rem', position: 'relative', zIndex: 10 }}>
        <HowItWorks onOpenBooking={onOpenBooking} />
      </div>

      {/* Trust & Verification Section */}
      <div className="container" style={{ marginTop: '3.5rem' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0F172A' }}>
            Frequently Asked Questions
          </h3>
          <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Got questions about our weighing process, payment methods, or safety protocols? Here is everything you need to know.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', marginBottom: '0.35rem' }}>
                ❓ Is there any minimum weight required for free doorstep pickup?
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                We require a nominal minimum threshold of 10 kg (or 1 major appliance) for free doorstep pickup. If you have less, you can combine paper, plastic, and metals to reach the threshold easily.
              </p>
            </div>

            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', marginBottom: '0.35rem' }}>
                ❓ How do I know the weighing scale is accurate?
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                Every partner carries a government-calibrated electronic weighing machine with LED readout. You are always welcome to verify with a 1 kg standard test weight provided by the collector before weighing your scrap.
              </p>
            </div>

            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', marginBottom: '0.35rem' }}>
                ❓ How and when do I get paid?
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                Payout is 100% instant! The moment the items are weighed, the collector initiates an immediate UPI transfer (Google Pay, PhonePe, Paytm, or direct IMPS) or pays in cash if requested.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
