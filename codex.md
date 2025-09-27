# Cruto Project Codex

## Snapshot
- Purpose: LINE WORKS向けの業務アプリ群（事故報告・入退院報告・営業支援Bot）をフロント（静的ホスティング）+ Google Apps Scriptバックエンドで提供
- Front hosting: Netlify（アプリ個別） / GitHub Pages `https://jumps710.github.io/cruto/`
- Backend (current test): GAS Web App `https://script.google.com/macros/s/AKfycby5fRaVu5vISA3dvflBAaYXtWtBGXRyWt9HpWYlAiWbqqHzyBxSAt6vpWn6NuWFk8Gj/exec`
- GAS Script ID (test): `19CXCTk6AZWQ_FxToZlaKJ3Snlh17AvJG5zoFVmA9VD70eV1lf8XLYaJj`
- Core tooling: Vanilla HTML/CSS/JS + shared `common/`, Apps Script (`gas/`), clasp CLI (`@google/clasp`)

## Test Environment
- Spreadsheet ID / URL: `14tWh6likEQcFxTFmpMhCwmap1p5qub-MG5Oxff6YJY0`
- Web App URL: `https://script.google.com/macros/s/AKfycby5fRaVu5vISA3dvflBAaYXtWtBGXRyWt9HpWYlAiWbqqHzyBxSAt6vpWn6NuWFk8Gj/exec`
- 事故報告: Bot ID `10724480`, WOFF ID `k7_SVZ1p8vy45jQkIRvOUw`
- 入退院報告: Bot ID `9946034`, WOFF ID `_2Todd08o2jPGgjmr_9Teg`
- 営業Bot: WOFF ID `Ilofk_65rvB6VHiOceQ0sg`

## System Architecture
- LINE WORKS WOFF → 静的フロント（GitHub Pages/Netlify）→ GAS `doPost` → Google Sheets / Drive / LINE WORKS Bot API
- GAS `main.gs` で `action` に応じて `accident-report.gs` / `hospital-report.gs` / `sales-bot.gs` / `photoUpload.gs` に振り分け
- データ永続化は Google Sheets、写真は Google Drive、Bot通知は LINE WORKS API

## Frontend Applications
### `accident-report/`
- 車両/その他事故フォーム、GPS取得、写真アップロード必須、事業所自動取得
- `config.woffId = 'k7_SVZ1p8vy45jQkIRvOUw'`, `config.gasUrl` はテストWebApp
- 送信形式は `URLSearchParams` / JSON 両対応、`result.html` で完了表示

### `hospital-report/`
- 入退院管理フォーム、利用者/医療機関サジェスト、契約終了処理
- 「報告対象」で `existing/new` を選択。`new` + `stop` の場合は中止フィールド任意
- `config.woffId = '_2Todd08o2jPGgjmr_9Teg'`, `config.gasUrl` はテストWebApp

### `sales-bot/`
- 戦略選択→ルート生成→分析モーダル、GPS取得と逆ジオコーディング
- `config.gasUrl` をテストWebAppに更新済み

### Shared
- `common/js/woff-init.js` で WOFF SDK 初期化と共通ユーティリティ
- CSS は `common/css/base.css` + 各アプリ個別CSS

## Backend (`gas/`)
- `main.gs`
  - `ENV` 定数で Spreadsheet/Bot/LINE WORKS 認証情報を直書き管理（Script Properties 非依存）
  - `getSpreadsheet()` / `getSheet()` / `getLogSheet()` ヘルパーでシートアクセスを統一
  - `appendLog()` でログ書き込みを共通化
- `accident-report.gs`
  - 環境定数は `ENV.ACCIDENT` と `ENV.LINE_WORKS` から参照
  - Bot通知先 URL / トークン取得をテストBot向けに更新
- `hospital-report.gs`
  - `entryType === 'new'` を受け取り、新規行を `入退院管理` シート末尾に追加（A列ID・C列利用者名を設定後 `updateHospitalRecord` を再利用）
  - 既存行更新時は従来通り C列一致で検索、見つからなければエラー返却
  - LINE WORKS 認証情報を `ENV.LINE_WORKS` に統合
- `photoUpload.gs`
  - DriveフォルダIDは `ENV.PHOTO_FOLDER_ID`
  - ログは `getLogSheet()` 経由で記録
- `sales-bot.gs`
  - データ参照は `getSheet(ENV.SHEETS.SALES)`、ログは `getLogSheet()` に統一

## Data Sources
- メインSpreadsheet（ID: `14tWh6...YJY0`）に以下のシートが存在する前提
  - `事故報告`, `入退院管理`, `利用者管理`, `医療マスタ`, `営業データ`, `事業所`, `Log`
- Drive: `ENV.PHOTO_FOLDER_ID` 配下に事故写真を保存
- LINE WORKS Bot: 事故報告Bot（通知 + スプレッドシートボタン）, 入退院Bot（将来拡張用）

## Operational Notes
- GASログ = `Log` シート or `clasp logs`
- デプロイは `npm run deploy:gas`（固定デプロイID更新）または `scripts/deploy-gas.sh`
- テストWebAppに切り替えたため、フロント `config.gasUrl` はすべてテストURLに統一
- `ENV.LINE_WORKS.PRIVATE_KEY_FILE` は Drive 上の鍵ファイル名と一致させる必要あり
