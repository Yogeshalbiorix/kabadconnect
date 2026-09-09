/**
 * Mapbox Configuration Helper
 * Reads token from .env (VITE_MAPBOX_TOKEN or VITE_MAP_API_KEY)
 * or from browser localStorage fallback.
 */

export const getMapboxToken = () => {
  const envToken = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.VITE_MAP_API_KEY;
  if (envToken && envToken.trim().length > 0) {
    return envToken.trim();
  }

  try {
    const saved = localStorage.getItem('kabadconnect_mapbox_token');
    if (saved && saved.trim().length > 0) {
      return saved.trim();
    }
  } catch (err) {}

  return null;
};

export const saveMapboxToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('kabadconnect_mapbox_token', token.trim());
    } else {
      localStorage.removeItem('kabadconnect_mapbox_token');
    }
  } catch (err) {}
};

/**
 * Converts [lat, lng] to [lng, lat] for Mapbox GL JS
 */
export const toLngLat = (coords) => {
  if (!coords || !Array.isArray(coords) || coords.length < 2) {
    return [72.5125, 23.0135]; // Default Ahmedabad [lng, lat]
  }
  // If first number is ~20-35 (latitude in India), swap to [longitude, latitude]
  if (coords[0] < 40 && coords[1] > 60) {
    return [coords[1], coords[0]];
  }
  return coords;
};
