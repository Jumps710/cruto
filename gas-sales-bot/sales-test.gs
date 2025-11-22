function sendTestMessageToMuramatsu() {
  const userId = 'lineworks.muramatsu@works-87651';
  const message = createTextMessage('テストメッセージ：営業支援Botの疎通確認です。');
  sendLineWorksUserMessage(userId, message);
}

function setupSalesFixedMenuTest() {
  try {
    SalesBotMenu.ensureMenu();
    Logger.log('Fixed menu setup completed.');
  } catch (error) {
    Logger.log('Fixed menu setup failed: ' + error);
    throw error;
  }
}

function inspectPersistentMenu() {
  const botId = ENV.SALES_BOT.BOT_ID;
  const accessToken = getLineWorksAccessToken();
  const url = `https://www.worksapis.com/v1.0/bots/${botId}/persistentmenu`;
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
  Logger.log('status: ' + response.getResponseCode());
  Logger.log(response.getContentText());
}
