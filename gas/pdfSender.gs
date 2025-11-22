/**
 * PDF送信メニューとLINE WORKS通知を担当するスクリプト。
 */

let cachedPdfSenderConfig = null;
function getPdfSenderConfig() {
  if (!cachedPdfSenderConfig) {
    const config = ENV && ENV.PDF_SENDER;
    if (!config) {
      throw new Error('ENV.PDF_SENDER が設定されていません');
    }
    const requiredKeys = ['BOT_ID', 'CHANNEL_ID', 'SHEET_NAME', 'SPREADSHEET_ID'];
    requiredKeys.forEach((key) => {
      if (!config[key]) {
        throw new Error(`ENV.PDF_SENDER.${key} が設定されていません`);
      }
    });
    cachedPdfSenderConfig = config;
  }
  return cachedPdfSenderConfig;
}

let cachedLineWorksConfigForPdf = null;
function getLineWorksConfigForPdfSender() {
  if (!cachedLineWorksConfigForPdf) {
    const config = ENV && ENV.LINE_WORKS;
    if (!config) {
      throw new Error('ENV.LINE_WORKS が設定されていません');
    }
    const requiredKeys = ['CLIENT_ID', 'CLIENT_SECRET', 'SERVICE_ACCOUNT', 'PRIVATE_KEY_FILE'];
    requiredKeys.forEach((key) => {
      if (!config[key]) {
        throw new Error(`ENV.LINE_WORKS.${key} が設定されていません`);
      }
    });
    cachedLineWorksConfigForPdf = config;
  }
  return cachedLineWorksConfigForPdf;
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('LINE WORKS通知')
    .addItem('PDFを作成してBot送信', 'notifyChannelBotFromSheet')
    .addToUi();
}

function notifyChannelBotFromSheet() {
  try {
    const pdf = exportRangePdf_();
    lwBotSendFile(pdf);
    SpreadsheetApp.getUi().alert('LINE WORKS Botへの通知が完了しました');
  } catch (e) {
    SpreadsheetApp.getUi().alert(`エラーが発生しました: ${e.message}`);
  }
}

function exportRangePdf_() {
  const config = getPdfSenderConfig();
  const ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);
  const sh = ss.getSheetByName(config.SHEET_NAME);
  if (!sh) {
    throw new Error(`シートが見つかりません: ${config.SHEET_NAME}`);
  }

  const rangeA1 = (config.RANGE_A1 || '').trim();
  const targetRange = rangeA1 || sh.getDataRange().getA1Notation();
  const params = [
    'format=pdf',
    'size=A4',
    'portrait=false',
    'fitw=true',
    'gridlines=false',
    'sheetnames=false',
    `gid=${sh.getSheetId()}`
  ];
  if (targetRange) {
    params.push(`range=${encodeURIComponent(targetRange)}`);
  }

  const pdfUrl = `https://docs.google.com/spreadsheets/d/${config.SPREADSHEET_ID}/export?${params.join('&')}`;

  const b1 = sh.getRange('B1').getValue();
  const b3 = sh.getRange('B3').getValue();
  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd');
  const fileName = `${b1}_${b3}_${today}.pdf`;

  const blob = UrlFetchApp.fetch(pdfUrl, {
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` }
  })
    .getBlob()
    .setName(fileName);

  return blob;
}

function logToSheet(message) {
  const config = getPdfSenderConfig();
  const userEmail = Session.getActiveUser().getEmail() || 'Unknown User';
  const ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);
  const logSheetName = 'Log';
  let logSheet = ss.getSheetByName(logSheetName);
  if (!logSheet) {
    logSheet = ss.insertSheet(logSheetName);
    logSheet.getRange(1, 1, 1, 2).setValues([['Timestamp', 'Message']]);
  }
  const sh = ss.getSheetByName(config.SHEET_NAME);
  const b1 = sh ? sh.getRange('B1').getValue() : '';
  const b3 = sh ? sh.getRange('B3').getValue() : '';
  logSheet.appendRow([new Date(), `${userEmail} ${message} ID${b1} 氏名_${b3}`]);
}

function lwBotSendFile(fileBlob) {
  const config = getPdfSenderConfig();
  try {
    const token = getLWBotAccessToken();
    const uploadInfo = getLWUploadUrl(token, fileBlob.getName(), config.BOT_ID);
    uploadFileToLW(uploadInfo.uploadUrl, fileBlob, token);
    sendLWBotFileMessage(token, config.CHANNEL_ID, uploadInfo.fileId, config.BOT_ID);
  } catch (e) {
    logToSheet(`より、PDF送信失敗しました: ${e.message}`);
    throw e;
  }
}

function getLWUploadUrl(botToken, fileName, botId) {
  const res = UrlFetchApp.fetch(`https://www.worksapis.com/v1.0/bots/${botId}/attachments`, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: `Bearer ${botToken}` },
    payload: JSON.stringify({ fileName: fileName })
  });
  const data = JSON.parse(res.getContentText());
  return data;
}

function uploadFileToLW(uploadUrl, fileBlob, botToken) {
  const boundary = '----WebKitFormBoundary' + new Date().getTime();
  const delimiter = '--' + boundary + '\r\n';
  const closeDelimiter = '\r\n--' + boundary + '--';

  const body =
    delimiter +
    'Content-Disposition: form-data; name="Filedata"; filename="' +
    fileBlob.getName() +
    '"\r\n' +
    'Content-Type: ' +
    fileBlob.getContentType() +
    '\r\n\r\n';

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
  if (res.getResponseCode() < 200 || res.getResponseCode() >= 300) {
    throw new Error(`ファイルアップロード失敗: ${res.getResponseCode()} - ${res.getContentText()}`);
  }
}

function concatByteArrays(blobs) {
  let result = [];
  blobs.forEach((b) => {
    result = result.concat(Array.prototype.slice.call(b));
  });
  return new Uint8Array(result);
}

function sendLWBotFileMessage(botToken, channelId, fileId, botId) {
  const res = UrlFetchApp.fetch(`https://www.worksapis.com/v1.0/bots/${botId}/channels/${channelId}/messages`, {
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

function getLWBotAccessToken() {
  const lineWorksConfig = getLineWorksConfigForPdfSender();
  const privateKey = loadLineWorksPrivateKey(lineWorksConfig.PRIVATE_KEY_FILE);
  const jwt = createLineWorksJwt(lineWorksConfig.CLIENT_ID, lineWorksConfig.SERVICE_ACCOUNT, privateKey);

  const res = UrlFetchApp.fetch('https://auth.worksmobile.com/oauth2/v2.0/token', {
    method: 'post',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    payload: {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
      client_id: lineWorksConfig.CLIENT_ID,
      client_secret: lineWorksConfig.CLIENT_SECRET,
      scope: 'bot'
    },
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200) {
    throw new Error(`LINE WORKS トークン取得失敗: ${res.getResponseCode()} - ${res.getContentText()}`);
  }

  const data = JSON.parse(res.getContentText());
  if (!data.access_token) {
    throw new Error(`LINE WORKS トークンレスポンスに access_token が含まれていません: ${res.getContentText()}`);
  }

  return data.access_token;
}

function createLineWorksJwt(clientId, serviceAccount, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = Utilities.base64Encode(
    JSON.stringify({ alg: 'RS256', typ: 'JWT' }),
    Utilities.Charset.UTF_8
  );
  const claimSet = JSON.stringify({
    iss: clientId,
    sub: serviceAccount,
    iat: now,
    exp: now + 1800
  });
  const encodeText = header + '.' + Utilities.base64Encode(claimSet, Utilities.Charset.UTF_8);
  const signature = Utilities.computeRsaSha256Signature(encodeText, privateKey);
  return encodeText + '.' + Utilities.base64Encode(signature);
}

function loadLineWorksPrivateKey(fileName) {
  const targetName = fileName || getLineWorksConfigForPdfSender().PRIVATE_KEY_FILE;
  const files = DriveApp.getFilesByName(targetName);
  if (!files.hasNext()) {
    throw new Error(`秘密鍵ファイルが見つかりません: ${targetName}`);
  }
  return files.next().getBlob().getDataAsString();
}
