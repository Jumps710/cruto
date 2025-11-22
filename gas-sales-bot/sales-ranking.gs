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
  },

  /**
   * 距離が取れるものを距離昇順で優先し、同距離または距離なし同士はスコア降順で並べる。
   * limit件に絞って返却する。
   */
  pickTopByDistance(items, limit) {
    const cappedLimit = limit || 10;
    const normalized = items.map(item => {
      const distance = (typeof item.distanceKm === 'number' && isFinite(item.distanceKm)) ? item.distanceKm : null;
      return Object.assign({}, item, { distanceKm: distance });
    });

    normalized.sort((a, b) => {
      const da = a.distanceKm;
      const db = b.distanceKm;
      const hasA = da !== null && da !== undefined;
      const hasB = db !== null && db !== undefined;

      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;
      if (hasA && hasB && da !== db) return da - db;

      const sa = (typeof a.score === 'number' && isFinite(a.score)) ? a.score : -Infinity;
      const sb = (typeof b.score === 'number' && isFinite(b.score)) ? b.score : -Infinity;
      return sb - sa;
    });

    return normalized.slice(0, cappedLimit);
  }
};
