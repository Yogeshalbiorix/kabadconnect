import React from 'react';
import { 
  TreePine, 
  Recycle, 
  Wallet, 
  Users, 
  Star, 
  Quote, 
  ShieldCheck 
} from 'lucide-react';

export const ImpactStats = () => {
  const stats = [
    {
      icon: <Recycle size={28} color="var(--color-accent-mint)" />,
      value: '520+ Tons',
      label: 'Scrap Recycled',
      sub: 'Diverted from urban landfills'
    },
    {
      icon: <Wallet size={28} color="var(--color-accent-gold)" />,
      value: '₹48 Lakhs+',
      label: 'Paid to Households',
      sub: 'Direct instant bank transfers'
    },
    {
      icon: <TreePine size={28} color="var(--color-primary-light)" />,
      value: '12,400+',
      label: 'Trees Preserved',
      sub: 'Through circular paper pulp'
    },
    {
      icon: <Users size={28} color="#0284C7" />,
      value: '1,200+',
      label: 'Kabadwalas Empowered',
      sub: 'Dignified digital livelihoods'
    }
  ];

  const testimonials = [
    {
      name: 'Sunita Mehra',
      location: 'Indirapuram, Ghaziabad',
      text: 'Sold 45kg old newspapers and a broken microwave. The kabadwala arrived in an electric rickshaw with a digital hanging scale. The exact weight showed 45.4 kg and ₹710 was in my Google Pay in 2 minutes!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80'
    },
    {
      name: 'Vikram Sethi',
      location: 'Sector 62, Noida',
      text: 'Our IT office cleared 3 cartons of obsolete cables and 4 old monitors. KabadCollect provided an official green disposal invoice and GST certificate. Super professional service.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
    },
    {
      name: 'Meenakshi Iyer',
      location: 'Dwarka, South Delhi',
      text: 'Earlier we had to haggle with street collectors who shaved off 5 kg with deceptive spring balances. KabadCollect has completely revolutionized waste disposal. Transparent and courteous.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
    }
  ];

  return (
    <section className="section" style={{
      background: 'linear-gradient(180deg, #072e1c 0%, #0D5C3A 100%)',
      color: '#FFFFFF'
    }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            background: 'rgba(16, 185, 129, 0.2)',
            color: 'var(--color-accent-mint-light)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.825rem',
            fontWeight: 700,
            marginBottom: '0.85rem'
          }}>
            <span>🌍 Real-World Impact</span>
          </div>
          <h2 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>
            Transforming Waste into Wealth & Sustainability
          </h2>
          <p style={{ color: '#E2E8F0', fontSize: '1.1rem' }}>
            Every kilogram of segregated scrap collected through KabadCollect creates verifiable environmental preservation and fair livelihoods.
          </p>
        </div>

        {/* Stats 4-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '4.5rem'
        }}>
          {stats.map((item, idx) => (
            <div 
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                {item.icon}
              </div>

              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2rem',
                fontWeight: 800,
                color: '#FFFFFF',
                marginBottom: '0.25rem'
              }}>
                {item.value}
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-accent-mint-light)', marginBottom: '0.2rem' }}>
                {item.label}
              </div>

              <div style={{ fontSize: '0.775rem', color: '#CBD5E1' }}>
                {item.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Customer Testimonials Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '1.65rem' }}>
            Loved by 14,000+ Eco-Conscious Citizens
          </h3>
        </div>

        {/* Testimonials 3-Card Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.75rem'
        }}>
          {testimonials.map((t, i) => (
            <div 
              key={i}
              style={{
                background: '#FFFFFF',
                color: 'var(--color-text-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    {[...Array(t.rating)].map((_, r) => (
                      <Star key={r} size={15} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                  <Quote size={20} color="#CBD5E1" />
                </div>

                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.25rem'
                }}>
                  "{t.text}"
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <img
                  src={t.avatar}
                  alt={t.name}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
