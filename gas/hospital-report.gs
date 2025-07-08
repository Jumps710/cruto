// 入退院報告システム GAS
function doPost(e) {
  try {
    const requestText = e.postData.contents;
    const requestData = JSON.parse(requestText);
    const action = requestData.action;
    
    switch(action) {
      case 'submitHospitalReport':
        return handleHospitalReport(requestData.data);
      case 'getUsers':
        return getUsers();
      case 'getHospitals':
        return getHospitals();
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

function handleHospitalReport(data) {
  try {
    console.log("入退院報告データ受信:", JSON.stringify(data));
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("入退院管理");
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("log");
    
    const timestamp = new Date();
    const reportId = 'HR' + timestamp.getTime();

    // 入退院管理シートに記録
    const row = [
      reportId,                           // A: 報告ID
      timestamp,                          // B: 報告日時
      data.incidentDate,                  // C: 発生日付
      data.incidentTime,                  // D: 発生時間
      data.reporter,                      // E: 報告者名
      data.userId || '',                  // F: ユーザーID
      data.department || '',              // G: 部署
      data.office,                        // H: 事業所
      data.userName,                      // I: 利用者名
      data.reason,                        // J: 脱落理由
      data.reason === 'hospital' ? data.hospitalDate : data.stopDate, // K: 入院日/中止日
      data.hospitalName || '',            // L: 入院先
      data.reason === 'hospital' ? 
        (data.hospitalDiagnosis === 'その他' ? data.hospitalOtherDiagnosisText : data.hospitalDiagnosis) : 
        data.stopDiagnosis,               // M: 診断名
      data.resumeDate || '',              // N: 退院日・再開日
      data.contractEnd ? '契約終了' : '', // O: 契約終了フラグ
      data.remarks || '',                 // P: 備考
      'pending'                           // Q: ステータス
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

    return createSuccessResponse({
      success: true,
      message: "入退院報告を受け付けました",
      reportId: reportId
    });

  } catch (error) {
    console.error("入退院報告処理エラー:", error);
    return createErrorResponse("報告の送信に失敗しました: " + error.toString());
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
    
    return createSuccessResponse(users);
  } catch (error) {
    console.error("利用者取得エラー:", error);
    return createErrorResponse("利用者情報の取得に失敗しました: " + error.toString());
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
    
    return createSuccessResponse(hospitals);
  } catch (error) {
    console.error("医療機関取得エラー:", error);
    return createErrorResponse("医療機関情報の取得に失敗しました: " + error.toString());
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