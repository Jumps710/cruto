# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Cruto社のLW業務アプリケーション開発プロジェクトです。4つのLine Worksアプリケーションを構築します：

1. **事故報告WOFF** - 事故種類（車両事故/その他）による条件分岐フォーム
2. **入退院報告WOFF** - 利用者予測検索機能付き入退院報告システム
3. **営業支援Bot** - 位置情報ベースのルート最適化と分析機能
4. **4つ目のアプリ** - 未定

## アーキテクチャ

**フロントエンド**: GitHub Pages（静的サイトホスティング）
- Progressive Web App（PWA）対応、オフライン機能
- モバイルファーストのレスポンシブデザイン
- 位置情報サービスとカメラ連携
- 条件分岐フォームロジック（HTML/CSS/JavaScript）

**バックエンド**: Google Apps Script（GAS）
- フォーム送信用REST APIエンドポイント
- Google Sheetsとの連携によるデータ保存
- Google Drive経由の画像アップロード処理

**データ層**: Google Sheets
- 事故報告シート
- 入退院管理シート
- 利用者マスタ
- 医療機関マスタ
- 営業データ（分析用）

## 主要技術要件

### フォームアプリケーション（WOFF）
- ユーザー選択による条件分岐フォーム表示
- Google Sheetsマスタデータを使用した予測入力
- 必須写真アップロード機能と検証
- 自動データ入力（タイムスタンプ、報告者情報、事業所位置）
- 位置情報サービス連携（GPS + 手動検索）

### 営業支援Bot
- 位置情報ベースのルート最適化
- 既存Google SheetsおよびLooker Studioデータとの連携
- 契約率と期間の分析機能
- 4つの戦略的ターゲティングモード：高契約率、早期開始、新規開拓、改善相談

### GAS APIエンドポイント
```
POST /api/accident-report - 事故報告の送信
POST /api/hospital-report - 入退院報告の送信
GET /api/users/suggest - マスタデータからのユーザー自動補完
GET /api/hospitals/suggest - 医療機関の自動補完
POST /api/sales-route - 最適化された営業ルートの生成
```

## 本番環境エンドポイント情報

### GitHub Pages（フロントエンド）
- **リポジトリ**: https://github.com/Jumps710/cruto
- **ベースURL**: https://jumps710.github.io/cruto/

### Google Apps Script（バックエンドAPI）
- **WebアプリURL**: https://script.google.com/macros/s/AKfycbyaHucPNASJmzi_LLaIBuTAXtxxU-VZx4xOBeSXfbPzur_36Omq25ajThTHZ-M8Jk2lVw/exec
- **スクリプトID**: 1tRFxjvtWORDXfaYU3aHH2CcoKPG_Wf4qw92OJCMCJ8dxdqsBdm_88nkZ

### WOFF アプリ登録情報

#### 1. 事故報告WOFF
- **WOFF ID**: `EownaFs9auCN-igUa84MDA`
- **WOFF URL**: https://woff.worksmobile.com/woff/EownaFs9auCN-igUa84MDA
- **GitHub Pages URL**: https://jumps710.github.io/cruto/accident-report/

#### 2. 入退院報告WOFF
- **WOFF ID**: `Exth8PXun2d80vxUyBamIw`
- **WOFF URL**: https://woff.worksmobile.com/woff/Exth8PXun2d80vxUyBamIw
- **GitHub Pages URL**: https://jumps710.github.io/cruto/hospital-report/

#### 3. 営業支援Bot
- **WOFF ID**: `Ilofk_65rvB6VHiOceQ0sg`
- **WOFF URL**: https://woff.worksmobile.com/woff/Ilofk_65rvB6VHiOceQ0sg
- **GitHub Pages URL**: https://jumps710.github.io/cruto/sales-bot/

## 開発フロー

段階的開発アプローチ：
1. インフラ構築（GitHub Pages + GAS）
2. 事故報告WOFF開発
3. 入退院報告WOFF開発
4. 営業支援Bot開発
5. テスト・デプロイ

## データフロー

1. フロントエンドフォームでユーザー入力を検証付きで収集
2. JavaScriptで条件分岐ロジックとファイルアップロードを処理
3. fetch APIを通じてGASエンドポイントにデータ送信
4. GASで処理し、適切なGoogle Sheetsに保存
5. 自動補完機能用にシートからマスタデータを取得
6. 営業Botが既存データを分析してルート最適化

## 重要事項

- 現場作業者向けにモバイル対応必須
- 事故報告では写真アップロードが必須
- 位置データはGPS優先、手動入力をフォールバック
- 予測検索は既存ユーザーとフリーテキスト入力両対応
- 営業分析は既存Looker Studioダッシュボードと連携

## 開発履歴・備忘録

### 2025年1月 - プロジェクト完成
Claude Code を使用してCruto社のLW業務アプリケーション3本を開発・完成。

#### 実装完了したアプリケーション

**1. 事故報告WOFF**
- 条件分岐フォーム（車両事故/その他）
- 発生場所の詳細選択（訪看/小児/施設別）
- 車両事故専用項目（運転手名、対物・対人、負傷詳細）
- GPS位置情報取得 + 手動入力
- 複数写真アップロード（必須 + 車両事故時の追加写真）
- 事業所選択（マスタ連携）
- 確認モーダルで送信前チェック
- 完了: accident-report/index.html, result.html, css/, js/

**2. 入退院報告WOFF**
- 利用者名の予測変換（マスタデータ連携、キーボード操作対応）
- 医療機関の予測変換（エリア別マスタ）
- 入院/中止の条件分岐フォーム
- 診断名の選択肢（誤嚥性肺炎、肺炎、尿路感染、心不全、消化器系疾患、骨折等）
- 契約終了処理とN列自動更新機能
- バリデーション機能（必須項目チェック）
- 完了: hospital-report/index.html, result.html, css/, js/

**3. 営業支援Bot**
- 4つの営業戦略（契約率重視、早期契約、新規開拓、改善相談）
- 位置情報ベース最適化（GPS自動取得 + 手動入力）
- 距離計算とルート最適化（巡回セールスマン問題の簡易解法）
- 契約率・期間分析と期待売上計算
- チャット形式のインターアクティブUI
- ステップ式の直感的操作、モーダル表示による詳細ルート確認
- CSV エクスポート機能、外部ナビ連携（Google Maps）
- 完了: sales-bot/index.html, css/, js/

#### 技術実装詳細

**共通基盤**
- 共通CSS/JS: common/css/base.css, common/js/woff-init.js
- WOFFManagerクラスでLINE WORKS SDK初期化を統一
- Utilsクラスで共通処理（日付フォーマット、Base64変換等）

**GASバックエンド**
- gas/accident-report.gs - 条件分岐、複数写真対応、事業所マスタ連携
- gas/hospital-report.gs - 予測検索API、N列管理更新、契約終了通知
- gas/sales-bot.gs - 営業データ分析、ルート最適化アルゴリズム、戦略別フィルタリング

**データ設計**
- Google Sheets: 7シート（事故報告、入退院管理、営業データ、3マスタ、log）
- Google Drive: 写真保存用フォルダとBase64アップロード処理
- 各シートの列設計とデータ型を仕様に合わせて設計

#### 開発プロセス

**Phase 1: 要件整理と設計**
- 4アプリの要件定義（事故報告、入退院報告、営業支援Bot + 未定1本）
- アーキテクチャ設計（GitHub Pages + GAS + Google Sheets）
- UI/UX設計（モバイルファースト、PWA対応）

**Phase 2: サンプルコード分析**
- 提供されたWOFFサンプルコード（HTML/CSS/JS/GAS）を分析
- LINE WORKS SDK v3.7.1の実装パターンを理解
- Base64画像アップロード、モーダル確認画面等の既存実装を活用

**Phase 3: プロジェクト構造構築**
- ディレクトリ構造設計（各アプリ分離、共通リソース管理）
- 共通CSS/JSライブラリの作成
- READMEとデプロイガイドの作成

**Phase 4: 段階的実装**
1. 事故報告WOFF（条件分岐、写真必須、位置情報）
2. 入退院報告WOFF（予測検索、N列更新）
3. 営業支援Bot（ルート最適化、分析機能）

**Phase 5: デプロイメント準備**
- deployment-guide.html作成（10ステップの詳細手順）
- 設定項目の整理（WOFF ID、GAS URL、フォルダID）
- トラブルシューティングガイド

#### アーキテクチャ決定

**なぜGitHub Pages + GAS？**
- コスト効率（両方とも無料枠で運用可能）
- LINE WORKS WOFFとの親和性
- Google Workspace統合（Sheets、Drive）
- デプロイ・メンテナンスの簡素化
- 既存のGoogle Sheets、Looker Studioデータ活用

**技術選択の理由**
- フロントエンド: Vanilla JS（軽量、依存なし、WOFF SDK対応）
- CSS: モバイルファースト、レスポンシブデザイン
- バックエンド: GAS（Google Workspace統合、サーバーレス）
- データ: Google Sheets（既存データ活用、非エンジニアも操作可能）

#### 今後の拡張可能性

**4つ目のアプリ候補**
- 勤怠管理WOFF
- 日報・業務報告WOFF  
- 顧客管理WOFF
- 在庫管理WOFF

**技術的改善案**
- Google Maps API統合（営業支援Bot）
- プッシュ通知機能
- オフライン対応の強化
- BigQueryへのデータ移行（大量データ対応）
- 機械学習による営業先推奨の改善

#### 設定必要事項（本番環境）

**各アプリのJavaScript設定**
```javascript
// 3つのアプリすべてで設定必要
config: {
  woffId: "実際のWOFF ID", // LINE WORKS Developers で取得
  gasUrl: "実際のGAS URL" // WebアプリデプロイURL
}
```

**Google Sheets設定**
- 7シートの作成（事故報告、入退院管理、営業データ、3マスタ、log）
- 列構成は各GASファイルのコメント参照

**Google Drive設定**  
- 写真保存用フォルダ作成とID取得
- フォルダ権限設定（リンクを知っている全員）

#### プロジェクト成果

**コード行数（概算）**
- HTML: 約800行（3アプリ + 共通）
- CSS: 約1,200行（レスポンシブ、モーダル、アニメーション込み）
- JavaScript: 約2,000行（条件分岐、自動補完、ルート最適化込み）
- GAS: 約1,000行（API、データ処理、分析機能）
- 合計: 約5,000行

**実装期間**: 1日集中開発
**使用ツール**: Claude Code + GitHub + Google Workspace

このプロジェクトは要件定義から完成まで一貫してClaude Codeで開発し、
実用的なLINE WORKS業務アプリケーション群として完成。








### 事故報告フォーム要件
・はフォームの入力項目
前提として、LINE WORKSのWOFFアプリとして起動する
※ローカルテスト中は、ブラウザで閲覧するため、WOFFを実装しなくてよい。


・報告日時
必須
自動入力（入力時のタイムスタンプ）

・発生日付
Data Pickerで選択

・発生時間
Time Pickerで選択

・報告者
WOFF SDK で自動取得
displayName（氏名）

・事故種類
ラジオボタン
車両事故　or その他

IF分岐で、
事故種類 = その他だった場合

・事業所
WOFF SDKでuserIdを取得し、
LW APIでuserが所属する組織のorgUnitName（事業所名称）を取得し、
自動表示

「事業所を変更」オプション
押下すると、Google Sheetの「事業所」シートのA列から事業所を参照し、
プルダウンで選択できるようにする

・発生場所
プルダウン
訪看
小児
施設

→IF文で、
訪看の場合
さらにプルダウン
ご利用者宅
その他
（その他の場合、フリーテキスト入力）

小児の場合
さらにプルダウン
活動スペース
トイレ
屋外
（その他の場合、フリーテキスト入力）

施設の場合
さらにプルダウン
居室
共有スペース
トイレ
浴室
中庭
玄関前
駐車場
階段
（その他の場合、フリーテキスト入力）



IF分岐で、
事故種類 = 車両事故だった場合


・運転手の名前
WOFF SDK で自動取得
displayName（氏名）

・事業所
WOFF SDKでuserIdを取得し、
LW APIでuserが所属する組織のorgUnitName（事業所名称）を取得し、
自動表示

「事業所を変更」オプション
押下すると、Google Sheetの「事業所」シートのA列から事業所を参照し、
プルダウンで選択できるようにする


・対物
ラジオボタン
あり・なし
ありの場合、フリーテキスト入力フィールドを表示

・対人
あり・なし
ありの場合、フリーテキスト入力フィールドを表示

・負傷
本人　あり・なし
同乗者　あり・なし
対人　あり・なし

それぞれ、ありの場合、フリーテキスト入力フィールドを表示


・発生場所
位置情報取得ボタン
押下するとGPS有効化して、住所取得
または自分で住所を入力

・事故内容詳細
フリーテキスト

・写真アップロード
入力必須

対物ありの場合
・対物の写真
撮影またはアップロード

対人ありの場合
・相手の免許証
・相手の車
・自分の車
それぞれ撮影またはアップロード



### 入退院報告フォーム

・はフォームの入力項目
前提として、LINE WORKSのWOFFアプリとして起動する
※ローカルテスト中は、ブラウザで閲覧するため、WOFFを実装しなくてよい。


・報告日時
必須
自動入力（入力時のタイムスタンプ）

・発生日付
Data Pickerで選択

・発生時間
Time Pickerで選択

・報告者
WOFF SDK で自動取得
displayName（氏名）

・事業所
WOFF SDKでuserIdを取得し、
LW APIでuserが所属する組織のorgUnitName（事業所名称）を取得し、
自動表示

「事業所を変更」オプション
押下すると、Google Sheetの「事業所」シートのA列から事業所を参照し、
プルダウンで選択できるようにする


・利用者名
テキスト入力
※テキスト入力した際に、「利用者管理」シートにある氏名（B列）やフリガナ(C列)から既存データ参照し、
予測変換するようなことは可能でしょうか？
たとえば入力規則でカタカナ固定にして、アと入力されたらアから開始されるフリガナの人の氏名を選択肢に表示するなど

・脱落理由
ラジオボタン
入院・中止

入院の場合
・入院日　DatePicker
・入院先　「医療マスタ」シートから入院先病院の情報取得
・診断名　プルダウン↓
尿路感染
心不全
消化器系疾患
骨折
その他

中止の場合
・中止日　DatePicker
・診断名　フリーテキスト

入院.中止共通の項目
・退院日 or 再開日　DatePicker
→ 送信すると、入退院管理シートの、該当利用者レコードのN列の日時 YYYY/MM/DDを更新
・契約終了
チェックボックスで「契約終了にする」の✔を入れる
→送信すると、入退院管理シートの、該当利用者レコードのM列を「契約終了」へ更新

