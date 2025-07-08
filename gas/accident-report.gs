// 事故報告システム GAS
function doPost(e) {
  try {
    const requestText = e.postData.contents;
    const requestData = JSON.parse(requestText);
    const action = requestData.action;
    
    switch(action) {
      case 'submitAccidentReport':
        return handleAccidentReport(requestData.data);
      case 'getOffices':
        return getOffices();
      case 'getUserOrganization':
        return getUserOrganization(requestData.userId);
      default:
        return createErrorResponse('無効なアクション: ' + action);
    }
  } catch (error) {
    console.error("doPost エラー:", error);
    return createErrorResponse('リクエストの処理に失敗しました: ' + error.toString());
  }
}

// CORS対応のためのGETハンドラー（デバッグ用）
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Accident Report API is running',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleAccidentReport(data) {
  try {
    console.log("事故報告データ受信:", JSON.stringify(data));
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("事故報告");
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("log");
    const folder = DriveApp.getFolderById("1kNQI4KKDifydVbyVvH88ueXOJKmJChe0");

    // 写真をGoogle Driveに保存
    const photoUrls = [];
    if (data.photos) {
      // 事故現場の写真
      if (data.photos.scene && data.photos.scene.length > 0) {
        data.photos.scene.forEach((photo, index) => {
          try {
            const blob = Utilities.newBlob(
              Utilities.base64Decode(photo.data), 
              'image/jpeg', 
              `${data.reporter}_事故現場_${data.incidentDate}_${index + 1}.jpg`
            );
            const file = folder.createFile(blob);
            photoUrls.push({
              url: file.getUrl(),
              type: '事故現場',
              name: photo.name
            });
          } catch (photoError) {
            console.error("写真保存エラー:", photoError);
          }
        });
      }
      
      // 車両事故の場合の追加写真
      if (data.accidentType === 'vehicle') {
        // 相手の車
        if (data.photos.otherVehicle && data.photos.otherVehicle.length > 0) {
          data.photos.otherVehicle.forEach((photo, index) => {
            try {
              const blob = Utilities.newBlob(
                Utilities.base64Decode(photo.data), 
                'image/jpeg', 
                `${data.reporter}_相手の車_${data.incidentDate}_${index + 1}.jpg`
              );
              const file = folder.createFile(blob);
              photoUrls.push({
                url: file.getUrl(),
                type: '相手の車',
                name: photo.name
              });
            } catch (photoError) {
              console.error("相手の車写真保存エラー:", photoError);
            }
          });
        }
        
        // 自分の車
        if (data.photos.ownVehicle && data.photos.ownVehicle.length > 0) {
          data.photos.ownVehicle.forEach((photo, index) => {
            try {
              const blob = Utilities.newBlob(
                Utilities.base64Decode(photo.data), 
                'image/jpeg', 
                `${data.reporter}_自分の車_${data.incidentDate}_${index + 1}.jpg`
              );
              const file = folder.createFile(blob);
              photoUrls.push({
                url: file.getUrl(),
                type: '自分の車',
                name: photo.name
              });
            } catch (photoError) {
              console.error("自分の車写真保存エラー:", photoError);
            }
          });
        }
        
        // 免許証
        if (data.photos.license && data.photos.license.length > 0) {
          data.photos.license.forEach((photo, index) => {
            try {
              const blob = Utilities.newBlob(
                Utilities.base64Decode(photo.data), 
                'image/jpeg', 
                `${data.reporter}_免許証_${data.incidentDate}_${index + 1}.jpg`
              );
              const file = folder.createFile(blob);
              photoUrls.push({
                url: file.getUrl(),
                type: '免許証',
                name: photo.name
              });
            } catch (photoError) {
              console.error("免許証写真保存エラー:", photoError);
            }
          });
        }
      }
    }

    const timestamp = new Date();
    const reportId = 'AR' + timestamp.getTime();

    // 事故報告シートに記録
    const row = [
      reportId,                           // A: 報告ID
      timestamp,                          // B: 報告日時
      data.incidentDate,                  // C: 発生日付
      data.incidentTime,                  // D: 発生時間
      data.reporter,                      // E: 報告者名
      data.userId || '',                  // F: ユーザーID
      data.department || '',              // G: 部署
      data.office,                        // H: 事業所
      data.accidentType,                  // I: 事故種類
      data.accidentType === 'vehicle' ? data.location : '', // J: 発生場所（車両事故）
      data.accidentType === 'other' ? data.locationCategory : '', // K: 場所分類（その他）
      data.accidentType === 'other' ? data.detailLocation : '', // L: 詳細場所（その他）
      data.accidentType === 'other' ? data.otherLocation : '', // M: その他の場所
      data.driverName || '',              // N: 運転手名
      data.propertyDamage || '',          // O: 対物
      data.propertyDetailsText || '',     // P: 対物詳細
      data.personalInjury || '',          // Q: 対人
      data.injuryTypes ? data.injuryTypes.join(', ') : '', // R: 負傷者種別
      data.injuryDetailsText || '',       // S: 負傷詳細
      data.accidentDetails,               // T: 事故内容詳細
      JSON.stringify(photoUrls),          // U: 写真URL
      'pending'                           // V: ステータス
    ];

    sheet.appendRow(row);

    // ログシートに記録
    logSheet.appendRow([
      timestamp,
      "事故報告",
      data.reporter,
      data.userId || '',
      reportId,
      data.incidentDate,
      data.incidentTime,
      photoUrls.length + '枚の写真',
      JSON.stringify(data)
    ]);

    console.log("事故報告保存完了:", reportId);

    return createSuccessResponse({
      success: true,
      message: "事故報告を受け付けました",
      reportId: reportId,
      photoCount: photoUrls.length
    });

  } catch (error) {
    console.error("事故報告処理エラー:", error);
    return createErrorResponse("報告の送信に失敗しました: " + error.toString());
  }
}

function getOffices() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("事業所");
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
    
    return createSuccessResponse(offices);
  } catch (error) {
    console.error("事業所取得エラー:", error);
    return createErrorResponse("事業所情報の取得に失敗しました: " + error.toString());
  }
}

function getUserOrganization(userId) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("log");
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
      JSON.stringify({action: "start", userId: userId})
    ]);
    
    // LINE WORKS API設定
    const CLIENT_ID = 'De3dyIflyPCDY2xrHUak';
    const CLIENT_SECRET = 'ckuFb6OYxV';
    const SERVICE_ACCOUNT = 'nagmx.serviceaccount@works-demo.org';
    const DOMAIN_ID = '10000389';
    const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCu74LymyotkWke
aglpN7YHTumde+b/VmdMVzSBe1s77M5WwVw+W4AvR1jfQvYXx5dzdHj69DtABSlE
1nLihxHu1MxU2gGG4m7Hhh8mRf3vF/vWw+KjaQFsQaD3ZFfaoq4BbiS2eYx9Z6YA
IV/3/BfCHTF+yVWkkYenYRHYB0q+Fx/pZMsKkVLUt2PCzlR+EmcYzC1e5JFxZ0/K
lfGmW/d4+XYjiyouGOcrD5e/jSfThi+ABuo2pUWJd1/q96o3QCIICJ7oYKx/ybz5
DP5aTJIOt0aRIt8wdswWBMAsVnbOS3H/VQSMlz0DonpkmMZ0YhK5ZwHT/Nz4hWpc
+nRe8u67AgMBAAECggEATYt4VYi4oqhxm3zPnSeH9idh4WB6Hjez5KBHcxo2cBLh
yI1AEZhH8y1CVP1+zz23ggNgWYYH+bIQACa7mHTdWyxTQ028HYmkJ6fpiPK/xMux
5BrDDULP0agp7WA6nX09ev7TIVwyDajzad1hiDDkazS7qwMehqvIIUcjPMrGtAoY
c/HUK5+ciNsmORmeQ392e8MLaWTSVq56IAtb+1xbRmucagmxPXiVHBRRi450B/5j
vQsi0XLDWog+h/c+wScqAfW4LgqVh82PnK/kUe34cICOrz9P/vuPf9/N8CSW+z5F
Jov95hQd8zajpb43ur7NNlA5JvS4KBMy21FdN15gYQKBgQC2UKy8ytDhLEm8H4b5
1VZURznIReqn0VYWmS76gXYpMP3a5Ztf6xHzBSYnzB+ndLcBGhahD0fbhMsPJD35
mUfn4orC+bglWXNLLascIOGhbfjp0coHje7v4tQcs7x1Ale5sQLqqHFPrCYc0hrO
TKJ4NxGpl//tnmdOlBdyXgx1SwKBgQD1o08Bd68Zs0mhXITgfwDF0Q5colQEwNUO
YRbGcTLV4RFEmsVmx9y2VZKbNeW4N6mME2EXLN4JgXJv6pVuPav+CcDq+gKnJt/Z
BqFiL6tD09YMK+K0j2dQF7zXLk+fghP8gRqAchfYW3Rx1jAOuS2xf7QbE6yBi+BY
X0EZPkw2UQKBgQCYxkXZ9oLPDhPDxw+Ob41mFkF/Z8dZVXw0d6z8Ulw37EvtkJaA
7DUgVmJA2zZzVsS78aag1HM8qqyWRaKBdEbjM91fwW7kLW8FwoEukwdABS2ekiQf
7HobHxLr8lmsG4hznLd6+CfrwbA2WoIH+gPzhQISAcN+1UxwdnynY9RAvQKBgGn0
WIbshkYStOb6joJ7peyuIYDJsG4gc4ZxUK6mc2QYYidyj0WnXkf0H3n9xKoysFqw
nUeu3dPB14f46x4TUhYRRPrWfsB1H0dw+bntj/WA8apsX6y80raUlqtG2aeXJ2Ha
moDfNfPodxEHb9FaBSC0Ug7/7IAwwsO7ysvFuIARAoGALC60V6AvHw5jhU/sBWHp
ULDW2wqcYOFlC2b3PWTuG/VE7maywLbA9MYwGVy52hD4AgkiSuqxDtlsO9DZn5nd
Yn32j0gdBElxoy4BvBe2Bd0KZ1wybuCyPgSNsZfVa9dnoqmDDV2w0EeAxhS2IPPp
K7JGqeB3/kYJmt9h1rZQr1o=
-----END PRIVATE KEY-----`;

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
        JSON.stringify({clientId: CLIENT_ID, serviceAccount: SERVICE_ACCOUNT})
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
        
        return createSuccessResponse({
          orgUnitName: userInfo.orgUnitName
        });
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
          message: apiError.message
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
        JSON.stringify({fallback: true})
      ]);
      
      return getOffices();
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
        message: error.message
      })
    ]);
    
    return createErrorResponse("組織情報の取得に失敗しました: " + error.toString());
  }
}

// JWTトークン生成
function generateJWT(clientId, serviceAccount, privateKey) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("log");
  const debugId = 'JWT_' + new Date().getTime();
  
  try {
    logSheet.appendRow([
      new Date(),
      "JWT生成",
      "開始",
      "",
      debugId,
      "JWT生成開始",
      "",
      "",
      JSON.stringify({clientId: clientId, serviceAccount: serviceAccount})
    ]);

    const header = {
      "alg": "RS256",
      "typ": "JWT"
    };
    
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      "iss": serviceAccount,
      "sub": clientId,
      "iat": now,
      "exp": now + 3600, // 1時間後
      "aud": "https://auth.worksmobile.com/oauth2/v2.0/token"
    };
    
    logSheet.appendRow([
      new Date(),
      "JWT生成",
      "ペイロード作成",
      "",
      debugId,
      "JWT payload作成完了",
      "",
      "",
      JSON.stringify(payload)
    ]);
    
    const headerEncoded = Utilities.base64EncodeWebSafe(JSON.stringify(header)).replace(/=+$/, '');
    const payloadEncoded = Utilities.base64EncodeWebSafe(JSON.stringify(payload)).replace(/=+$/, '');
    
    const signatureInput = headerEncoded + "." + payloadEncoded;
    
    logSheet.appendRow([
      new Date(),
      "JWT生成",
      "署名前",
      "",
      debugId,
      "署名前文字列生成完了",
      "",
      "",
      JSON.stringify({signatureInput: signatureInput.substring(0, 100) + "..."})
    ]);
    
    const signature = Utilities.computeRsaSha256Signature(signatureInput, privateKey);
    const signatureEncoded = Utilities.base64EncodeWebSafe(signature).replace(/=+$/, '');
    
    const jwt = signatureInput + "." + signatureEncoded;
    
    logSheet.appendRow([
      new Date(),
      "JWT生成",
      "完了",
      "",
      debugId,
      "JWT生成成功",
      "",
      "",
      JSON.stringify({jwtLength: jwt.length, jwtPrefix: jwt.substring(0, 50)})
    ]);
    
    return jwt;
  } catch (error) {
    logSheet.appendRow([
      new Date(),
      "JWT生成",
      "エラー",
      "",
      debugId,
      "JWT生成エラー: " + error.toString(),
      "",
      "",
      JSON.stringify({error: error.toString(), stack: error.stack})
    ]);
    throw error;
  }
}

// アクセストークン取得
function getAccessToken(jwt, clientId, clientSecret) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("log");
  const debugId = 'TOKEN_' + new Date().getTime();
  const url = 'https://auth.worksmobile.com/oauth2/v2.0/token';
  
  try {
    logSheet.appendRow([
      new Date(),
      "アクセストークン取得",
      "開始",
      "",
      debugId,
      "トークン取得開始",
      "",
      "",
      JSON.stringify({url: url, clientId: clientId})
    ]);
    
    const payload = {
      'assertion': jwt,
      'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      'client_id': clientId,
      'client_secret': clientSecret,
      'scope': 'user:read'
    };
    
    logSheet.appendRow([
      new Date(),
      "アクセストークン取得",
      "リクエスト準備",
      "",
      debugId,
      "OAuth2リクエスト準備完了",
      "",
      "",
      JSON.stringify({
        grant_type: payload.grant_type,
        client_id: payload.client_id,
        scope: payload.scope,
        jwtLength: jwt.length
      })
    ]);
    
    const options = {
      'method': 'POST',
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      'payload': Object.keys(payload).map(key => key + '=' + encodeURIComponent(payload[key])).join('&')
    };
    
    logSheet.appendRow([
      new Date(),
      "アクセストークン取得",
      "API呼び出し中",
      "",
      debugId,
      "UrlFetchApp.fetch実行中",
      "",
      "",
      JSON.stringify({method: options.method, headers: options.headers})
    ]);
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    logSheet.appendRow([
      new Date(),
      "アクセストークン取得",
      "レスポンス受信",
      "",
      debugId,
      "OAuth2 APIレスポンス受信",
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
    
    const data = JSON.parse(responseText);
    
    if (data.access_token) {
      logSheet.appendRow([
        new Date(),
        "アクセストークン取得",
        "成功",
        "",
        debugId,
        "アクセストークン取得成功",
        "",
        "",
        JSON.stringify({
          token_type: data.token_type,
          expires_in: data.expires_in,
          tokenLength: data.access_token.length
        })
      ]);
      return data.access_token;
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
      "トークン取得エラー: " + error.toString(),
      "",
      "",
      JSON.stringify({error: error.toString(), stack: error.stack})
    ]);
    throw error;
  }
}

// ユーザー情報取得
function getUserInfo(accessToken, domainId, userId) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("log");
  const debugId = 'USER_' + new Date().getTime();
  const url = `https://www.worksapis.com/v1.0/domains/${domainId}/users/${userId}`;
  
  try {
    logSheet.appendRow([
      new Date(),
      "ユーザー情報取得",
      "開始",
      userId,
      debugId,
      "ユーザー情報API呼び出し開始",
      "",
      "",
      JSON.stringify({url: url, domainId: domainId, userId: userId})
    ]);
    
    const options = {
      'method': 'GET',
      'headers': {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      }
    };
    
    logSheet.appendRow([
      new Date(),
      "ユーザー情報取得",
      "リクエスト準備完了",
      userId,
      debugId,
      "APIリクエストオプション設定完了",
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
      "UrlFetchApp.fetch実行中",
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
      "LINE WORKS User APIレスポンス受信",
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
        "ユーザー情報API呼び出し成功",
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
        "LINE WORKS User API HTTPエラー: " + errorMessage,
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
      "ユーザー情報取得エラー: " + error.toString(),
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

function createSuccessResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // CORS対応ヘッダー設定
  return output;
}

function createErrorResponse(message) {
  const output = ContentService
    .createTextOutput(JSON.stringify({ 
      success: false,
      error: message 
    }))
    .setMimeType(ContentService.MimeType.JSON);
  
  // CORS対応ヘッダー設定
  return output;
}