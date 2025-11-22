const SalesSearchHandlers = {
  handleTargetSelection(data, userId) {
    if (!data || !data.target) {
      return [createTextMessage('\u30bf\u30fc\u30b2\u30c3\u30c8\u60c5\u5831\u304c\u53d6\u5f97\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u518d\u5ea6\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002')];
    }
    if (data.target === 'counsel') {
      return [createTextMessage('\u76f8\u8ac7\u652f\u63f4\u4e8b\u696d\u6240\u306e\u691c\u7d22\u306f\u6e96\u5099\u4e2d\u3067\u3059\u3002\u5225\u306e\u30bf\u30fc\u30b2\u30c3\u30c8\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002')];
    }
    if (Number.isNaN(data.lat) || Number.isNaN(data.lng)) {
      return [createTextMessage('\u4f4d\u7f6e\u60c5\u5831\u304c\u4e0d\u6b63\u3067\u3059\u3002\u518d\u5ea6\u9001\u4fe1\u3057\u3066\u304f\u3060\u3055\u3044\u3002')];
    }
    data.offset = 0;
    return SalesSearchPipeline.buildInitialResponse(data);
  },

  handleMoreRequest(data, userId) {
    if (!data || !data.target) {
      return [createTextMessage('\u8ffd\u52a0\u691c\u7d22\u3092\u5b9f\u884c\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u30e1\u30cb\u30e5\u30fc\u304b\u3089\u518d\u5ea6\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002')];
    }
    if (Number.isNaN(data.lat) || Number.isNaN(data.lng)) {
      return [createTextMessage('\u4f4d\u7f6e\u60c5\u5831\u304c\u4e0d\u6b63\u3067\u3059\u3002\u518d\u5ea6\u30ea\u30af\u30a8\u30b9\u30c8\u3057\u3066\u304f\u3060\u3055\u3044\u3002')];
    }
    const parsed = parseInt(data.offset || '0', 10);
    const offset = Number.isNaN(parsed) ? SALES_RESPONSE_PAGE_SIZE : parsed;
    if (offset >= SALES_RESPONSE_MAX_RESULTS) {
      return [createTextMessage('\u3053\u308c\u4ee5\u4e0a\u306e\u691c\u7d22\u7d50\u679c\u306f\u3042\u308a\u307e\u305b\u3093\u3002')];
    }
    data.offset = offset;
    return SalesSearchPipeline.buildMoreResponse(data);
  }
};
