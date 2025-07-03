# WSL環境でのclasp認証手順

## 方法1: Windows側でclasp認証を行う

1. WindowsのコマンドプロンプトまたはPowerShellを開く
2. 以下のコマンドを実行：
```cmd
npm install -g @google/clasp
clasp login
```

3. 認証が完了したら、以下のファイルをWSLにコピー：
   - Windows: `%USERPROFILE%\.clasprc.json`
   - WSL: `~/.clasprc.json`

コピーコマンド例：
```bash
cp /mnt/c/Users/[WindowsUsername]/.clasprc.json ~/.clasprc.json
```

## 方法2: 手動で認証トークンを設定

1. 以下のURLにアクセス：
https://script.google.com/home/usersettings

2. Google Apps Script APIが有効になっていることを確認

3. 以下のURLにアクセスして手動で認証：
https://accounts.google.com/o/oauth2/v2/auth?client_id=1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/script.deployments%20https://www.googleapis.com/auth/script.projects%20https://www.googleapis.com/auth/script.webapp.deploy%20https://www.googleapis.com/auth/drive.metadata.readonly%20https://www.googleapis.com/auth/drive.file%20https://www.googleapis.com/auth/service.management%20https://www.googleapis.com/auth/logging.read%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile%20https://www.googleapis.com/auth/cloud-platform&response_type=code&access_type=offline

4. 認証コードを取得してメモ

## 方法3: サービスアカウントを使用

1. Google Cloud Console でサービスアカウントを作成
2. 認証情報JSONファイルをダウンロード
3. 環境変数に設定：
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
```

## 推奨される解決策

Windows側で認証を行い、認証ファイルをWSLにコピーする方法が最も簡単です。