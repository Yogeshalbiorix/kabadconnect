import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getMapboxToken, toLngLat } from '../../utils/mapboxConfig';
import { Navigation, Truck } from 'lucide-react';

export const OrderRouteMap = ({ order }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const token = getMapboxToken();
  const isAhmedabad = order?.address?.toLowerCase().includes('ahmedabad') || order?.pincode?.startsWith('38');

  // Customer location & Collector location in [lat, lng]
  const defaultCoords = isAhmedabad ? [23.0135, 72.5125] : [28.6385, 77.3710];
  const userCoords = order?.userCoords || defaultCoords;
  const collectorCoords = order?.kabadwala?.coords || (isAhmedabad ? [23.0185, 72.5080] : [28.6295, 77.3630]);

  const userLngLat = toLngLat(userCoords);
  const collectorLngLat = toLngLat(collectorCoords);

  useEffect(() => {
    if (!token || !mapContainerRef.current) return;

    try {
      mapboxgl.accessToken = token;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: userLngLat,
        zoom: 14,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      // User doorstep marker
      const userEl = document.createElement('div');
      userEl.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #0D5C3A;
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-size: 15px;
        ">
          🏠
        </div>
      `;
      new mapboxgl.Marker({ element: userEl }).setLngLat(userLngLat).addTo(map);

      // Collector vehicle marker
      const collectorDisplayName = order?.agentName || order?.assignedAgent?.name || order?.kabadwala?.name || 'Collector';
      const vehicleEl = document.createElement('div');
      vehicleEl.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 4px;
          background: #10B981;
          color: #FFFFFF;
          padding: 3px 8px;
          border-radius: 999px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.45);
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          border: 2px solid #FFFFFF;
          font-family: sans-serif;
        ">
          <span>🛺</span>
          <span>${collectorDisplayName.split(' ')[0]} (En Route)</span>
        </div>
      `;
      new mapboxgl.Marker({ element: vehicleEl, anchor: 'center' }).setLngLat(collectorLngLat).addTo(map);

      // Route line
      map.on('load', () => {
        map.addSource('route-line-src', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [collectorLngLat, userLngLat]
            }
          }
        });

        map.addLayer({
          id: 'route-line-layer',
          type: 'line',
          source: 'route-line-src',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#10B981',
            'line-width': 4,
            'line-dasharray': [2, 2]
          }
        });

        // Fit bounds
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(userLngLat);
        bounds.extend(collectorLngLat);
        map.fitBounds(bounds, { padding: 40 });
      });
    } catch (err) {
      console.error('Mapbox Route map error:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [token, order]);

  const activeCollectorName = order?.agentName || order?.assignedAgent?.name || order?.kabadwala?.name || 'Collector';

  if (!token) {
    return (
      <div style={{
        marginTop: '1rem',
        padding: '1.25rem',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
          <Truck size={18} color="var(--color-accent-mint)" />
          <span>Live Vehicle Tracking Active</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
          {activeCollectorName} is currently traveling on {isAhmedabad ? 'SG Highway near Iscon' : 'Sector 62 Indirapuram'}. Estimated arrival in <strong>12-14 minutes</strong> (~0.8 km away).
        </p>
        <div style={{
          height: '6px',
          background: '#E2E8F0',
          borderRadius: '999px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            width: '65%',
            height: '100%',
            background: 'var(--color-accent-mint)',
            borderRadius: '999px'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '210px',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1.5px solid var(--color-border)',
      marginTop: '1rem'
    }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating live ETA badge */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 5,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '0.35rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--color-border)',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
        <span>Mapbox GPS Route: ~0.8 km to doorstep (ETA: 12-14 mins)</span>
      </div>
    </div>
  );
};
