# Cruto LINE WORKSアプリケーション移行ガイド

## 概要
本ガイドは、現在運用中のLINE WORKSアプリケーション（事故報告・入退院報告）をお客様環境へ移行する手順を説明します。

## 移行対象
1. 事故報告WOFF
2. 入退院報告WOFF
3. 営業支援Bot（必要に応じて）

## 前提条件
お客様側で以下の準備が必要です：
- Googleアカウント（Google Workspace推奨）
- GitHubアカウント
- LINE WORKS管理者権限

---

## Phase 1: GitHub環境の準備

### 1.1 GitHubリポジトリ作成
1. お客様のGitHubアカウントでログイン
2. 新規リポジトリ作成
   - リポジトリ名: `cruto-apps`（任意）
   - 公開設定: **Public**（GitHub Pages利用のため）
   - READMEは作成しない

### 1.2 ソースコード移行
```bash
# 1. 現在のリポジトリをクローン
git clone https://github.com/Jumps710/cruto.git temp-cruto
cd temp-cruto

# 2. リモートURLを変更
git remote remove origin
git remote add origin https://github.com/[お客様のGitHubユーザー名]/cruto-apps.git

# 3. プッシュ
git push -u origin main
```

### 1.3 GitHub Pages有効化
1. リポジトリの Settings → Pages
2. Source: Deploy from a branch
3. Branch: main / (root)
4. Save
5. 数分待つと `https://[お客様のGitHubユーザー名].github.io/cruto-apps/` でアクセス可能

---

## Phase 2: Google環境の準備

### 2.1 Google Sheetsの作成
お客様のGoogleドライブで以下のシートを作成：

#### 必要なスプレッドシート
1. **メインデータシート**（1つのスプレッドシートに全シート含む）
   - シート名: `事故報告`
   - シート名: `入退院管理`
   - シート名: `営業データ`
   - シート名: `利用者管理`
   - シート名: `医療マスタ`
   - シート名: `事業所`
   - シート名: `log`

#### 各シートの列構成

**事故報告シート**
```
A: ID
B: タイムスタンプ
C: 報告日
D: 発生日付
E: 発生時間
F: 報告者
G: 事故種類
H: 事業所
I: 運転手の名前
J: 発生場所（大分類）
K: 発生場所（詳細）
L: 対物
M: 対物詳細
N: 対人
O: 対人詳細
P: 負傷_本人
Q: 負傷_同乗者
R: 負傷_対人
S: 負傷詳細_本人
T: 負傷詳細_同乗者
U: 負傷詳細_対人
V: 写真1
W: 写真2
X: 対物写真
Y: 相手の免許証
Z: 相手の車
AA: 自分の車
AB: 事故内容詳細
AC: 位置情報
```

**入退院管理シート**
```
A: ID
B: 状況
C: 利用者名
D: 報告者
E: 報告日
F: 入院先
G: 入院日
H: 診断名
I: 担当者
J: 転院先
K: 脱落デッドライン
L: 今日の日付
M: 契約終了
N: 退院日・再開日
O: 報告日差異
P: 退院までの日数
Q: 脱落までの残り日数
```

**利用者管理シート**
```
A: ID
B: 氏名
C: フリガナ
D: 生年月日
E: 住所
F: 電話番号
G: 事業所
```

**医療マスタシート**
```
A: 医療機関名
B: エリア
C: 住所
D: 電話番号
```

**事業所シート**
```
A: 事業所名
B: 住所
C: 電話番号
```

### 2.2 Google Driveフォルダ作成
1. Google Driveで新規フォルダ作成
   - フォルダ名: `事故報告_写真`
2. フォルダを右クリック → 「リンクを取得」
3. 「リンクを知っている全員」に変更
4. フォルダIDをメモ（URLの/folders/以降の部分）

---

## Phase 3: Google Apps Script設定

### 3.1 GASプロジェクト作成
1. Google Driveで新規作成 → その他 → Google Apps Script
2. プロジェクト名: `Cruto Apps API`

### 3.2 スクリプトファイル作成
以下のファイルを作成し、移行元のコードをコピー：
- `accident-report.gs`
- `hospital-report.gs`
- `sales-bot.gs`（必要に応じて）
- `photoUpload.gs`
- `lineWorksNotification.gs`

### 3.3 設定値の更新
各スクリプトファイル内の以下の値を更新：

```javascript
// accident-report.gs と photoUpload.gs
const SHEET_ID = 'お客様のスプレッドシートID';
const PHOTO_FOLDER_ID = 'お客様の写真フォルダID';

// lineWorksNotification.gs
const BOT_ID = 'お客様のBot ID';
const CHANNEL_ID = 'お客様のChannel ID';
const DOMAIN_ID = 'お客様のDomain ID';
const CLIENT_ID = 'お客様のClient ID';
const CLIENT_SECRET = 'お客様のClient Secret';
const SERVICE_ACCOUNT = 'お客様のService Account';
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
お客様のPrivate Key
-----END PRIVATE KEY-----`;
```

### 3.4 Webアプリとしてデプロイ
1. デプロイ → 新しいデプロイ
2. 種類: ウェブアプリ
3. 説明: `Cruto Apps API v1`
4. 実行ユーザー: 自分
5. アクセスできるユーザー: 全員
6. デプロイ
7. Web アプリのURLをコピー

### 3.5 トリガー設定
1. トリガー → トリガーを追加
2. 関数: `processAllPhotoUploads`
3. イベント: 時間ベース / 分ベース / 1分おき
4. 保存

---

## Phase 4: LINE WORKS設定

### 4.1 Developer Console設定
1. [LINE WORKS Developers](https://developers.worksmobile.com/)にログイン
2. 新規アプリ作成 × 3（事故報告、入退院報告、営業支援）

### 4.2 各WOFFアプリ設定
各アプリに対して：
1. アプリ名設定
2. WOFF URLの設定:
   - 事故報告: `https://[お客様のGitHub].github.io/cruto-apps/accident-report/`
   - 入退院報告: `https://[お客様のGitHub].github.io/cruto-apps/hospital-report/`
   - 営業支援: `https://[お客様のGitHub].github.io/cruto-apps/sales-bot/`
3. 権限設定（必要に応じて）

### 4.3 Bot設定（通知用）
1. Bot作成
2. 名前: `事故報告通知Bot`
3. Webhook設定（必要に応じて）
4. Bot ID、Channel IDをメモ

### 4.4 API認証情報取得
1. OAuth Apps作成
2. Scopeを設定: bot, directory, user
3. Client ID、Client Secret取得
4. Service Account作成
5. Private Key生成・保存

---

## Phase 5: フロントエンドコード更新

### 5.1 各アプリのconfig更新
GitHubにプッシュしたコードの以下のファイルを更新：

**accident-report/js/app.js**
```javascript
const config = {
    woffId: 'お客様のWOFF ID',
    gasUrl: 'お客様のGAS WebアプリURL'
};
```

**hospital-report/js/app.js**
```javascript
const config = {
    woffId: 'お客様のWOFF ID',
    gasUrl: 'お客様のGAS WebアプリURL'
};
```

**sales-bot/js/app.js**
```javascript
const config = {
    woffId: 'お客様のWOFF ID',
    gasUrl: 'お客様のGAS WebアプリURL'
};
```

### 5.2 変更をコミット・プッシュ
```bash
git add .
git commit -m "お客様環境用にconfig更新"
git push origin main
```

---

## Phase 6: 動作確認

### 6.1 基本動作確認
1. 各WOFF URLにアクセス
2. フォームが正しく表示されることを確認
3. LINE WORKSアプリからアクセス確認

### 6.2 データ連携確認
1. テストデータ送信
2. Google Sheetsにデータが記録されることを確認
3. 写真アップロード確認
4. Bot通知確認（設定した場合）

### 6.3 マスタデータ確認
1. 事業所選択が動作することを確認
2. 利用者予測検索が動作することを確認
3. 医療機関検索が動作することを確認

---

## Phase 7: 本番移行

### 7.1 データ移行（必要に応じて）
1. 既存データをエクスポート
2. お客様のGoogle Sheetsにインポート
3. データ整合性確認

### 7.2 ユーザー周知
1. 新しいWOFF URLを社内周知
2. 操作マニュアル提供（必要に応じて）
3. 移行日時のアナウンス

### 7.3 旧環境の停止
1. 旧WOFFアプリを無効化
2. 旧GASのトリガーを停止
3. データのバックアップ

---

## トラブルシューティング

### よくある問題

**Q: WOFFが表示されない**
- A: WOFF URLが正しいか確認
- A: GitHub Pagesが有効になっているか確認
- A: HTTPSでアクセスしているか確認

**Q: データが送信されない**
- A: GAS WebアプリURLが正しいか確認
- A: GASの実行権限を確認
- A: CORSエラーが出ていないか確認

**Q: 写真がアップロードされない**
- A: Google Driveフォルダの権限確認
- A: フォルダIDが正しいか確認
- A: GASトリガーが動作しているか確認

**Q: Bot通知が来ない**
- A: Bot ID、Channel IDが正しいか確認
- A: API認証情報が正しいか確認
- A: Botがチャンネルに追加されているか確認

---

## サポート情報

移行作業中に問題が発生した場合は、以下の情報を確認してください：

1. **ログ確認**
   - Google Sheetsの「log」シート
   - GASの実行ログ
   - ブラウザのコンソールログ

2. **必要な権限**
   - Google: スプレッドシート編集権限、Drive書き込み権限
   - GitHub: リポジトリ管理権限
   - LINE WORKS: アプリ管理権限、Bot作成権限

3. **推定作業時間**
   - 環境準備: 1-2時間
   - 設定作業: 2-3時間
   - 動作確認: 1時間
   - 合計: 4-6時間

本ガイドに従って作業を進めることで、スムーズな移行が可能です。