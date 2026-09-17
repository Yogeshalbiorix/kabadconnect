import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Key, 
  MapPin, 
  CheckCircle2, 
  Calendar, 
  Locate, 
  ExternalLink,
  Sparkles,
  RefreshCw,
  Truck,
  Loader2,
  Navigation
} from 'lucide-react';
import { CITY_COORDINATES, KABADWALA_PARTNERS } from '../../data/kabadwalas';
import { getMapboxToken, saveMapboxToken, toLngLat } from '../../utils/mapboxConfig';
import { 
  getUserCoordinates, 
  reverseGeocodeMapbox, 
  rankPartnersByProximity,
  calculateDistanceKm,
  calculateEtaMinutes
} from '../../utils/geolocation';

export const HyperlocalMap = ({ 
  activeCity, 
  onSelectPartnerForBooking,
  userLocation: propUserLocation = null,
  onLocationDetected = null,
  partners = []
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const partnerMarkersRef = useRef([]);

  const [token, setToken] = useState(getMapboxToken() || '');
  const [tokenInput, setTokenInput] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationToast, setLocationToast] = useState(null);
  const [activeUserLocation, setActiveUserLocation] = useState(propUserLocation);

  // Determine city key and coordinates
  const isAhmd = String(activeCity || '').toLowerCase().includes('ahmedabad');
  const cityKey = isAhmd ? 'ahmedabad' : 'delhi';
  const cityData = CITY_COORDINATES[cityKey] || CITY_COORDINATES.delhi;

  // Compute active user coords [lat, lng]
  const currentCoords = activeUserLocation?.coords || cityData.userLocation.coords;

  const incomingPartners = partners && partners.length > 0 ? partners : KABADWALA_PARTNERS;

  // Dynamic ranked partners strictly for the active city, prioritizing real database agents
  const cityPartners = React.useMemo(() => {
    const userLat = currentCoords[0] || (isAhmd ? 23.0135 : 28.6385);
    const userLng = currentCoords[1] || (isAhmd ? 72.5125 : 77.3710);

    // 1. Filter partners that belong to the active city / nearby area
    const localFiltered = incomingPartners.filter((p) => {
      const pCity = String(p.city || '').toLowerCase();
      const pLocality = String(p.locality || '').toLowerCase();
      const pAddress = String(p.address || '').toLowerCase();
      if (isAhmd) {
        return pCity.includes('ahmedabad') || pLocality.includes('ahmedabad') || pAddress.includes('ahmedabad') || pLocality.includes('bopal') || pLocality.includes('prahlad') || pLocality.includes('sg highway');
      } else {
        // Delhi / Gurugram / Noida / NCR
        return !pCity.includes('ahmedabad') && !pLocality.includes('ahmedabad') && !pAddress.includes('ahmedabad');
      }
    });

    const activeList = localFiltered.length > 0 ? localFiltered : incomingPartners;

    // Realistic offsets around doorstep for local agents (0.5km - 1.8km in all directions)
    const offsets = [
      [0.0055, 0.0048],   // North-East (~0.8 km)
      [-0.0052, 0.0060],  // South-East (~0.9 km)
      [0.0042, -0.0058],  // North-West (~0.8 km)
      [-0.0062, -0.0045], // South-West (~0.9 km)
      [0.0080, 0.0018],   // North (~1.0 km)
      [-0.0075, -0.0020], // South (~0.9 km)
      [0.0020, 0.0085],   // East (~1.0 km)
      [-0.0025, -0.0080]  // West (~1.0 km)
    ];

    // Prioritize real database agents (e.g. isRealDbAgent: true)
    const sortedBase = [...activeList].sort((a, b) => {
      if (a.isRealDbAgent && !b.isRealDbAgent) return -1;
      if (!a.isRealDbAgent && b.isRealDbAgent) return 1;
      return 0;
    });

    const mapped = sortedBase.map((p, idx) => {
      let coords = p.coords;
      const off = offsets[idx % offsets.length];

      const hasValidCoords = Array.isArray(coords) && coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1]);
      
      const isCoordInCurrentCity = hasValidCoords && (
        isAhmd ? (coords[0] > 22.5 && coords[0] < 23.5 && coords[1] > 72.0 && coords[1] < 73.0)
               : (coords[0] > 28.0 && coords[0] < 29.2 && coords[1] > 76.5 && coords[1] < 77.8)
      );

      // If coordinates are in current city, use them; otherwise position around doorstep
      if (!isCoordInCurrentCity) {
        coords = [
          parseFloat((userLat + off[0]).toFixed(5)),
          parseFloat((userLng + off[1]).toFixed(5))
        ];
      }

      const dist = calculateDistanceKm([userLat, userLng], coords);

      return {
        ...p,
        coords,
        distanceKm: parseFloat(dist.toFixed(1)),
        etaMinutes: Math.max(8, Math.round(dist * 6))
      };
    });

    return rankPartnersByProximity(mapped, [userLat, userLng]);
  }, [incomingPartners, currentCoords, isAhmd]);

  const nearestPartner = cityPartners[0] || incomingPartners[0];

  // Sync prop changes
  useEffect(() => {
    if (propUserLocation) {
      setActiveUserLocation(propUserLocation);
    }
  }, [propUserLocation]);

  useEffect(() => {
    if (cityPartners.length > 0) {
      setSelectedPartner((prev) => {
        if (prev && cityPartners.some(p => p.id === prev.id)) {
          return cityPartners.find(p => p.id === prev.id);
        }
        return cityPartners[0];
      });
    }
  }, [cityPartners]);

  // Handle token save
  const handleSaveToken = (e) => {
    e.preventDefault();
    if (tokenInput.trim().length > 0) {
      saveMapboxToken(tokenInput.trim());
      setToken(tokenInput.trim());
      setMapError(null);
    }
  };

  // Re-draw the collector route line
  const updateRouteLine = useCallback((map, userLngLat, partnerLngLat) => {
    if (!map) return;
    try {
      const source = map.getSource('collector-route');
      const routeData = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [partnerLngLat, userLngLat]
        }
      };

      if (source) {
        source.setData(routeData);
      } else if (map.isStyleLoaded()) {
        map.addSource('collector-route', {
          type: 'geojson',
          data: routeData
        });

        if (!map.getLayer('collector-route-line')) {
          map.addLayer({
            id: 'collector-route-line',
            type: 'line',
            source: 'collector-route',
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
        }
      }
    } catch (e) {
      console.warn('Error updating route line:', e);
    }
  }, []);

  // Update user marker position and popup
  const updateUserMarker = useCallback((map, userLngLat, locationLabel, locationAddress) => {
    if (!map) return;

    const popupHtml = `
      <div style="font-family: sans-serif; padding: 6px; max-width: 220px;">
        <div style="font-size: 10px; font-weight: 800; color: #10B981; text-transform: uppercase; letter-spacing: 0.5px;">📍 Your Pickup Doorstep</div>
        <strong style="color: #0D5C3A; font-size: 13px; display: block; margin-top: 2px;">${locationLabel}</strong>
        <div style="font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.3;">${locationAddress}</div>
      </div>
    `;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat(userLngLat);
      const popup = userMarkerRef.current.getPopup();
      if (popup) popup.setHTML(popupHtml);
    } else {
      const userEl = document.createElement('div');
      userEl.innerHTML = `
        <div style="
          position: relative;
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.4);
            animation: pulseGlow 2s infinite;
          "></div>
          <div style="
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #0D5C3A;
            border: 3px solid #FFFFFF;
            box-shadow: 0 4px 14px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-size: 17px;
            z-index: 2;
          ">
            🏠
          </div>
        </div>
      `;

      userMarkerRef.current = new mapboxgl.Marker({ element: userEl })
        .setLngLat(userLngLat)
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml))
        .addTo(map);
    }
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!token || !mapContainerRef.current) return;

    let isMounted = true;

    try {
      mapboxgl.accessToken = token;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      userMarkerRef.current = null;
      partnerMarkersRef.current = [];

      const userLngLat = toLngLat(currentCoords);

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: userLngLat,
        zoom: cityData.zoom || 13.5,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      // Add Controls
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

      // Native Mapbox Geolocate Control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: true
      });
      map.addControl(geolocate, 'top-right');

      geolocate.on('geolocate', async (e) => {
        const lng = e.coords.longitude;
        const lat = e.coords.latitude;
        try {
          const geo = await reverseGeocodeMapbox(lng, lat, token);
          if (isMounted) {
            setActiveUserLocation(geo);
            onLocationDetected?.(geo);
            setLocationToast(`Doorstep detected: ${geo.locality || geo.city}`);
            setTimeout(() => setLocationToast(null), 4000);
          }
        } catch (err) {
          console.warn('Geocode error on native locate:', err);
        }
      });

      map.on('error', (e) => {
        if (e && e.error && e.error.status === 401) {
          setMapError('Invalid Mapbox token. Please check your pk.eyJ... token in .env');
        }
      });

      // 1. User Location Marker
      const label = activeUserLocation?.locality 
        ? `Your Location: ${activeUserLocation.locality}` 
        : cityData.userLocation.name;
      const addr = activeUserLocation?.fullAddress || cityData.userLocation.address;

      updateUserMarker(map, userLngLat, label, addr);

      // 2. Kabadwala Partner Markers (Initial render)
      updatePartnerMarkers(map, cityPartners);

      // 3. Draw initial Route Line on style load
      map.on('load', () => {
        if (nearestPartner && nearestPartner.coords) {
          const nearestLngLat = toLngLat(nearestPartner.coords);
          updateRouteLine(map, userLngLat, nearestLngLat);
        }
      });
    } catch (err) {
      console.error('Mapbox load error:', err);
      setMapError(err.message);
    }

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [token, cityKey]);

  // Re-render partner markers on map whenever cityPartners list changes
  const updatePartnerMarkers = useCallback((map, partnersToRender) => {
    if (!map) return;

    if (partnerMarkersRef.current && partnerMarkersRef.current.length > 0) {
      partnerMarkersRef.current.forEach(m => m.remove());
    }
    partnerMarkersRef.current = [];

    partnersToRender.forEach((partner) => {
      const partnerLngLat = toLngLat(partner.coords);
      const isEnRoute = partner.status === 'en_route' || partner.status === 'available';

      const partnerEl = document.createElement('div');
      partnerEl.style.cursor = 'pointer';
      partnerEl.className = 'kabadwala-map-marker';
      partnerEl.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.25));
          transition: transform 0.2s ease;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: #FFFFFF;
            border: 2.5px solid ${isEnRoute ? '#10B981' : '#F59E0B'};
            border-radius: 999px;
            padding: 4px 10px 4px 4px;
            font-family: sans-serif;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          ">
            <img 
              src="${partner.photo || partner.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}" 
              onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'"
              style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1.5px solid #10B981;"
            />
            <div style="display: flex; flex-direction: column; text-align: left;">
              <span style="font-weight: 800; font-size: 11px; color: #0F172A;">${(partner.name || 'Collector').split(' ')[0]}</span>
              <span style="font-size: 9.5px; color: #059669; font-weight: 800;">★ ${partner.rating || '4.9'} • ${partner.distanceKm || '1.1'}km</span>
            </div>
          </div>
          <div style="
            width: 0; 
            height: 0; 
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid ${isEnRoute ? '#10B981' : '#F59E0B'};
          "></div>
        </div>
      `;

      partnerEl.addEventListener('click', () => {
        setSelectedPartner(partner);
      });

      const pMarker = new mapboxgl.Marker({ element: partnerEl, anchor: 'bottom' })
        .setLngLat(partnerLngLat)
        .addTo(map);

      partnerMarkersRef.current.push(pMarker);
    });
  }, []);

  // Update markers and route line whenever cityPartners, selectedPartner, or user coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    updatePartnerMarkers(map, cityPartners);

    const userLngLat = toLngLat(currentCoords);
    const activeTarget = selectedPartner || nearestPartner;
    if (activeTarget && activeTarget.coords) {
      const targetLngLat = toLngLat(activeTarget.coords);
      updateRouteLine(map, userLngLat, targetLngLat);
    }
  }, [cityPartners, currentCoords, selectedPartner, nearestPartner, updatePartnerMarkers, updateRouteLine]);

  // When user coordinates change dynamically (e.g. after geolocation), re-position and fly
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const userLngLat = toLngLat(currentCoords);

    const label = activeUserLocation?.locality 
      ? `Your Location: ${activeUserLocation.locality}` 
      : cityData.userLocation.name;
    const addr = activeUserLocation?.fullAddress || cityData.userLocation.address;

    updateUserMarker(map, userLngLat, label, addr);

    if (nearestPartner && nearestPartner.coords) {
      const nearestLngLat = toLngLat(nearestPartner.coords);
      updateRouteLine(map, userLngLat, nearestLngLat);
    }
  }, [currentCoords, activeUserLocation, nearestPartner, updateRouteLine, updateUserMarker, cityData]);

  // Locate Current Doorstep (Browser Geolocation + Mapbox Geocoding)
  const handleDetectCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const pos = await getUserCoordinates();
      const lng = pos.longitude;
      const lat = pos.latitude;

      // Reverse geocode via Mapbox
      const geo = await reverseGeocodeMapbox(lng, lat, token);
      setActiveUserLocation(geo);
      onLocationDetected?.(geo);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo({
          center: [lng, lat],
          zoom: 14.5,
          essential: true,
          duration: 1800
        });
      }

      setLocationToast(`📍 Live Doorstep Detected: ${geo.locality || geo.city} (${geo.pincode || ''})`);
      setTimeout(() => setLocationToast(null), 5000);
    } catch (err) {
      console.error('Location detection failed:', err);
      alert(err.message || 'Could not detect your current location. Please verify browser permissions.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleCenterOnUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: toLngLat(currentCoords),
        zoom: 14.5,
        essential: true
      });
    }
  };

  return (
    <div style={{
      position: 'relative',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-xl)',
      background: '#E2E8F0',
      minHeight: '480px'
    }}>
      {/* If Mapbox Token is NOT set, show clean setup prompt */}
      {!token ? (
        <div style={{
          minHeight: '480px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem',
          background: 'linear-gradient(135deg, #072e1c 0%, #0D5C3A 100%)',
          color: '#FFFFFF',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            color: 'var(--color-accent-mint)'
          }}>
            <Key size={32} />
          </div>

          <h3 style={{ color: '#FFFFFF', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Enter Your Mapbox Access Token
          </h3>
          <p style={{ color: '#E2E8F0', maxWidth: '520px', fontSize: '0.925rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            To view high-resolution vector maps for <strong>{cityData.name}</strong>, paste your free public token below or save it to <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>kabadconnect-web/.env</code>.
          </p>

          <form onSubmit={handleSaveToken} style={{
            display: 'flex',
            gap: '0.65rem',
            maxWidth: '480px',
            width: '100%',
            marginBottom: '1.25rem'
          }}>
            <input
              type="text"
              placeholder="pk.eyJ1..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
            <button type="submit" className="btn btn-gold">
              <Sparkles size={16} />
              <span>Load Map</span>
            </button>
          </form>

          <a
            href="https://account.mapbox.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-accent-mint-light)',
              fontSize: '0.85rem',
              textDecoration: 'underline'
            }}
          >
            <span>Get a free Mapbox public token from account.mapbox.com</span>
            <ExternalLink size={13} />
          </a>
        </div>
      ) : (
        <>
          {/* Top Floating Radar Bar */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            maxWidth: 'calc(100% - 220px)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            <span style={{
              width: '9px',
              height: '9px',
              minWidth: '9px',
              borderRadius: '50%',
              background: 'var(--color-accent-mint)',
              boxShadow: '0 0 8px var(--color-accent-mint)'
            }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong>Radar:</strong> {activeUserLocation?.locality ? `${activeUserLocation.locality} • ` : ''}{cityPartners.length} Active Verified Collectors Near Doorstep
            </span>
          </div>

          {/* Top Right Actions: "Use Live Location" & "Recenter" */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '56px',
            zIndex: 10,
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button
              onClick={handleDetectCurrentLocation}
              disabled={isLocating}
              style={{
                background: 'linear-gradient(135deg, #0D5C3A 0%, #10B981 100%)',
                border: '1px solid var(--color-accent-mint)',
                borderRadius: 'var(--radius-full)',
                padding: '0.55rem 0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                cursor: isLocating ? 'wait' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Detect real current location using GPS"
            >
              {isLocating ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Locate size={15} />
              )}
              <span>{isLocating ? 'Detecting...' : 'Use Current Location'}</span>
            </button>
          </div>

          {/* Mapbox Canvas Container */}
          <div 
            ref={mapContainerRef} 
            style={{ width: '100%', height: '480px' }}
          />

          {/* Toast Notification for Location Success */}
          {locationToast && (
            <div style={{
              position: 'absolute',
              top: '65px',
              left: '16px',
              zIndex: 15,
              background: '#0D5C3A',
              color: '#FFFFFF',
              padding: '0.65rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'fadeIn 0.25s ease'
            }}>
              <CheckCircle2 size={16} color="#34D399" />
              <span>{locationToast}</span>
            </div>
          )}

          {/* Error notice if token is invalid */}
          {mapError && (
            <div style={{
              position: 'absolute',
              top: '70px',
              left: '16px',
              right: '16px',
              zIndex: 10,
              padding: '0.75rem 1rem',
              background: '#FEF2F2',
              border: '1px solid #F87171',
              borderRadius: 'var(--radius-md)',
              color: '#991B1B',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>{mapError}</span>
              <button
                onClick={() => {
                  saveMapboxToken('');
                  setToken('');
                }}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.75rem' }}
              >
                Change Token
              </button>
            </div>
          )}

          {/* Bottom Floating Info Card for Selected Partner */}
          {selectedPartner && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              zIndex: 10,
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              animation: 'fadeIn 0.25s ease'
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img
                  src={selectedPartner.photo || selectedPartner.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                  alt={selectedPartner.name}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'; }}
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: '2px solid var(--color-accent-mint)'
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{selectedPartner.name}</h4>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle2 size={12} /> Digital Scale
                    </span>
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                      {selectedPartner.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    {selectedPartner.businessName} • {selectedPartner.vehicle} ({selectedPartner.vehicleReg})
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.775rem', marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: '#F59E0B', fontWeight: 700 }}>★ {selectedPartner.rating} ({selectedPartner.reviewsCount} reviews)</span>
                    <span>📍 ~<strong>{selectedPartner.distanceKm} km</strong> from your doorstep</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>⏱️ Dynamic ETA: ~{selectedPartner.etaMinutes} mins</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={() => onSelectPartnerForBooking(selectedPartner)}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.35rem' }}
                >
                  <Calendar size={16} />
                  <span>Book Pickup with {selectedPartner.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
