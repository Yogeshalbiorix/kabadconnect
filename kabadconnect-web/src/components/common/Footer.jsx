import React from 'react';
import { 
  Recycle, 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Scale, 
  Award 
} from 'lucide-react';

export const Footer = ({ onOpenBooking, onOpenPartnerModal, onNavigate = () => {} }) => {
  return (
    <footer style={{
      background: 'var(--color-primary-dark)',
      color: '#CBD5E1',
      padding: '3.5rem 0 2rem 0',
      borderTop: '1px solid rgba(16, 185, 129, 0.2)'
    }}>
      <div className="container">
        {/* Main Footer Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '2.25rem',
          marginBottom: '3rem'
        }}>
          {/* Col 1: Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--color-accent-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Recycle size={22} />
              </div>
              <span 
                onClick={() => onNavigate('home')} 
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.35rem',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                Kabad<span style={{ color: 'var(--color-accent-mint)' }}>Collect</span>
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94A3B8', marginBottom: '1.25rem' }}>
              India's first hyperlocal scrap marketplace connecting households and businesses directly with certified, digitally equipped local kabadwalas.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.75rem',
              background: 'rgba(16, 185, 129, 0.12)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-accent-mint-light)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              <ShieldCheck size={14} /> 100% Certified Scales Guaranteed
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', marginBottom: '1.25rem' }}>
              Services & Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li>
                <button 
                  onClick={() => onNavigate('rates')} 
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}
                >
                  Live Scrap Rates Today
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('calculator')} 
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}
                >
                  Earnings & Carbon Calculator
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('kabadwalas')} 
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}
                >
                  Verified Local Kabadwalas
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('store')} 
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}
                >
                  Recycled Lifestyle Products
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('how-it-works')} 
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: '0.875rem' }}
                >
                  Digital Weighing Guarantee & FAQ
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenPartnerModal}
                  style={{ color: 'var(--color-accent-gold)', fontWeight: 600, fontSize: '0.875rem', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Join as Kabadwala Partner ➔
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Operational Cities */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', marginBottom: '1.25rem' }}>
              Active Operating Zones
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#94A3B8' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={13} color="var(--color-accent-mint)" /> Delhi NCR (Indirapuram, Vaishali)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={13} color="var(--color-accent-mint)" /> Noida (Sectors 18, 62, 137, 76)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={13} color="var(--color-accent-mint)" /> Gurugram (DLF, Cyber City, Sohna)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={13} color="var(--color-accent-mint)" /> South & Central Delhi
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={13} color="var(--color-accent-mint)" /> Ahmedabad (SG Highway, Prahlad Nagar, Bopal)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={13} color="var(--color-accent-mint)" /> Bengaluru (Koramangala, HSR)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={13} color="var(--color-accent-mint)" /> Mumbai (Andheri, Bandra, Powai)
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Help */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', marginBottom: '1.25rem' }}>
              Help & Support
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1rem' }}>
              Have questions or need assistance with a corporate or heavy scrap pickup?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF' }}>
                <Phone size={15} color="var(--color-accent-mint)" />
                <strong>1800-KABAD-COLLECT</strong> (Toll Free)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8' }}>
                <Mail size={15} color="var(--color-accent-mint)" />
                <span>support@kabadcollect.in</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={onOpenBooking}
                className="btn btn-accent btn-sm btn-full"
              >
                <span>Schedule a Pickup Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748B'
        }}>
          <div>
            © {new Date().getFullYear()} KabadCollect Technologies Pvt. Ltd. All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8' }}>
            <span>Proudly promoting Swachh Bharat & Circular Economy</span>
            <span style={{ color: '#10B981' }}>♻️</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
