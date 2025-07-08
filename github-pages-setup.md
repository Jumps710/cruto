# GitHub Pages 設定手順

## 1. GitHub Pages を有効化

1. GitHubリポジトリ https://github.com/Jumps710/cruto にアクセス
2. **Settings** タブをクリック
3. 左サイドバーの **Pages** をクリック
4. **Source** セクションで：
   - **Deploy from a branch** を選択
   - **Branch**: `main` を選択
   - **Folder**: `/ (root)` を選択
5. **Save** をクリック

## 2. GitHub Pages URL

設定完了後、以下のURLでアクセス可能になります：

**メインページ:**
```
https://jumps710.github.io/cruto/
```

**各アプリのURL:**
```
事故報告:   https://jumps710.github.io/cruto/accident-report/
入退院報告: https://jumps710.github.io/cruto/hospital-report/
営業支援Bot: https://jumps710.github.io/cruto/sales-bot/
```

## 3. デプロイ時間

- GitHub Pagesの反映には通常5-10分かかります
- 初回設定では最大30分かかる場合があります

## 4. 今後のワークフロー

### コード更新時：
```bash
# ローカルで編集後
git add .
git commit -m "更新内容の説明"
git push origin main
```

### GAS更新時：
```bash
npm run deploy:gas
```

### 両方同時更新時：
```bash
# まずGitにコミット・プッシュ
git add .
git commit -m "フロントエンドとバックエンドを更新"
git push origin main

# 次にGASをデプロイ
npm run deploy:gas
```

## 5. トラブルシューティング

- **404エラー**: ファイルパスが正しいか確認
- **反映されない**: 5-10分待つ、ブラウザキャッシュをクリア
- **CSS/JSが読み込まれない**: 相対パス（./）を使用しているか確認

## 6. カスタムドメイン（オプション）

独自ドメインを使用したい場合：
1. Pages設定でCustom domainを入力
2. DNSレコードでCNAMEを設定
3. HTTPS強制を有効化