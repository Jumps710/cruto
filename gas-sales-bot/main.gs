/**
 * 営業支援Bot メインエントリ
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
  try {
    const request = parseLineWorksEvent(e);
    const replyMessages = handleSalesBotEvent(request);
    if (replyMessages && replyMessages.length > 0) {
      replyLineWorksMessages(request.replyToken, replyMessages);
    }
    return createSuccessResponse();
  } catch (error) {
    logError('doPost', error, e);
    return createErrorResponse(error);
  }
}

function parseLineWorksEvent(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Invalid request: missing postData');
  }
  const payload = JSON.parse(e.postData.contents);
  const event = payload.events && payload.events[0];
  if (!event) {
    throw new Error('Invalid request: no events');
  }
  return {
    type: event.type,
    replyToken: event.replyToken,
    source: event.source,
    message: event.message,
    postback: event.postback,
    timestamp: event.timestamp
  };
}

function handleSalesBotEvent(context) {
  switch (context.type) {
    case 'message':
      return handleSalesMessage(context);
    case 'postback':
      return handleSalesPostback(context);
    default:
      return [createTextMessage('未対応のイベントです。メニューから操作をお願いします。')];
  }
}

function handleSalesMessage(context) {
  if (context.message.type === 'location') {
    return SalesBot.handleLocation(context);
  }
  return [createTextMessage('固定メニューから「訪問先サジェストを開始」を押してください。')];
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

function replyLineWorksMessages(replyToken, messages) {
  // TODO: LINE WORKS Reply API での送信処理を実装
}

function createTextMessage(text) {
  return { type: 'text', text };
}

function logError(tag, error, raw) {
  console.error(`[${tag}]`, error, raw);
}
