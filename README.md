# Cruto LW業務アプリケーション

## プロジェクト構成

```
cruto/
├── accident-report/     # 事故報告WOFF
│   ├── index.html
│   ├── result.html
│   ├── css/
│   └── js/
├── hospital-report/     # 入退院報告WOFF
│   ├── index.html
│   ├── result.html
│   ├── css/
│   └── js/
├── sales-bot/          # 営業支援Bot
│   ├── index.html
│   ├── css/
│   └── js/
├── common/             # 共通リソース
│   ├── css/
│   └── js/
└── gas/               # Google Apps Script
    ├── accident-report.gs
    ├── hospital-report.gs
    └── sales-bot.gs
```

## 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **LINE WORKS SDK**: v3.7.1
- **バックエンド**: Google Apps Script
- **データストア**: Google Sheets
- **ファイルストレージ**: Google Drive

## セットアップ

1. GitHub Pagesを有効化
2. Google Apps ScriptプロジェクトをデプロイしてWebアプリとして公開
3. LINE WORKS WOFFアプリを作成し、woffIdを取得
4. Google SheetsとDriveフォルダを準備

## 開発手順

各アプリケーションのディレクトリで開発を行い、GitHub Pagesでホスティングします。