import React from 'react';
import { MapPin, ArrowLeft, ShieldCheck, Truck, Star, UserPlus } from 'lucide-react';
import { KabadwalaDirectory } from '../components/kabadwala/KabadwalaDirectory';

export const KabadwalasPage = ({
  onSelectPartnerForBooking,
  onOpenPartnerModal,
  activeCity,
  userLocation,
  onLocationDetected,
  onNavigate,
  partners = []
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
            <span style={{ color: '#34D399', fontWeight: 700 }}>Nearby Verified Kabadwalas</span>
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
            Hyperlocal Scrap Collector Network
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '700px',
            lineHeight: 1.6,
            marginBottom: '1.5rem'
          }}>
            Police-verified, background-checked local scrap collectors equipped with certified digital scales. Real-time GPS proximity matching for lightning fast 15-minute pickups.
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.95)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <ShieldCheck size={16} color="#34D399" />
              <span>100% Police Verified & Digital Scale Certified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Truck size={16} color="#34D399" />
              <span>Zero-Carbon Electric Rickshaws & Loaders</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Star size={16} color="#34D399" />
              <span>4.8+ Average Customer Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Directory and Radar Map Component */}
      <div style={{ marginTop: '-1rem', position: 'relative', zIndex: 10 }}>
        <KabadwalaDirectory
          onSelectPartnerForBooking={onSelectPartnerForBooking}
          onOpenPartnerModal={onOpenPartnerModal}
          activeCity={activeCity}
          userLocation={userLocation}
          onLocationDetected={onLocationDetected}
          partners={partners}
        />
      </div>
    </div>
  );
};
