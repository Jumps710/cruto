const SalesBot = {
  handleLocation(context) {
    const { latitude, longitude } = context.message;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return [createTextMessage('位置情報を取得できませんでした。もう一度送信してください。')];
    }
    const quickReply = buildTargetQuickReply(latitude, longitude);
    return [
      {
        type: 'text',
        text: 'どのターゲットを調べますか？',
        quickReply
      }
    ];
  },

  handlePostback(context) {
    const data = parsePostbackData(context.postback && context.postback.data);
    switch (data.action) {
      case 'start':
        return [buildRequestLocationMessage()];
      case 'choose':
        return SalesSearchHandlers.handleTargetSelection(data, context.source.userId);
      case 'more':
        return SalesSearchHandlers.handleMoreRequest(data, context.source.userId);
      default:
        return [createTextMessage('サポートしていない操作です。メニューからやり直してください。')];
    }
  }
};

function buildRequestLocationMessage() {
  return {
    type: 'text',
    text: 'まず位置情報を取得します。ボタンを押して位置情報を送信してください。',
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'location',
            label: '位置情報を送信'
          }
        }
      ]
    }
  };
}

function buildTargetQuickReply(lat, lng) {
  const base = `lat=${lat}&lng=${lng}`;
  return {
    items: [
      createQuickReplyButton('居宅', `action=choose&target=home&${base}`),
      createQuickReplyButton('医療施設', `action=choose&target=medical&${base}`),
      createQuickReplyButton('施設', `action=choose&target=facility&${base}`),
      createQuickReplyButton('相談支援事業所(準備中)', `action=choose&target=counsel&${base}`)
    ]
  };
}

function createQuickReplyButton(label, data) {
  return {
    type: 'action',
    action: {
      type: 'postback',
      label,
      data
    }
  };
}

function parsePostbackData(data) {
  const params = new URLSearchParams(data || '');
  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  result.lat = parseFloat(result.lat);
  result.lng = parseFloat(result.lng);
  result.offset = parseInt(result.offset || '0', 10);
  return result;
}
