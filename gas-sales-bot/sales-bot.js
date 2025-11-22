const QUICK_REPLY_TEXTS = ['\u5c45\u5b85\u4ecb\u8b77', '\u533b\u7642\u65bd\u8a2d', '\u65bd\u8a2d', '\u76f8\u8ac7\u652f\u63f4\u4e8b\u696d\u6240\uff08\u6e96\u5099\u4e2d\uff09', '\u3082\u3063\u3068\u898b\u308b', '\u3084\u308a\u76f4\u3059'];

const SalesBot = {
  handleLocation(context) {
    const { latitude, longitude } = context.message;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return [createTextMessage('\u4f4d\u7f6e\u60c5\u5831\u3092\u53d6\u5f97\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u3082\u3046\u4e00\u5ea6\u9001\u4fe1\u3057\u3066\u304f\u3060\u3055\u3044\u3002')];
    }
    const quickReply = buildTargetQuickReply(latitude, longitude);
    return [
      {
        type: 'text',
        text: '\u3069\u306e\u30bf\u30fc\u30b2\u30c3\u30c8\u3092\u8abf\u3079\u307e\u3059\u304b\uff1f',
        quickReply
      }
    ];
  },

  handleText(context) {
    const textValue = context && context.message && typeof context.message.text === 'string'
      ? context.message.text.trim()
      : '';
    if (textValue && QUICK_REPLY_TEXTS.indexOf(textValue) >= 0) {
      return [];
    }
    return [buildRequestLocationMessage()];
  },

  handlePostback(context) {
    const data = parsePostbackData(context.postback && context.postback.data);
    switch (data.action) {
      case 'start':
        return [buildRequestLocationMessage()];
      case 'choose':
        return SalesSearchHandlers.handleTargetSelection(data, context.source && context.source.userId);
      case 'more':
        return SalesSearchHandlers.handleMoreRequest(data, context.source && context.source.userId);
      default:
        return [createTextMessage('\u30b5\u30dd\u30fc\u30c8\u3057\u3066\u3044\u306a\u3044\u64cd\u4f5c\u3067\u3059\u3002\u30e1\u30cb\u30e5\u30fc\u304b\u3089\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002')];
    }
  }
};

function buildRequestLocationMessage() {
  return {
    type: 'text',
    text: '\u5468\u8fba\u3067\u63d0\u6848\u3067\u304d\u308b\u4e8b\u696d\u6240\u3092\u63a2\u3057\u307e\u3059\u3002\u307e\u305a\u4f4d\u7f6e\u60c5\u5831\u3092\u9001\u4fe1\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'location',
            label: '\u4f4d\u7f6e\u60c5\u5831\u3092\u9001\u4fe1',
            displayText: '\u4f4d\u7f6e\u60c5\u5831\u3092\u9001\u4fe1'
          }
        }
      ]
    }
  };
}

function buildTargetQuickReply(lat, lng) {
  return {
    items: [
      createQuickReplyButton('\u5c45\u5b85\u4ecb\u8b77', createPostbackQuery({ action: 'choose', target: 'home', lat, lng })),
      createQuickReplyButton('\u533b\u7642\u65bd\u8a2d', createPostbackQuery({ action: 'choose', target: 'medical', lat, lng })),
      createQuickReplyButton('\u65bd\u8a2d', createPostbackQuery({ action: 'choose', target: 'facility', lat, lng })),
      createQuickReplyButton('\u76f8\u8ac7\u652f\u63f4\u4e8b\u696d\u6240\uff08\u6e96\u5099\u4e2d\uff09', createPostbackQuery({ action: 'choose', target: 'counsel', lat, lng }))
    ]
  };
}

function createQuickReplyButton(label, data) {
  return {
    type: 'action',
    action: {
      type: 'postback',
      label,
      data,
      displayText: label
    }
  };
}

function createPostbackQuery(params) {
  return Object.keys(params)
    .filter(function(key) { return params[key] !== undefined && params[key] !== null; })
    .map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(String(params[key]));
    })
    .join('&');
}

function parsePostbackData(data) {
  const result = {};
  if (!data) {
    return result;
  }
  const pairs = String(data).split('&');
  pairs.forEach(function(pair) {
    if (!pair) {
      return;
    }
    const parts = pair.split('=');
    const key = decodeURIComponent(parts[0] || '');
    const value = decodeURIComponent(parts[1] || '');
    result[key] = value;
  });
  result.lat = result.lat !== undefined ? parseFloat(result.lat) : NaN;
  result.lng = result.lng !== undefined ? parseFloat(result.lng) : NaN;
  result.offset = result.offset !== undefined ? parseInt(result.offset, 10) : 0;
  return result;
}
