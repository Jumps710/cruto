// Logシートを作成
// スクリプトプロパティを入れ替え

/************* スクリプトプロパティの利用 *************/
const pdfSenderProperties = PropertiesService.getScriptProperties();
const BOT_ID = pdfSenderProperties.getProperty('BOT_ID');
const CHANNEL_ID = pdfSenderProperties.getProperty('CHANNEL_ID');
const SHEET_NAME = pdfSenderProperties.getProperty('SHEET_NAME');
const RANGE_A1 = pdfSenderProperties.getProperty('RANGE_A1');
const SPREADSHEET_ID = pdfSenderProperties.getProperty('SPREADSHEET_ID');

/************* メニュー追加 *************/
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('LINE WORKS通知')
    .addItem('PDFを作成してBot送信', 'notifyChannelBotFromSheet')
    .addToUi();
}

/************* メイン関数 *************/
function notifyChannelBotFromSheet() {
  try {
    const pdf = exportRangePdf_();
    lwBotSendFile(pdf);
    SpreadsheetApp.getUi().alert('LINE WORKS Botへの通知が完了しました');
  } catch (e) {
    SpreadsheetApp.getUi().alert(`エラーが発生しました: ${e.message}`);
  }
}

/************* PDF作成 *************/
function exportRangePdf_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SHEET_NAME);
  const pdfUrl =
    `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?` +
    `format=pdf&size=A4&portrait=false&fitw=true&gridlines=false&sheetnames=false&` +
    `range=${encodeURIComponent(RANGE_A1)}&gid=${sh.getSheetId()}`;

  // B1とB3の値を取得
  const b1 = sh.getRange('B1').getValue();
  const b3 = sh.getRange('B3').getValue();

  // 今日の日付をYYYYMMDD形式で取得
  const today = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyyMMdd");

  // ファイル名生成
  const fileName = `${b1}_${b3}_${today}.pdf`;

  const blob = UrlFetchApp.fetch(pdfUrl, {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }
 }).getBlob().setName(fileName);

  return blob;
}

/************* ログ記録関数（メッセージ送信時のみ、ユーザー名付き） *************/
function logToSheet(message) {
  const userEmail = Session.getActiveUser().getEmail() || "Unknown User";
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const logSheet = sheet.getSheetByName('Log');
  const sh = sheet.getSheetByName(SHEET_NAME);
  const b1 = sh.getRange('B1').getValue();
  const b3 = sh.getRange('B3').getValue();
  logSheet.appendRow([new Date(), `${userEmail} ${message} ID${b1} 氏名_${b3}`]);
}

/************* LINE WORKS Botへのファイル送信まとめ *************/
function lwBotSendFile(fileBlob) {
  try {
    const token = getLWBotAccessToken();
    const uploadInfo = getLWUploadUrl(token, fileBlob.getName());
    uploadFileToLW(uploadInfo.uploadUrl, fileBlob, token);
    sendLWBotFileMessage(token, CHANNEL_ID, uploadInfo.fileId);
  } catch (e) {
    logToSheet(`より、PDF送信失敗しました: ${e.message}`);
    throw e;
  }
}

// ファイルのアップロードURL取得
function getLWUploadUrl(botToken, fileName) {
  const res = UrlFetchApp.fetch(`https://www.worksapis.com/v1.0/bots/${BOT_ID}/attachments`, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: `Bearer ${botToken}` },
    payload: JSON.stringify({ fileName: fileName })
  });
  const data = JSON.parse(res.getContentText());
  return data;
}

// ファイルのアップロード
function uploadFileToLW(uploadUrl, fileBlob, botToken) {
  const boundary = "----WebKitFormBoundary" + new Date().getTime();
  const delimiter = "--" + boundary + "\r\n";
  const closeDelimiter = "\r\n--" + boundary + "--";

  const body = delimiter +
    'Content-Disposition: form-data; name="Filedata"; filename="' + fileBlob.getName() + '"\r\n' +
    'Content-Type: ' + fileBlob.getContentType() + '\r\n\r\n';

  const footer = closeDelimiter;

  const payload = concatByteArrays([
    Utilities.newBlob(body).getBytes(),
    fileBlob.getBytes(),
    Utilities.newBlob(footer).getBytes()
  ]);

  const options = {
    method: 'post',
    contentType: 'multipart/form-data; boundary=' + boundary,
    payload: payload,
    headers: {
      Authorization: `Bearer ${botToken}`
    },
    muteHttpExceptions: true
  };

  const res = UrlFetchApp.fetch(uploadUrl, options);
  if (!(res.getResponseCode() >= 200 && res.getResponseCode() < 300)) {
    throw new Error(`ファイルアップロード失敗: ${res.getResponseCode()} - ${res.getContentText()}`);
  }
}

// バイト配列
function concatByteArrays(blobs) {
  let result = [];
  blobs.forEach(b => {
    result = result.concat(Array.prototype.slice.call(b));
  });
  return new Uint8Array(result);
}

// Botメッセージ送信API
function sendLWBotFileMessage(botToken, channelId, fileId) {
  const res = UrlFetchApp.fetch(`https://www.worksapis.com/v1.0/bots/${BOT_ID}/channels/${channelId}/messages`, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: `Bearer ${botToken}` },
    payload: JSON.stringify({
      content: { type: 'file', fileId: fileId }
    }),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() >= 200 && res.getResponseCode() < 300) {
    logToSheet(`より、PDF送信が成功しました`);
  } else {
    logToSheet(`より、PDF送信失敗しました: ${res.getResponseCode()} - ${res.getContentText()}`);
    throw new Error(`PDF送信失敗: ${res.getResponseCode()} - ${res.getContentText()}`);
  }
}

