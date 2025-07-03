# 手動認証手順

## ステップ1: 認証URLにアクセス

以下のURLをブラウザで開いてください（1行でコピー）：

```
https://accounts.google.com/o/oauth2/v2/auth?client_id=1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/script.deployments%20https://www.googleapis.com/auth/script.projects%20https://www.googleapis.com/auth/script.webapp.deploy%20https://www.googleapis.com/auth/drive.metadata.readonly%20https://www.googleapis.com/auth/drive.file%20https://www.googleapis.com/auth/service.management%20https://www.googleapis.com/auth/logging.read%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile%20https://www.googleapis.com/auth/cloud-platform&response_type=code&access_type=offline
```

## ステップ2: 認証を完了

1. Googleアカウントでログイン
2. 権限を許可
3. 表示される認証コードをコピー

## ステップ3: 認証コードを使用

認証コードを取得したら、それを使ってclaspの設定を行います。

## 代替案: .clasp.jsonを直接作成

プロジェクトに.clasp.jsonファイルを直接作成することで、認証をスキップしてプロジェクトの操作が可能です：

```json
{
  "scriptId": "1tRFxjvtWORDXfaYU3aHH2CcoKPG_Wf4qw92OJCMCJ8dxdqsBdm_88nkZ",
  "rootDir": "./gas"
}
```