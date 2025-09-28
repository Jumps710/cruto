const SalesSearchHandlers = {
  handleTargetSelection(data, userId) {
    if (!data || !data.target) {
      return [createTextMessage('ターゲット情報が取得できませんでした。もう一度お試しください。')];
    }
    if (data.target === 'counsel') {
      return [createTextMessage('相談支援事業所のサジェストは現在準備中です。ほかのターゲットを選択してください。')];
    }
    if (Number.isNaN(data.lat) || Number.isNaN(data.lng)) {
      return [createTextMessage('位置情報が無効です。再度お送りください。')];
    }
    return SalesSearchPipeline.buildInitialResponse(data);
  },

  handleMoreRequest(data, userId) {
    if (!data || !data.target) {
      return [createTextMessage('リクエスト内容が不明です。メニューから再度開始してください。')];
    }
    return SalesSearchPipeline.buildMoreResponse(data);
  }
};
