/**
 * 事故報告写真アップロード処理
 * シートに新しいデータが登録されたことをトリガーに実行される
 */

// 設定
const PHOTO_FOLDER_ID = "11r9PGtZKBuX22TnA6cIRHru6zlNYD9T_"; // 事故報告フォルダ
const PHOTO_COLUMNS = {
  SCENE: 22,     // V列: 事故現場写真
  PROPERTY: 23,  // W列: 対物写真
  OTHER_VEHICLE: 24, // X列: 相手の車の写真
  OWN_VEHICLE: 25,   // Y列: 自分の車の写真
  LICENSE: 26        // Z列: 相手の免許証写真
};

/**
 * スプレッドシートの編集トリガー関数
 * 事故報告シートに新しい行が追加された際に実行される
 */
function onAccidentPhotoEditTrigger(e) {
  try {
    // 時刻ベースのトリガーの場合（eパラメータなし）
    if (!e || !e.source) {
      console.log("時刻ベーストリガー: 未処理の写真をチェック中...");
      checkForUnprocessedPhotos();
      return;
    }
    
    const sheet = e.source.getActiveSheet();
    
    // 事故報告シートの場合のみ処理
    if (sheet.getName() !== "事故報告") {
      return;
    }
    
    const range = e.range;
    const row = range.getRow();
    
    // ヘッダー行は除外
    if (row <= 1) {
      return;
    }
    
    // 新しい行が追加された場合（A列に報告IDがある場合）
    const reportId = sheet.getRange(row, 1).getValue();
    if (reportId && typeof reportId === 'string' && reportId.startsWith('AC')) {
      // 写真処理ステータスをチェック
      const photoStatus = sheet.getRange(row, 27).getValue(); // AA列
      
      if (photoStatus !== "写真UL処理完了") {
        console.log(`新しい事故報告を検出: ${reportId}, 写真アップロード処理開始`);
        processAccidentPhotoUpload(sheet, row);
      }
    }
  } catch (error) {
    console.error("onEditTriggerエラー:", error);
    
    // エラーログをシートに記録
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
    if (logSheet) {
      logSheet.appendRow([
        new Date(),
        "写真トリガーエラー",
        "onAccidentPhotoEditTrigger",
        "",
        "",
        error.toString(),
        error.stack || "",
        "",
        ""
      ]);
    }
  }
}

/**
 * 未処理の写真をチェックする関数（時刻ベーストリガー用）
 */
function checkForUnprocessedPhotos() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("事故報告");
    if (!sheet) {
      console.log("事故報告シートが見つかりません");
      return;
    }
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    let processedCount = 0;
    
    // 最後の10行をチェック（効率化）
    const startRow = Math.max(1, values.length - 10);
    
    for (let i = startRow; i < values.length; i++) {
      const row = i + 1;
      const reportId = values[i][0]; // A列
      const photoStatus = values[i][26]; // AA列
      
      if (reportId && typeof reportId === 'string' && reportId.startsWith('AC')) {
        if (!photoStatus || photoStatus === '未処理') {
          console.log(`未処理レコードを処理: ${reportId} (行${row})`);
          processAccidentPhotoUpload(sheet, row);
          processedCount++;
          
          // レート制限対策（1件ずつ処理）
          if (processedCount >= 1) {
            break;
          }
        }
      }
    }
    
    if (processedCount === 0) {
      console.log("未処理の写真はありません");
    }
  } catch (error) {
    console.error("未処理写真チェックエラー:", error);
  }
}

/**
 * 手動実行用関数（テスト用）
 */
function testAccidentPhotoUpload() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("事故報告");
    const lastRow = sheet.getLastRow();
    
    if (lastRow > 1) {
      console.log(`最新行(${lastRow})の写真アップロード処理をテスト実行`);
      processPhotoUpload(sheet, lastRow);
    } else {
      console.log("処理対象のデータがありません");
    }
  } catch (error) {
    console.error("testPhotoUploadエラー:", error);
  }
}

/**
 * 指定した報告IDの写真をアップロード（手動実行用）
 */
function uploadAccidentPhotosByReportId(reportId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("事故報告");
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // 指定した報告IDの行を検索
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === reportId) { // A列の報告ID
        const row = i + 1;
        console.log(`報告ID ${reportId} (行${row})の写真アップロード処理を実行`);
        processAccidentPhotoUpload(sheet, row);
        return;
      }
    }
    
    console.log(`報告ID ${reportId} が見つかりませんでした`);
  } catch (error) {
    console.error("uploadPhotosByReportIdエラー:", error);
  }
}

/**
 * 写真アップロード処理のメイン関数
 */
function processAccidentPhotoUpload(sheet, row) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
  const timestamp = new Date();
  
  try {
    // 報告データを取得
    const reportId = sheet.getRange(row, 1).getValue(); // A列: 報告ID
    const driverName = sheet.getRange(row, 12).getValue(); // L列: 運転手名
    const accidentType = sheet.getRange(row, 7).getValue(); // G列: 事故種類
    
    console.log(`写真アップロード処理開始: ${reportId}, 事故種類: ${accidentType}`);
    
    // ログ記録（開始ログは削除）
    
    // ケースフォルダを作成または取得
    const caseFolder = getOrCreateCaseFolder(reportId);
    
    let uploadCount = 0;
    let processedPhotos = {};
    
    // 各写真列を処理
    Object.entries(PHOTO_COLUMNS).forEach(([photoType, columnIndex]) => {
      const base64Data = sheet.getRange(row, columnIndex).getValue();
      
      if (base64Data && typeof base64Data === 'string' && base64Data.length > 100) {
        console.log(`${photoType}写真を処理中...`);
        
        try {
          const photoUrls = uploadPhotosFromBase64(
            base64Data, 
            caseFolder, 
            photoType, 
            driverName || 'unknown',
            reportId
          );
          
          if (photoUrls.length > 0) {
            // ハイパーリンク形式でシートに設定（コメント付き）
            setPhotoHyperlinkWithComment(sheet, row, columnIndex, photoUrls);
            
            processedPhotos[photoType] = photoUrls.length;
            uploadCount += photoUrls.length;
            
            console.log(`${photoType}: ${photoUrls.length}枚アップロード完了`);
          }
        } catch (photoError) {
          console.error(`${photoType}写真のアップロードエラー:`, photoError);
          
          // 個別写真エラーは詳細ログには記録しない（コンソールログのみ）
        }
      }
    });
    
    // ステータス更新
    if (uploadCount > 0) {
      // AA列: 写真処理ステータスを更新
      sheet.getRange(row, 27).setValue("写真UL処理完了");
      
      // AB列: フォルダIDを記録
      sheet.getRange(row, 28).setValue(caseFolder.getId());
      
      // AC列: 処理完了日時を記録
      sheet.getRange(row, 29).setValue(timestamp);
      
      // 成功ログ（簡潔版）
      // 報告者名と事業所を取得
      const reporterName = sheet.getRange(row, 5).getValue(); // E列: 報告者名
      const office = sheet.getRange(row, 6).getValue(); // F列: 事業所名
      
      logSheet.appendRow([
        timestamp,
        "写真アップロード完了",
        reporterName || '',
        office || '',
        reportId,
        `写真: ${uploadCount}枚アップロード`,
        `フォルダID: ${caseFolder.getId()}`,
        "",
        ""
      ]);
      
      console.log(`写真アップロード完了: ${reportId}, ${uploadCount}枚アップロード`);
    } else {
      // 写真がない場合もステータス更新
      sheet.getRange(row, 27).setValue("写真なし");
      sheet.getRange(row, 29).setValue(timestamp);
      
      console.log(`写真なし: ${reportId}`);
    }
    
  } catch (error) {
    console.error("写真アップロード処理エラー:", error);
    
    // エラーログ（簡潔版）
    const reporterName = sheet.getRange(row, 5).getValue(); // E列: 報告者名
    const office = sheet.getRange(row, 6).getValue(); // F列: 事業所名
    
    logSheet.appendRow([
      timestamp,
      "写真アップロードエラー",
      reporterName || '',
      office || '',
      sheet.getRange(row, 1).getValue(),
      `エラー: ${error.toString()}`,
      "",
      "",
      ""
    ]);
    
    // ステータスをエラーに設定
    sheet.getRange(row, 27).setValue("写真ULエラー");
    sheet.getRange(row, 29).setValue(timestamp);
  }
}

/**
 * ケースフォルダを取得または作成
 */
function getOrCreateCaseFolder(reportId) {
  const parentFolder = DriveApp.getFolderById(PHOTO_FOLDER_ID);
  
  // 既存フォルダを検索
  const existingFolders = parentFolder.getFoldersByName(reportId);
  if (existingFolders.hasNext()) {
    console.log(`既存フォルダを使用: ${reportId}`);
    return existingFolders.next();
  }
  
  // 新しいフォルダを作成
  const newFolder = parentFolder.createFolder(reportId);
  console.log(`新しいフォルダを作成: ${reportId}`);
  return newFolder;
}

/**
 * Base64データから写真をアップロード
 */
function uploadPhotosFromBase64(base64Data, folder, photoType, driverName, reportId) {
  const photoUrls = [];
  
  // カンマ区切りの場合は複数写真として処理
  const base64Array = base64Data.includes(',') ? base64Data.split(',') : [base64Data];
  
  base64Array.forEach((base64, index) => {
    try {
      // Base64データのクリーンアップ
      let cleanBase64 = base64.trim();
      if (cleanBase64.includes('data:image')) {
        cleanBase64 = cleanBase64.split(',')[1];
      }
      
      // 空データをスキップ
      if (!cleanBase64 || cleanBase64.length < 100) {
        return;
      }
      
      // ファイル名を生成
      const photoTypeJp = getPhotoTypeJapanese(photoType);
      const fileName = `${photoTypeJp}_${driverName}_${reportId}_${index + 1}.jpg`;
      
      // Blobを作成
      const blob = Utilities.newBlob(
        Utilities.base64Decode(cleanBase64),
        'image/jpeg',
        fileName
      );
      
      // ファイルをアップロード
      const file = folder.createFile(blob);
      
      // 共有設定を適用
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      // 閲覧可能なURLを取得
      const viewUrl = `https://drive.google.com/file/d/${file.getId()}/view?usp=sharing`;
      photoUrls.push(viewUrl);
      
      console.log(`アップロード完了: ${fileName}`);
      
    } catch (uploadError) {
      console.error(`個別写真アップロードエラー (${index}):`, uploadError);
    }
  });
  
  return photoUrls;
}

/**
 * 写真タイプの日本語名を取得
 */
function getPhotoTypeJapanese(photoType) {
  const typeMap = {
    'SCENE': '事故現場写真',
    'PROPERTY': '対物写真',
    'OTHER_VEHICLE': '相手の車の写真',
    'OWN_VEHICLE': '自分の車の写真',
    'LICENSE': '相手の免許証写真'
  };
  
  return typeMap[photoType] || photoType;
}

/**
 * 写真URLリストからハイパーリンク式を作成
 */
function createPhotoHyperlinks(photoUrls) {
  if (photoUrls.length === 0) {
    return '';
  }
  
  if (photoUrls.length === 1) {
    // 1枚の場合
    return `=HYPERLINK("${photoUrls[0]}", "📷 写真をみる")`;
  } else {
    // 複数枚の場合は枚数を表示し、最初の写真にリンク
    // 注意：Google Sheetsでは1セルに1つのハイパーリンクしか設定できないため
    // 複数のURLがある場合は最初の画像にリンクし、コメントで他の画像URLを記載する方法もある
    return `=HYPERLINK("${photoUrls[0]}", "📷 写真をみる (${photoUrls.length}枚)")`;
  }
}

/**
 * 複数写真がある場合にコメント付きでセルを設定
 */
function setPhotoHyperlinkWithComment(sheet, row, columnIndex, photoUrls) {
  if (photoUrls.length === 0) {
    return;
  }
  
  const range = sheet.getRange(row, columnIndex);
  
  if (photoUrls.length === 1) {
    // 1枚の場合は通常のハイパーリンク
    range.setFormula(`=HYPERLINK("${photoUrls[0]}", "📷 写真をみる")`);
  } else {
    // 複数枚の場合はハイパーリンク + コメント
    range.setFormula(`=HYPERLINK("${photoUrls[0]}", "📷 写真をみる (${photoUrls.length}枚)")`);
    
    // コメントに全てのURLを記載
    let commentText = `写真 ${photoUrls.length}枚:\n`;
    photoUrls.forEach((url, index) => {
      commentText += `${index + 1}. ${url}\n`;
    });
    
    range.setComment(commentText);
  }
}

/**
 * トリガー設定関数（初回実行時のみ）
 */
function setupAccidentPhotoTriggers() {
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onAccidentPhotoEditTrigger') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // スプレッドシート編集時のトリガーを作成
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onAccidentPhotoEditTrigger')
    .timeBased()
    .everyMinutes(1) // 1分ごとにチェック
    .create();
    
  console.log("写真アップロード時刻ベーストリガーを設定しました（1分間隔）");
  console.log("新しいレコードが追加されると自動的に写真処理が開始されます");
}

/**
 * 全ての未処理レコードを処理（メンテナンス用）
 */
function processAllPendingAccidentPhotoUploads() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("事故報告");
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  let processedCount = 0;
  
  for (let i = 1; i < values.length; i++) { // ヘッダー行をスキップ
    const row = i + 1;
    const reportId = values[i][0]; // A列
    const photoStatus = values[i][26]; // AA列
    
    if (reportId && typeof reportId === 'string' && reportId.startsWith('AC')) {
      if (!photoStatus || photoStatus === '未処理') {
        console.log(`未処理レコードを処理: ${reportId}`);
        processAccidentPhotoUpload(sheet, row);
        processedCount++;
        
        // レート制限対策
        Utilities.sleep(1000);
      }
    }
  }
  
  console.log(`処理完了: ${processedCount}件のレコードを処理しました`);
}