/**
 * Geolocation & Mapbox Reverse Geocoding Utility
 * Provides HTML5 GPS location, Mapbox geocoding resolution,
 * and Haversine distance calculations for KabadConnect.
 */

/**
 * Get user's current GPS position via browser Geolocation API
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number }>}
 */
export const getUserCoordinates = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let message = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission was denied. Please allow location access in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is currently unavailable.';
            break;
          case error.TIMEOUT:
            message = 'The request to get user location timed out.';
            break;
          default:
            message = error.message || message;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  });
};

/**
 * Reverse Geocode [lng, lat] using Mapbox Places API
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {string} token - Mapbox public access token
 * @returns {Promise<{
 *   fullAddress: string,
 *   locality: string,
 *   city: string,
 *   pincode: string,
 *   state: string,
 *   coords: [number, number],
 *   lngLat: [number, number]
 * }>}
 */
export const reverseGeocodeMapbox = async (lng, lat, token) => {
  if (!token) {
    throw new Error('Mapbox access token is required for geocoding.');
  }

  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,poi,neighborhood,locality,place,postcode,region`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Mapbox geocoding error: ${response.statusText}`);
  }

  const data = await response.json();
  const features = data.features || [];

  if (features.length === 0) {
    return {
      fullAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      locality: 'Current Location',
      city: 'Your City',
      pincode: '',
      state: '',
      coords: [lat, lng],
      lngLat: [lng, lat]
    };
  }

  // Extract components from Mapbox response
  let fullAddress = features[0]?.place_name || '';
  let locality = '';
  let city = '';
  let pincode = '';
  let state = '';

  // Look through feature hierarchy and context
  for (const feat of features) {
    const placeType = feat.place_type?.[0];
    if (!locality && (placeType === 'neighborhood' || placeType === 'locality' || placeType === 'address')) {
      locality = feat.text;
    }
    if (!city && placeType === 'place') {
      city = feat.text;
    }
    if (!pincode && placeType === 'postcode') {
      pincode = feat.text;
    }
    if (!state && placeType === 'region') {
      state = feat.text;
    }
  }

  // Also parse context array of the top feature
  if (features[0]?.context) {
    for (const ctx of features[0].context) {
      if (ctx.id.startsWith('postcode') && !pincode) {
        pincode = ctx.text;
      } else if (ctx.id.startsWith('place') && !city) {
        city = ctx.text;
      } else if (ctx.id.startsWith('neighborhood') && !locality) {
        locality = ctx.text;
      } else if (ctx.id.startsWith('region') && !state) {
        state = ctx.text;
      }
    }
  }

  // Fallback defaults if components are empty
  if (!locality) locality = features[0]?.text || 'Your Area';
  if (!city) city = 'Ahmedabad';

  return {
    fullAddress,
    locality,
    city,
    pincode,
    state,
    coords: [lat, lng],
    lngLat: [lng, lat]
  };
};

/**
 * Calculates Haversine distance in Kilometers between two [lat, lng] points
 * @param {[number, number]} coords1 - [lat, lng]
 * @param {[number, number]} coords2 - [lat, lng]
 * @returns {number} Distance in kilometers (rounded to 1 decimal place)
 */
export const calculateDistanceKm = (coords1, coords2) => {
  if (!coords1 || !coords2 || coords1.length < 2 || coords2.length < 2) {
    return 1.2;
  }

  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.max(0.3, Math.round(distance * 10) / 10);
};

/**
 * Estimates arrival time in minutes based on distance
 * @param {number} distanceKm
 * @returns {number} Minutes
 */
export const calculateEtaMinutes = (distanceKm) => {
  // Average urban speed ~18 km/h + 6 mins prep/traffic buffer
  const minutes = Math.round((distanceKm / 18) * 60 + 6);
  return Math.max(8, Math.min(60, minutes));
};

/**
 * Calculates dynamic distances for all partners relative to user coordinates
 * and sorts by closest first.
 * @param {Array} partners
 * @param {[number, number]} userCoords - [lat, lng]
 * @returns {Array} Sorted partners with dynamic distanceKm and etaMinutes
 */
export const rankPartnersByProximity = (partners, userCoords) => {
  if (!userCoords || !Array.isArray(partners)) return partners;

  return partners
    .map((partner) => {
      const dist = calculateDistanceKm(userCoords, partner.coords);
      const eta = calculateEtaMinutes(dist);
      return {
        ...partner,
        distanceKm: dist,
        etaMinutes: eta
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

/**
 * Fallback mapping for major Indian postal circles & pincode prefixes
 */
const PINCODE_PREFIX_MAP = {
  '11': { city: 'New Delhi', state: 'Delhi', district: 'Delhi' },
  '12': { city: 'Gurgaon', state: 'Haryana', district: 'Gurgaon' },
  '13': { city: 'Ambala', state: 'Haryana', district: 'Ambala' },
  '14': { city: 'Ludhiana', state: 'Punjab', district: 'Ludhiana' },
  '16': { city: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh' },
  '20': { city: 'Ghaziabad / Noida', state: 'Uttar Pradesh', district: 'Ghaziabad' },
  '22': { city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow' },
  '24': { city: 'Dehradun', state: 'Uttarakhand', district: 'Dehradun' },
  '30': { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur' },
  '38': { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad' },
  '39': { city: 'Surat', state: 'Gujarat', district: 'Surat' },
  '40': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai' },
  '41': { city: 'Pune', state: 'Maharashtra', district: 'Pune' },
  '44': { city: 'Nagpur', state: 'Maharashtra', district: 'Nagpur' },
  '45': { city: 'Indore', state: 'Madhya Pradesh', district: 'Indore' },
  '46': { city: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal' },
  '50': { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad' },
  '56': { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban' },
  '57': { city: 'Mangalore', state: 'Karnataka', district: 'Dakshina Kannada' },
  '60': { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
  '64': { city: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore' },
  '68': { city: 'Kochi', state: 'Kerala', district: 'Ernakulam' },
  '70': { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata' },
  '80': { city: 'Patna', state: 'Bihar', district: 'Patna' },
  '83': { city: 'Ranchi', state: 'Jharkhand', district: 'Ranchi' }
};

/**
 * Fetch City, State, District, and Post Offices by 6-digit Indian Pincode
 * Uses official postalpincode.in API with instant cache & offline prefix fallback.
 * @param {string} pincode
 * @returns {Promise<{
 *   success: boolean,
 *   pincode: string,
 *   city: string,
 *   state: string,
 *   district: string,
 *   area: string,
 *   postOffices: string[],
 *   formatted?: string,
 *   isFallback?: boolean,
 *   message?: string
 * }>}
 */
export const fetchLocationByPincode = async (pincode) => {
  const clean = String(pincode || '').trim().replace(/\D/g, '');
  if (clean.length !== 6) {
    return {
      success: false,
      pincode: clean,
      message: 'Pincode must be exactly 6 digits.'
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice) && data[0].PostOffice.length > 0) {
        const poList = data[0].PostOffice;
        const primaryPo = poList[0];
        const uniqueNames = [...new Set(poList.map(p => p.Name).filter(Boolean))];

        const city = primaryPo.District || primaryPo.Division || primaryPo.Block || primaryPo.Circle || '';
        const state = primaryPo.State || primaryPo.Circle || '';
        const district = primaryPo.District || city;
        const area = primaryPo.Name || '';

        return {
          success: true,
          pincode: clean,
          city,
          state,
          district,
          area,
          postOffices: uniqueNames,
          formatted: `${area ? area + ', ' : ''}${city}, ${state}`
        };
      }
    }
  } catch (err) {
    console.warn('[Pincode Lookup] Postal API unavailable, trying prefix fallback:', err.message);
  }

  // Fallback to prefix table
  const prefix = clean.slice(0, 2);
  const matched = PINCODE_PREFIX_MAP[prefix];
  if (matched) {
    return {
      success: true,
      pincode: clean,
      city: matched.city,
      state: matched.state,
      district: matched.district,
      area: '',
      postOffices: [],
      isFallback: true,
      formatted: `${matched.city}, ${matched.state}`
    };
  }

  return {
    success: false,
    pincode: clean,
    message: 'Could not resolve pincode details. Please verify the pincode.'
  };
};

/**
 * Detect Current User Location via Browser GPS and Reverse Geocode
 * Returns address, city, state, pincode, and coordinates.
 * Supports Mapbox Places API with fallback to OpenStreetMap Nominatim.
 */
export const detectCurrentLocationWithAddress = async (token = '') => {
  const coords = await getUserCoordinates();
  const { latitude, longitude } = coords;

  // 1. Try Mapbox if token provided
  if (token) {
    try {
      const geo = await reverseGeocodeMapbox(longitude, latitude, token);
      if (geo) {
        let resolvedCity = geo.city;
        let resolvedState = geo.state;
        if (geo.pincode && (!resolvedCity || !resolvedState)) {
          const pinData = await fetchLocationByPincode(geo.pincode);
          if (pinData.success) {
            resolvedCity = resolvedCity || pinData.city;
            resolvedState = resolvedState || pinData.state;
          }
        }

        return {
          success: true,
          address: geo.fullAddress || `${geo.locality || ''}, ${resolvedCity}`.trim(),
          locality: geo.locality || '',
          city: resolvedCity || 'Your City',
          state: resolvedState || '',
          pincode: geo.pincode || '',
          latitude,
          longitude,
          source: 'mapbox'
        };
      }
    } catch (mapboxErr) {
      console.warn('[Geolocation] Mapbox reverse geocode failed, trying Nominatim fallback:', mapboxErr.message);
    }
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: { 'User-Agent': 'KabadConnect/1.0' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (nomRes.ok) {
      const data = await nomRes.json();
      const addr = data.address || {};

      const pincode = addr.postcode || '';
      const city = addr.city || addr.town || addr.municipality || addr.district || addr.county || '';
      const state = addr.state || '';
      const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.road || '';
      const address = data.display_name || [addr.road, locality, city].filter(Boolean).join(', ');

      return {
        success: true,
        address,
        locality,
        city: city || 'Your City',
        state,
        pincode,
        latitude,
        longitude,
        source: 'nominatim'
      };
    }
  } catch (nomErr) {
    console.warn('[Geolocation] Nominatim reverse geocode failed:', nomErr.message);
  }

  // Fallback with GPS coordinates
  return {
    success: true,
    address: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    locality: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '',
    latitude,
    longitude,
    source: 'gps_only'
  };
};

/**
 * Fast IP-based Geolocation resolution (No browser permission required)
 * Uses ipwho.is with fallback to bigdatacloud reverse-geocode-client.
 * @returns {Promise<{
 *   fullAddress: string,
 *   locality: string,
 *   city: string,
 *   pincode: string,
 *   state: string,
 *   country: string,
 *   coords: [number, number],
 *   lngLat: [number, number]
 * } | null>}
 */
export const fetchIpLocation = async () => {
  // Provider 1: ipwho.is (fast, HTTPS, CORS enabled)
  try {
    const res = await fetch('https://ipwho.is/');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.city) {
        const lat = Number(data.latitude);
        const lng = Number(data.longitude);
        return {
          fullAddress: `${data.city}, ${data.region || ''}, ${data.country || 'India'}`.replace(', ,', ','),
          locality: data.city,
          city: data.city,
          pincode: data.postal || '',
          state: data.region || '',
          country: data.country || 'India',
          coords: [lat, lng],
          lngLat: [lng, lat]
        };
      }
    }
  } catch (err) {
    console.warn('[Geolocation] ipwho.is lookup failed, trying backup provider:', err.message);
  }

  // Provider 2: bigdatacloud reverse-geocode-client
  try {
    const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
    if (res.ok) {
      const data = await res.json();
      if (data && (data.city || data.locality)) {
        const city = data.city || data.locality;
        const lat = Number(data.latitude);
        const lng = Number(data.longitude);
        return {
          fullAddress: `${city}, ${data.principalSubdivision || ''}, ${data.countryName || 'India'}`,
          locality: data.locality || city,
          city: city,
          pincode: data.postcode || '',
          state: data.principalSubdivision || '',
          country: data.countryName || 'India',
          coords: [lat, lng],
          lngLat: [lng, lat]
        };
      }
    }
  } catch (err) {
    console.warn('[Geolocation] bigdatacloud lookup failed:', err.message);
  }

  return null;
};

/**
 * Resolves any raw detected city name into the app's standard city hub names
 * @param {string} city
 * @param {string} state
 * @param {string} locality
 * @returns {string} Hub full name (e.g. "Ahmedabad (SG Highway / Prahlad Nagar)")
 */
export const resolveCityFullName = (city = '', state = '', locality = '') => {
  const c = (city || '').toLowerCase();
  const s = (state || '').toLowerCase();

  if (c.includes('ahmedabad') || (s.includes('gujarat') && c.includes('ahmedabad'))) {
    return 'Ahmedabad (SG Highway / Prahlad Nagar)';
  }
  if (c.includes('gurugram') || c.includes('gurgaon')) {
    return 'Gurugram (Cyber City / Sohna Rd)';
  }
  if (c.includes('ghaziabad') || c.includes('vaishali') || c.includes('indirapuram')) {
    return 'Ghaziabad & Vaishali';
  }
  if (c.includes('bengaluru') || c.includes('bangalore')) {
    return 'Bengaluru (Koramangala / HSR)';
  }
  if (c.includes('mumbai') || c.includes('bombay') || c.includes('thane') || c.includes('navi mumbai')) {
    return 'Mumbai (Bandra / Andheri)';
  }
  if (c.includes('delhi') || s.includes('delhi') || c.includes('noida')) {
    return 'Delhi NCR (Indirapuram / Noida)';
  }
  if (c.includes('pune')) {
    return 'Pune (Kothrud / Hinjewadi)';
  }
  if (c.includes('hyderabad')) {
    return 'Hyderabad (Gachibowli / Hitech City)';
  }
  if (c.includes('jaipur')) {
    return 'Jaipur (Malviya Nagar / Mansarovar)';
  }
  if (c.includes('kolkata')) {
    return 'Kolkata (Salt Lake / New Town)';
  }
  if (c.includes('chennai')) {
    return 'Chennai (OMR / Anna Nagar)';
  }
  if (city) {
    return `${city} (${locality || 'Doorstep Area'})`;
  }
  return 'Delhi NCR (Indirapuram / Noida)';
};


