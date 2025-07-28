# GAS自動デプロイの代替手段

## 1. clasp deployments を使用した確認

```bash
# 現在のデプロイメントを確認
npx clasp deployments

# 出力例：
# 2 Deployments.
# - AKfycbw... @HEAD 
# - AKfycby... @1 
```

## 2. Google Apps Script API を使用した部分自動化

```javascript
// デプロイ設定ファイル（.clasp.json）の例
{
  "scriptId": "1tRFxjvtWORDXfaYU3aHH2CcoKPG_Wf4qw92OJCMCJ8dxdqsBdm_88nkZ",
  "rootDir": "./gas",
  "deploymentId": "AKfycbyL58-LDmfXvfXkYbj-LL9PPrnDZreH0RPg1-io0xgdNgICh30_VUBa1SZebAqk4hBxoA"
}
```

## 3. 手動デプロイの最速手順

1. 以下のURLに直接アクセス：
   ```
   https://script.google.com/home/projects/1tRFxjvtWORDXfaYU3aHH2CcoKPG_Wf4qw92OJCMCJ8dxdqsBdm_88nkZ/deployments
   ```

2. キーボードショートカット：
   - `Ctrl + Alt + D` - デプロイメニューを開く（GASエディタ内）
   - `Tab` キーで「新しいバージョン」に移動
   - `Enter` でデプロイ

## 4. 自動化可能な部分

```bash
#!/bin/bash
# deploy-with-notification.sh

# 1. コードをプッシュ
npm run push:gas

# 2. デプロイページを直接開く
xdg-open "https://script.google.com/home/projects/1tRFxjvtWORDXfaYU3aHH2CcoKPG_Wf4qw92OJCMCJ8dxdqsBdm_88nkZ/deployments"

# 3. デプロイ手順を通知
notify-send "GAS Deploy" "新しいバージョンとしてデプロイしてください"

# 4. デプロイ後の確認
echo "デプロイ完了後、以下のコマンドで確認："
echo "curl https://script.google.com/macros/s/AKfycbyL58-LDmfXvfXkYbj-LL9PPrnDZreH0RPg1-io0xgdNgICh30_VUBa1SZebAqk4hBxoA/exec"
```

## 5. 将来的な完全自動化の可能性

Google Cloud Platform の Service Account を使用すれば理論的には可能ですが、現在のLINE WORKSプロジェクトでは以下の理由で推奨されません：

1. 追加の認証設定が複雑
2. セキュリティリスクの増加
3. 既存のデプロイメントIDを維持できない可能性

## 推奨される運用

1. `npm run push:gas` でコードを更新
2. ブラウザでデプロイページを開く（URLをブックマーク）
3. 「新しいバージョン」を選択してデプロイ
4. バージョン番号をメモして管理

この手順により、30秒程度でデプロイが完了します。