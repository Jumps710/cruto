// 営業支援Bot用の個別doPost関数（統一doPostから呼び出される）
function doPostSalesBotLegacy_DISABLED(e) {
  const action = e.parameter.action || 'generateRoute';
  
  switch(action) {
    case 'generateRoute':
      return generateOptimalRoute(e);
    case 'getSalesData':
      return getSalesData();
    case 'getTargets':
      return getSalesTargets();
    default:
      return createSalesErrorResponse('無効なアクション');
  }
}

function generateOptimalRoute(e) {
  try {
    const strategy = e.parameter.strategy;
    const location = JSON.parse(e.parameter.location || '{}');
    const conditions = JSON.parse(e.parameter.conditions || '[]');
    const maxVisits = parseInt(e.parameter.maxVisits || '5');
    const userId = e.parameter.userId;

    // 営業データを取得
    const salesData = getSalesTargetsData();
    
    // 戦略に基づいてターゲットを選別・ソート
    const filteredTargets = filterTargetsByStrategy(salesData, strategy, conditions);
    
    // 位置情報に基づいて距離計算とルート最適化
    const optimizedRoute = optimizeRouteByLocation(filteredTargets, location, maxVisits);
    
    // 分析データ生成
    const analytics = generateAnalytics(optimizedRoute, salesData, strategy);
    
    // ログ記録
    logRouteGeneration(userId, strategy, optimizedRoute.length);

    const routeData = {
      strategy: strategy,
      visits: optimizedRoute,
      estimatedTime: calculateTotalTime(optimizedRoute),
      totalDistance: calculateTotalDistance(optimizedRoute),
      analytics: analytics,
      generatedAt: new Date().toISOString()
    };

    return { status: "success", data: routeData };

  } catch (error) {
    console.error("ルート生成エラー:", error);
    throw new Error("ルート生成に失敗しました: " + error.toString());
  }
}

function getSalesTargetsData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("営業データ");
    const data = sheet.getDataRange().getValues();
    
    // ヘッダー行を除いてデータを処理
    return data.slice(1).map(row => ({
      id: row[0],
      name: row[1],
      contactType: row[2], // 医療機関、居宅、相談支援事業所、施設
      address: row[3],
      phone: row[4],
      contactPerson: row[5],
      contractRate: parseFloat(row[6]) || 0, // 契約率 (%)
      avgContractDays: parseInt(row[7]) || 0, // 平均契約日数
      lastContactDate: row[8] ? new Date(row[8]) : null,
      totalContacts: parseInt(row[9]) || 0, // 接触回数
      totalContracts: parseInt(row[10]) || 0, // 契約件数
      lastContractDate: row[11] ? new Date(row[11]) : null,
      area: row[12] || '',
      notes: row[13] || '',
      lat: parseFloat(row[14]) || null,
      lng: parseFloat(row[15]) || null,
      priority: row[16] || 'normal', // high, normal, low
      status: row[17] || 'active' // active, inactive, pending
    })).filter(target => target.status === 'active');
    
  } catch (error) {
    console.error("営業データ取得エラー:", error);
    // フォールバック用のダミーデータ
    return generateDummySalesData();
  }
}

function generateDummySalesData() {
  return [
    {
      id: "target1",
      name: "○○総合病院",
      contactType: "医療機関",
      address: "東京都新宿区西新宿1-1-1",
      contractRate: 85.5,
      avgContractDays: 12,
      lastContactDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      totalContacts: 8,
      totalContracts: 7,
      area: "新宿エリア",
      lat: 35.6895, lng: 139.6917,
      priority: "high"
    },
    {
      id: "target2", 
      name: "△△クリニック",
      contactType: "医療機関",
      address: "東京都渋谷区渋谷2-2-2",
      contractRate: 45.2,
      avgContractDays: 28,
      lastContactDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      totalContacts: 12,
      totalContracts: 5,
      area: "渋谷エリア",
      lat: 35.6580, lng: 139.7016,
      priority: "normal"
    },
    {
      id: "target3",
      name: "□□居宅介護支援事業所",
      contactType: "居宅",
      address: "東京都港区六本木3-3-3",
      contractRate: 92.0,
      avgContractDays: 8,
      lastContactDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      totalContacts: 15,
      totalContracts: 14,
      area: "港エリア",
      lat: 35.6627, lng: 139.7312,
      priority: "high"
    },
    {
      id: "target4",
      name: "◇◇相談支援事業所",
      contactType: "相談支援事業所",
      address: "東京都千代田区丸の内4-4-4",
      contractRate: 33.8,
      avgContractDays: 45,
      lastContactDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      totalContacts: 18,
      totalContracts: 6,
      area: "千代田エリア",
      lat: 35.6810, lng: 139.7669,
      priority: "low"
    },
    {
      id: "target5",
      name: "◆◆介護施設",
      contactType: "施設",
      address: "東京都品川区品川5-5-5",
      contractRate: 78.9,
      avgContractDays: 18,
      lastContactDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      totalContacts: 9,
      totalContracts: 7,
      area: "品川エリア",
      lat: 35.6284, lng: 139.7387,
      priority: "normal"
    }
  ];
}

function filterTargetsByStrategy(targets, strategy, conditions) {
  let filtered = [...targets];
  
  // 戦略別フィルタリング
  switch(strategy) {
    case 'high-conversion':
      // 契約率で降順ソート
      filtered.sort((a, b) => b.contractRate - a.contractRate);
      break;
      
    case 'quick-start':
      // 平均契約日数で昇順ソート
      filtered.sort((a, b) => a.avgContractDays - b.avgContractDays);
      break;
      
    case 'new-development':
      // 契約率が低く、最終接触から時間が経っているものを優先
      filtered.sort((a, b) => {
        const aLastContact = a.lastContactDate ? (Date.now() - a.lastContactDate.getTime()) / (1000 * 60 * 60 * 24) : 999;
        const bLastContact = b.lastContactDate ? (Date.now() - b.lastContactDate.getTime()) / (1000 * 60 * 60 * 24) : 999;
        
        // 契約率の低さ × 最終接触からの日数で優先度計算
        const aScore = (100 - a.contractRate) + (aLastContact * 0.1);
        const bScore = (100 - b.contractRate) + (bLastContact * 0.1);
        
        return bScore - aScore;
      });
      break;
      
    case 'improvement':
      // 契約日数が長いものを優先
      filtered.sort((a, b) => b.avgContractDays - a.avgContractDays);
      break;
  }
  
  // 条件による追加フィルタリング
  if (conditions.includes('appointment-preferred')) {
    // 優先度が高いものを前に
    filtered.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'normal': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  
  return filtered;
}

function optimizeRouteByLocation(targets, userLocation, maxVisits) {
  if (!userLocation.lat && !userLocation.lng && !userLocation.address) {
    // 位置情報がない場合は、戦略順で上位を返す
    return targets.slice(0, maxVisits).map((target, index) => 
      enrichTargetWithRouteInfo(target, index, null)
    );
  }
  
  // 距離計算と最適化
  const targetsWithDistance = targets.map(target => {
    const distance = calculateDistance(userLocation, target);
    return {
      ...target,
      distanceFromUser: distance,
      estimatedTravelTime: Math.round(distance * 2) // 1kmあたり2分と仮定
    };
  });
  
  // 戦略と距離のバランスを考慮したスコアリング
  const scoredTargets = targetsWithDistance.map((target, strategyIndex) => {
    const strategyScore = (targets.length - strategyIndex) * 10; // 戦略的優先度
    const distanceScore = Math.max(0, 50 - target.distanceFromUser); // 距離ボーナス（50km以内）
    
    return {
      ...target,
      totalScore: strategyScore + distanceScore
    };
  });
  
  // スコア順でソートし、上位を選択
  const optimizedTargets = scoredTargets
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, maxVisits);
  
  // 実際の訪問順序を距離ベースで最適化（巡回セールスマン問題の簡易版）
  const routeOrder = optimizeVisitOrder(optimizedTargets, userLocation);
  
  return routeOrder.map((target, index) => 
    enrichTargetWithRouteInfo(target, index, userLocation)
  );
}

function calculateDistance(location1, location2) {
  // 両方に座標がある場合は直線距離を計算
  if (location1.lat && location1.lng && location2.lat && location2.lng) {
    return getDistanceFromLatLonInKm(location1.lat, location1.lng, location2.lat, location2.lng);
  }
  
  // 座標がない場合はランダムな距離を返す（実装時は住所から座標取得）
  return Math.random() * 20 + 2; // 2-22km
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球の半径 (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function optimizeVisitOrder(targets, startLocation) {
  if (targets.length <= 2) return targets;
  
  // 簡易的な最近隣法で訪問順序を最適化
  const unvisited = [...targets];
  const route = [];
  let currentLocation = startLocation;
  
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = calculateDistance(currentLocation, unvisited[0]);
    
    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(currentLocation, unvisited[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }
    
    const nearest = unvisited.splice(nearestIndex, 1)[0];
    route.push(nearest);
    currentLocation = nearest;
  }
  
  return route;
}

function enrichTargetWithRouteInfo(target, index, userLocation) {
  const lastContactDays = target.lastContactDate ? 
    Math.floor((Date.now() - target.lastContactDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
  
  return {
    ...target,
    visitOrder: index + 1,
    distance: target.distanceFromUser ? `${target.distanceFromUser.toFixed(1)}km` : `${(Math.random() * 10 + 2).toFixed(1)}km`,
    estimatedTime: '30分',
    contractRate: `${target.contractRate.toFixed(1)}%`,
    avgContractDays: `${target.avgContractDays}日`,
    lastContact: lastContactDays < 999 ? `${lastContactDays}日前` : '未接触',
    notes: generateVisitNotes(target, index)
  };
}

function generateVisitNotes(target, index) {
  const notes = [];
  
  if (target.contractRate > 80) {
    notes.push('高契約率の重要顧客');
  } else if (target.contractRate < 40) {
    notes.push('新規開拓対象');
  }
  
  if (target.avgContractDays < 15) {
    notes.push('迅速な決裁が期待');
  }
  
  if (target.priority === 'high') {
    notes.push('優先度：高');
  }
  
  const lastContactDays = target.lastContactDate ? 
    Math.floor((Date.now() - target.lastContactDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
  
  if (lastContactDays > 60) {
    notes.push('長期未接触');
  }
  
  return notes.length > 0 ? notes.join(' / ') : '通常の営業活動';
}

function generateAnalytics(route, allTargets, strategy) {
  const totalTargets = allTargets.length;
  const avgContractRate = allTargets.reduce((sum, t) => sum + t.contractRate, 0) / totalTargets;
  const avgContractDays = allTargets.reduce((sum, t) => sum + t.avgContractDays, 0) / totalTargets;
  
  // 期待売上の計算（仮定：1契約あたり50万円）
  const expectedContracts = route.reduce((sum, t) => sum + (t.contractRate / 100), 0);
  const expectedRevenue = Math.round(expectedContracts * 500000);
  
  return {
    totalTargets: totalTargets,
    selectedTargets: route.length,
    avgContractRate: `${avgContractRate.toFixed(1)}%`,
    avgContractDays: `${Math.round(avgContractDays)}日`,
    expectedContracts: Math.round(expectedContracts),
    expectedRevenue: `¥${expectedRevenue.toLocaleString()}`,
    strategy: strategy
  };
}

function calculateTotalTime(route) {
  // 移動時間 + 各営業先での滞在時間を計算
  const travelTime = route.length * 15; // 平均移動時間15分
  const visitTime = route.length * 30; // 1件あたり30分
  const totalMinutes = travelTime + visitTime;
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `約${hours}時間${minutes > 0 ? minutes + '分' : ''}`;
}

function calculateTotalDistance(route) {
  const totalKm = route.reduce((sum, visit) => {
    const distance = parseFloat(visit.distance.replace('km', ''));
    return sum + distance;
  }, 0);
  
  return `約${totalKm.toFixed(1)}km`;
}

function logRouteGeneration(userId, strategy, visitCount) {
  try {
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
    logSheet.appendRow([
      new Date(),
      "営業ルート生成",
      userId,
      strategy,
      visitCount,
      "success"
    ]);
  } catch (error) {
    console.error("ログ記録エラー:", error);
  }
}

function getSalesData() {
  try {
    const targets = getSalesTargetsData();
    return { status: "success", data: targets };
  } catch (error) {
    throw new Error("営業データの取得に失敗しました: " + error.toString());
  }
}

function getSalesTargets() {
  return getSalesData();
}

// レスポンス作成関数は main.gs で統一定義済み

function createSalesErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: "error", 
      message: message 
    }))
    .setMimeType(ContentService.MimeType.JSON);
}