// 入退院報告システム GAS
function doPostHospitalReportLegacy_DISABLED(e) {
  try {
    const requestText = e.postData.contents;
    const requestData = JSON.parse(requestText);
    const action = requestData.action;
    
    switch(action) {
      case 'submitHospitalReport':
        return handleHospitalReport(requestData.data);
      case 'searchUsers':
        return searchUsers(requestData.query);
      case 'searchHospitals':
        return searchHospitals(requestData.query);
      case 'getUsers':
        return getUsers();
      case 'getHospitals':
        return getHospitals();
      case 'getOffices':
        return getOffices();
      case 'getUserOrganization':
        return getHospitalUserOrganization(requestData.userId);
      default:
        return createErrorResponse('無効なアクション: ' + action);
    }
  } catch (error) {
    console.error("doPost エラー:", error);
    return createErrorResponse('リクエストの処理に失敗しました: ' + error.toString());
  }
}

// CORS対応のためのGETハンドラー（デバッグ用）
function doGetHospitalReportLegacy_DISABLED(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Hospital Report API is running',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getHospitalDataSpreadsheet() {
  const hospitalConfig = ENV.HOSPITAL || {};
  const spreadsheetId = hospitalConfig.SPREADSHEET_ID || ENV.SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error('HOSPITAL用のスプレッドシートIDが設定されていません');
  }
  return SpreadsheetApp.openById(spreadsheetId);
}

function getHospitalDataSheet() {
  const hospitalConfig = ENV.HOSPITAL || {};
  const sheetName = hospitalConfig.SHEET_NAME || ENV.SHEETS.HOSPITAL;
  const sheet = getHospitalDataSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('入退院データシートが見つかりません: ' + sheetName);
  }
  return sheet;
}

function getHospitalMasterSheet() {
  const hospitalConfig = ENV.HOSPITAL || {};
  const masterSheetName = hospitalConfig.MASTER_SHEET_NAME || ENV.SHEETS.HOSPITAL_MASTER;
  const sheet = getHospitalDataSpreadsheet().getSheetByName(masterSheetName);
  if (!sheet) {
    throw new Error('医療機関マスタシートが見つかりません: ' + masterSheetName);
  }
  return sheet;
}

const HOSPITAL_COLUMNS = Object.freeze({
  ID: 1,
  STATUS: 2,
  USER_NAME: 3,
  ROOM: 4,
  REPORTER: 5,
  REPORT_DATE: 6,
  HOSPITAL_NAME: 7,
  HOSPITAL_DATE: 8,
  DIAGNOSIS: 9,
  CONTRACT_END: 12,
  RESUME_DATE: 15
});

function handleHospitalReport(data) {
  try {
    const sheet = getHospitalDataSheet();
    const logSheet = getLogSheet();
    
    if (!sheet) {
      throw new Error('入退院管理シートが見つかりません');
    }
    
    const timestamp = new Date();
    const isNewEntry = data.entryType === "new" || data.isNew === true;
    let createdRecord = null;
    
    // 利用者名で既存レコードを検索
    const userName = data.userName;
    if (!userName) {
      throw new Error('利用者名が指定されていません');
    }
    
    // シート全体のデータを取得
    const allData = sheet.getDataRange().getValues();
    let targetRow = -1;
    
    // C列（利用者名）で一致するレコードを検索
    for (let i = 1; i < allData.length; i++) { // 1行目はヘッダーなのでスキップ
      if (allData[i][2] && allData[i][2].toString().trim() === userName.trim()) {
        targetRow = i + 1; // 1ベースのインデックス
        break;
      }
    }
    
    if (targetRow === -1) {
      if (isNewEntry) {
        createdRecord = createNewHospitalRecordRow(sheet, data, timestamp);
        targetRow = createdRecord.rowIndex;
      } else {
        throw new Error(`利用者「${userName}」のレコードが見つかりません`);
      }
    }

    // カラム更新処理
    const existingRecordId = sheet.getRange(targetRow, HOSPITAL_COLUMNS.ID).getValue();
    updateHospitalRecord(sheet, targetRow, data, timestamp);

    const reportId = createdRecord ? createdRecord.recordId : String(existingRecordId || `HOSP-${timestamp.getTime()}`);
    const logAction = createdRecord ? 'NEW' : 'UPDATE';

    logSheet.appendRow([
      timestamp,
      'HOSPITAL_REPORT',
      logAction,
      data.reporter || '',
      reportId,
      data.userName || '',
      data.reason || '',
      data.reportDate || '',
      data.contractEnd ? '契約終了' : ''
    ]);

    return {
      success: true,
      message: "入退院報告を受け付けました",
      reportId: reportId
    };

  } catch (error) {
    console.error("入退院報告処理エラー:", error);
    throw new Error("報告の送信に失敗しました: " + error.toString());
  }
}

function createNewHospitalRecordRow(sheet, data, timestamp) {
  const lastColumn = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  let firstEmptyRowIndex = null;
  let existingIdValue = null;
  let maxNumericId = 0;

  if (lastRow >= 2) {
    const allRows = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      const idValue = row[0];
      const numericId = typeof idValue === 'number' ? idValue : parseInt(idValue, 10);
      if (!Number.isNaN(numericId)) {
        if (numericId > maxNumericId) {
          maxNumericId = numericId;
        }
      }

      const hasDataExceptId = row.slice(1).some(value => value !== '' && value !== null);
      if (!hasDataExceptId && firstEmptyRowIndex === null) {
        firstEmptyRowIndex = i + 2;
        if (idValue !== '' && idValue !== null) {
          existingIdValue = idValue;
        }
      }
    }
  }

  let targetRow = firstEmptyRowIndex;
  if (!targetRow) {
    targetRow = lastRow + 1;
    sheet.insertRowsAfter(lastRow, 1);
  } else if (targetRow <= lastRow && lastColumn > 1) {
    sheet.getRange(targetRow, 2, 1, lastColumn - 1).clearContent();
  }

  let recordId;
  if (existingIdValue !== null && existingIdValue !== '') {
    const numericExisting = typeof existingIdValue === 'number' ? existingIdValue : parseInt(existingIdValue, 10);
    recordId = Number.isNaN(numericExisting) ? existingIdValue : numericExisting;
  } else {
    recordId = maxNumericId + 1;
  }

  sheet.getRange(targetRow, HOSPITAL_COLUMNS.ID).setValue(recordId);
  sheet.getRange(targetRow, HOSPITAL_COLUMNS.USER_NAME).setValue(data.userName || '');

  return {
    rowIndex: targetRow,
    recordId: recordId.toString()
  };
}

// 入退院管理シートのレコード更新関数
function updateHospitalRecord(sheet, targetRow, data, timestamp) {
  try {

    // 各カラムの値を設定
    const entryType = (data.entryType || '').toLowerCase();
    let statusText;

    if (entryType === 'existing') {
      if (data.contractEnd) {
        statusText = '契約終了';
      } else if (data.resumeDate) {
        statusText = '退院';
      } else {
        statusText = '入院中';
      }
    } else {
      statusText = data.reason === 'hospital' ? '入院中'
        : data.contractEnd ? '契約終了' : '退院';
    }
    
    // 状況
    sheet.getRange(targetRow, HOSPITAL_COLUMNS.STATUS).setValue(statusText);

    // 利用者名
    if (data.userName) {
      sheet.getRange(targetRow, HOSPITAL_COLUMNS.USER_NAME).setValue(data.userName);
    }

    // 報告者
    sheet.getRange(targetRow, HOSPITAL_COLUMNS.REPORTER).setValue(data.reporter || '');

    // 報告日
    if (data.reportDate) {
      sheet.getRange(targetRow, HOSPITAL_COLUMNS.REPORT_DATE).setValue(new Date(data.reportDate));
    } else {
      sheet.getRange(targetRow, HOSPITAL_COLUMNS.REPORT_DATE).clearContent();
    }

    // 入院の場合の追加情報
    if (data.reason === 'hospital') {
      // 入院先
      if (data.hospitalName) {
        sheet.getRange(targetRow, HOSPITAL_COLUMNS.HOSPITAL_NAME).setValue(data.hospitalName);
      } else {
        sheet.getRange(targetRow, HOSPITAL_COLUMNS.HOSPITAL_NAME).clearContent();
      }

      // 入院日
      if (data.hospitalDate) {
        sheet.getRange(targetRow, HOSPITAL_COLUMNS.HOSPITAL_DATE).setValue(new Date(data.hospitalDate));
      } else {
        sheet.getRange(targetRow, HOSPITAL_COLUMNS.HOSPITAL_DATE).clearContent();
      }

      // 診断名
      const diagnosis = data.hospitalDiagnosis === 'その他' ?
                       data.hospitalOtherDiagnosisText :
                       data.hospitalDiagnosis;
      if (diagnosis) {
        sheet.getRange(targetRow, HOSPITAL_COLUMNS.DIAGNOSIS).setValue(diagnosis);
      } else {
        sheet.getRange(targetRow, HOSPITAL_COLUMNS.DIAGNOSIS).clearContent();
      }
    } else {
      // 中止の場合
      if (data.stopDate) {
        sheet.getRange(targetRow, HOSPITAL_COLUMNS.HOSPITAL_DATE).setValue(new Date(data.stopDate));
      } else {
        sheet.getRange(targetRow, HOSPITAL_COLUMNS.HOSPITAL_DATE).clearContent();
      }
      if (data.stopDiagnosis) {
        sheet.getRange(targetRow, HOSPITAL_COLUMNS.DIAGNOSIS).setValue(data.stopDiagnosis);
      } else {
        sheet.getRange(targetRow, HOSPITAL_COLUMNS.DIAGNOSIS).clearContent();
      }
      sheet.getRange(targetRow, HOSPITAL_COLUMNS.HOSPITAL_NAME).clearContent();
    }

    // M列: 契約終了
    if (data.contractEnd) {
      sheet.getRange(targetRow, HOSPITAL_COLUMNS.CONTRACT_END).setValue('契約終了');
    } else {
      sheet.getRange(targetRow, HOSPITAL_COLUMNS.CONTRACT_END).clearContent();
    }

    // N列: 退院日・再開日
    if (data.resumeDate) {
      sheet.getRange(targetRow, HOSPITAL_COLUMNS.RESUME_DATE).setValue(new Date(data.resumeDate));
    } else {
      sheet.getRange(targetRow, HOSPITAL_COLUMNS.RESUME_DATE).clearContent();
    }
    
  } catch (error) {
    console.error(`レコード更新エラー (行${targetRow}):`, error);
    throw new Error(`レコード更新に失敗しました: ${error.message}`);
  }
}

function getUsers() {
  try {
    const sheet = getSheet(ENV.SHEETS.USERS);
    if (!sheet) {
      throw new Error("利用者管理シートが見つかりません");
    }
    
    const data = sheet.getDataRange().getValues();
    const users = [];
    
    // B列（氏名）とC列（フリガナ）から取得（1行目はヘッダーなのでスキップ）
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] && data[i][1].toString().trim() !== '') {
        users.push({
          name: data[i][1].toString().trim(),
          reading: data[i][2] ? data[i][2].toString().trim() : ''
        });
      }
    }
    
    return users;
  } catch (error) {
    console.error("利用者取得エラー:", error);
    throw new Error("利用者情報の取得に失敗しました: " + error.toString());
  }
}

function getHospitals() {
  try {
    const sheet = getHospitalMasterSheet();
    if (!sheet) {
      throw new Error("医療マスタシートが見つかりません");
    }
    
    const data = sheet.getDataRange().getValues();
    const hospitals = [];
    
    // A列（病院名）とB列（エリア）から取得（1行目はヘッダーなのでスキップ）
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim() !== '') {
        hospitals.push({
          name: data[i][0].toString().trim(),
          area: data[i][1] ? data[i][1].toString().trim() : ''
        });
      }
    }
    
    return hospitals;
  } catch (error) {
    console.error("医療機関取得エラー:", error);
    throw new Error("医療機関情報の取得に失敗しました: " + error.toString());
  }
}

function getOffices() {
  try {
    // 指定されたスプレッドシートから事業所シートを取得
    const spreadsheet = SpreadsheetApp.openById("1ZZjvaUptj1BCbV0jsbILwXbB_NF8L4MkeYT5P23mU7Y");
    const sheet = spreadsheet.getSheetByName("事業所");
    if (!sheet) {
      throw new Error("事業所シートが見つかりません");
    }
    
    const data = sheet.getDataRange().getValues();
    const offices = [];
    
    // A列から事業所名を取得（1行目はヘッダーなのでスキップ）
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim() !== '') {
        offices.push({
          value: data[i][0].toString().trim(),
          name: data[i][0].toString().trim()
        });
      }
    }
    
    console.log("事業所一覧取得成功:", offices.length + "件");
    return offices;
  } catch (error) {
    console.error("事業所取得エラー:", error);
    throw new Error("事業所情報の取得に失敗しました: " + error.toString());
  }
}

function getHospitalUserOrganization(userId) {
  const logSheet = getLogSheet();
  const timestamp = new Date();
  const debugId = 'ORG_' + timestamp.getTime();
  
  try {
    console.log("ユーザー組織情報取得開始:", userId);
    
    // デバッグログ記録開始
    logSheet.appendRow([
      timestamp,
      "組織情報取得",
      "開始",
      userId,
      debugId,
      "getUserOrganization開始",
      "",
      "",
      JSON.stringify({action: "start", userId: userId, source: "hospital-report"})
    ]);
    
    // LINE WORKS API設定
    const CLIENT_ID = ENV.LINE_WORKS.CLIENT_ID;
    const CLIENT_SECRET = ENV.LINE_WORKS.CLIENT_SECRET;
    const SERVICE_ACCOUNT = ENV.LINE_WORKS.SERVICE_ACCOUNT;
    const DOMAIN_ID = ENV.LINE_WORKS.DOMAIN_ID;
    // 秘密鍵をファイルから読み込み
    const PRIVATE_KEY = getPrivateKeyFromFile(ENV.LINE_WORKS.PRIVATE_KEY_FILE);

    try {
      // JWTトークンを生成
      logSheet.appendRow([
        new Date(),
        "組織情報取得",
        "JWT生成開始",
        userId,
        debugId,
        "generateJWT実行",
        "",
        "",
        JSON.stringify({clientId: CLIENT_ID, serviceAccount: SERVICE_ACCOUNT, source: "hospital-report"})
      ]);
      
      const jwt = generateJWT(CLIENT_ID, SERVICE_ACCOUNT, PRIVATE_KEY);
      
      logSheet.appendRow([
        new Date(),
        "組織情報取得",
        "JWT生成完了",
        userId,
        debugId,
        "JWT生成成功",
        "",
        "",
        JSON.stringify({jwtLength: jwt.length, jwtPrefix: jwt.substring(0, 50)})
      ]);
      
      // アクセストークンを取得
      logSheet.appendRow([
        new Date(),
        "組織情報取得",
        "トークン取得開始",
        userId,
        debugId,
        "getAccessToken実行",
        "",
        "",
        JSON.stringify({clientId: CLIENT_ID})
      ]);
      
      const accessToken = getAccessToken(jwt, CLIENT_ID, CLIENT_SECRET);
      
      logSheet.appendRow([
        new Date(),
        "組織情報取得",
        "トークン取得完了",
        userId,
        debugId,
        "アクセストークン取得成功",
        "",
        "",
        JSON.stringify({tokenLength: accessToken.length, tokenPrefix: accessToken.substring(0, 20)})
      ]);
      
      // ユーザー情報を取得
      logSheet.appendRow([
        new Date(),
        "組織情報取得",
        "ユーザー情報取得開始",
        userId,
        debugId,
        "getUserInfo実行",
        "",
        "",
        JSON.stringify({domainId: DOMAIN_ID, userId: userId})
      ]);
      
      const userInfo = getUserInfo(accessToken, DOMAIN_ID, userId);
      
      logSheet.appendRow([
        new Date(),
        "組織情報取得",
        "ユーザー情報取得完了",
        userId,
        debugId,
        "ユーザー情報取得成功",
        "",
        "",
        JSON.stringify(userInfo)
      ]);
      
      if (userInfo && userInfo.orgUnitName) {
        console.log("組織情報取得成功:", userInfo.orgUnitName);
        
        logSheet.appendRow([
          new Date(),
          "組織情報取得",
          "成功",
          userId,
          debugId,
          "組織名取得成功: " + userInfo.orgUnitName,
          "",
          "",
          JSON.stringify({orgUnitName: userInfo.orgUnitName})
        ]);
        
        return {
          orgUnitName: userInfo.orgUnitName
        };
      } else {
        throw new Error('組織情報が取得できませんでした - userInfo: ' + JSON.stringify(userInfo));
      }
      
    } catch (apiError) {
      console.error("LINE WORKS API呼び出しエラー:", apiError);
      
      logSheet.appendRow([
        new Date(),
        "組織情報取得",
        "API_ERROR",
        userId,
        debugId,
        "LINE WORKS API エラー: " + apiError.toString(),
        "",
        "",
        JSON.stringify({
          error: apiError.toString(),
          stack: apiError.stack,
          message: apiError.message,
          source: "hospital-report"
        })
      ]);
      
      // フォールバック: 事業所シートから取得
      console.log("フォールバック: 事業所シートから事業所一覧を取得");
      
      logSheet.appendRow([
        new Date(),
        "組織情報取得",
        "フォールバック",
        userId,
        debugId,
        "事業所シートから取得開始",
        "",
        "",
        JSON.stringify({fallback: true, source: "hospital-report"})
      ]);
      
      const fallbackOffices = getOffices();
      return fallbackOffices;
    }
    
  } catch (error) {
    console.error("組織情報取得エラー:", error);
    
    logSheet.appendRow([
      new Date(),
      "組織情報取得",
      "FATAL_ERROR",
      userId,
      debugId,
      "致命的エラー: " + error.toString(),
      "",
      "",
      JSON.stringify({
        error: error.toString(),
        stack: error.stack,
        message: error.message,
        source: "hospital-report"
      })
    ]);
    
    throw new Error("組織情報の取得に失敗しました: " + error.toString());
  }
}

// JWTトークン生成（動作確認済み手法）
function generateJWT(clientId, serviceAccount, privateKey) {
  const logSheet = getLogSheet();
  const debugId = 'JWT_' + new Date().getTime();
  
  try {
    logSheet.appendRow([
      new Date(),
      "JWT生成",
      "開始",
      "",
      debugId,
      "JWT生成開始（hospital-report修正版）",
      "",
      "",
      JSON.stringify({clientId: clientId, serviceAccount: serviceAccount})
    ]);

    // ユーザー提供の動作確認済み手法に完全一致
    var header = Utilities.base64Encode(JSON.stringify({ "alg": "RS256", "typ": "JWT" }), Utilities.Charset.UTF_8);
    var claimSet = JSON.stringify({
      "iss": clientId,
      "sub": serviceAccount,
      "iat": Math.floor(Date.now() / 1000),
      "exp": Math.floor(Date.now() / 1000 + 2000)
    });
    var encodeText = header + "." + Utilities.base64Encode(claimSet, Utilities.Charset.UTF_8);
    var signature = Utilities.computeRsaSha256Signature(encodeText, privateKey);
    var jwtToken = encodeText + "." + Utilities.base64Encode(signature);
    
    logSheet.appendRow([
      new Date(),
      "JWT生成",
      "完了",
      "",
      debugId,
      "JWT生成成功（hospital-report修正版）",
      "",
      "",
      JSON.stringify({jwtLength: jwtToken.length, jwtPrefix: jwtToken.substring(0, 50)})
    ]);
    
    return jwtToken;
  } catch (error) {
    logSheet.appendRow([
      new Date(),
      "JWT生成",
      "エラー",
      "",
      debugId,
      "JWT生成エラー（hospital-report修正版）: " + error.toString(),
      "",
      "",
      JSON.stringify({error: error.toString(), stack: error.stack})
    ]);
    throw error;
  }
}

// アクセストークン取得（動作確認済み手法）
function getAccessToken(jwt, clientId, clientSecret) {
  const logSheet = getLogSheet();
  const debugId = 'TOKEN_' + new Date().getTime();
  const uri = 'https://auth.worksmobile.com/oauth2/v2.0/token';
  
  try {
    logSheet.appendRow([
      new Date(),
      "アクセストークン取得",
      "開始",
      "",
      debugId,
      "トークン取得開始（hospital-report修正版）",
      "",
      "",
      JSON.stringify({uri: uri, clientId: clientId})
    ]);
    
    // 動作確認済み手法に完全に合わせる
    var requestBody = {
      "grant_type": encodeURI("urn:ietf:params:oauth:grant-type:jwt-bearer"),
      "assertion": jwt,
      "client_id": clientId,
      "client_secret": clientSecret,
      "scope": "user.read"
    };
    
    var options = {
      'method': 'post',
      'headers': { 'Content-Type': 'application/x-www-form-urlencoded' },
      "payload": requestBody,
      'muteHttpExceptions': true
    };
    
    logSheet.appendRow([
      new Date(),
      "アクセストークン取得",
      "リクエスト準備",
      "",
      debugId,
      "OAuth2リクエスト準備完了（hospital-report修正版）",
      "",
      "",
      JSON.stringify({
        grant_type: requestBody.grant_type,
        client_id: requestBody.client_id,
        scope: requestBody.scope,
        jwtLength: jwt.length
      })
    ]);
    
    var res = UrlFetchApp.fetch(uri, options);
    var responseText = res.getContentText();
    var responseCode = res.getResponseCode();
    
    logSheet.appendRow([
      new Date(),
      "アクセストークン取得",
      "レスポンス受信",
      "",
      debugId,
      "OAuth2 APIレスポンス受信（hospital-report修正版）",
      "",
      "",
      JSON.stringify({
        responseCode: responseCode,
        responseText: responseText.substring(0, 200)
      })
    ]);
    
    if (responseCode !== 200) {
      throw new Error(`HTTP ${responseCode}: ${responseText}`);
    }
    
    var data = JSON.parse(responseText);
    var LWAccessToken = data.access_token;
    
    if (LWAccessToken) {
      logSheet.appendRow([
        new Date(),
        "アクセストークン取得",
        "成功",
        "",
        debugId,
        "アクセストークン取得成功（hospital-report修正版）",
        "",
        "",
        JSON.stringify({
          token_type: data.token_type,
          expires_in: data.expires_in,
          tokenLength: LWAccessToken.length
        })
      ]);
      return LWAccessToken;
    } else {
      throw new Error('アクセストークンが含まれていません: ' + responseText);
    }
  } catch (error) {
    logSheet.appendRow([
      new Date(),
      "アクセストークン取得",
      "エラー",
      "",
      debugId,
      "トークン取得エラー（hospital-report修正版）: " + error.toString(),
      "",
      "",
      JSON.stringify({error: error.toString(), stack: error.stack})
    ]);
    throw error;
  }
}

// ユーザー情報取得
function getUserInfo(accessToken, domainId, userId) {
  const logSheet = getLogSheet();
  const debugId = 'USER_' + new Date().getTime();
  const url = `https://www.worksapis.com/v1.0/users/${userId}`;
  
  try {
    logSheet.appendRow([
      new Date(),
      "ユーザー情報取得",
      "開始",
      userId,
      debugId,
      "ユーザー情報API呼び出し開始（hospital-report）",
      "",
      "",
      JSON.stringify({url: url, domainId: domainId, userId: userId})
    ]);
    
    const options = {
      'method': 'GET',
      'headers': {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      'muteHttpExceptions': true
    };
    
    logSheet.appendRow([
      new Date(),
      "ユーザー情報取得",
      "リクエスト準備完了",
      userId,
      debugId,
      "APIリクエストオプション設定完了（hospital-report）",
      "",
      "",
      JSON.stringify({
        method: options.method,
        headers: options.headers,
        tokenLength: accessToken.length
      })
    ]);
    
    logSheet.appendRow([
      new Date(),
      "ユーザー情報取得",
      "API呼び出し中",
      userId,
      debugId,
      "UrlFetchApp.fetch実行中（hospital-report）",
      "",
      "",
      JSON.stringify({url: url})
    ]);
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    logSheet.appendRow([
      new Date(),
      "ユーザー情報取得",
      "レスポンス受信",
      userId,
      debugId,
      "LINE WORKS User APIレスポンス受信（hospital-report）",
      "",
      "",
      JSON.stringify({
        responseCode: responseCode,
        responseText: responseText.substring(0, 300)
      })
    ]);
    
    if (responseCode === 200) {
      const data = JSON.parse(responseText);
      
      logSheet.appendRow([
        new Date(),
        "ユーザー情報取得",
        "成功",
        userId,
        debugId,
        "ユーザー情報API呼び出し成功（hospital-report）",
        "",
        "",
        JSON.stringify({
          userId: data.userId,
          userName: data.userName,
          orgUnitName: data.orgUnitName,
          orgUnitId: data.orgUnitId
        })
      ]);
      
      return data;
    } else {
      const errorMessage = `HTTP ${responseCode}: ${responseText}`;
      
      logSheet.appendRow([
        new Date(),
        "ユーザー情報取得",
        "HTTPエラー",
        userId,
        debugId,
        "LINE WORKS User API HTTPエラー（hospital-report）: " + errorMessage,
        "",
        "",
        JSON.stringify({
          responseCode: responseCode,
          responseText: responseText
        })
      ]);
      
      throw new Error('ユーザー情報の取得に失敗しました: ' + errorMessage);
    }
  } catch (error) {
    logSheet.appendRow([
      new Date(),
      "ユーザー情報取得",
      "エラー",
      userId,
      debugId,
      "ユーザー情報取得エラー（hospital-report）: " + error.toString(),
      "",
      "",
      JSON.stringify({
        error: error.toString(),
        stack: error.stack,
        message: error.message
      })
    ]);
    throw error;
  }
}

// 契約終了ステータス更新
function updateContractEndStatus(userName, endDate) {
  try {
    const sheet = getHospitalDataSheet();
    const data = sheet.getDataRange().getValues();
    
    // 該当利用者のレコードを検索してM列を更新
    for (let i = 1; i < data.length; i++) {
      const rowUserName = data[i][HOSPITAL_COLUMNS.USER_NAME - 1];
      if (rowUserName && rowUserName.toString().trim() === userName.trim()) {
        sheet.getRange(i + 1, HOSPITAL_COLUMNS.CONTRACT_END).setValue('契約終了');
        break;
      }
    }
  } catch (error) {
    console.error("契約終了ステータス更新エラー:", error);
  }
}

// N列の退院日・再開日更新
function updateResumeDate(userName, resumeDate) {
  try {
    const sheet = getHospitalDataSheet();
    const data = sheet.getDataRange().getValues();
    
    // 該当利用者のレコードを検索してN列を更新
    for (let i = 1; i < data.length; i++) {
      const rowUserName = data[i][HOSPITAL_COLUMNS.USER_NAME - 1];
      if (rowUserName && rowUserName.toString().trim() === userName.trim()) {
        sheet.getRange(i + 1, HOSPITAL_COLUMNS.RESUME_DATE).setValue(resumeDate);
        break;
      }
    }
  } catch (error) {
    console.error("退院日・再開日更新エラー:", error);
  }
}

// レスポンス作成関数は main.gs で統一定義済み

// 秘密鍵をファイルから読み込む関数
function getPrivateKeyFromFile(fileName) {
  const targetName = fileName || ENV.LINE_WORKS.PRIVATE_KEY_FILE;
  try {
    const files = DriveApp.getFilesByName(targetName);
    if (files.hasNext()) {
      const file = files.next();
      const privateKey = file.getBlob().getDataAsString();
      console.log("秘密鍵をファイルから正常に読み込みました");
      return privateKey;
    }
    throw new Error("秘密鍵ファイルが見つかりません: " + targetName);
  } catch (error) {
    console.error("秘密鍵ファイル読み込みエラー:", error);
    throw error;
  }
}
// 利用者検索機能（改良版：2文字以上、部分一致、漢字のみ対応）
function searchUsers(query) {
  try {
    // 2文字未満の場合は検索しない
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const cleanQuery = query.trim();
    const sheet = getHospitalDataSheet();
    const data = sheet.getDataRange().getValues();
    const results = [];

    for (let i = 1; i < data.length; i++) {
      const rawName = data[i][HOSPITAL_COLUMNS.USER_NAME - 1];
      if (rawName && rawName.toString().trim() !== '') {
        const statusCell = data[i][HOSPITAL_COLUMNS.STATUS - 1];
        const status = statusCell ? statusCell.toString().trim() : '';
        if (status !== '入院中') {
          continue;
        }

        const userName = rawName.toString().trim();
        const nameMatch = userName.toLowerCase().includes(cleanQuery.toLowerCase());

        if (nameMatch) {
          if (!results.find(r => r.name === userName)) {
            results.push({
              name: userName,
              value: userName,
              reading: '',
              id: data[i][HOSPITAL_COLUMNS.ID - 1] || '',
              status: status
            });
          }
        }
      }
    }
    
    return results;
    
  } catch (error) {
    console.error("利用者検索エラー:", error);
    return [];
  }
}


// 医療機関検索機能（改良版：2文字以上、部分一致対応）
function searchHospitals(query) {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cleanQuery = query.trim().toLowerCase();
    const sheet = getHospitalMasterSheet();
    const data = sheet.getDataRange().getValues();
    const results = [];

    for (let i = 1; i < data.length; i++) {
      const cell = data[i][0];
      if (!cell) {
        continue;
      }
      const hospitalName = cell.toString().trim();
      if (!hospitalName) {
        continue;
      }
      if (hospitalName.toLowerCase().includes(cleanQuery)) {
        if (!results.find(r => r.name === hospitalName)) {
          results.push({
            name: hospitalName,
            value: hospitalName,
            area: data[i][1] || '',
            address: data[i][2] || '',
            phone: data[i][3] || ''
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error("医療機関検索エラー:", error);
    return [];
  }
}
// 秘密鍵をファイルから読み込む関数
function getPrivateKeyFromFile(fileName) {
  const targetName = fileName || ENV.LINE_WORKS.PRIVATE_KEY_FILE;
  try {
    const files = DriveApp.getFilesByName(targetName);
    if (files.hasNext()) {
      const file = files.next();
      const privateKey = file.getBlob().getDataAsString();
      console.log("秘密鍵をファイルから正常に読み込みました");
      return privateKey;
    }
    throw new Error("秘密鍵ファイルが見つかりません: " + targetName);
  } catch (error) {
    console.error("秘密鍵ファイル読み込みエラー:", error);
    throw error;
  }
}
