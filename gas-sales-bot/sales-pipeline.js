const SalesSearchPipeline = {
  buildInitialResponse(params) {
    const items = SalesDataRepository.fetchTopRankings(params.target);
    if (!items || items.length === 0) {
      return [createTextMessage('\u5bfe\u8c61\u30c7\u30fc\u30bf\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f\u3002')];
    }
    SalesLogger.log('target_select', { target: params.target, lat: params.lat, lng: params.lng });
    const ranked = SalesRankingService.rankWithDistance(items, params.lat, params.lng);
    const messages = SalesResponseBuilder.buildBatches(ranked, params, 0);
    const intro = createTextMessage('\u5951\u7d04\u7387\u4e0a\u4f4d\u304b\u3089\u8a2a\u554f\u5019\u88dc\u3092\u3054\u6848\u5185\u3057\u307e\u3059\u3002');
    return [intro].concat(messages);
  },

  buildMoreResponse(params) {
    const items = SalesDataRepository.fetchTopRankings(params.target);
    if (!items || items.length === 0) {
      return [createTextMessage('\u5bfe\u8c61\u30c7\u30fc\u30bf\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3067\u3057\u305f\u3002')];
    }
    SalesLogger.log('more_request', { target: params.target, lat: params.lat, lng: params.lng, offset: params.offset });
    const ranked = SalesRankingService.rankWithDistance(items, params.lat, params.lng);
    const messages = SalesResponseBuilder.buildBatches(ranked, params, params.offset || 0);
    return messages;
  }
};
