function onOpen() {
  SpreadsheetApp.getUi().createMenu('📊 集計メニュー')
    .addItem('医療機関 集計', 'analyzeByRoute_医療機関')
    .addItem('居宅 集計', 'analyzeByRoute_居宅')
    .addItem('施設 集計', 'analyzeByRoute_施設')
    .addItem('相談支援事業所 集計', 'analyzeByRoute_相談支援事業所')
    .addItem('入院動向 集計', 'analyzeHospitalization')
    .addToUi();
}

// ✅ ラッパー関数
function analyzeByRoute_医療機関() {
  analyzeByRoute('医療機関');
}
function analyzeByRoute_居宅() {
  analyzeByRoute('居宅');
}
function analyzeByRoute_施設() {
  analyzeByRoute('施設');
}
function analyzeByRoute_相談支援事業所() {
  analyzeByRoute('相談支援事業所');
}

// ✅ 日付変換ユーティリティ
function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

// ✅ 利用者管理・脱落管理の全設定
const fileConfigs = [
  { id:'1FnQ4bgH2qBaBjQaLq85ZRCjTZrpmBDn0PwdS0EDrHPc', user:'利用者管理', drop:'脱落管理', routeCols:{ '医療機関':8, '居宅':6, '施設':10 }, startDateIdx:45, startDaysIdx:17 },
  { id:'12jRtkFHxIaZ_trD5udkxwBwPomc5tDtRME0I1eiBXow', user:'利用者管理', drop:'脱落管理', routeCols:{ '医療機関':8, '居宅':6, '施設':10 }, startDateIdx:45, startDaysIdx:17 },
  { id:'1cCd8RmNL2CRLFfOaKd-_9-bYLM_TP80wuaTYbZ0HY0w', user:'利用者管理', drop:'脱落管理', routeCols:{ '医療機関':8, '居宅':6, '施設':10 }, startDateIdx:45, startDaysIdx:17 },
  { id:'1SuosFBv9_-F8Pdqs3sum3erIhgCfekU_v-RNmPJxaTU', user:'利用者管理', drop:'脱落管理', routeCols:{ '医療機関':8, '居宅':6, '施設':10 }, startDateIdx:45, startDaysIdx:17 },
  { id:'1PrzaKGFcOygpmc8w8jap5_Ft-X9yUmnl5zpg8gY_o48', user:'利用者管理', drop:'脱落管理', routeCols:{ '医療機関':8, '居宅':6, '施設':10 }, startDateIdx:45, startDaysIdx:17 },
  { id:'1ywY-yyvLBSWWvsW-mSn6j5wzZscTBFHp1k_Rdmem5JI', user:'利用者管理', drop:'脱落管理', routeCols:{ '医療機関':8, '居宅':6, '施設':10 }, startDateIdx:73, startDaysIdx:17 },
  { id:'1_ozsCYdO03ck2i4KhKvdxPrHWID8NazSqCA4gifnYQM', user:'利用者管理', drop:'脱落管理', routeCols:{ '相談支援事業所':6, '居宅':8, '医療機関':10 }, startDateIdx:51, startDaysIdx:19 },
  { id:'1TMAkVvBNYFilrooUTeBp_Otk1GC2OuufFRc1QXsSQII', user:'利用者管理', drop:'脱落管理', routeCols:{ '医療機関':8, '居宅':6, '施設':10 }, startDateIdx:45, startDaysIdx:17 },
  { id:'1e1jpOEhQ4jiJzFyKS1bpwi3E0Ob0YR1lnxWvZgWxXeU', user:'利用者管理', drop:'脱落管理', routeCols:{ '医療機関':8, '居宅':6, '施設':10 }, startDateIdx:45, startDaysIdx:17 },
  { id:'1_8pJ7fOJT2HcIilm42MZYHXYTJQPc5Vm6qxo6sGe2IA', user:'利用者管理', drop:'脱落管理', routeCols:{ '医療機関':8, '居宅':6, '施設':10 }, startDateIdx:45, startDaysIdx:17 },
  { id:'13euQETusL0PVbvymcNmZKqY4DDQ_H2Fw9HuP__4RS5Y', user:'利用者管理', drop:'脱落管理', routeCols:{ '医療機関':10, '居宅':6, '施設':10 }, startDateIdx:51, startDaysIdx:17 },
  { id:'1ivUCUyxfx9U0L8jTecFwbUcWCYyKRZILadGlLXGVbBM', user:'利用者管理', drop:'脱落管理', routeCols:{ '相談支援事業所':6, '居宅':8, '医療機関':10 }, startDateIdx:51, startDaysIdx:19 },
  { id:'1QpmfL8nX4bp-fZUma599LAxtf4ryKyCeAHFyMJYndC8', user:'光の森_利用者管理', drop:'脱落管理_光の森', routeCols:{ '相談支援事業所':6, '居宅':8, '医療機関':10 }, startDateIdx:51, startDaysIdx:19 },
  { id:'1QpmfL8nX4bp-fZUma599LAxtf4ryKyCeAHFyMJYndC8', user:'玉名_利用者管理', drop:'脱落管理_玉名', routeCols:{ '相談支援事業所':6, '居宅':8, '医療機関':10 }, startDateIdx:51, startDaysIdx:19 }
];

// ✅ 接触経路に基づく集計関数
function analyzeByRoute(routeName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const outSheet = ss.getSheetByName(routeName);
  if (!outSheet) throw new Error(`❌ 出力先シート「${routeName}」が見つかりません`);

  const facilities = outSheet.getRange("A2:A").getValues().flat()
    .map(f => typeof f === 'string' ? f.trim() : '')
    .filter(f => f !== '');

  const results = facilities.map(name => ({
    name,
    requestCount: 0,
    startCount: 0,
    startDaysTotal: 0,
    monthCounts: Array(12).fill(0)
  }));

  for (const cfg of fileConfigs) {
    const book = SpreadsheetApp.openById(cfg.id);
    const userSheet = book.getSheetByName(cfg.user);
    if (!userSheet || !cfg.routeCols[routeName]) continue;

    const data = userSheet.getDataRange().getValues();
    const nameCol = cfg.routeCols[routeName];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const route = typeof row[5] === 'string' ? row[5].trim() : '';
      if (route !== routeName) continue;

      const rawName = row[nameCol];
      const name = typeof rawName === 'string' ? rawName.trim() : '';
      if (!name || !facilities.includes(name)) continue;

      const result = results.find(r => r.name === name);
      if (!result) continue;

      result.requestCount++;

      const reqDate = parseDate(row[4]);
      if (reqDate) {
        const fiscalMonth = (reqDate.getMonth() + 9) % 12;
        result.monthCounts[fiscalMonth]++;
      }

      const startDate = parseDate(row[cfg.startDateIdx]);
      const days = row[cfg.startDaysIdx];
      if (startDate) {
        result.startCount++;
        if (typeof days === 'number') {
          result.startDaysTotal += days;
        }
      }
    }
  }

  // ✅ 出力処理（D列スキップ）
  results.forEach((r, i) => {
    const row = i + 2;
    const avgDays = r.startCount > 0 ? r.startDaysTotal / r.startCount : '';
    const leftValues = [r.requestCount, r.startCount];
    const rightValues = [avgDays, ...r.monthCounts];
    outSheet.getRange(row, 2, 1, 2).setValues([leftValues]);         // B〜C列
    outSheet.getRange(row, 5, 1, rightValues.length).setValues([rightValues]); // E列以降
  });

  Logger.log(`✅ 集計完了：「${routeName}」`);
}

// ✅ 入院動向（脱落管理）集計
function analyzeHospitalization() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const outSheet = ss.getSheetByName('入院動向');
  if (!outSheet) throw new Error('❌ 出力先「入院動向」シートが見つかりません');

  const facilities = outSheet.getRange("A2:A").getValues().flat()
    .map(f => typeof f === 'string' ? f.trim() : '')
    .filter(f => f !== '');

  const results = facilities.map(name => ({
    name,
    count: 0,
    totalDays: 0,
    monthCounts: Array(12).fill(0)
  }));

  for (const cfg of fileConfigs) {
    const book = SpreadsheetApp.openById(cfg.id);
    const dropSheet = book.getSheetByName(cfg.drop);
    if (!dropSheet) continue;

    const data = dropSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const reason = row[3];
      if (!reason || !reason.includes('入院')) continue;

      const name = typeof row[7] === 'string' ? row[7].trim() : '';
      if (!name || !facilities.includes(name)) continue;

      const result = results.find(r => r.name === name);
      if (!result) continue;

      result.count++;

      const inDate = parseDate(row[8]);
      if (inDate) {
        const fiscalMonth = (inDate.getMonth() + 9) % 12;
        result.monthCounts[fiscalMonth]++;
      }

      const days = row[17];
      if (typeof days === 'number') result.totalDays += days;
    }
  }

  results.forEach((r, i) => {
    const row = i + 2;
    const avg = r.count > 0 ? r.totalDays / r.count : '';
    const vals = [r.count, avg, ...r.monthCounts];
    outSheet.getRange(row, 2, 1, vals.length).setValues([vals]);
  });

  Logger.log(`🏥 入院動向 集計完了`);
}
