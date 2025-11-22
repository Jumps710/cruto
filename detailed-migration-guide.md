# Cruto LINE WORKSアプリケーション詳細移行手順書

## 事前準備チェックリスト

### お客様側で必要なアカウント
- [ ] Googleアカウント（できればGoogle Workspace）
- [ ] GitHubアカウント（無料版でOK）
- [ ] LINE WORKS管理者アカウント

### 必要な情報の事前確認
- [ ] LINE WORKSのドメインID
- [ ] 移行対象のユーザー数
- [ ] 既存データの移行要否

---

## Step 1: GitHub環境構築（詳細手順）

### 1-1. GitHubアカウントでリポジトリ作成

1. **GitHubにログイン**
   - https://github.com にアクセス
   - お客様のアカウントでログイン

2. **新規リポジトリ作成**
   - 右上の「+」アイコン → 「New repository」をクリック
   - Repository name: `cruto-apps`
   - Description: `Cruto LINE WORKS業務アプリケーション`
   - **Public**を選択（重要：GitHub Pagesは無料版ではPublicのみ）
   - 「Add a README file」のチェックは**外す**
   - 「Create repository」をクリック

3. **作成完了後の画面を確認**
   - `https://github.com/[ユーザー名]/cruto-apps.git` のURLをメモ

### 1-2. ソースコードの移行（Windows環境想定）

1. **コマンドプロンプトを開く**
   ```
   Windowsキー + R → 「cmd」と入力 → Enter
   ```

2. **作業用フォルダに移動**
   ```cmd
   cd C:\Users\%USERNAME%\Desktop
   mkdir cruto-migration
   cd cruto-migration
   ```

3. **既存リポジトリをクローン**
   ```cmd
   git clone https://github.com/Jumps710/cruto.git
   cd cruto
   ```

4. **リモートURLを変更**
   ```cmd
   git remote -v
   rem 現在のURLを確認
   
   git remote remove origin
   git remote add origin https://github.com/[お客様のGitHubユーザー名]/cruto-apps.git
   
   git remote -v
   rem 新しいURLに変更されたことを確認
   ```

5. **お客様のリポジトリにプッシュ**
   ```cmd
   git push -u origin main
   ```
   
   ※GitHubのユーザー名とパスワードを求められます
   ※2要素認証を使用している場合は、Personal Access Tokenが必要です

### 1-3. GitHub Pages有効化（画像付き詳細）

1. **リポジトリ設定画面へ**
   - `https://github.com/[ユーザー名]/cruto-apps` にアクセス
   - 「Settings」タブをクリック

2. **Pages設定**
   - 左メニューから「Pages」をクリック
   - Sourceセクションで：
     - Source: `Deploy from a branch`
     - Branch: `main` を選択
     - Folder: `/ (root)` を選択
   - 「Save」ボタンをクリック

3. **公開URL確認**
   - 数分待つと上部に緑色のチェックマークと共にURLが表示
   - `https://[ユーザー名].github.io/cruto-apps/` の形式
   - このURLをメモ（後で使用）

---

## Step 2: Google Sheets詳細設定

### 2-1. スプレッドシート作成

1. **Googleドライブにアクセス**
   - https://drive.google.com
   - お客様のGoogleアカウントでログイン

2. **新規スプレッドシート作成**
   - 「新規」ボタン → 「Google スプレッドシート」
   - ファイル名を「Cruto_業務データ」に変更

3. **必要なシートを追加**
   - 画面下部の「+」ボタンで新しいシートを追加
   - 以下の7つのシートを作成：
     1. `事故報告`
     2. `入退院管理`
     3. `営業データ`
     4. `利用者管理`
     5. `医療マスタ`
     6. `事業所`
     7. `log`

### 2-2. 各シートの列設定（コピペ用）

**事故報告シート（1行目に以下をコピペ）**
```
ID	タイムスタンプ	報告日	発生日付	発生時間	報告者	事故種類	事業所	運転手の名前	発生場所（大分類）	発生場所（詳細）	対物	対物詳細	対人	対人詳細	負傷_本人	負傷_同乗者	負傷_対人	負傷詳細_本人	負傷詳細_同乗者	負傷詳細_対人	写真1	写真2	対物写真	相手の免許証	相手の車	自分の車	事故内容詳細	位置情報
```

**入退院管理シート（1行目に以下をコピペ）**
```
ID	状況	利用者名	報告者	報告日	入院先	入院日	診断名	担当者	転院先	脱落デッドライン	今日の日付	契約終了	退院日・再開日	報告日差異	退院までの日数	脱落までの残り日数
```

**利用者管理シート（1行目に以下をコピペ）**
```
ID	氏名	フリガナ	生年月日	住所	電話番号	事業所
```

**サンプルデータ（利用者管理シート2行目以降）**
```
U001	山田太郎	ヤマダタロウ	1950/1/1	東京都港区1-1-1	090-1234-5678	港事業所
U002	鈴木花子	スズキハナコ	1948/5/15	東京都渋谷区2-2-2	090-2345-6789	渋谷事業所
U003	田中一郎	タナカイチロウ	1952/8/20	東京都新宿区3-3-3	090-3456-7890	新宿事業所
```

**医療マスタシート（1行目に以下をコピペ）**
```
医療機関名	エリア	住所	電話番号
```

**サンプルデータ（医療マスタシート2行目以降）**
```
東京総合病院	港区	東京都港区1-1-1	03-1234-5678
渋谷医療センター	渋谷区	東京都渋谷区2-2-2	03-2345-6789
新宿中央病院	新宿区	東京都新宿区3-3-3	03-3456-7890
```

**事業所シート（1行目に以下をコピペ）**
```
事業所名	住所	電話番号
```

**サンプルデータ（事業所シート2行目以降）**
```
港事業所	東京都港区1-1-1	03-1111-2222
渋谷事業所	東京都渋谷区2-2-2	03-2222-3333
新宿事業所	東京都新宿区3-3-3	03-3333-4444
```

**営業データシート（1行目に以下をコピペ）**
```
ID	顧客名	住所	緯度	経度	契約率	平均契約期間	最終訪問日	担当者	備考
```

**logシート（1行目に以下をコピペ）**
```
タイムスタンプ	アプリ名	イベント	ユーザー	事業所	詳細	送信データ	エラー詳細	スタックトレース
```

### 2-3. スプレッドシートIDの取得

1. **スプレッドシートのURLを確認**
   - URL例: `https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit`
   - `/d/` と `/edit` の間の文字列がスプレッドシートID
   - 例: `1ABC...XYZ`
   - このIDをメモ（重要）

### 2-4. Google Driveフォルダ作成

1. **Google Driveで新規フォルダ作成**
   - Googleドライブのトップページで「新規」→「フォルダ」
   - フォルダ名: `事故報告_写真`

2. **フォルダの共有設定**
   - 作成したフォルダを右クリック
   - 「共有」→「リンクを取得」
   - 「制限付き」を「リンクを知っている全員」に変更
   - 「リンクをコピー」

3. **フォルダIDの取得**
   - コピーしたURL: `https://drive.google.com/drive/folders/1DEF...UVW`
   - `/folders/` の後の文字列がフォルダID
   - 例: `1DEF...UVW`
   - このIDをメモ（重要）

---

## Step 3: Google Apps Script詳細設定

### 3-1. GASプロジェクト作成

1. **Google Driveから新規作成**
   - Googleドライブで「新規」ボタン
   - 「その他」→「Google Apps Script」
   - もし表示されない場合：
     - 「その他」→「アプリを追加」
     - 「Google Apps Script」を検索して追加

2. **プロジェクト名を変更**
   - 「無題のプロジェクト」をクリック
   - 「Cruto Apps API」に変更

### 3-2. スクリプトファイルの作成と設定

1. **ファイル構成を作成**
   - 「コード.gs」の名前を「accident-report.gs」に変更
   - 「+」ボタンで新規スクリプトファイルを追加：
     - `hospital-report.gs`
     - `photoUpload.gs`
     - `lineWorksNotification.gs`

2. **各ファイルにコードをコピー**
   - 元のリポジトリの`gas/`フォルダから各ファイルの内容をコピー
   - 対応するGASファイルにペースト

3. **重要な設定値の変更箇所**

**accident-report.gs の冒頭部分を修正：**
```javascript
// スプレッドシートとフォルダの設定
const SHEET_ID = 'ここにお客様のスプレッドシートIDを入力'; // 例: '1ABC...XYZ'
const PHOTO_FOLDER_ID = 'ここにお客様の写真フォルダIDを入力'; // 例: '1DEF...UVW'
```

**photoUpload.gs の冒頭部分を修正：**
```javascript
// スプレッドシートとフォルダの設定
const SHEET_ID = 'ここにお客様のスプレッドシートIDを入力'; // accident-report.gsと同じID
const PHOTO_FOLDER_ID = 'ここにお客様の写真フォルダIDを入力'; // accident-report.gsと同じID
```

### 3-3. LINE WORKS API設定（Bot通知を使う場合）

**lineWorksNotification.gs の設定値：**
```javascript
// LINE WORKS API設定（後述のLINE WORKS設定後に入力）
const BOT_ID = 'あとで入力';
const CHANNEL_ID = 'あとで入力';
const DOMAIN_ID = 'お客様のドメインID';
const CLIENT_ID = 'あとで入力';
const CLIENT_SECRET = 'あとで入力';
const SERVICE_ACCOUNT = 'あとで入力';
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
あとで入力
-----END PRIVATE KEY-----`;
```

### 3-4. Webアプリとしてデプロイ

1. **デプロイ準備**
   - 右上の「デプロイ」ボタンをクリック
   - 「新しいデプロイ」を選択

2. **デプロイ設定**
   - 歯車アイコン → 「ウェブアプリ」を選択
   - 説明: `Cruto Apps API v1`
   - 実行ユーザー: `自分`
   - アクセスできるユーザー: `全員`
   - 「デプロイ」ボタンをクリック

3. **承認プロセス**
   - 「アクセスを承認」をクリック
   - Googleアカウントを選択
   - 「詳細」→「Cruto Apps API（安全ではないページ）に移動」
   - 必要な権限をすべて許可

4. **WebアプリURL取得**
   - デプロイ完了後に表示されるWebアプリのURLをコピー
   - 形式: `https://script.google.com/macros/s/AKfyc.../exec`
   - このURLを必ずメモ（超重要）

### 3-5. 自動実行トリガーの設定

1. **トリガー設定画面へ**
   - 左メニューの時計アイコン「トリガー」をクリック
   - 「トリガーを追加」ボタン

2. **写真アップロード用トリガー設定**
   - 実行する関数: `processAllPhotoUploads`
   - 実行するデプロイ: `Head`
   - イベントのソース: `時間主導型`
   - 時間ベースのトリガーのタイプ: `分ベースのタイマー`
   - 時間の間隔: `1分おき`
   - 「保存」

3. **手動でトリガー設定関数を実行**
   - エディタに戻る
   - `photoUpload.gs`を開く
   - 関数選択で`setupAccidentPhotoTriggers`を選択
   - 「実行」ボタンをクリック
   - 承認が求められたら許可

---

## Step 4: LINE WORKS詳細設定

### 4-1. LINE WORKS Developers Console

1. **ログイン**
   - https://developers.worksmobile.com/
   - お客様の管理者アカウントでログイン

2. **新規アプリ作成（3つ必要）**
   - 「アプリ」→「アプリの新規作成」

**アプリ1: 事故報告WOFF**
- アプリ名: `事故報告フォーム`
- 説明: `車両事故・その他事故の報告用フォーム`
- アイコン: 適切なアイコンをアップロード

**アプリ2: 入退院報告WOFF**
- アプリ名: `入退院報告フォーム`
- 説明: `利用者の入退院情報報告用フォーム`
- アイコン: 適切なアイコンをアップロード

**アプリ3: 営業支援Bot**
- アプリ名: `営業支援アシスタント`
- 説明: `営業ルート最適化支援ツール`
- アイコン: 適切なアイコンをアップロード

### 4-2. 各WOFFアプリの詳細設定

**共通設定手順（3つのアプリそれぞれで実施）**

1. **WOFF設定**
   - 作成したアプリをクリック
   - 「WOFF」タブを選択
   - 「WOFF URL」に以下を設定：
   
   **事故報告用：**
   ```
   https://[GitHubユーザー名].github.io/cruto-apps/accident-report/
   ```
   
   **入退院報告用：**
   ```
   https://[GitHubユーザー名].github.io/cruto-apps/hospital-report/
   ```
   
   **営業支援用：**
   ```
   https://[GitHubユーザー名].github.io/cruto-apps/sales-bot/
   ```

2. **権限設定**
   - 「権限」タブを選択
   - 必要な権限にチェック：
     - ☑ プロフィール情報の参照
     - ☑ 所属組織の情報参照
     - ☑ カメラの使用（事故報告用）
     - ☑ 位置情報の取得

3. **利用範囲設定**
   - 「利用範囲」タブ
   - 全メンバーまたは特定グループを選択

4. **WOFF ID取得**
   - 各アプリの「概要」タブ
   - 「WOFF ID」をコピー（後で使用）

### 4-3. Bot設定（通知機能を使う場合）

1. **Bot作成**
   - 「Bot」→「Botの新規作成」
   - Bot名: `事故報告通知`
   - 説明: `事故報告の自動通知用Bot`

2. **Bot設定**
   - Callback URL: 不要（送信専用）
   - 固定メニュー: 設定不要

3. **Bot ID取得**
   - 作成したBotの詳細画面
   - Bot IDとChannel IDをメモ

### 4-4. API認証情報の取得

1. **Service Account作成**
   - 「認証」→「Service Account」
   - 「Service Accountの新規作成」
   - 名前: `Cruto API Account`
   - 権限:
     - ☑ Bot送信
     - ☑ ユーザー情報参照
     - ☑ 組織情報参照

2. **Private Key生成**
   - Service Account詳細画面
   - 「Private Keyを発行」
   - ダウンロードしたキーファイルを安全に保管

3. **OAuth App作成**
   - 「認証」→「OAuth」
   - 「OAuth Appの新規作成」
   - Client ID、Client Secretをメモ

---

## Step 5: フロントエンドコード更新

### 5-1. 設定ファイルの更新

1. **ローカルでファイル編集**
   - 先ほどクローンしたフォルダを開く
   - テキストエディタ（メモ帳、VSCode等）で編集

2. **accident-report/js/app.js を編集**
   ```javascript
   // 13行目付近のconfigを更新
   const config = {
       woffId: 'ここに事故報告のWOFF ID', // 例: 'EownaFs9...'
       gasUrl: 'ここにGAS WebアプリURL'   // 例: 'https://script.google.com/...'
   };
   ```

3. **hospital-report/js/app.js を編集**
   ```javascript
   // 同様にconfigを更新
   const config = {
       woffId: 'ここに入退院報告のWOFF ID',
       gasUrl: 'ここにGAS WebアプリURL'  // 同じURL
   };
   ```

4. **sales-bot/js/app.js を編集**
   ```javascript
   // 同様にconfigを更新
   const config = {
       woffId: 'ここに営業支援のWOFF ID',
       gasUrl: 'ここにGAS WebアプリURL'  // 同じURL
   };
   ```

### 5-2. GitHubへのプッシュ

1. **変更をコミット**
   ```cmd
   git add .
   git commit -m "お客様環境用の設定に更新"
   ```

2. **GitHubにプッシュ**
   ```cmd
   git push origin main
   ```

3. **GitHub Pagesの更新確認**
   - 数分待つ（通常1-2分）
   - ブラウザでGitHub Pages URLにアクセスして確認

---

## Step 6: 動作確認手順

### 6-1. 基本動作確認

1. **GitHub Pages確認**
   - 各URLにブラウザでアクセス：
     - `https://[ユーザー名].github.io/cruto-apps/accident-report/`
     - `https://[ユーザー名].github.io/cruto-apps/hospital-report/`
     - `https://[ユーザー名].github.io/cruto-apps/sales-bot/`
   - 各ページが表示されることを確認

2. **LINE WORKSアプリ確認**
   - LINE WORKSアプリを開く
   - 各WOFFアプリが表示されることを確認
   - タップして起動確認

### 6-2. 機能別動作確認

**事故報告フォーム**
1. テストデータ入力
2. 写真撮影またはアップロード
3. 送信ボタンクリック
4. Google Sheetsの「事故報告」シートを確認
5. 1分後に写真列がリンクに変わることを確認

**入退院報告フォーム**
1. 利用者名に「や」と入力
2. 予測候補が表示されることを確認
3. テストデータで送信
4. Google Sheetsの「入退院管理」シートを確認

**営業支援Bot**
1. 位置情報取得を許可
2. 戦略を選択
3. ルート提案が表示されることを確認

### 6-3. エラー確認方法

1. **ブラウザのコンソール確認**
   - F12キーでデベロッパーツール
   - Consoleタブでエラー確認

2. **GASログ確認**
   - GASエディタで「実行数」をクリック
   - エラーの詳細を確認

3. **Googleシートのlogシート確認**
   - エラー情報が記録されているか確認

---

## Step 7: トラブルシューティング詳細

### よくあるエラーと対処法

**1. CORS（Cross-Origin Resource Sharing）エラー**
```
エラー: Access to fetch at 'https://script.google.com/...' from origin 'https://....github.io' has been blocked by CORS policy
```
**対処法:**
- GASのWebアプリ設定で「全員」アクセスになっているか確認
- URLが正確にコピーされているか確認（最後の/execまで含む）

**2. 認証エラー**
```
エラー: 承認が必要です
```
**対処法:**
- GASプロジェクトの実行権限を再設定
- デプロイを新しいバージョンで更新

**3. シートが見つからない**
```
エラー: シート '事故報告' が見つかりません
```
**対処法:**
- シート名が完全に一致しているか確認（スペース含む）
- スプレッドシートIDが正しいか確認

**4. 写真アップロードが動作しない**
```
症状: 写真がBase64のまま表示される
```
**対処法:**
- トリガーが正しく設定されているか確認
- フォルダIDが正しいか確認
- フォルダの共有設定を確認

---

## 移行完了チェックリスト

### 最終確認項目
- [ ] 3つのWOFFアプリすべてが起動する
- [ ] フォームからのデータ送信が成功する
- [ ] Google Sheetsにデータが記録される
- [ ] 写真が自動的にGoogle Driveにアップロードされる
- [ ] 予測検索機能が動作する（入退院報告）
- [ ] 位置情報取得が動作する
- [ ] Bot通知が送信される（設定した場合）

### 引き継ぎ事項
1. **管理者向け**
   - GASプロジェクトのURL
   - スプレッドシートのURL
   - 各種ID一覧

2. **利用者向け**
   - 各WOFFアプリの使い方
   - エラー時の連絡先

3. **保守担当者向け**
   - GitHub リポジトリのアクセス権
   - GASプロジェクトの編集権限
   - トラブルシューティング手順

---

## 付録: コマンド・URL一覧

### Git コマンド
```bash
# クローン
git clone https://github.com/Jumps710/cruto.git

# リモート変更
git remote remove origin
git remote add origin https://github.com/[新ユーザー名]/cruto-apps.git

# プッシュ
git push -u origin main

# 設定更新後
git add .
git commit -m "設定更新"
git push origin main
```

### 重要URL
- GitHub: `https://github.com/[ユーザー名]/cruto-apps`
- GitHub Pages: `https://[ユーザー名].github.io/cruto-apps/`
- GAS: `https://script.google.com/macros/s/[デプロイID]/exec`
- スプレッドシート: `https://docs.google.com/spreadsheets/d/[シートID]/`

### サポート連絡先
- 技術的な質問: [設定する連絡先]
- 運用に関する質問: [設定する連絡先]