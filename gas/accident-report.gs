function doPost(e) {
  const action = e.parameter.action || 'submit';
  
  switch(action) {
    case 'submit':
      return handleAccidentReport(e);
    case 'getOffices':
      return getOffices();
    default:
      return createErrorResponse('無効なアクション');
  }
}

function handleAccidentReport(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("事故報告");
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("log");
    const folder = DriveApp.getFolderById("1kNQI4KKDifydVbyVvH88ueXOJKmJChe0");

    const data = {
      reporter: e.parameter.reporter,
      userId: e.parameter.userId,
      office: e.parameter.office,
      date: e.parameter.date,
      time: e.parameter.time,
      accidentType: e.parameter.accidentType,
      location: e.parameter.location,
      locationDetail: e.parameter.locationDetail,
      details: e.parameter.details,
      photos: e.parameter.photos ? JSON.parse(e.parameter.photos) : []
    };

    // 車両事故の場合の追加情報
    if (data.accidentType === 'vehicle') {
      data.driverName = e.parameter.driverName;
      data.propertyDamage = e.parameter.propertyDamage;
      data.personalDamage = e.parameter.personalDamage;
      data.injuries = e.parameter.injuries ? JSON.parse(e.parameter.injuries) : {};
      data.locationGPS = e.parameter.locationGPS;
    }

    // 写真をGoogle Driveに保存
    const photoUrls = [];
    data.photos.forEach((photo, index) => {
      if (photo.base64) {
        const blob = Utilities.newBlob(
          Utilities.base64Decode(photo.base64), 
          MimeType.JPEG, 
          `${data.reporter}_${data.date}_${index + 1}.jpg`
        );
        const file = folder.createFile(blob);
        photoUrls.push({
          url: file.getUrl(),
          type: photo.type
        });
      }
    });

    const timestamp = new Date();

    // 事故報告シートに記録
    const row = [
      timestamp,                    // A: 報告日時
      data.date,                   // B: 発生日付
      data.time,                   // C: 発生時間
      data.reporter,               // D: 報告者名
      data.office,                 // E: 事業所
      data.accidentType,           // F: 事故種類
      data.location,               // G: 発生場所
      data.locationDetail,         // H: 発生場所詳細
      data.driverName || '',       // I: 運転手名
      data.propertyDamage || '',   // J: 対物
      data.personalDamage || '',   // K: 対人
      JSON.stringify(data.injuries || {}), // L: 負傷詳細
      data.locationGPS || '',      // M: GPS位置
      data.details,                // N: 事故内容
      JSON.stringify(photoUrls),   // O: 写真URL
      'pending'                    // P: ステータス
    ];

    sheet.appendRow(row);

    // ログシートに記録
    logSheet.appendRow([
      timestamp,
      "事故報告",
      data.reporter,
      data.userId,
      data.date,
      data.time,
      JSON.stringify(photoUrls)
    ]);

    return createSuccessResponse({
      message: "事故報告を受け付けました",
      reportId: sheet.getLastRow() - 1
    });

  } catch (error) {
    console.error("事故報告処理エラー:", error);
    return createErrorResponse("報告の送信に失敗しました: " + error.toString());
  }
}

function getOffices() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("事業所マスタ");
    const data = sheet.getDataRange().getValues();
    const offices = data.slice(1).map(row => ({
      id: row[0],
      name: row[1],
      address: row[2]
    }));
    
    return createSuccessResponse(offices);
  } catch (error) {
    return createErrorResponse("事業所情報の取得に失敗しました");
  }
}

function createSuccessResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: "success", 
      data: data 
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: "error", 
      message: message 
    }))
    .setMimeType(ContentService.MimeType.JSON);
}