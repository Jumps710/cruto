# Google Maps API 設定ガイド

GPS位置情報から住所を取得する機能では、以下の2つの方法を使用します：

## 1. 無料版（デフォルト）
- **Nominatim (OpenStreetMap)** を使用
- **APIキー不要**
- 基本的な住所変換が可能
- **制限**: 使用頻度制限あり、精度は標準的

## 2. Google Maps Geocoding API（推奨）
より正確で詳細な住所を取得したい場合

### セットアップ手順

#### Step 1: Google Cloud Console でAPIキーを取得
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. **APIs & Services > Library** へ移動
4. **"Geocoding API"** を検索して有効化
5. **APIs & Services > Credentials** でAPIキーを作成
6. APIキーの使用制限を設定（推奨）
   - **Application restrictions**: HTTP referrers
   - **Referrer**: `https://jumps710.github.io/cruto/*`
   - **API restrictions**: Geocoding API のみ

#### Step 2: APIキーを設定

**事故報告アプリ**
```javascript
// accident-report/js/accident-report.js
const config = {
    woffId: 'EownaFs9auCN-igUa84MDA',
    gasUrl: 'https://script.google.com/macros/s/AKfycbyL58-LDmfXvfXkYbj-LL9PPrnDZreH0RPg1-io0xgdNgICh30_VUBa1SZebAqk4hBxoA/exec',
    googleMapsApiKey: 'YOUR_API_KEY_HERE' // ← ここに取得したAPIキーを設定
};
```

## 住所取得の動作

### Google Maps API使用時
```
緯度: 35.689487, 経度: 139.691711
↓
"東京都新宿区西新宿1丁目6-1 新宿エルタワー"
```

### Nominatim使用時
```  
緯度: 35.689487, 経度: 139.691711
↓
"東京都新宿区西新宿1-6-1"
```

## 料金について

**Google Maps Geocoding API**
- 月間 $200 の無料クレジット
- 1,000回のリクエストごとに $5
- 通常の使用であれば無料枠内で十分

**使用量の目安**
- 事故報告での位置情報取得: 1回につき1リクエスト
- 月間200件の事故報告まで無料

## トラブルシューティング

### APIキーが無効な場合
- Nominatim に自動的にフォールバック
- エラーメッセージはコンソールに出力

### 住所が取得できない場合
- 座標情報（緯度・経度）を表示
- 手動で住所を編集可能

## セキュリティ

- APIキーには必ずリファラー制限を設定
- 公開リポジトリでAPIキーをコミットしない
- 定期的にAPIキーをローテーション