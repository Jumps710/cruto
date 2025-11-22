# GASコード設定変更手順書

## 前提条件
- お客様のスプレッドシートは作成済み
- お客様のGitHubリポジトリは設定済み
- GASプロジェクトにコードをコピーする段階

## 必要な情報の収集

### 1. Google環境の情報収集

#### 1-1. スプレッドシートIDの確認
1. お客様のスプレッドシートを開く
2. URLから以下の部分をコピー：
   ```
   https://docs.google.com/spreadsheets/d/【ここの文字列がID】/edit
   例: 1ABC123DEF456GHI789JKL
   ```

#### 1-2. 写真保存用フォルダIDの確認
1. Google Driveで「事故報告_写真」フォルダを作成（まだの場合）
2. フォルダを右クリック → 「共有」→「リンクを取得」
3. 「制限付き」を「リンクを知っている全員」に変更
4. URLから以下の部分をコピー：
   ```
   https://drive.google.com/drive/folders/【ここの文字列がID】
   例: 1XYZ789ABC456DEF123
   ```

### 2. LINE WORKS API情報の取得

#### 2-1. ドメインIDの確認
1. LINE WORKS管理画面にログイン
2. 「セキュリティ」→「外部連携」
3. ドメインIDをコピー（例: 100012345）

#### 2-2. Bot情報の作成・取得（通知機能を使う場合）
1. LINE WORKS Developers Console にログイン
2. 「Bot」→「Botの新規作成」
   - Bot名: `事故報告通知Bot`
   - 説明: `事故報告の自動通知用`
3. 作成後、以下をメモ：
   - Bot ID（例: 1234567）
   - Channel ID（例: C1234567890abcdef）

#### 2-3. Service Accountの作成
1. Developers Console で「認証」→「Service Account」
2. 「Service Accountの新規作成」
   - 名前: `Cruto GAS連携`
   - 必要な権限にチェック：
     - ☑ bot.send
     - ☑ directory.read
     - ☑ user.read
3. 作成後、Service Account のメールアドレスをコピー
   - 例: `cruto-gas@worksmobile.com`

#### 2-4. Private Keyの生成
1. 作成したService Accountの詳細画面
2. 「Private Keyを発行」ボタンをクリック
3. ダウンロードされたキーファイル（.key）をテキストエディタで開く
4. 内容全体をコピー（-----BEGIN PRIVATE KEY----- から -----END PRIVATE KEY----- まで）

#### 2-5. OAuth App情報の取得
1. 「認証」→「OAuth」→「OAuth Appの新規作成」
2. アプリ名: `Cruto API連携`
3. Redirect URI: `https://script.google.com/macros/s/dummy/usercallback`（仮のURL）
4. 作成後、以下をメモ：
   - Client ID（例: De3dyIflyPCDY2xrHUak）
   - Client Secret（例: ckuFb6OYxV）

---

## GASコードの設定変更

### 1. accident-report.gs の変更箇所

```javascript
// ファイルの最初の部分（2-3行目あたり）を探して変更
const SHEET_ID = 'ここにお客様のスプレッドシートID'; // 収集したスプレッドシートID
const PHOTO_FOLDER_ID = 'ここにお客様の写真フォルダID'; // 収集したフォルダID

// 例：
const SHEET_ID = '1ABC123DEF456GHI789JKL';
const PHOTO_FOLDER_ID = '1XYZ789ABC456DEF123';
```

### 2. hospital-report.gs の変更箇所

```javascript
// ファイルの最初の部分（2行目あたり）を探して変更
const SHEET_ID = 'ここにお客様のスプレッドシートID'; // accident-report.gsと同じID

// 例：
const SHEET_ID = '1ABC123DEF456GHI789JKL';
```

### 3. photoUpload.gs の変更箇所

```javascript
// ファイルの最初の部分を探して変更
const SHEET_ID = 'ここにお客様のスプレッドシートID'; // 同じスプレッドシートID
const PHOTO_FOLDER_ID = 'ここにお客様の写真フォルダID'; // 同じフォルダID

// 例：
const SHEET_ID = '1ABC123DEF456GHI789JKL';
const PHOTO_FOLDER_ID = '1XYZ789ABC456DEF123';
```

### 4. lineWorksNotification.gs の変更箇所（Bot通知を使う場合）

```javascript
// ファイルの最初の部分（2-20行目あたり）をすべて変更

// LINE WORKS Bot設定
const BOT_ID = 'ここにBot ID';           // 収集したBot ID
const CHANNEL_ID = 'ここにChannel ID';    // 収集したChannel ID

// LINE WORKS API認証情報
const DOMAIN_ID = 'ここにドメインID';     // 収集したドメインID
const CLIENT_ID = 'ここにClient ID';      // 収集したClient ID
const CLIENT_SECRET = 'ここにClient Secret'; // 収集したClient Secret
const SERVICE_ACCOUNT = 'ここにService Account'; // 収集したService Accountメールアドレス
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
ここにPrivate Keyの内容をペースト（改行も含めて）
-----END PRIVATE KEY-----`;

// 実際の例：
const BOT_ID = '1234567';
const CHANNEL_ID = 'C1234567890abcdef';
const DOMAIN_ID = '100012345';
const CLIENT_ID = 'De3dyIflyPCDY2xrHUak';
const CLIENT_SECRET = 'ckuFb6OYxV';
const SERVICE_ACCOUNT = 'cruto-gas@worksmobile.com';
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCu74LymyotkWke
...（実際のキー内容）...
K7JGqeB3/kYJmt9h1rZQr1o=
-----END PRIVATE KEY-----`;
```

---

## 設定変更後の確認手順

### 1. GASでの動作確認

#### 1-1. 基本動作テスト
1. GASエディタで `accident-report.gs` を開く
2. 関数選択で `doPost` を選択（できない場合はスキップ）
3. 保存（Ctrl+S または Cmd+S）

#### 1-2. 写真アップロード機能テスト
1. `photoUpload.gs` を開く
2. 関数選択で `testPhotoUpload` 関数があれば選択
3. なければ、以下のテスト関数を一時的に追加：

```javascript
function testConnection() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID);
    console.log('スプレッドシート接続成功:', sheet.getName());
    
    const folder = DriveApp.getFolderById(PHOTO_FOLDER_ID);
    console.log('フォルダ接続成功:', folder.getName());
    
    return '接続テスト成功';
  } catch (error) {
    console.error('接続エラー:', error);
    return error.message;
  }
}
```

4. `testConnection` を実行
5. 初回実行時は認証が必要：
   - 「承認が必要」→「詳細」→「安全ではないページに移動」→「許可」

#### 1-3. LINE WORKS API接続テスト（Bot通知を使う場合）
1. `lineWorksNotification.gs` にテスト関数を追加：

```javascript
function testLineWorksAuth() {
  try {
    const token = getAccessToken();
    console.log('アクセストークン取得成功');
    console.log('トークンの最初の10文字:', token.substring(0, 10) + '...');
    return 'LINE WORKS認証成功';
  } catch (error) {
    console.error('LINE WORKS認証エラー:', error);
    return error.message;
  }
}
```

2. `testLineWorksAuth` を実行
3. コンソールでエラーがないか確認

### 2. よくあるエラーと対処法

#### エラー1: スプレッドシートが見つからない
```
Exception: Unexpected error while getting the method or property openById on object SpreadsheetApp
```
**対処法:**
- スプレッドシートIDが正しくコピーされているか確認
- 余分なスペースが入っていないか確認
- スプレッドシートの共有設定を確認

#### エラー2: フォルダが見つからない
```
Exception: Unexpected error while getting the method or property getFolderById on object DriveApp
```
**対処法:**
- フォルダIDが正しくコピーされているか確認
- フォルダの共有設定が「リンクを知っている全員」になっているか確認

#### エラー3: LINE WORKS認証エラー
```
Error: Invalid private key
```
**対処法:**
- Private Keyの改行が正しく保持されているか確認
- -----BEGIN PRIVATE KEY----- と -----END PRIVATE KEY----- が含まれているか確認
- Service Accountが正しく作成されているか確認

---

## 設定完了チェックリスト

### 必須項目
- [ ] スプレッドシートIDを3箇所に設定（accident-report.gs, hospital-report.gs, photoUpload.gs）
- [ ] 写真フォルダIDを2箇所に設定（accident-report.gs, photoUpload.gs）
- [ ] GASプロジェクトを保存
- [ ] Webアプリとしてデプロイ（新しいデプロイ）
- [ ] WebアプリのURLを取得してメモ

### Bot通知を使う場合（オプション）
- [ ] Bot ID、Channel IDを設定
- [ ] ドメインID、Client ID、Client Secretを設定
- [ ] Service Account、Private Keyを設定
- [ ] LINE WORKS認証テストが成功

### 最終確認
- [ ] フロントエンドのJavaScriptファイルにGAS URLを設定
- [ ] GitHubにプッシュ
- [ ] LINE WORKSのWOFF URLを更新（必要な場合）

---

## 設定値一覧（控え）

お客様環境の重要な設定値を以下にまとめて保管してください：

```
【Google関連】
スプレッドシートID: ________________________
写真フォルダID: ____________________________
GAS WebアプリURL: __________________________

【LINE WORKS関連】
ドメインID: _______________________________
Bot ID: ____________________________________
Channel ID: ________________________________
Client ID: _________________________________
Client Secret: _____________________________
Service Account: ___________________________

【GitHub関連】
リポジトリURL: _____________________________
GitHub Pages URL: __________________________

【WOFF ID】
事故報告: __________________________________
入退院報告: ________________________________
営業支援: __________________________________
```

この情報は安全な場所に保管し、必要に応じて参照してください。