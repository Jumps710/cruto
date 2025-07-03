#!/bin/bash

echo "🚀 GAS自動デプロイを開始..."

# 固定デプロイメントID（同じURLを維持）
DEPLOYMENT_ID="AKfycbyaHucPNASJmzi_LLaIBuTAXtxxU-VZx4xOBeSXfbPzur_36Omq25ajThTHZ-M8Jk2lVw"

# コードをプッシュ
echo "📤 コードをアップロード中..."
npx clasp push

if [ $? -ne 0 ]; then
    echo "❌ コードのアップロードに失敗しました"
    exit 1
fi

# デプロイ
echo "🎯 デプロイ中..."

# 既存デプロイを更新（同じURLを維持）
echo "既存のデプロイを更新します: $DEPLOYMENT_ID"
npx clasp deploy --deploymentId "$DEPLOYMENT_ID" --description "Update $(date +'%Y-%m-%d %H:%M:%S')"

if [ $? -eq 0 ]; then
    echo "✅ デプロイ完了!"
    echo ""
    echo "🔗 WebアプリURL（固定）:"
    echo "https://script.google.com/macros/s/$DEPLOYMENT_ID/exec"
    echo ""
    echo "📋 デプロイ情報:"
    npx clasp deployments
else
    echo "❌ デプロイに失敗しました"
    exit 1
fi