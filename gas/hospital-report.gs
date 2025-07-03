function doPost(e) {
  const action = e.parameter.action || 'submit';
  
  switch(action) {
    case 'submit':
      return handleHospitalReport(e);
    case 'getOffices':
      return getOffices();
    case 'getUsers':
      return getUsers();
    case 'getHospitals':
      return getHospitals();
    default:
      return createErrorResponse('無効なアクション');
  }
}

function handleHospitalReport(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("入退院管理");
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("log");
    
    const data = {
      reporter: e.parameter.reporter,
      userId: e.parameter.userId,
      office: e.parameter.office,
      date: e.parameter.date,
      time: e.parameter.time,
      userName: e.parameter.userName,
      dropoutReason: e.parameter.dropoutReason,
      contractEnded: e.parameter.contractEnded === 'true',
      notes: e.parameter.notes || ''
    };

    // 入院の場合の追加情報
    if (data.dropoutReason === 'hospitalization') {
      data.hospitalizationDate = e.parameter.hospitalizationDate;
      data.hospital = e.parameter.hospital;
      data.diagnosis = e.parameter.diagnosis;
      data.dischargeDate = e.parameter.dischargeDate;
    }
    
    // 中止の場合の追加情報
    if (data.dropoutReason === 'discontinuation') {
      data.discontinuationDate = e.parameter.discontinuationDate;
      data.discontinuationDiagnosis = e.parameter.discontinuationDiagnosis;
      data.restartDate = e.parameter.restartDate;
    }

    const timestamp = new Date();

    // 入退院管理シートに記録
    const row = [
      timestamp,                    // A: 報告日時
      data.date,                   // B: 発生日付
      data.time,                   // C: 発生時間
      data.reporter,               // D: 報告者名
      data.office,                 // E: 事業所
      data.userName,               // F: 利用者名
      data.dropoutReason,          // G: 脱落理由
      data.dropoutReason === 'hospitalization' ? data.hospitalizationDate : data.discontinuationDate, // H: 入院日/中止日
      data.hospital || '',         // I: 入院先
      data.diagnosis || data.discontinuationDiagnosis || '', // J: 診断名
      data.dischargeDate || data.restartDate || '', // K: 退院日/再開日
      data.contractEnded,          // L: 契約終了フラグ
      timestamp,                   // M: 更新日時
      data.notes,                  // N: 備考（管理用列）
      ''                          // O: ステータス
    ];

    const newRowIndex = sheet.getLastRow() + 1;
    sheet.getRange(newRowIndex, 1, 1, row.length).setValues([row]);

    // N列更新処理（要件に応じて）
    updateManagementColumn(sheet, newRowIndex, data);

    // ログシートに記録
    logSheet.appendRow([
      timestamp,
      "入退院報告",
      data.reporter,
      data.userId,
      data.userName,
      data.dropoutReason,
      data.contractEnded ? "契約終了" : "契約継続"
    ]);

    // 関係者への通知（オプション）
    if (data.contractEnded) {
      notifyContractEnd(data);
    }

    return createSuccessResponse({
      message: "入退院報告を受け付けました",
      reportId: newRowIndex - 1,
      managementUpdated: true
    });

  } catch (error) {
    console.error("入退院報告処理エラー:", error);
    return createErrorResponse("報告の送信に失敗しました: " + error.toString());
  }
}

function updateManagementColumn(sheet, rowIndex, data) {
  try {
    // N列の更新ロジック（入退院管理の特別な処理）
    let managementNote = "";
    
    if (data.dropoutReason === 'hospitalization') {
      managementNote = `入院: ${data.hospital} (${data.diagnosis})`;
      if (data.dischargeDate) {
        managementNote += ` 退院予定: ${data.dischargeDate}`;
      }
    } else {
      managementNote = `中止: ${data.discontinuationDiagnosis}`;
      if (data.restartDate) {
        managementNote += ` 再開予定: ${data.restartDate}`;
      }
    }
    
    if (data.contractEnded) {
      managementNote += " [契約終了]";
    }
    
    // N列（14列目）に更新
    sheet.getRange(rowIndex, 14).setValue(managementNote);
    
    // 条件付き書式や色付けなどの追加処理
    if (data.contractEnded) {
      sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).setBackground("#ffebee");
    } else if (data.dropoutReason === 'hospitalization') {
      sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).setBackground("#e8f5e8");
    }
    
  } catch (error) {
    console.error("N列更新エラー:", error);
  }
}

function getUsers() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("利用者マスタ");
    const data = sheet.getDataRange().getValues();
    const users = data.slice(1).map(row => ({
      id: row[0],
      name: row[1],
      office: row[2],
      birthDate: row[3] ? Utilities.formatDate(new Date(row[3]), "JST", "yyyy-MM-dd") : "",
      status: row[4] || "active"
    })).filter(user => user.status === "active"); // アクティブな利用者のみ
    
    return createSuccessResponse(users);
  } catch (error) {
    console.error("利用者マスタ取得エラー:", error);
    return createErrorResponse("利用者情報の取得に失敗しました");
  }
}

function getHospitals() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("医療機関マスタ");
    const data = sheet.getDataRange().getValues();
    const hospitals = data.slice(1).map(row => ({
      id: row[0],
      name: row[1],
      area: row[2],
      address: row[3],
      phone: row[4] || "",
      type: row[5] || "hospital"
    }));
    
    return createSuccessResponse(hospitals);
  } catch (error) {
    console.error("医療機関マスタ取得エラー:", error);
    return createErrorResponse("医療機関情報の取得に失敗しました");
  }
}

function notifyContractEnd(data) {
  try {
    // 契約終了時の通知処理
    // メール送信、Slack通知などを実装
    
    const subject = `【契約終了】${data.userName}様の利用契約終了について`;
    const body = `
利用者: ${data.userName}
事業所: ${data.office}
終了理由: ${data.dropoutReason === 'hospitalization' ? '入院' : '中止'}
報告者: ${data.reporter}
報告日時: ${new Date().toLocaleString('ja-JP')}

※事務手続きを開始してください。
    `;
    
    // 実際の送信先メールアドレスに変更
    // MailApp.sendEmail("admin@example.com", subject, body);
    
    console.log("契約終了通知:", data.userName);
  } catch (error) {
    console.error("通知送信エラー:", error);
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

// 共通関数（事故報告と共有）
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