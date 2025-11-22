const SalesRankingService = {
  rankWithDistance(items, lat, lng) {
    const hasCoordinates = typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng);
    return items.map(item => {
      const recordLat = (typeof item.lat === 'number' && isFinite(item.lat)) ? item.lat : null;
      const recordLng = (typeof item.lng === 'number' && isFinite(item.lng)) ? item.lng : null;
      const geo = recordLat !== null && recordLng !== null
        ? { lat: recordLat, lng: recordLng }
        : GeoCache.resolve(item.address);
      const distanceKm = (hasCoordinates && geo)
        ? GeoUtils.haversine(lat, lng, geo.lat, geo.lng)
        : null;
      return Object.assign({}, item, {
        distanceKm,
        lat: geo ? geo.lat : null,
        lng: geo ? geo.lng : null
      });
    });
  }
};
