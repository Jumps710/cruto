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
  try {
    // LINE WORKS API設定（実際の設定値に置き換える必要があります）
    const API_ID = 'YOUR_API_ID';
    const CONSUMER_KEY = 'YOUR_CONSUMER_KEY';
    const SERVER_ID = 'YOUR_SERVER_ID';
    const PRIVATE_KEY = 'YOUR_PRIVATE_KEY';
    
    // JWTトークン生成とAPIコール
    // 注意: 実際の実装では、LINE WORKS APIの認証とユーザー情報取得を行う
    // ここでは簡易的な実装例を示します
    
    // 暫定的に、ユーザーIDから組織名を推定（実際はAPIから取得）
    const orgMapping = {
      'tokyo_': '東京事業所',
      'osaka_': '大阪事業所',
      'nagoya_': '名古屋事業所',
      'fukuoka_': '福岡事業所',
      'sendai_': '仙台事業所',
      'sapporo_': '札幌事業所'
    };
    
    let orgName = '';
    for (const prefix in orgMapping) {
      if (userId.startsWith(prefix)) {
        orgName = orgMapping[prefix];
        break;
      }
    }
    
    if (!orgName) {
      orgName = '本社'; // デフォルト
    }
    
    return createSuccessResponse({
      orgUnitName: orgName
    });
    
  } catch (error) {
    console.error("組織情報取得エラー:", error);
    return createErrorResponse("組織情報の取得に失敗しました: " + error.toString());
  }
}

function createSuccessResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      success: false,
      error: message 
    }))
    .setMimeType(ContentService.MimeType.JSON);
}