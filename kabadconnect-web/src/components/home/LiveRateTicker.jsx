import React from 'react';
import { TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react';
import { SCRAP_ITEMS } from '../../data/scrapRates';

export const LiveRateTicker = ({ onSelectCategory }) => {
  // Highlight top 10 items for the marquee
  const tickerItems = SCRAP_ITEMS.slice(0, 12);

  return (
    <div style={{
      background: 'var(--color-primary-dark)',
      borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
      overflow: 'hidden',
      padding: '0.65rem 0',
      position: 'relative',
      width: '100%',
      maxWidth: '100vw'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
        background: 'linear-gradient(90deg, #072e1c 80%, transparent 100%)',
        padding: '0 clamp(0.75rem, 1.5vw, 1.25rem) 0 0.75rem',
        color: '#FFFFFF',
        fontSize: 'clamp(0.7rem, 2.2vw, 0.8rem)',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap'
      }}>
        <Flame size={15} color="var(--color-accent-gold)" style={{ marginRight: '0.35rem' }} />
        <span>Live Rates Today:</span>
      </div>

      <div style={{
        display: 'flex',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        paddingLeft: 'clamp(130px, 20vw, 170px)'
      }}>
        <div style={{
          display: 'flex',
          gap: '2.5rem',
          animation: 'tickerScroll 35s linear infinite'
        }}>
          {[...tickerItems, ...tickerItems].map((item, idx) => {
            const isUp = item.trendType === 'up';
            const isDown = item.trendType === 'down';

            return (
              <div 
                key={`${item.id}-${idx}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#E2E8F0',
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{item.name}:</span>
                <span style={{ 
                  fontFamily: 'var(--font-heading)', 
                  fontWeight: 700, 
                  color: 'var(--color-accent-mint-light)' 
                }}>
                  ₹{item.rate}/{item.unit}
                </span>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.15rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isUp ? '#34D399' : isDown ? '#F87171' : '#94A3B8'
                }}>
                  {isUp && <TrendingUp size={12} />}
                  {isDown && <TrendingDown size={12} />}
                  {!isUp && !isDown && <Minus size={12} />}
                  <span>{item.trend}</span>
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.2)', marginLeft: '1rem' }}>•</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
