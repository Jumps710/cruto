// メインルーティング処理 - 統一doPost関数
function doPost(e) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
  const timestamp = new Date();
  
  // 最初にリクエスト到達を記録
  logSheet.appendRow([
    timestamp,
    "doPost",
    "到達確認",
    "",
    "",
    "POSTリクエスト到達",
    e ? "イベントあり" : "イベントなし",
    e && e.postData ? "データあり" : "データなし",
    ""
  ]);
  
  try {
    if (!e || !e.postData) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: "Cruto Apps API is running",
          timestamp: new Date().toISOString(),
          apps: ["accident-report", "hospital-report", "sales-bot"]
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // リクエスト形式の判定と処理
    let action, requestData;
    
    // URLSearchParams形式（application/x-www-form-urlencoded）で送信された場合
    if (e.parameter && e.parameter.action) {
      action = e.parameter.action;
      requestData = e.parameter;
    }
    // POSTでURLSearchParams形式の場合（e.postDataがURLSearchParams）
    else if (e.postData && e.postData.contents && e.postData.type === 'application/x-www-form-urlencoded') {
      const params = new URLSearchParams(e.postData.contents);
      const paramObj = {};
      for (const [key, value] of params.entries()) {
        paramObj[key] = value;
      }
      action = paramObj.action;
      requestData = paramObj;
    }
    // JSON形式で送信された場合（従来通り）
    else if (e.postData && e.postData.contents) {
      const requestText = e.postData.contents;
      requestData = JSON.parse(requestText);
      action = requestData.action;
    } else {
      throw new Error('リクエストデータが不正な形式です');
    }
    
    // アクション別ルーティング
    switch(action) {
      // 事故報告系アクション
      case 'submitAccidentReport':
        // URLSearchParams形式かどうかの判定
        const isUrlParams = (e.parameter && e.parameter.action) || Object.keys(requestData).some(k => k.startsWith('photo_'));
        
        // URLSearchParams形式の場合（POSTでも対応）
        if (isUrlParams) {
          try {
            const accidentResult = handleAccidentReportFromParams(requestData);
            return createSuccessResponse(accidentResult);
          } catch (paramsError) {
            // エラーをログに記録（最小限）
            logSheet.appendRow([
              new Date(),
              "事故報告エラー",
              requestData.reporterName || "",
              requestData.office || "",
              "",
              `エラー: ${paramsError.toString()}`,
              "",
              "",
              ""
            ]);
            throw paramsError;
          }
        } 
        // JSON形式の場合
        else {
          const accidentResult = handleAccidentReport(requestData.data);
          return createSuccessResponse(accidentResult);
        }
        
      case 'getUserOrganization':
        // 事故報告からの組織取得
        if (requestData.source === 'accident-report' || !requestData.source) {
          const orgResult = getAccidentUserOrganization(requestData.userId);
          return createSuccessResponse(orgResult);
        } else {
          // 入退院報告からの組織取得
          const hospitalOrgResult = getHospitalUserOrganization(requestData.userId);
          return createSuccessResponse(hospitalOrgResult);
        }
        
      case 'getOffices':
        const officesResult = getOffices();
        return createSuccessResponse(officesResult);
        
      // 入退院報告系アクション
      case 'submitHospitalReport':
        // フォーム送信開始ログ（トラブルシューティング用）
        logSheet.appendRow([
          new Date(),
          "入退院報告",
          "フォーム送信開始",
          requestData.data?.reporterId || "",
          "",
          `入退院報告フォーム送信開始: ${requestData.data?.reasonType || "不明"}`,
          "",
          "",
          ""
        ]);
        const hospitalResult = handleHospitalReport(requestData.data);
        return createSuccessResponse(hospitalResult);
        
      case 'getUsers':
        const usersResult = getUsers();
        return createSuccessResponse(usersResult);
        
      case 'getHospitals':
        const hospitalsResult = getHospitals();
        return createSuccessResponse(hospitalsResult);
        
      // 営業支援Bot系アクション
      case 'generateRoute':
        const routeResult = generateOptimalRoute({
          parameter: {
            strategy: requestData.strategy,
            location: JSON.stringify(requestData.location || {}),
            conditions: JSON.stringify(requestData.conditions || []),
            maxVisits: requestData.maxVisits || '5',
            userId: requestData.userId
          }
        });
        return createSuccessResponse(routeResult);
        
      case 'getSalesData':
        const salesDataResult = getSalesData();
        return createSuccessResponse(salesDataResult);
        
      case 'getTargets':
        const targetsResult = getSalesTargets();
        return createSuccessResponse(targetsResult);
        
      case 'logGoogleMapsResponse':
        const logResult = logGoogleMapsApiResponse(requestData);
        return createSuccessResponse(logResult);
        
      default:
        return createErrorResponse('無効なアクション: ' + action);
    }
    
  } catch (error) {
    // 致命的エラーログのみ記録
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

// GET テスト用関数（簡素化版）
function doGet(e) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
  const timestamp = new Date();
  
  // GETリクエスト到達ログ
  logSheet.appendRow([
    timestamp,
    "doGet",
    "到達確認",
    "",
    "",
    "GETリクエスト到達",
    e && e.parameter ? `params: ${JSON.stringify(e.parameter)}` : "パラメータなし",
    "",
    ""
  ]);
  
  try {
    // パラメータがない場合は基本情報を返す
    if (!e || !e.parameter || !e.parameter.action) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: "Cruto Apps API is running",
          timestamp: new Date().toISOString(),
          apps: ["accident-report", "hospital-report", "sales-bot"],
          parameters: e ? e.parameter : "no parameters",
          version: "2025-01-28-002", // デプロイバージョンを確認
          lastUpdated: "2025/01/28 11:00", // 最終更新日時
          gasDeployed: true,
          doGetWorking: true
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = e.parameter.action;
    const userId = e.parameter.userId;
    
    // デバッグログ追加
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
    logSheet.appendRow([
      new Date(),
      "doGet",
      "アクション受信",
      action || "なし",
      "",
      `パラメータ: ${JSON.stringify(e.parameter)}`,
      "",
      "",
      ""
    ]);
    
    // アクション別ルーティング（doPost と同じ）
    switch(action) {
      case 'getUserOrganization':
        const orgResult = getAccidentUserOrganization(userId);
        return createSuccessResponse(orgResult);
        
      case 'submitAccidentReport':
        // JSONデータをパースして処理
        const dataParam = e.parameter.data;
        if (!dataParam) {
          throw new Error('データパラメータがありません');
        }
        
        const formData = JSON.parse(dataParam);
        const accidentResult = handleAccidentReport(formData);
        return createSuccessResponse(accidentResult);
        
      case 'getOffices':
        const officesResult = getOffices();
        return createSuccessResponse(officesResult);
        
      // 入退院報告系のGETアクション
      case 'searchUsers':
        const query = e.parameter.query;
        // hospital-report.gsのsearchUsers関数を明示的に呼び出し
        const usersSearchResult = searchUsers(query);
        return createSuccessResponse(usersSearchResult);
        
      case 'searchHospitals':
        const hospitalQuery = e.parameter.query;
        const hospitalsSearchResult = searchHospitals(hospitalQuery);
        return createSuccessResponse(hospitalsSearchResult);
        
      case 'getUsers':
        const usersResult = getUsers();
        return createSuccessResponse(usersResult);
        
      case 'getHospitals':
        const hospitalsResult = getHospitals();
        return createSuccessResponse(hospitalsResult);
        
      case 'logError':
        // エラーログ記録用
        const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
        const errorMsg = e.parameter.error || 'Unknown error';
        const source = e.parameter.source || 'Unknown source';
        logSheet.appendRow([
          new Date(),
          "クライアントエラー",
          source,
          "",
          "",
          errorMsg,
          "",
          "",
          ""
        ]);
        return createSuccessResponse({ logged: true });
        
      default:
        return createErrorResponse('無効なアクション: ' + action);
    }
    
  } catch (error) {
    return createErrorResponse('リクエストの処理に失敗しました: ' + error.toString());
  }
}

// 共通レスポンス作成関数（シンプル版）
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

/**
 * Google Maps APIレスポンスをログに記録する関数
 */
function logGoogleMapsApiResponse(requestData) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
  const timestamp = new Date();
  const requestId = 'MAPS_' + timestamp.getTime();
  
  try {
    // リクエストデータの取得
    const coordinates = requestData.coordinates || {};
    const lat = coordinates.lat || '';
    const lng = coordinates.lng || '';
    const googleResponse = requestData.googleResponse || {};
    const extractedAddress = requestData.extractedAddress || {};
    const source = requestData.source || 'unknown';
    
    // Google Maps APIレスポンスをログに記録
    logSheet.appendRow([
      timestamp,
      "GoogleMaps",
      "APIレスポンス",
      source,
      requestId,
      `座標(${lat}, ${lng})からの住所取得結果`,
      `抽出住所: ${extractedAddress.fullAddress || ''}`,
      `番地: ${extractedAddress.houseNumber || ''}`,
      JSON.stringify({
        coordinates: { lat, lng },
        googleApiResponse: googleResponse,
        extractedAddress: extractedAddress,
        responseLength: JSON.stringify(googleResponse).length
      })
    ]);
    
    // Google APIから返された各address_componentも詳細ログに記録
    if (googleResponse.results && googleResponse.results.length > 0) {
      const firstResult = googleResponse.results[0];
      
      // address_componentsの詳細ログ
      if (firstResult.address_components) {
        firstResult.address_components.forEach((component, index) => {
          logSheet.appendRow([
            timestamp,
            "GoogleMaps",
            "Component",
            source,
            requestId,
            `Component ${index + 1}: ${component.types.join(', ')}`,
            `Long: ${component.long_name}`,
            `Short: ${component.short_name}`,
            JSON.stringify({
              component: component,
              index: index
            })
          ]);
        });
      }
      
      // formatted_addressもログ
      if (firstResult.formatted_address) {
        logSheet.appendRow([
          timestamp,
          "GoogleMaps",
          "FormattedAddress",
          source,
          requestId,
          "Google Maps formatted_address",
          firstResult.formatted_address,
          "",
          JSON.stringify({
            formatted_address: firstResult.formatted_address,
            place_id: firstResult.place_id || ''
          })
        ]);
      }
    }
    
    return {
      success: true,
      message: "Google Maps APIレスポンスをログに記録しました",
      requestId: requestId,
      timestamp: timestamp.toISOString()
    };
    
  } catch (error) {
    // エラーログ
    logSheet.appendRow([
      timestamp,
      "GoogleMaps",
      "ERROR",
      source,
      requestId,
      "Google Maps APIレスポンスログ記録エラー: " + error.toString(),
      "",
      "",
      JSON.stringify({
        error: error.toString(),
        stack: error.stack
      })
    ]);
    
    return {
      success: false,
      error: "ログ記録に失敗しました: " + error.toString(),
      requestId: requestId
    };
  }
}