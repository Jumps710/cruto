const GeoUtils = {
  haversine(lat1, lng1, lat2, lng2) {
    const toRad = angle => (angle * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // 0.1km 精度
  }
};

const GeoCache = {
  resolve(address) {
    if (!address) return null;
    const cache = CacheService.getScriptCache();
    const key = `geo:${address}`;
    const cached = cache.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    const stored = PropertiesService.getScriptProperties().getProperty(key);
    if (stored) {
      cache.put(key, stored, 21600);
      return JSON.parse(stored);
    }
    const geo = geocodeAddress(address);
    if (geo) {
      const serialized = JSON.stringify(geo);
      cache.put(key, serialized, 21600);
      PropertiesService.getScriptProperties().setProperty(key, serialized);
    }
    return geo;
  }
};

function geocodeAddress(address) {
  if (!ENV.GEO.USE_GOOGLE) {
    return null;
  }
  const apiKey = ENV.GEO.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('Google Maps API key not configured');
    return null;
  }
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const data = JSON.parse(response.getContentText());
  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    console.warn('Geocode failed:', address, data.status);
    return null;
  }
  const location = data.results[0].geometry.location;
  return { lat: location.lat, lng: location.lng };
}
