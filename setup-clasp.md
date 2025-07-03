# clasp セットアップ手順

## 手動で行う必要がある手順

### 1. claspでGoogleアカウントにログイン
```bash
npm run setup:gas
```
または
```bash
npx clasp login
```

これを実行すると：
1. ブラウザが開きます
2. Googleアカウントでログイン
3. 権限を許可してください

### 2. Google Apps Script APIを有効化
以下のURLにアクセスして、APIをONにしてください：
https://script.google.com/home/usersettings

### 3. スプレッドシートからスクリプトIDを取得

提供されたスプレッドシート:
https://docs.google.com/spreadsheets/d/1ZZjvaUptj1BCbV0jsbILwXbB_NF8L4MkeYT5P23mU7Y/

1. このスプレッドシートを開く
2. 「拡張機能」→「Apps Script」をクリック
3. Apps Scriptエディタが開いたら、URLを確認
4. URLの中の`/projects/`の後の文字列がスクリプトID

例：
```
https://script.google.com/home/projects/XXXXXXXXXXXXXXXXXXXXX/edit
                                        ↑ここがスクリプトID
```

## 自動実行可能な手順

ログインとスクリプトIDの取得が完了したら、以下のコマンドで自動セットアップできます：

```bash
# スクリプトIDを環境変数に設定
export SCRIPT_ID="取得したスクリプトID"

# プロジェクトをクローン
npx clasp clone $SCRIPT_ID --rootDir ./gas

# 既存のGASファイルをプッシュ
npm run push:gas

# デプロイ
npm run deploy:gas
```

## 注意事項

- 初回はブラウザでの認証が必須です
- スクリプトIDは手動で確認する必要があります
- 一度認証すれば、以降はCLIだけで操作できます