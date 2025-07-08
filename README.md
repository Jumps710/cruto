# Cruto LINE WORKS業務アプリケーション

LINE WORKS向けの業務支援アプリケーション群です。

## アプリケーション

各アプリは独立してNetlifyでデプロイされています：

### 🚗 [事故報告アプリ](./accident-report/)
- 車両事故/その他の事故報告フォーム
- 写真アップロード機能付き
- WOFF ID: `EownaFs9auCN-igUa84MDA`

### 🏥 [入退院報告アプリ](./hospital-report/)
- 入退院管理フォーム
- 予測検索機能付き
- WOFF ID: `Exth8PXun2d80vxUyBamIw`

### 📊 [営業支援Bot](./sales-bot/)
- 営業ルート最適化・分析機能
- WOFF ID: `Ilofk_65rvB6VHiOceQ0sg`

## デプロイ方法

### Netlify個別デプロイ
1. 各アプリフォルダ（`accident-report/`, `hospital-report/`）を個別のNetlifyサイトとしてデプロイ
2. Build settings: `Publish directory` を `.` に設定
3. 各アプリが独立したNetlify URLを持つ

### GitHub Pages（オプション）
- **ベースURL**: https://jumps710.github.io/cruto/

## 技術スタック

- Frontend: HTML5, CSS3, JavaScript (Vanilla)
- Backend: Google Apps Script
- Data: Google Sheets
- Deploy: Netlify / GitHub Pages