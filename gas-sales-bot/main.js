/**
 * 蝟ｶ讌ｭ謾ｯ謠ｴBot 繝｡繧､繝ｳ繧ｨ繝ｳ繝医Μ
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    version: '0.1.0',
    env: CURRENT_ENV,
    message: 'Sales Bot GAS running'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const start = new Date();
  try {
    SalesLogger.log('doPost_start', {
      timestamp: start.toISOString(),
      hasEvent: !!e,
      hasPostData: !!(e && e.postData && e.postData.contents)
    });

    const request = parseLineWorksEvent(e);
    const replyMessages = handleSalesBotEvent(request);

    if (replyMessages && replyMessages.length > 0) {
      replyLineWorksMessages(request, replyMessages);
    }

    return createSuccessResponse();
  } catch (error) {
    SalesLogger.log('doPost_error', {
      message: error && error.message,
      stack: error && error.stack
    });
    logError('doPost', error, e);
    return createErrorResponse(error);
  }
}


function parseLineWorksEvent(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Invalid request: missing postData');
  }
  const payloadText = String(e.postData.contents);
  let payload;
  try {
    payload = JSON.parse(payloadText);
  } catch (parseError) {
    SalesLogger.log('parseLineWorksEvent_json_error', {
      message: parseError && parseError.message,
      payloadPreview: payloadText.substring(0, 500)
    });
    throw parseError;
  }

  let event = null;
  if (payload && Array.isArray(payload.events) && payload.events.length > 0) {
    event = payload.events[0];
  } else if (payload && payload.type && payload.source) {
    event = payload;
  } else {
    SalesLogger.log('parseLineWorksEvent_no_events', {
      payloadPreview: payloadText.substring(0, 500)
    });
    throw new Error('Invalid request: no events');
  }

  const messagePayload = event.message || event.content || null;
  const postbackData = (event.postback && event.postback.data) ? event.postback.data : (typeof event.data === 'string' ? event.data : null);
  const postbackPayload = event.postback || (postbackData ? { data: postbackData } : null);

  return {
    type: event.type,
    replyToken: event.replyToken || null,
    source: event.source || null,
    message: messagePayload,
    postback: postbackPayload,
    timestamp: event.timestamp || payload.issuedTime || null
  };
}

function handleSalesBotEvent(context) {
  switch (context.type) {
    case 'message':
      return handleSalesMessage(context);
    case 'postback':
      return handleSalesPostback(context);
    default:
      return [createTextMessage('\u672a\u5bfe\u5fdc\u306e\u30a4\u30d9\u30f3\u30c8\u3067\u3059\u3002\u30e1\u30cb\u30e5\u30fc\u304b\u3089\u64cd\u4f5c\u3092\u304a\u9858\u3044\u3057\u307e\u3059\u3002')];
  }
}

function handleSalesMessage(context) {
  if (context.message && context.message.type === 'location') {
    return SalesBot.handleLocation(context);
  }
  return SalesBot.handleText(context);
}

function handleSalesPostback(context) {
  return SalesBot.handlePostback(context);
}

function createSuccessResponse() {
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(error) {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: error && error.message ? error.message : String(error)
  })).setMimeType(ContentService.MimeType.JSON);
}

function createTextMessage(text) {
  return { type: 'text', text };
}

function logError(tag, error, raw) {
  console.error(`[${tag}]`, error, raw);
}

