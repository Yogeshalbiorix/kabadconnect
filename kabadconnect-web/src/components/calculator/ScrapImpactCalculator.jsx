import React, { useState } from 'react';
import { 
  Calculator, 
  TreePine, 
  Droplets, 
  Wind, 
  Wallet, 
  ArrowRight, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const ScrapImpactCalculator = ({ onBookCalculatedScrap }) => {
  const [paperWeight, setPaperWeight] = useState(25); // kg
  const [plasticWeight, setPlasticWeight] = useState(10); // kg
  const [metalWeight, setMetalWeight] = useState(15); // kg
  const [ewasteUnits, setEwasteUnits] = useState(1); // units (e.g. old microwave / monitor)

  // Benchmarked values
  // Paper: avg ₹12/kg, 1.8kg CO2, 25L water, 0.015 tree/kg
  // Plastic: avg ₹16/kg, 2.4kg CO2, 38L water, 0.005 tree/kg
  // Metal: avg ₹35/kg, 3.8kg CO2, 55L water, 0.012 tree/kg
  // Ewaste: avg ₹550/unit, 14kg CO2, 200L water, 0.08 tree/unit

  const totalRupees = 
    (paperWeight * 12) + 
    (plasticWeight * 16) + 
    (metalWeight * 35) + 
    (ewasteUnits * 550);

  const totalCo2 = (
    (paperWeight * 1.8) + 
    (plasticWeight * 2.4) + 
    (metalWeight * 3.8) + 
    (ewasteUnits * 14)
  ).toFixed(1);

  const totalWater = Math.round(
    (paperWeight * 25) + 
    (plasticWeight * 38) + 
    (metalWeight * 55) + 
    (ewasteUnits * 200)
  );

  const totalTrees = (
    (paperWeight * 0.015) + 
    (plasticWeight * 0.005) + 
    (metalWeight * 0.012) + 
    (ewasteUnits * 0.08)
  ).toFixed(2);

  const handleBookNow = () => {
    onBookCalculatedScrap({
      paperWeight,
      plasticWeight,
      metalWeight,
      ewasteUnits,
      estimatedRupees: totalRupees,
      co2: totalCo2
    });
  };

  const handleReset = () => {
    setPaperWeight(15);
    setPlasticWeight(5);
    setMetalWeight(10);
    setEwasteUnits(0);
  };

  return (
    <section id="calculator" className="section" style={{
      background: 'linear-gradient(180deg, #F8FAFC 0%, rgba(236, 253, 245, 0.4) 100%)'
    }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="section-subtitle">
            <Calculator size={14} />
            <span>Interactive Estimator</span>
          </div>
          <h2 className="section-title">
            Scrap Value & Environmental Impact Calculator
          </h2>
          <p className="section-description">
            Drag the sliders to estimate how much cash you will earn and the exact ecological footprint you'll prevent by recycling with KabadCollect.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="calculator-grid">
          {/* Left Column: Sliders */}
          <div className="card calculator-card" style={{ padding: 'clamp(1.15rem, 2.8vw, 2rem)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box' }}>
            <div>
              <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Select Approximate Weight</span>
                </h3>
                <button 
                  onClick={handleReset}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    fontWeight: 600
                  }}
                >
                  <RefreshCw size={13} /> Reset
                </button>
              </div>

              {/* Slider 1: Paper & Cardboard */}
              <div className="range-slider-container">
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.25rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: 0, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                    <span>📄 Paper, Books & Cardboard</span>
                  </label>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 'clamp(1rem, 2.2vw, 1.15rem)', flexShrink: 0 }}>
                    {paperWeight} kg
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={paperWeight}
                  onChange={(e) => setPaperWeight(Number(e.target.value))}
                  className="range-slider"
                />
                <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <span>0 kg</span>
                  <span>Avg ~₹12/kg</span>
                  <span>100 kg</span>
                </div>
              </div>

              {/* Slider 2: Plastics */}
              <div className="range-slider-container">
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.25rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: 0, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                    <span>🧴 Plastic Bottles, Containers & Cans</span>
                  </label>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 'clamp(1rem, 2.2vw, 1.15rem)', flexShrink: 0 }}>
                    {plasticWeight} kg
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="2"
                  value={plasticWeight}
                  onChange={(e) => setPlasticWeight(Number(e.target.value))}
                  className="range-slider"
                />
                <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <span>0 kg</span>
                  <span>Avg ~₹16/kg</span>
                  <span>50 kg</span>
                </div>
              </div>

              {/* Slider 3: Metals */}
              <div className="range-slider-container">
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.25rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: 0, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                    <span>🔩 Metals (Iron, Steel, Copper, Brass)</span>
                  </label>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 'clamp(1rem, 2.2vw, 1.15rem)', flexShrink: 0 }}>
                    {metalWeight} kg
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="2"
                  value={metalWeight}
                  onChange={(e) => setMetalWeight(Number(e.target.value))}
                  className="range-slider"
                />
                <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <span>0 kg</span>
                  <span>Avg ~₹35/kg</span>
                  <span>80 kg</span>
                </div>
              </div>

              {/* Slider 4: E-Waste & Small Appliances */}
              <div className="range-slider-container" style={{ marginBottom: 0 }}>
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.25rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: 0, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                    <span>💻 E-Waste (Laptops, Appliances, Batteries)</span>
                  </label>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: 'clamp(1rem, 2.2vw, 1.15rem)', flexShrink: 0 }}>
                    {ewasteUnits} {ewasteUnits === 1 ? 'Unit' : 'Units'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="1"
                  value={ewasteUnits}
                  onChange={(e) => setEwasteUnits(Number(e.target.value))}
                  className="range-slider"
                />
                <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <span>0 Units</span>
                  <span>Avg ~₹550/unit</span>
                  <span>6 Units</span>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '1.5rem',
              padding: '0.85rem',
              background: 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Sparkles size={16} color="var(--color-accent-mint)" style={{ flexShrink: 0 }} />
              <span>Exact weights are verified in front of you using certified digital hanging scales.</span>
            </div>
          </div>

          {/* Right Column: Earnings & Ecological Impact Result Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', minWidth: 0 }}>
            {/* Cash Earnings Card */}
            <div className="calculator-card" style={{
              background: 'linear-gradient(135deg, #072e1c 0%, #0D5C3A 100%)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(1.15rem, 3vw, 2rem)',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                pointerEvents: 'none'
              }} />

              <div className="flex-between" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--color-accent-mint-light)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Estimated Instant Payout
                </span>
                <span className="badge badge-warning" style={{ color: '#92400E', background: '#FEF3C7', flexShrink: 0 }}>
                  Instant UPI / Cash
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.5rem',
                marginBottom: '1rem',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2.1rem, 5vw, 3rem)',
                  fontWeight: 800,
                  lineHeight: 1
                }}>
                  ₹{totalRupees.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.95rem', color: '#CBD5E1' }}>
                  estimated total
                </span>
              </div>

              <p style={{ color: '#E2E8F0', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Payment is made immediately on pickup completion into your Google Pay, PhonePe, Paytm, or Cash.
              </p>

              <button
                onClick={handleBookNow}
                className="btn btn-gold btn-full btn-lg"
                style={{ height: 'auto', padding: '0.85rem 1rem', whiteSpace: 'normal', textAlign: 'center' }}
              >
                <span>Book Pickup for this Scrap (₹{totalRupees})</span>
                <ArrowRight size={18} style={{ flexShrink: 0 }} />
              </button>
            </div>

            {/* Environmental Savings Card */}
            <div className="card" style={{ padding: 'clamp(1rem, 2.5vw, 1.75rem)', width: '100%', boxSizing: 'border-box' }}>
              <h4 style={{
                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '1.25rem'
              }}>
                Your Positive Environmental Footprint ♻️
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 'clamp(0.35rem, 1.2vw, 0.85rem)'
              }}>
                {/* CO2 Saved */}
                <div style={{
                  padding: 'clamp(0.6rem, 1.5vw, 1rem) clamp(0.2rem, 1vw, 0.5rem)',
                  background: 'var(--color-accent-mint-soft)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  textAlign: 'center',
                  minWidth: 0
                }}>
                  <Wind size={20} color="var(--color-accent-mint)" style={{ margin: '0 auto 0.35rem auto' }} />
                  <div style={{ fontSize: 'clamp(0.95rem, 2.8vw, 1.25rem)', fontWeight: 800, color: 'var(--color-primary)', wordBreak: 'break-word' }}>
                    {totalCo2} <span style={{ fontSize: '0.72rem' }}>kg</span>
                  </div>
                  <div style={{ fontSize: 'clamp(0.68rem, 1.8vw, 0.75rem)', color: 'var(--color-text-mint)', fontWeight: 600, lineHeight: 1.2, marginTop: '0.2rem' }}>
                    CO₂ Prevented
                  </div>
                </div>

                {/* Water Conserved */}
                <div style={{
                  padding: 'clamp(0.6rem, 1.5vw, 1rem) clamp(0.2rem, 1vw, 0.5rem)',
                  background: 'var(--color-accent-cyan-soft)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  textAlign: 'center',
                  minWidth: 0
                }}>
                  <Droplets size={20} color="var(--color-accent-cyan)" style={{ margin: '0 auto 0.35rem auto' }} />
                  <div style={{ fontSize: 'clamp(0.95rem, 2.8vw, 1.25rem)', fontWeight: 800, color: '#0E7490', wordBreak: 'break-word' }}>
                    {totalWater.toLocaleString('en-IN')} <span style={{ fontSize: '0.72rem' }}>L</span>
                  </div>
                  <div style={{ fontSize: 'clamp(0.68rem, 1.8vw, 0.75rem)', color: '#0E7490', fontWeight: 600, lineHeight: 1.2, marginTop: '0.2rem' }}>
                    Water Conserved
                  </div>
                </div>

                {/* Trees Preserved */}
                <div style={{
                  padding: 'clamp(0.6rem, 1.5vw, 1rem) clamp(0.2rem, 1vw, 0.5rem)',
                  background: 'var(--color-accent-gold-soft)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  textAlign: 'center',
                  minWidth: 0
                }}>
                  <TreePine size={20} color="var(--color-accent-gold-dark)" style={{ margin: '0 auto 0.35rem auto' }} />
                  <div style={{ fontSize: 'clamp(0.95rem, 2.8vw, 1.25rem)', fontWeight: 800, color: '#92400E', wordBreak: 'break-word' }}>
                    {totalTrees}
                  </div>
                  <div style={{ fontSize: 'clamp(0.68rem, 1.8vw, 0.75rem)', color: '#92400E', fontWeight: 600, lineHeight: 1.2, marginTop: '0.2rem' }}>
                    Trees Preserved
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .calculator-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 2.5rem;
          align-items: stretch;
          width: 100%;
          min-width: 0;
        }
        @media (max-width: 900px) {
          .calculator-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 1.75rem;
          }
        }
        @media (max-width: 860px) {
          .calculator-card {
            padding: 1.15rem !important;
          }
        }
      `}</style>
    </section>
  );
};
