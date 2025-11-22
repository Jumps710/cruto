/**
 * LINE WORKS 固定メニュー設定ユーティリティ
 */
const SalesBotMenu = {
  ensureMenu() {
    LineWorksMenu.ensureFixedMenu([
      {
        label: '訪問先サジェストを開始',
        action: {
          type: 'postback',
          data: 'action=start'
        }
      }
    ]);
  }
};
