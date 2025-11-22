// 事故報告システム GAS
function doPostAccidentReportLegacy_DISABLED(e) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
  
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
        return getAccidentUserOrganization(requestData.userId);
      default:
        return createErrorResponse('無効なアクション: ' + action);
    }
  } catch (error) {
    // エラーログのみ記録
    logSheet.appendRow([
      new Date(),
      "doPost",
      "FATAL_ERROR",
      "",
      "",
      "致命的エラー: " + error.toString(),
      "",
      "",
      ""
    ]);
    return createErrorResponse('リクエストの処理に失敗しました: ' + error.toString());
  }
}

// CORS対応のためのGETハンドラー（デバッグ用）- LEGACY
function doGetAccidentReportLegacy_DISABLED(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Accident Report API is running',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 新しい事故報告データ処理関数（条件分岐対応）
 */
function handleAccidentReport(data) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
  const timestamp = new Date();
  const reportId = generateAccidentReportId();
  
  try {
    // データ受信時のトラブルシューティングログ（削除）
    const photoCount = data.photos ? Object.values(data.photos).flat().length : 0;
    
    // 写真データをBase64でシートに保存（高速処理）
    const photoInfo = savePhotosAsBase64(data.photos || {});
    
    // 事故報告シートに保存
    try {
      const result = saveAccidentReportToSheet(data, reportId, timestamp, photoInfo);
      if (logSheet) {
        logSheet.appendRow([
          timestamp,
          "事故報告",
          "シート保存成功",
          data.reporterName || '',
          reportId,
          `事故報告シートへの保存完了`,
          `保存結果: ${JSON.stringify(result)}`,
          "",
          ""
        ]);
      }
    } catch (saveError) {
      if (logSheet) {
        logSheet.appendRow([
          timestamp,
          "事故報告",
          "シート保存エラー",
          data.reporterName || '',
          reportId,
          `事故報告シート保存失敗: ${saveError.message}`,
          `エラー詳細: ${saveError.stack}`,
          "",
          ""
        ]);
      }
      throw saveError;
    }
    
    // 成功ログのみ記録（簡潔版）
    if (logSheet) {
      logSheet.appendRow([
        timestamp,
        "事故報告フォーム送信完了",
        data.reporterName || '',
        data.office || '',
        reportId,
        `事故種類: ${data.accidentType}`,
        `写真: ${photoInfo.totalCount}枚`,
        "",
        ""
      ]);
    }
    
    // LINE WORKS通知を送信
    try {
      sendAccidentNotificationToLineWorks(data, reportId, timestamp);
      if (logSheet) {
        logSheet.appendRow([
          timestamp,
          "事故報告",
          "Bot通知成功",
          data.reporterName || '',
          reportId,
          `LINE WORKS Bot通知送信完了`,
          "",
          "",
          ""
        ]);
      }
    } catch (notificationError) {
      console.error("LINE WORKS通知エラー:", notificationError);
      if (logSheet) {
        logSheet.appendRow([
          timestamp,
          "事故報告",
          "Bot通知エラー",
          data.reporterName || '',
          reportId,
          `LINE WORKS Bot通知失敗: ${notificationError.message}`,
          `エラー詳細: ${notificationError.stack}`,
          "",
          ""
        ]);
      }
      // 通知エラーがあってもフォーム送信は成功とする
    }
    
    return {
      success: true,
      message: "事故報告を受け付けました",
      reportId: reportId,
      photoCount: photoInfo.totalCount,
      timestamp: timestamp.toISOString()
    };
    
  } catch (error) {
    console.error("[事故報告] 処理エラー:", error);
    
    // エラーログのみ記録
    if (logSheet) {
      logSheet.appendRow([
        timestamp,
        "事故報告",
        "ERROR",
        data.reporterId || '',
        reportId,
        "事故報告処理エラー: " + error.toString(),
        `エラー詳細: ${error.stack}`,
        data.reporterName || '',
        ""
      ]);
    }
    
    throw new Error("事故報告の処理に失敗しました: " + error.toString());
  }
}

/**
 * 事故報告IDを生成 - ACYYYYMMDD_HHMM形式
 */
function generateAccidentReportId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  return `AC${year}${month}${day}_${hour}${minute}`;
}

/**
 * 写真データをBase64でシートに保存（高速処理）
 * 写真データ自体は写真管理シートに保存し、事故報告シートにはマーカーのみ記録
 */
function savePhotosAsBase64(photos) {
  const photoInfo = {
    scene: [],
    property: [],
    license: [],
    otherVehicle: [],
    ownVehicle: [],
    totalCount: 0
  };
  
  // 各写真タイプごとに処理
  Object.keys(photos).forEach(photoType => {
    if (photos[photoType] && Array.isArray(photos[photoType])) {
      photos[photoType].forEach((photo, index) => {
        if (photo && photo.data) {
          const photoData = {
            fileName: `${photoType}_${index + 1}.jpg`,
            base64Data: photo.data,
            originalName: photo.name || `${photoType}_${index + 1}.jpg`,
            compressedSize: photo.compressedSize || 0
          };
          
          photoInfo[photoType].push(photoData);
          photoInfo.totalCount++;
        }
      });
    }
  });
  
  return photoInfo;
}

/**
 * 写真をGoogle Driveにアップロード（後で非同期実行用）
 */
function uploadAccidentPhotos(reportId, photos) {
  const folderId = "1ZljZRLOZvvs1ZTpcmSlJ0GFpi2QS2UI4"; // 事故報告写真フォルダID
  const folder = DriveApp.getFolderById(folderId);
  
  // 年月フォルダを作成
  const yearMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const targetFolder = getOrCreateFolder(folder, yearMonth);
  
  const photoUrls = {
    scene: [],
    property: [],
    license: [],
    otherVehicle: [],
    ownVehicle: [],
    totalCount: 0
  };
  
  // 各写真タイプごとに並列処理（高速化）
  Object.keys(photos).forEach(photoType => {
    if (photos[photoType] && Array.isArray(photos[photoType])) {
      photos[photoType].forEach((photo, index) => {
        if (photo && photo.data) {
          try {
            const fileName = `${reportId}_${photoType}_${index + 1}.jpg`;
            const base64Data = photo.data.includes(',') ? photo.data.split(',')[1] : photo.data;
            
            // Base64データサイズをログ出力（デバッグ用）
            const dataSizeKB = (base64Data.length * 0.75 / 1024).toFixed(1);
            console.log(`[写真アップロード] ${photoType} ${index + 1}: ${fileName} (${dataSizeKB}KB)`);
            
            const blob = Utilities.newBlob(
              Utilities.base64Decode(base64Data),
              'image/jpeg',
              fileName
            );
            
            const file = targetFolder.createFile(blob);
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            
            const photoInfo = {
              url: file.getDownloadUrl(),
              fileName: fileName,
              fileId: file.getId(),
              originalName: photo.name || `${photoType}_${index + 1}.jpg`,
              sizeKB: dataSizeKB
            };
            
            photoUrls[photoType].push(photoInfo);
            photoUrls.totalCount++;
            
          } catch (photoError) {
            console.error(`[写真アップロード] エラー ${photoType} ${index + 1}:`, photoError);
          }
        }
      });
    }
  });
  
  return photoUrls;
}

/**
 * フォルダを取得または作成
 */
function getOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

/**
 * 事故報告データをシートに保存 - 指定カラム順序対応
 */
function saveAccidentReportToSheet(data, reportId, timestamp, photoInfo) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("事故報告");
  
  // デバッグ: 受信したデータを確認
  console.log('[DEBUG] 受信したdata:', JSON.stringify(data));
  console.log('[DEBUG] 受信したphotoInfo:', JSON.stringify(photoInfo));
  console.log('[DEBUG] 事故種類:', data.accidentType);
  console.log('[DEBUG] 運転手名:', data.driverName);
  console.log('[DEBUG] 対物有無:', data.propertyDamage);
  console.log('[DEBUG] 対物詳細:', data.propertyDetails);
  console.log('[DEBUG] 対人有無:', data.personalInjury);
  console.log('[DEBUG] 負傷情報:', data.injury);
  
  // 写真データの詳細チェック
  console.log('[DEBUG] 写真データ詳細:', {
    scene: photoInfo.scene?.length || 0,
    property: photoInfo.property?.length || 0, 
    otherVehicle: photoInfo.otherVehicle?.length || 0,
    ownVehicle: photoInfo.ownVehicle?.length || 0,
    license: photoInfo.license?.length || 0
  });
  
  // 各写真の最初の数文字を確認（重複チェック）
  if (photoInfo.scene?.length > 0) {
    console.log('[DEBUG] 事故現場写真（最初の50文字）:', photoInfo.scene[0]?.base64Data?.substring(0, 50));
  }
  if (photoInfo.property?.length > 0) {
    console.log('[DEBUG] 対物写真（最初の50文字）:', photoInfo.property[0]?.base64Data?.substring(0, 50));
  }
  if (photoInfo.otherVehicle?.length > 0) {
    console.log('[DEBUG] 相手の車写真（最初の50文字）:', photoInfo.otherVehicle[0]?.base64Data?.substring(0, 50));
  }
  
  // カラム順序通りに行データを構築
  const row = [
    reportId,                                    // A: 報告ID
    timestamp,                                   // B: 報告日時
    data.incidentDate || '',                     // C: 発生日付
    data.incidentTime || '',                     // D: 発生時刻
    data.reporterName || '',                     // E: 報告者名
    data.office || '',                           // F: 事業所名
    data.accidentType || '',                     // G: 事故種類
    
    // その他事故エリア（H-K列）
    data.accidentType === 'その他' ? (data.locationCategory || '') : '',     // H: 場所分類
    data.accidentType === 'その他' ? (data.locationDetail || '') : '',       // I: 詳細場所
    data.accidentType === 'その他' ? (data.locationNote || '') : '',         // J: その他の場所
    data.accidentType === 'その他' ? (data.details || '') : '',              // K: 事故内容詳細
    
    // 車両事故エリア（L-U列）
    data.accidentType === '車両事故' ? (data.driverName || '') : '',         // L: 運転手名
    data.accidentType === '車両事故' ? (data.location || '') : '',           // M: 発生場所（住所）
    data.accidentType === '車両事故' ? (data.propertyDamage || '') : '',     // N: 対物有無
    data.accidentType === '車両事故' ? (data.propertyDetails || '') : '',    // O: 対物詳細
    data.accidentType === '車両事故' ? (data.personalInjury || '') : '',     // P: 対人有無
    data.accidentType === '車両事故' ? (data.injury?.self || '') : '',       // Q: 負傷_本人
    data.accidentType === '車両事故' ? (data.injury?.passenger || '') : '',  // R: 負傷_同乗者
    data.accidentType === '車両事故' ? (data.injury?.other || '') : '',      // S: 負傷_対人
    data.accidentType === '車両事故' ? buildInjuryDetails(data.injury) : '', // T: 負傷詳細
    data.accidentType === '車両事故' ? (data.details || '') : '',            // U: 事故内容詳細
    
    // 写真管理エリア（V-Z列）
    buildPhotoData(photoInfo.scene),             // V: 事故現場写真
    buildPhotoData(photoInfo.property),          // W: 対物写真
    buildPhotoData(photoInfo.otherVehicle),      // X: 相手の車の写真
    buildPhotoData(photoInfo.ownVehicle),        // Y: 自分の車の写真
    buildPhotoData(photoInfo.license),           // Z: 相手の免許証写真
    
    // システム管理エリア（AA-AC列）
    '未処理',                                    // AA: 写真処理ステータス
    '',                                          // AB: DriveフォルダID
    new Date()                                   // AC: 作成日時
  ];
  
  // 2行目から記録するように修正
  // 1行目はヘッダーとして残す
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  let targetRow = 2; // デフォルトは2行目
  
  // 2行目から順に空行を探す
  for (let i = 1; i < values.length; i++) { // i=1から開始（2行目）
    const rowData = values[i];
    // A列（報告ID）が空の場合、その行を使用
    if (!rowData[0] || rowData[0] === '') {
      targetRow = i + 1; // 配列のインデックスは0始まりなので+1
      break;
    }
  }
  
  // 全て埋まっている場合は最後の行の次に追加
  if (targetRow === 2 && values.length > 1 && values[1][0]) {
    targetRow = values.length + 1;
  }
  
  // データを挿入
  sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
  
  console.log(`[シート保存] 報告ID: ${reportId}, カラム数: ${row.length}, 行番号: ${targetRow}`);
  return { reportId, rowData: row, rowNumber: targetRow };
}

/**
 * 写真データを文字列化する関数
 */
function buildPhotoData(photoArray) {
  if (!photoArray || photoArray.length === 0) {
    return '';
  }
  
  // Base64データの文字数制限対策
  const base64Strings = photoArray.map(photo => photo.base64Data || photo.data || '');
  const combinedData = base64Strings.join(',');
  
  // 50,000文字制限チェック
  if (combinedData.length > 48000) { // 少し余裕を持って48000文字
    console.warn(`写真データが大きすぎます: ${combinedData.length}文字`);
    // 各写真を短縮（最初の10000文字のみ保持）
    const truncatedData = base64Strings.map(data => {
      if (data.length > 10000) {
        return data.substring(0, 10000) + '...[TRUNCATED]';
      }
      return data;
    }).join(',');
    return truncatedData;
  }
  
  return combinedData;
}

/**
 * 負傷詳細を統合する関数
 */
function buildInjuryDetails(injury) {
  if (!injury) return '';
  
  // 負傷詳細を取得（selfDetails, passengerDetails, otherDetailsのいずれか）
  const injuryText = injury.selfDetails || injury.passengerDetails || injury.otherDetails || '';
  
  // 詳細のみを返す
  return injuryText;
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

function getAccidentUserOrganization(userId) {
  try {
    const DOMAIN_ID = '10000389';

    try {
      
      // アクセストークンを取得
      const accessToken = getLWBotAccessToken();
      
      // ユーザー情報を取得
      const userInfo = getAccidentUserInfo(accessToken, DOMAIN_ID, userId);
      
      // 組織情報を適切に取得
      let orgUnitName = null;
      if (userInfo && userInfo.organizations && userInfo.organizations.length > 0) {
        const targetOrg = userInfo.organizations.find(org => org.domainId === 10000389);
        if (targetOrg && targetOrg.orgUnits && targetOrg.orgUnits.length > 0) {
          const primaryOrgUnit = targetOrg.orgUnits.find(unit => unit.primary === true) || targetOrg.orgUnits[0];
          orgUnitName = primaryOrgUnit.orgUnitName;
        }
      }
      
      if (orgUnitName) {
        return {
          orgUnitName: orgUnitName
        };
      } else {
        throw new Error('組織情報が取得できませんでした');
      }
      
    } catch (apiError) {
      // フォールバック: 事業所シートから取得
      const fallbackOffices = getOffices();
      return fallbackOffices;
    }
    
  } catch (error) {
    throw new Error("組織情報の取得に失敗しました: " + error.toString());
  }
}

// JWTトークン生成（事故報告専用）
function generateAccidentJWT(clientId, serviceAccount, privateKey) {
  try {
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
    
    return jwtToken;
  } catch (error) {
    console.error("JWT生成エラー:", error);
    throw error;
  }
}

// ユーザー情報取得（事故報告専用）
function getAccidentUserInfo(accessToken, domainId, userId) {
  const url = `https://www.worksapis.com/v1.0/users/${userId}`;
  
  try {
    const options = {
      'method': 'GET',
      'headers': {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      'muteHttpExceptions': true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      const data = JSON.parse(responseText);
      return data;
    } else {
      throw new Error(`ユーザー情報の取得に失敗しました: HTTP ${responseCode}`);
    }
  } catch (error) {
    console.error("ユーザー情報取得エラー:", error);
    throw error;
  }
}

// URLSearchParams形式のデータを処理する関数
function handleAccidentReportFromParams(params) {
  try {
    console.log("事故報告データ受信（URLSearchParams形式）");
    
    // デバッグ: 受信したパラメータをログ出力
    console.log('[DEBUG] 受信パラメータ:', JSON.stringify(params));
    
    // ログ記録は削除（handleAccidentReportで記録される）
    
    // URLSearchParamsからフォームデータを構築
    const formData = {
      reporterId: params.reporterId || '',
      reporterName: params.reporterName || '',
      office: params.office || '',
      incidentDate: params.incidentDate || '',
      incidentTime: params.incidentTime || '',
      accidentType: params.accidentType || '',
      location: params.location || '',
      details: params.details || '',
      
      // 車両事故の追加フィールド
      driverName: params.driverName || '',
      propertyDamage: params.propertyDamage || '',
      propertyDetails: params.propertyDetails || '',
      personalInjury: params.personalInjury || '',
      personalDetails: params.personalDetails || '',
      
      // その他事故の追加フィールド
      locationCategory: params.locationCategory || '',
      locationDetail: params.locationDetail || '',
      locationNote: params.locationNote || '',
      
      // 負傷詳細フィールドを構築
      injury: {
        self: params.injurySelf || '',
        selfDetails: params.injurySelfDetails || '',
        passenger: params.injuryPassenger || '',
        passengerDetails: params.injuryPassengerDetails || '',
        other: params.injuryOther || '',
        otherDetails: params.injuryOtherDetails || ''
      },
      
      timestamp: new Date().toISOString(),
      photos: {}
    };
    
    // デバッグ: 構築されたformDataを確認
    console.log('[DEBUG] 構築されたformData:', JSON.stringify(formData));
    
    // 写真データを復元
    Object.keys(params).forEach(key => {
      if (key.startsWith('photo_')) {
        const match = key.match(/photo_(\w+)_(\d+)/);
        if (match) {
          const photoType = match[1];
          const index = parseInt(match[2]);
          const photoName = params[`photoName_${photoType}_${index}`] || `${photoType}_${index}.jpg`;
          
          if (!formData.photos[photoType]) {
            formData.photos[photoType] = [];
          }
          
          formData.photos[photoType][index] = {
            name: photoName,
            data: params[key],
            originalSize: 0,
            compressedSize: params[key].length
          };
        }
      }
    });
    
    // 既存のhandleAccidentReport関数を使用
    return handleAccidentReport(formData);
    
  } catch (error) {
    console.error("URLSearchParams形式データ処理エラー:", error);
    throw new Error("URLSearchParams形式データの処理に失敗しました: " + error.toString());
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
      return privateKey;
    } else {
      throw new Error("秘密鍵ファイルが見つかりません: private_20250720123804.key");
    }
  } catch (error) {
    console.error("秘密鍵ファイル読み込みエラー:", error);
    throw error;
  }
}

/**
 * LINE WORKS Bot APIを使用して事故報告通知を送信
 */
function sendAccidentNotificationToLineWorks(data, reportId, timestamp) {
  const BOT_ID = "10724480";
  const CHANNEL_ID = "4085b984-7e5d-7a65-7eb0-ce5dba081404";
  //これはテスト用です const CHANNEL_ID = "4085b984-7e5d-7a65-7eb0-ce5dba081404"; 
  //これは本番用です const CHANNEL_ID = "4085b984-7e5d-7a65-7eb0-ce5dba081404"; 
  const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1oP-gLA5OQxL0Tm4mXTSQgJy3bPCuoZ75hJwZMoh2ZpU/edit?gid=1727492303#gid=1727492303";
  
  try {
    
    // アクセストークンを取得
    const accessToken = getLWBotAccessToken();
    
    // メッセージ内容を構築
    let messageText = `【事故報告】\n${data.office || ''}${data.reporterName || ''}さんより事故報告です。\n\n`;
    messageText += `発生日付: ${data.incidentDate || ''}\n`;
    messageText += `発生時刻: ${data.incidentTime || ''}\n`;
    messageText += `事故種類: ${data.accidentType || ''}\n\n`;
    
    if (data.accidentType === 'その他') {
      messageText += `【その他事故の詳細】\n`;
      messageText += `場所分類: ${data.locationCategory || ''}\n`;
      messageText += `詳細場所: ${data.locationDetail || ''}\n`;
      if (data.locationNote) {
        messageText += `その他の場所: ${data.locationNote}\n`;
      }
      messageText += `事故内容詳細: ${data.details || ''}\n`;
    } else if (data.accidentType === '車両事故') {
      messageText += `【車両事故の詳細】\n`;
      messageText += `運転手名: ${data.driverName || ''}\n`;
      messageText += `発生場所: ${data.location || ''}\n`;
      messageText += `対物有無: ${data.propertyDamage || ''}\n`;
      if (data.propertyDetails) {
        messageText += `対物詳細: ${data.propertyDetails}\n`;
      }
      messageText += `対人有無: ${data.personalInjury || ''}\n`;
      if (data.injury) {
        if (data.injury.self === 'あり') {
          messageText += `負傷_本人: あり\n`;
        }
        if (data.injury.passenger === 'あり') {
          messageText += `負傷_同乗者: あり\n`;
        }
        if (data.injury.other === 'あり') {
          messageText += `負傷_対人: あり\n`;
        }
        const injuryDetails = buildInjuryDetails(data.injury);
        if (injuryDetails) {
          messageText += `負傷詳細: ${injuryDetails}\n`;
        }
      }
      messageText += `事故内容詳細: ${data.details || ''}\n`;
    }
    
    messageText += `\n報告ID: ${reportId}`;
    
    // メッセージペイロード
    const messagePayload = {
      content: {
        type: "text",
        text: messageText
      }
    };
    
    // ボタン付きメッセージを追加
    const buttonMessagePayload = {
      content: {
        type: "button_template",
        contentText: "詳細はスプレッドシートをご確認ください。",
        actions: [
          {
            type: "uri",
            label: "詳細を見る",
            uri: SPREADSHEET_URL
          }
        ]
      }
    };
    
    // メッセージ送信URL
    const url = `https://www.worksapis.com/v1.0/bots/${BOT_ID}/channels/${CHANNEL_ID}/messages`;
    
    // まずテキストメッセージを送信
    const options = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(messagePayload),
      muteHttpExceptions: true
    };
    
    const response1 = UrlFetchApp.fetch(url, options);
    
    // 次にボタンメッセージを送信
    options.payload = JSON.stringify(buttonMessagePayload);
    const response2 = UrlFetchApp.fetch(url, options);
    
    console.log("LINE WORKS通知送信成功:", reportId);
    
  } catch (error) {
    console.error("LINE WORKS通知送信エラー:", error);
    throw error;
  }
}
