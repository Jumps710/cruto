# GAS自動デプロイガイド

## 前提条件
- Node.js がインストールされていること
- Google アカウントでログイン可能であること

## 1. clasp のインストール

```bash
npm install -g @google/clasp
```

## 2. Google アカウントでログイン

```bash
clasp login
```
ブラウザが開くので、使用するGoogleアカウントでログインし、権限を許可してください。

## 3. GAS API の有効化

以下のURLにアクセスして、Google Apps Script API を有効化：
https://script.google.com/home/usersettings

「Google Apps Script API」をオンにしてください。

## 4. プロジェクトの初期設定

### 新規GASプロジェクトを作成する場合：
```bash
# プロジェクトフォルダで実行
clasp create --type webapp --title "Cruto LW Apps Backend"
```

### 既存のスプレッドシートにバインドする場合：
```bash
# スプレッドシートIDを指定してクローン
clasp clone --rootDir ./gas "YOUR_SCRIPT_ID"
```

スクリプトIDは、Google Sheetsから：
1. 拡張機能 → Apps Script を開く
2. プロジェクトの設定 → スクリプトIDをコピー

## 5. .clasp.json の設定

プロジェクトルートに `.clasp.json` が作成されます：

```json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "./gas"
}
```

## 6. appsscript.json の設定

`gas/appsscript.json` を作成：

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

## 7. ローカルコードをGASにプッシュ

```bash
# gasフォルダ内のすべての.gsファイルをアップロード
clasp push

# 特定のファイルのみプッシュ（フィルタリング）
clasp push --files gas/accident-report.gs gas/hospital-report.gs
```

## 8. デプロイ

### 新しいデプロイを作成：
```bash
clasp deploy --description "Initial deployment"
```

### 既存のデプロイを更新：
```bash
# デプロイ一覧を確認
clasp deployments

# 特定のデプロイIDを指定して更新
clasp deploy --deploymentId "YOUR_DEPLOYMENT_ID" --description "Update v1.1"
```

## 9. 自動化スクリプト

`deploy.sh` を作成：

```bash
#!/bin/bash

echo "🚀 GAS自動デプロイを開始..."

# コードをプッシュ
echo "📤 コードをアップロード中..."
clasp push

# デプロイ
echo "🎯 デプロイ中..."
DEPLOYMENT_ID="YOUR_DEPLOYMENT_ID"

if [ -z "$DEPLOYMENT_ID" ]; then
  # 新規デプロイ
  clasp deploy --description "Auto deploy $(date +'%Y-%m-%d %H:%M:%S')"
else
  # 既存デプロイを更新
  clasp deploy --deploymentId "$DEPLOYMENT_ID" --description "Update $(date +'%Y-%m-%d %H:%M:%S')"
fi

# WebアプリURLを取得
echo "🔗 WebアプリURL:"
clasp deployments

echo "✅ デプロイ完了!"
```

実行権限を付与：
```bash
chmod +x deploy.sh
```

## 10. package.json にスクリプトを追加

```json
{
  "scripts": {
    "deploy:gas": "./deploy.sh",
    "push:gas": "clasp push",
    "pull:gas": "clasp pull",
    "open:gas": "clasp open",
    "logs:gas": "clasp logs"
  }
}
```

## 使用方法

```bash
# コードをプッシュしてデプロイ
npm run deploy:gas

# コードのみプッシュ
npm run push:gas

# GASエディタを開く
npm run open:gas

# ログを確認
npm run logs:gas
```

## トラブルシューティング

### エラー: "User has not enabled the Apps Script API"
→ https://script.google.com/home/usersettings でAPIを有効化

### エラー: "Manifest file has been updated"
→ `clasp pull` で最新のappsscript.jsonを取得してからpush

### エラー: "Invalid grant"
→ `clasp login --creds creds.json` で再ログイン

## .gitignore に追加

```
.clasp.json
creds.json
```

## 注意事項

- `.clasp.json` にはスクリプトIDが含まれるため、公開リポジトリにはpushしない
- 複数人で開発する場合は、各自でclasp loginが必要
- GASエディタとローカルの両方で編集すると競合する可能性があるため注意