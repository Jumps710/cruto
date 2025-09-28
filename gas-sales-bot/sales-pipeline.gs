const SalesSearchPipeline = {
  buildInitialResponse(params) {
    const items = SalesDataRepository.fetchTopRankings(params.target);
    if (!items || items.length === 0) {
      return [createTextMessage('該当データがありませんでした。')];
    }
    const ranked = SalesRankingService.rankWithDistance(items, params.lat, params.lng);
    return SalesResponseBuilder.buildBatches(ranked, params, 0);
  },

  buildMoreResponse(params) {
    const items = SalesDataRepository.fetchTopRankings(params.target);
    if (!items || items.length === 0) {
      return [createTextMessage('該当データがありませんでした。')];
    }
    const ranked = SalesRankingService.rankWithDistance(items, params.lat, params.lng);
    return SalesResponseBuilder.buildBatches(ranked, params, params.offset || 0);
  }
};
