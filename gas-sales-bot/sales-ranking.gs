const SalesRankingService = {
  rankWithDistance(items, lat, lng) {
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return items;
    }
    return items.map(item => {
      const geo = GeoCache.resolve(item.address);
      return Object.assign({}, item, {
        distanceKm: geo ? GeoUtils.haversine(lat, lng, geo.lat, geo.lng) : null,
        lat: geo ? geo.lat : null,
        lng: geo ? geo.lng : null
      });
    }).sort((a, b) => {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }
};
