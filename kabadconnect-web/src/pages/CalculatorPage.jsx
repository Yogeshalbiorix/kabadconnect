import React from 'react';
import { Calculator, ArrowLeft, Leaf, Droplets, TreePine, Zap, Award } from 'lucide-react';
import { ScrapImpactCalculator } from '../components/calculator/ScrapImpactCalculator';

export const CalculatorPage = ({
  onBookCalculatedScrap,
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
          top: '-30px',
          right: '-30px',
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
            <span style={{ color: '#34D399', fontWeight: 700 }}>Scrap Value & Impact Calculator</span>
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
            <Calculator size={13} /> Real-Time Estimator
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
            Calculate Scrap Value & Carbon Offset
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '700px',
            lineHeight: 1.6,
            marginBottom: '1.5rem'
          }}>
            Adjust the estimated scrap weights across Paper, Plastic, Metals, and E-Waste to calculate your expected cash payout and the real environmental impact of your recycling effort.
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.95)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Leaf size={16} color="#34D399" />
              <span>CO2 Greenhouse Emissions Avoided</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <TreePine size={16} color="#34D399" />
              <span>Mature Trees Preserved</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Droplets size={16} color="#34D399" />
              <span>Industrial Water Conserved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Calculator */}
      <div style={{ marginTop: '-1rem', position: 'relative', zIndex: 10 }}>
        <ScrapImpactCalculator onBookCalculatedScrap={onBookCalculatedScrap} />
      </div>

      {/* Educational Guide Card */}
      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0F172A' }}>
            Why Calculate Before Booking?
          </h3>
          <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '820px' }}>
            Traditional scrap collection often involves guesswork where customers have no idea what their scrap is worth until the collector quotes an arbitrary number. Our interactive calculator empowers you with transparent market-benchmarked estimates so you always know your payout beforehand.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', gap: '0.85rem', padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
              <Award size={22} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A' }}>Verified Green Certificate</div>
                <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '2px' }}>
                  Every completed booking awards a personalized digital Green Impact Certificate with exact kg of CO2 offset.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
              <Zap size={22} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A' }}>1-Click Pre-filled Booking</div>
                <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '2px' }}>
                  Clicking "Book Pickup with this Estimate" carries your selected weights straight into the scheduling wizard.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
