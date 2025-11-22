const SalesLogger = {
  log(action, detail) {
    try {
      const spreadsheet = SpreadsheetApp.openById(ENV.SPREADSHEET_ID);
      const sheet = spreadsheet.getSheetByName(ENV.SHEETS.LOG);
      if (!sheet) {
        console.warn('SalesLogger: Log sheet not found', { id: ENV.SPREADSHEET_ID, sheetName: ENV.SHEETS.LOG });
        return;
      }
      sheet.appendRow([
        new Date(),
        action,
        JSON.stringify(detail || {})
      ]);
      SpreadsheetApp.flush();
      console.log('SalesLogger: appended', action);
    } catch (error) {
      console.error('SalesLogger error', error);
      throw error;
    }
  }
};
