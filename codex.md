# Cruto Project Codex

## Snapshot
- Purpose: LINE WORKS向けの業務アプリ（事故報告・入退院報告・営業支援Bot）をフロント（静的ホスティング）+ Google Apps Scriptバックエンドで提供
- Hosting: 各アプリをNetlify個別デプロイ / GitHub Pages共通公開 `https://jumps710.github.io/cruto/`
- Backend Endpoint (current prod): `https://script.google.com/macros/s/AKfycbyL58-LDmfXvfXkYbj-LL9PPrnDZreH0RPg1-io0xgdNgICh30_VUBa1SZebAqk4hBxoA/exec`
- GAS Script ID: `1tRFxjvtWORDXfaYU3aHH2CcoKPG_Wf4qw92OJCMCJ8dxdqsBdm_88nkZ`
- Core tooling: Vanilla HTML/CSS/JS, shared `common/` assets, Apps Script (`gas/`), clasp CLI (`@google/clasp`)

## Test Environment
- Backend endpoint: `https://docs.google.com/spreadsheets/d/14tWh6likEQcFxTFmpMhCwmap1p5qub-MG5Oxff6YJY0/edit?gid=494299374#gid=494299374`
- SpreadSheet ID: `14tWh6likEQcFxTFmpMhCwmap1p5qub-MG5Oxff6YJY0`
- SpreadSheet URL: `https://docs.google.com/spreadsheets/d/14tWh6likEQcFxTFmpMhCwmap1p5qub-MG5Oxff6YJY0/edit?gid=494299374#gid=494299374`
- GAS Script ID: `19CXCTk6AZWQ_FxToZlaKJ3Snlh17AvJG5zoFVmA9VD70eV1lf8XLYaJj`
- Web App URL: `https://script.google.com/macros/s/AKfycby5fRaVu5vISA3dvflBAaYXtWtBGXRyWt9HpWYlAiWbqqHzyBxSAt6vpWn6NuWFk8Gj/exec`
- Frontend `config.gasUrl` (accident/hospital/sales) は上記テスト Web App を指すよう設定済み。切替時は各アプリの `config.gasUrl` を同時更新すること。
- 事故
   Bot ID: 10724480
   WOFF ID: k7_SVZ1p8vy45jQkIRvOUw
- 入退院
   Bot ID: 9946034
   WOFF ID: _2Todd08o2jPGgjmr_9Teg
-


## System Architecture
- LINE WORKS WOFF → 静的アプリ（GitHub Pages/Netlify）→ GAS Web App (`doPost`) → Google Sheets/Drive/LINE WORKS Bot
- GAS `main.js` で `action` ベースのルーティング、個別モジュール（事故/入退院/営業/写真処理）へ委譲
- データ永続化は Google Sheets、写真は Google Drive フォルダへ格納、通知は LINE WORKS Bot API 経由

## Frontend Applications
### accident-report/ (`index.html`, `js/accident-report.js`)
- 車両事故/その他の事故フォーム、GPS取得、写真必須アップロード、事業所自動取得
- `config` に WOFF ID `EownaFs9auCN-igUa84MDA`, GAS URL (上記), Google Maps Geocoding API キーを格納
- 送信形式は `URLSearchParams` + JSON双方に対応、結果画面は `result.html`

### hospital-report/ (`index.html`, `js/hospital-report.js`)
- 入退院管理フォーム、利用者/医療機関サジェスト、契約終了処理、条件分岐
- `config` に WOFF ID `Exth8PXun2d80vxUyBamIw` と GAS URL、結果画面 `result.html`
- 医療機関/利用者検索は GAS 側 `action` を通して取得

### sales-bot/ (`index.html`, `js/sales-bot.js`)
- 営業戦略選択→ルート生成→分析モーダル表示、GPS取得、Google Maps住所逆引き
- `config` に WOFF ID `Ilofk_65rvB6VHiOceQ0sg`, GAS URL, Google Maps API キー
- Bot UXは単一ページ内で状態遷移 (`SalesBot.state`)

### Shared assets
- `common/js/woff-init.js` で WOFF SDK 初期化・共通ユーティリティ
- `common/css/` にベーススタイル（ボタン/フォーム/ローディング等）
- フロント構成は純粋な静的ファイル。Netlify/Pages では Publish directory `.`

## Backend (gas/)
- `appsscript.json` : V8ランタイム、`executeAs`: USER_DEPLOYING, `access`: ANYONE_ANONYMOUS
- `main.js` :
  - `doPost` がすべてのアクションを受け付け、URLSearchParams/JSON両対応
  - ログ用 `Log` シートを自動作成/append
  - 代表的 `action`: `submitAccidentReport`, `getAccidentFormData`, `submitHospitalReport`, `getHospitalSuggestions`, `getUserOrganization`, `submitSalesRoute` など
  - `createSuccessResponse`/`createErrorResponse` で標準レスポンス生成
- `accident-report.js` : フォームデータの検証→`事故報告` シートへ書き込み、Bot通知、写真ステータス初期化
- `hospital-report.js` : 入退院管理シート更新、マスタ検索、状況計算ロジック
- `sales-bot.js` : 営業データ抽出とルート最適化アルゴリズム、Geo逆引きサポート
- `photoUpload.js` : `PHOTO_FOLDER_ID` 固定値 (`11r9PGtZKBuX22TnA6cIRHru6zlNYD9T_`) を使用し、トリガーでDriveに画像を保存→シートURL更新
- `getToken.js` : LINE WORKS Bot アクセストークン生成。Script Properties `CLIENT_ID`, `CLIENT_SECRET`, `SERVICE_ACCOUNT` 必須、秘密鍵ファイル名はハードコード (`private_20250521164648.key`)
- `getToken.js` / `accident-report.js` は Drive 上の `.key` ファイル名がそれぞれ異なる点に注意（運用時は統一を検討）

### 必要な Script Properties / 外部依存
- `SPREADSHEET_ID` : 事故/入退院/営業データシートを指す
- `BOT_ID`, `BOT_CHANNEL_ID`, `DOMAIN_ID` : LINE WORKS Bot通知用
- `CLIENT_ID`, `CLIENT_SECRET`, `SERVICE_ACCOUNT` : Bot OAuth (JWT)
- `PHOTO_FOLDER_ID` : 事故写真保存先（現状 `photoUpload.js` で固定値）
- 必要に応じて `GOOGLE_MAPS_API_KEY` はフロント側で管理（GASではフォールバック対応）

## Data & Integrations
- Google Sheets (推奨構成は `migration-guide.md` 参照)
  - `事故報告`, `入退院管理`, `営業データ`, `利用者管理`, `医療マスタ`, `事業所`, `log` 等
  - 事故報告シート: A列ID〜AC列位置情報、AA列で写真処理ステータス管理
- Google Drive: 事故写真格納フォルダ（IDをScript Propertiesまたはコードに設定）
- LINE WORKS Bot: `sendAccidentNotificationToLineWorks` で通知、`https://www.worksapis.com/v1.0/bots/{BOT_ID}/channels/{BOT_CHANNEL_ID}/messages`
- 地図API: デフォルトで Nominatim(OpenStreetMap) / Google Maps APIキー設定時は高精度逆ジオコーディング (`GOOGLE_MAPS_SETUP.md`)

## Deployment & Operations
- `package.json` scripts:
  - `npm run push:gas` → `npx clasp push`
  - `npm run deploy:gas` → `./scripts/deploy-gas.sh`（固定デプロイID `AKfycbyaHucPNASJmzi_LLaIBuTAXtxxU-VZx4xOBeSXfbPzur_36Omq25ajThTHZ-M8Jk2lVw` を更新）
  - `npm run auto-deploy` → push 後 `npx clasp deploy -i AKfycbyL58-LDmfXvfXkYbj-LL9PPrnDZreH0RPg1-io0xgdNgICh30_VUBa1SZebAqk4hBxoA`
  - `setup:gas`, `open:gas`, `logs:gas`, `watch:gas` など claspユーティリティ
- Netlify: 各アプリフォルダを個別サイトとして設定（Publish directory `.`、ビルド無し）
- GitHub Pages: main ブランチ直下を公開、ベースURL `https://jumps710.github.io/cruto/`
- Apps Script デプロイは既存デプロイメントIDを更新して同じURLを維持する方針（スクリプトでIDが複数登場するため環境整合に注意）
- WebアプリURLは既存デプロイ（例: `npx clasp deploy -i AKfycby5fRaVu5vISA3dvflBAaYXtWtBGXRyWt9HpWYlAiWbqqHzyBxSAt6vpWn6NuWFk8Gj`）を再利用して維持すること。新規デプロイを作成しない。

## Setup & Access
- `manual-auth.md` : ブラウザ認証できない環境向けの手動clasp認証フローと `.clasp.json` 例
- `setup-clasp.md`, `wsl-clasp-auth.md` : 開発環境別のclaspセットアップ
- `.clasp.json`（ローカル想定）: `{ "scriptId": "1tRFxjvtWORDXfaYU3aHH2CcoKPG_Wf4qw92OJCMCJ8dxdqsBdm_88nkZ", "rootDir": "./gas" }`
- `GOOGLE_MAPS_SETUP.md` : Geocoding APIキーの取得とフロント側設定手順

## Playbooks & Guides
- `migration-guide.md` / `detailed-migration-guide.md` : 顧客環境への移行手順、シート構成、権限要件
- `gas-config-migration-guide.md` : Script Properties や Drive/Sheets ID の置き換え手順
- `scripts/auto-deploy.md` : claspデプロイ確認と半自動化メモ
- `deployment-guide.html`, `github-pages-setup.md`, `github-push-guide.md` : デプロイ/公開系ナレッジ

## Operational Notes
- GASログは Spreadsheet `Log` シート または `clasp logs` で確認
- 事故写真処理トリガー: `onAccidentPhotoEditTrigger` + 時刻トリガーで未処理検知
- 秘密鍵ファイル名がコード中で固定化されているため、環境移行時は Drive 上でファイル名を合わせるかコード修正が必要
- 現在2種類のデプロイメントIDがスクリプト中で参照されている（`deploy-gas.sh` vs フロント`config.gasUrl`）。URLを切り替える場合は全アプリ/スクリプトを同時更新すること







ステップ2. 入退院Botの仕様を以下の通り変更する。
フォームアクセス,WOFF初期化後に、まず
新規　既存
のラジオボタンを設ける。

新規を選択した場合は、
・基本情報ブロック（これまでと同じ）
・利用者名（テキスト入力　→  GSheet"入退院管理"シートのC列に記録）
・報告理由（入院/中心のラジオボタンから選択）
　→入院を選択した場合以下の追加フィールドを表示
　・入院先（テキスト入力　→　GSheet"入退院管理"シートのF列に記録）
　・入院日（カレンダービューから選択　→　GSheet"入退院管理"シートのG列に記録）
　・診断名（既存にあるプルダウンと同じ　→　GSheet"入退院管理"シートのH列に記録）
　→中止を選択した場合　追加フィールドなし
・今後の予定ブロックを表示
　今後の予定ブロック内の
・退院日または再開日　→　（任意入力）という表示を追加
・契約終了にする　→　（任意入力）という表示を追加

既存の場合は、これまでと同じ。

