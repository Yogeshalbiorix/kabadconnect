import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Scale, 
  MapPin, 
  Star, 
  Truck, 
  Calendar, 
  Phone, 
  CheckCircle2, 
  Users, 
  Award,
  Map as MapIcon,
  LayoutGrid
} from 'lucide-react';
import { CITY_COORDINATES, KABADWALA_PARTNERS } from '../../data/kabadwalas';
import { HyperlocalMap } from './HyperlocalMap';
import { rankPartnersByProximity } from '../../utils/geolocation';

export const KabadwalaDirectory = ({ 
  onSelectPartnerForBooking, 
  onOpenPartnerModal, 
  activeCity,
  userLocation = null,
  onLocationDetected = null,
  partners = KABADWALA_PARTNERS
}) => {
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'grid'
  const [filterBadge, setFilterBadge] = useState('all');
  const isAhmedabad = activeCity?.toLowerCase().includes('ahmedabad');

  const cityKey = isAhmedabad ? 'ahmedabad' : 'delhi';
  const defaultCoords = CITY_COORDINATES[cityKey]?.userLocation?.coords || [23.0135, 72.5125];
  const userCoords = userLocation?.coords || defaultCoords;

  const partnerList = partners && partners.length > 0 ? partners : KABADWALA_PARTNERS;
  const rawPartners = [...partnerList].sort((a, b) => {
    if (isAhmedabad) {
      if (a.city === 'Ahmedabad' && b.city !== 'Ahmedabad') return -1;
      if (b.city === 'Ahmedabad' && a.city !== 'Ahmedabad') return 1;
    }
    return 0;
  });

  const rankedPartners = rankPartnersByProximity(rawPartners, userCoords);

  const filteredPartners = rankedPartners.filter((partner) => {
    if (filterBadge === 'top') return partner.rating >= 4.9;
    if (filterBadge === 'scale') return partner.digitalScaleVerified;
    return true;
  });

  return (
    <section id="kabadwalas" className="section" style={{ background: '#FFFFFF' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-subtitle">
            <Users size={14} />
            <span>Hyperlocal Verified Network</span>
          </div>
          <h2 className="section-title">
            Live Radar & Verified Kabadwalas Near You
          </h2>
          <p className="section-description">
            Track your doorstep location and live verified kabadwalas moving around your sector in <strong>{activeCity}</strong>.
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex-between" style={{
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* View Toggle: Map vs Cards */}
          <div style={{
            display: 'inline-flex',
            background: 'var(--color-bg)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)'
          }}>
            <button
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: viewMode === 'map' ? 'var(--color-primary)' : 'transparent',
                color: viewMode === 'map' ? '#FFFFFF' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'map' ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              <MapIcon size={16} />
              <span>Live Radar Map</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: viewMode === 'grid' ? 'var(--color-primary)' : 'transparent',
                color: viewMode === 'grid' ? '#FFFFFF' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              <LayoutGrid size={16} />
              <span>Collector Cards</span>
            </button>
          </div>

          {/* Filter Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Partners' },
              { id: 'top', label: '★ Top Rated (4.9+)' },
              { id: 'scale', label: '⚖️ Digital Scale' }
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setFilterBadge(pill.id)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  background: filterBadge === pill.id ? 'var(--color-accent-mint-soft)' : 'var(--color-bg)',
                  color: filterBadge === pill.id ? 'var(--color-text-mint)' : 'var(--color-text-secondary)',
                  border: `1px solid ${filterBadge === pill.id ? 'var(--color-accent-mint)' : 'var(--color-border)'}`,
                  transition: 'all var(--transition-fast)'
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* View 1: Interactive Hyperlocal Map */}
        {viewMode === 'map' && (
          <div style={{ marginBottom: '3.5rem', animation: 'fadeIn 0.25s ease' }}>
            <HyperlocalMap 
              activeCity={activeCity} 
              onSelectPartnerForBooking={onSelectPartnerForBooking} 
              userLocation={userLocation}
              onLocationDetected={onLocationDetected}
              partners={partnerList}
            />
          </div>
        )}

        {/* Partners Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {filteredPartners.map((partner) => (
            <div 
              key={partner.id} 
              className="card card-interactive kabadwala-partner-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem'
              }}
            >
              <div>
                {/* Header: Photo, Name, Rating */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <img
                    src={partner.photo || partner.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                    alt={partner.name}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'; }}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      objectFit: 'cover',
                      border: '2px solid var(--color-border)'
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <h3 style={{ fontSize: '1.15rem' }}>{partner.name}</h3>
                      <CheckCircle2 size={16} color="var(--color-accent-mint)" />
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                      {partner.businessName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        color: '#F59E0B',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}>
                        <Star size={13} fill="#F59E0B" /> {partner.rating}
                      </span>
                      <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
                        ({partner.reviewsCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <span className="badge badge-success">
                    <Scale size={12} /> Digital Scale
                  </span>
                  <span className="badge badge-primary">
                    <ShieldCheck size={12} /> KYC Verified
                  </span>
                  <span className="badge badge-warning">
                    {partner.badge}
                  </span>
                </div>

                {/* Vehicle and Locality details */}
                <div style={{
                  padding: '0.85rem',
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.825rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--color-text-secondary)' }}>
                    <MapPin size={14} color="var(--color-primary)" />
                    <span>Coverage: <strong>{partner.locality}</strong> (~{partner.distanceKm} km away)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--color-text-secondary)' }}>
                    <Truck size={14} color="var(--color-primary)" />
                    <span>Vehicle: <strong>{partner.vehicle}</strong></span>
                  </div>
                </div>

                {/* Review Snippet */}
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                  marginBottom: '1.25rem',
                  paddingLeft: '0.75rem',
                  borderLeft: '3px solid var(--color-accent-mint)'
                }}>
                  "{partner.recentReview}"
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectPartnerForBooking(partner)}
                className="btn btn-primary btn-full btn-sm"
              >
                <Calendar size={15} />
                <span>Request Pickup with {partner.name.split(' ')[0]}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Partner with Us Callout Banner */}
        <div style={{
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          border: '1.5px dashed var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <span className="badge badge-warning" style={{ marginBottom: '0.5rem' }}>
              Vendor Registration Open
            </span>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>
              Are you a Scrap Dealer or Kabadwala in {activeCity}?
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '620px', fontSize: '0.925rem' }}>
              Join 1,200+ kabadwalas growing their business with verified online customer orders, guaranteed doorstep routes, and zero registration fees.
            </p>
          </div>

          <button
            onClick={onOpenPartnerModal}
            className="btn btn-gold btn-lg"
          >
            <span>Register as Kabadwala Partner</span>
          </button>
        </div>
      </div>
    </section>
  );
};
