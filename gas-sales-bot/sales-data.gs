const SalesDataRepository = {
  fetchTopRankings(target) {
    const sheetName = getSheetNameByTarget(target);
    if (!sheetName) {
      return [];
    }
    const sheet = SpreadsheetApp.openById(ENV.SPREADSHEET_ID).getSheetByName(sheetName);
    if (!sheet) {
      throw new Error(`対象シートが見つかりません: ${sheetName}`);
    }
    const values = sheet.getDataRange().getValues();
    const headerOffset = 1;
    const rows = values.slice(headerOffset)
      .filter(row => row[0] && row[3] !== '')
      .map((row, index) => ({
        rank: index + 1,
        name: String(row[0]),
        requestCount: Number(row[1] || 0),
        usageCount: Number(row[2] || 0),
        contractRate: Number(row[3] || 0),
        averageStartDate: row[4],
        address: String(row[17] || row[5] || ''),
      }))
      .filter(item => !Number.isNaN(item.contractRate))
      .sort((a, b) => b.contractRate - a.contractRate)
      .slice(0, 10);
    return rows;
  }
};

function getSheetNameByTarget(target) {
  switch (target) {
    case 'medical':
      return ENV.SHEETS.MEDICAL;
    case 'home':
      return ENV.SHEETS.HOME;
    case 'facility':
      return ENV.SHEETS.FACILITY;
    case 'counsel':
      return ENV.SHEETS.COUNSEL;
    default:
      return null;
  }
}
