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

function handleHospitalReport(data) {
  try {
    console.log("入退院報告データ受信:", JSON.stringify(data));
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("入退院管理");
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
    
    const timestamp = new Date();
    const reportId = 'HR' + timestamp.getTime();

    // 入退院管理シートに記録（スクリーンショット構造に合わせて修正）
    const statusText = data.reason === 'hospital' ? '入院中' : '中止';
    
    const row = [
      reportId,                           // A: ID
      statusText,                         // B: 状文
      data.userName,                      // C: 利用者名
      data.reporter,                      // D: 報告者
      data.incidentDate,                  // E: 報告日
      data.hospitalName || '',            // F: 入院先
      data.reason === 'hospital' ? data.hospitalDate : data.stopDate, // G: 入院日
      data.reason === 'hospital' ? 
        (data.hospitalDiagnosis === 'その他' ? data.hospitalOtherDiagnosisText : data.hospitalDiagnosis) : 
        data.stopDiagnosis,               // H: 診断名
      '',                                 // I: 当番（プライマリー）
      '',                                 // J: 転院先
      '',                                 // K: 脱落となるアウトライン
      new Date().toISOString().split('T')[0], // L: 今日の日付
      data.contractEnd ? '契約終了' : '', // M: 契約終了
      data.resumeDate || '',              // N: 通院日（退院日・再開日）
      '',                                 // O: 報告日の変更
      '',                                 // P: 退院までの日数順
      ''                                  // Q: 漏れての入り込み
    ];

    sheet.appendRow(row);

    // 契約終了処理
    if (data.contractEnd) {
      updateContractEndStatus(data.userName, data.resumeDate);
    }

    // N列の更新（退院日・再開日がある場合）
    if (data.resumeDate) {
      updateResumeDate(data.userName, data.resumeDate);
    }

    // ログシートに記録
    logSheet.appendRow([
      timestamp,
      "入退院報告",
      data.reporter,
      data.userId || '',
      reportId,
      data.userName,
      data.reason,
      data.contractEnd ? '契約終了' : '',
      JSON.stringify(data)
    ]);

    console.log("入退院報告保存完了:", reportId);

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

function getUsers() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("利用者管理");
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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("医療マスタ");
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
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
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
    const CLIENT_ID = 'De3dyIflyPCDY2xrHUak';
    const CLIENT_SECRET = 'ckuFb6OYxV';
    const SERVICE_ACCOUNT = 'nagmx.serviceaccount@works-demo.org';
    const DOMAIN_ID = '10000389';
    // 秘密鍵をファイルから読み込み
    const PRIVATE_KEY = getPrivateKeyFromFile();

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
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
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
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
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
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("入退院管理");
    const data = sheet.getDataRange().getValues();
    
    // 該当利用者のレコードを検索してM列を更新
    for (let i = 1; i < data.length; i++) {
      if (data[i][8] === userName) { // I列（利用者名）で検索
        sheet.getRange(i + 1, 15).setValue('契約終了'); // O列（M列は13番目、O列は15番目）
        console.log(`契約終了ステータス更新: ${userName}`);
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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("入退院管理");
    const data = sheet.getDataRange().getValues();
    
    // 該当利用者のレコードを検索してN列を更新
    for (let i = 1; i < data.length; i++) {
      if (data[i][8] === userName) { // I列（利用者名）で検索
        sheet.getRange(i + 1, 14).setValue(resumeDate); // N列（14番目）
        console.log(`退院日・再開日更新: ${userName} -> ${resumeDate}`);
        break;
      }
    }
  } catch (error) {
    console.error("退院日・再開日更新エラー:", error);
  }
}

// レスポンス作成関数は main.gs で統一定義済み

// 秘密鍵をファイルから読み込む関数
function getPrivateKeyFromFile() {
  try {
    const files = DriveApp.getFilesByName('private_20250720123804.key');
    if (files.hasNext()) {
      const file = files.next();
      const privateKey = file.getBlob().getDataAsString();
      console.log("秘密鍵をファイルから正常に読み込みました");
      return privateKey;
    } else {
      throw new Error("秘密鍵ファイルが見つかりません: private_20250720123804.key");
    }
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
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("入退院管理");
    const data = sheet.getDataRange().getValues();
    const results = [];
    
    // C列（利用者名）から検索
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] && data[i][2].toString().trim() !== '') {
        const userName = data[i][2].toString().trim(); // C列：利用者名（漢字）
        const userReading = data[i][3] ? data[i][3].toString().trim() : ''; // D列：フリガナ（もしあれば）
        
        // 漢字のみで部分一致検索（大文字小文字を区別しない）
        const nameMatch = userName.toLowerCase().includes(cleanQuery.toLowerCase());
        
        if (nameMatch) {
          // 重複を除去
          if (!results.find(r => r.name === userName)) {
            results.push({
              name: userName,
              value: userName,
              reading: userReading,
              id: data[i][0] || '', // A列：ID
              status: data[i][1] || '' // B列：状態
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
    
    // 2文字未満の場合は検索しない
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const cleanQuery = query.trim();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("医療機関マスタ");
    const data = sheet.getDataRange().getValues();
    const results = [];
    
    // A列から医療機関名を完全一致検索
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim() !== '') {
        const hospitalName = data[i][0].toString().trim();
        
        // 部分一致検索（大文字小文字を区別しない）
        if (hospitalName.toLowerCase().includes(cleanQuery.toLowerCase())) {
          // 重複を除去
          if (!results.find(r => r.name === hospitalName)) {
            results.push({
              name: hospitalName,
              value: hospitalName,
              area: data[i][1] || '', // B列: エリア
              address: data[i][2] || '', // C列: 住所
              phone: data[i][3] || '' // D列: 電話番号
            });
          }
        }
      }
    }
    
    return results;
    
  } catch (error) {
    console.error("医療機関検索エラー:", error);
    return [];
  }
}