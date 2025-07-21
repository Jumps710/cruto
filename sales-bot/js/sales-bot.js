// 営業支援Bot JavaScript
const SalesBot = {
  // 設定
  config: {
    woffId: "Ilofk_65rvB6VHiOceQ0sg", // 営業支援Bot WOFF ID
    gasUrl: "https://script.google.com/macros/s/AKfycbyL58-LDmfXvfXkYbj-LL9PPrnDZreH0RPg1-io0xgdNgICh30_VUBa1SZebAqk4hBxoA/exec" // 本番環境 GAS URL
  },
  
  // 状態管理
  state: {
    currentStep: 'strategy',
    selectedStrategy: null,
    userLocation: null,
    conditions: [],
    maxVisits: 5,
    generatedRoute: null
  },

  // 戦略設定
  strategies: {
    'high-conversion': {
      name: '契約率重視',
      description: '契約率が高いお得意様を優先',
      icon: '📈',
      criteria: 'contract_rate DESC'
    },
    'quick-start': {
      name: '早期契約',
      description: '契約開始までが短い先を優先',
      icon: '⚡',
      criteria: 'avg_contract_days ASC'
    },
    'new-development': {
      name: '新規開拓',
      description: '契約率が低い新規開拓先を優先',
      icon: '🌱',
      criteria: 'contract_rate ASC, last_contact_days DESC'
    },
    'improvement': {
      name: '改善相談',
      description: '契約期間が長い先の改善を図る',
      icon: '💡',
      criteria: 'avg_contract_days DESC'
    }
  },

  async init() {
    try {
      // WOFF初期化
      await WOFFManager.init(this.config.woffId);
      
      // イベントリスナー設定
      this.setupEventListeners();
      
      // 初期メッセージ表示
      this.addBotMessage("営業支援Botを開始しました。まずは営業戦略を選択してください。");
      
      console.log("✅ 営業支援Bot初期化完了");
    } catch (error) {
      console.error("❌ 初期化エラー:", error);
      this.addBotMessage("申し訳ございません。初期化に失敗しました。");
    }
  },

  setupEventListeners() {
    // 戦略選択
    document.querySelectorAll('.strategy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectStrategy(e.currentTarget.dataset.strategy);
      });
    });

    // 位置情報取得
    document.getElementById('getLocationBtn').addEventListener('click', () => {
      this.getCurrentLocation();
    });

    // 手動位置情報
    document.getElementById('useManualLocationBtn').addEventListener('click', () => {
      this.useManualLocation();
    });

    // ルート生成
    document.getElementById('generateRouteBtn').addEventListener('click', () => {
      this.generateRoute();
    });

    // 条件選択
    document.querySelectorAll('input[name="condition"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.updateConditions();
      });
    });

    // 最大訪問件数
    document.getElementById('maxVisits').addEventListener('change', (e) => {
      this.state.maxVisits = parseInt(e.target.value);
    });

    // モーダル関連
    this.setupModalListeners();
  },

  setupModalListeners() {
    const routeModal = document.getElementById('routeModal');
    const analyticsModal = document.getElementById('analyticsModal');
    
    // モーダルを閉じる
    document.querySelectorAll('.close').forEach(closeBtn => {
      closeBtn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
      });
    });

    // ルートアクション
    document.getElementById('startNavigationBtn').addEventListener('click', () => {
      this.startNavigation();
    });

    document.getElementById('exportRouteBtn').addEventListener('click', () => {
      this.exportRoute();
    });

    document.getElementById('newRouteBtn').addEventListener('click', () => {
      this.resetBot();
    });

    document.getElementById('closeAnalyticsBtn').addEventListener('click', () => {
      analyticsModal.style.display = 'none';
    });

    // モーダル外クリック
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });
  },

  selectStrategy(strategy) {
    this.state.selectedStrategy = strategy;
    
    // UI更新
    document.querySelectorAll('.strategy-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    document.querySelector(`[data-strategy="${strategy}"]`).classList.add('selected');
    
    // ボットメッセージ
    const strategyInfo = this.strategies[strategy];
    this.addBotMessage(`「${strategyInfo.name}」を選択しました。${strategyInfo.description}で営業先を分析します。`);
    
    // 次のステップ表示
    setTimeout(() => {
      this.showLocationStep();
    }, 1000);
  },

  showLocationStep() {
    this.addBotMessage("次に、現在地を取得して最適なルートを計算します。");
    document.getElementById('locationStep').style.display = 'block';
    this.state.currentStep = 'location';
  },

  async getCurrentLocation() {
    const btn = document.getElementById('getLocationBtn');
    const locationDisplay = document.getElementById('locationDisplay');
    const manualLocation = document.querySelector('.manual-location');
    
    btn.disabled = true;
    btn.textContent = "📍 位置情報取得中...";
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      const { latitude, longitude } = position.coords;
      this.state.userLocation = { lat: latitude, lng: longitude };
      
      // 逆ジオコーディング
      try {
        const address = await this.reverseGeocode(latitude, longitude);
        
        locationDisplay.innerHTML = `
          <h4>📍 現在地を取得しました</h4>
          <p><strong>住所:</strong> ${address || '住所取得中...'}</p>
          <p><strong>座標:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
        `;
        
        this.addBotMessage(`現在地を取得しました：${address || '座標情報のみ'}`);
        
      } catch (error) {
        locationDisplay.innerHTML = `
          <h4>📍 現在地を取得しました</h4>
          <p><strong>座標:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
        `;
        
        this.addBotMessage("現在地を取得しました。（住所の取得に失敗しましたが、座標で計算します）");
      }
      
      locationDisplay.style.display = 'block';
      this.showConditionsStep();
      
    } catch (error) {
      console.error("位置情報取得エラー:", error);
      this.addBotMessage("位置情報の取得に失敗しました。手動で住所を入力してください。");
      manualLocation.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = "📍 現在地を取得";
    }
  },

  async reverseGeocode(lat, lng) {
    // 実際のプロジェクトではGoogle Geocoding APIなどを使用
    // ここでは簡易実装
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error("逆ジオコーディングエラー:", error);
      return null;
    }
  },

  useManualLocation() {
    const manualInput = document.getElementById('manualLocation');
    const address = manualInput.value.trim();
    
    if (!address) {
      this.addBotMessage("住所を入力してください。");
      return;
    }
    
    // 住所から座標を取得（簡易実装）
    this.state.userLocation = { address: address, lat: null, lng: null };
    
    const locationDisplay = document.getElementById('locationDisplay');
    locationDisplay.innerHTML = `
      <h4>📍 手動入力の住所</h4>
      <p><strong>住所:</strong> ${address}</p>
    `;
    locationDisplay.style.display = 'block';
    
    this.addBotMessage(`入力された住所：${address} で営業ルートを計算します。`);
    this.showConditionsStep();
  },

  showConditionsStep() {
    setTimeout(() => {
      this.addBotMessage("追加の条件を設定して、営業ルートを生成しましょう。");
      document.getElementById('conditionsStep').style.display = 'block';
      this.state.currentStep = 'conditions';
    }, 1000);
  },

  updateConditions() {
    const selectedConditions = Array.from(document.querySelectorAll('input[name="condition"]:checked'))
      .map(cb => cb.value);
    this.state.conditions = selectedConditions;
  },

  async generateRoute() {
    if (!this.state.selectedStrategy || !this.state.userLocation) {
      this.addBotMessage("戦略と位置情報を設定してください。");
      return;
    }

    this.addBotMessage("営業ルートを生成中です。しばらくお待ちください...");
    this.showLoading();

    try {
      // 条件を更新
      this.updateConditions();
      
      // GASから営業データを取得してルート生成
      const routeData = await this.fetchOptimalRoute();
      
      if (routeData.status === 'success') {
        this.state.generatedRoute = routeData.data;
        this.addBotMessage(`最適な営業ルートを生成しました！${routeData.data.visits.length}件の訪問先を含む効率的なルートです。`);
        this.showRouteModal(routeData.data);
      } else {
        throw new Error(routeData.message || 'ルート生成に失敗しました');
      }
      
    } catch (error) {
      console.error("ルート生成エラー:", error);
      this.addBotMessage("申し訳ございません。ルート生成中にエラーが発生しました。");
    } finally {
      this.hideLoading();
    }
  },

  async fetchOptimalRoute() {
    const requestData = {
      action: 'generateRoute',
      strategy: this.state.selectedStrategy,
      location: this.state.userLocation,
      conditions: this.state.conditions,
      maxVisits: this.state.maxVisits,
      userId: WOFFManager.getUserId()
    };

    const response = await fetch(this.config.gasUrl, {
      method: 'POST',
      body: new URLSearchParams(requestData)
    });

    return await response.json();
  },

  showRouteModal(routeData) {
    const modal = document.getElementById('routeModal');
    const strategyInfo = this.strategies[this.state.selectedStrategy];
    
    // サマリー情報
    document.getElementById('selectedStrategy').textContent = strategyInfo.name;
    document.getElementById('estimatedTime').textContent = routeData.estimatedTime || '約3時間';
    document.getElementById('totalDistance').textContent = routeData.totalDistance || '約25km';
    
    // ルートリスト
    this.renderRouteList(routeData.visits);
    
    // 分析結果表示
    if (routeData.analytics) {
      this.showAnalytics(routeData.analytics);
    }
    
    modal.style.display = 'block';
  },

  renderRouteList(visits) {
    const routeList = document.getElementById('routeList');
    
    routeList.innerHTML = visits.map((visit, index) => `
      <div class="route-item">
        <div class="route-header">
          <div>
            <span class="route-number">${index + 1}</span>
            <strong style="margin-left: 12px;">${visit.name}</strong>
          </div>
          <div style="font-size: 14px;">
            ${visit.estimatedTime || '30分'}
          </div>
        </div>
        <div class="route-details">
          <h4>${visit.contactType || '医療機関'}</h4>
          <div class="route-meta">
            <div class="meta-item">
              📍 <strong>${visit.distance || '2.5km'}</strong>
            </div>
            <div class="meta-item">
              📈 契約率: <strong>${visit.contractRate || '75%'}</strong>
            </div>
            <div class="meta-item">
              ⏱️ 平均契約日数: <strong>${visit.avgContractDays || '14日'}</strong>
            </div>
            <div class="meta-item">
              📞 最終接触: <strong>${visit.lastContact || '30日前'}</strong>
            </div>
          </div>
          ${visit.notes ? `<div class="route-notes">${visit.notes}</div>` : ''}
        </div>
      </div>
    `).join('');
  },

  showAnalytics(analytics) {
    const analyticsContent = document.getElementById('analyticsContent');
    
    analyticsContent.innerHTML = `
      <div class="analytics-section">
        <h3>📊 営業先分析サマリー</h3>
        <div class="analytics-grid">
          <div class="analytics-item">
            <span class="analytics-value">${analytics.totalTargets || 15}</span>
            <span class="analytics-label">候補先総数</span>
          </div>
          <div class="analytics-item">
            <span class="analytics-value">${analytics.avgContractRate || '68%'}</span>
            <span class="analytics-label">平均契約率</span>
          </div>
          <div class="analytics-item">
            <span class="analytics-value">${analytics.avgContractDays || '18日'}</span>
            <span class="analytics-label">平均契約日数</span>
          </div>
          <div class="analytics-item">
            <span class="analytics-value">${analytics.expectedRevenue || '¥2,400,000'}</span>
            <span class="analytics-label">期待売上</span>
          </div>
        </div>
      </div>
      
      <div class="analytics-section">
        <h3>🎯 戦略別おすすめポイント</h3>
        ${this.getStrategyRecommendations()}
      </div>
    `;
    
    setTimeout(() => {
      document.getElementById('analyticsModal').style.display = 'block';
    }, 1000);
  },

  getStrategyRecommendations() {
    const recommendations = {
      'high-conversion': `
        <p>• 選択された営業先は契約率70%以上の実績があります</p>
        <p>• 特に○○病院は過去90%の契約率を誇る重要顧客です</p>
        <p>• 既存サービスの拡張提案が効果的です</p>
      `,
      'quick-start': `
        <p>• 平均15日以内で契約締結可能な営業先を選定しました</p>
        <p>• 決裁者との直接面談をお勧めします</p>
        <p>• 即決プランの提案準備をしてください</p>
      `,
      'new-development': `
        <p>• 過去接触が少ない新規開拓先を中心に選定</p>
        <p>• 詳細なニーズヒアリングから始めましょう</p>
        <p>• 競合分析資料の準備をお勧めします</p>
      `,
      'improvement': `
        <p>• 契約期間が長期化している先の関係改善が目標</p>
        <p>• 課題解決型のアプローチが効果的です</p>
        <p>• サービス改善提案書を準備してください</p>
      `
    };
    
    return recommendations[this.state.selectedStrategy] || '';
  },

  startNavigation() {
    this.addBotMessage("ナビゲーションを開始します。安全運転でお気をつけください！");
    
    // 実際の実装では外部ナビアプリとの連携
    if (this.state.generatedRoute && this.state.generatedRoute.visits.length > 0) {
      const firstDestination = this.state.generatedRoute.visits[0];
      const destination = firstDestination.address || firstDestination.name;
      
      // Google Maps アプリで開く
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
      window.open(url, '_blank');
    }
    
    document.getElementById('routeModal').style.display = 'none';
  },

  exportRoute() {
    if (!this.state.generatedRoute) return;
    
    const routeData = this.state.generatedRoute;
    const csvData = this.generateCSVData(routeData);
    
    // CSV ダウンロード
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `営業ルート_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    this.addBotMessage("営業ルートをCSVファイルでエクスポートしました。");
  },

  generateCSVData(routeData) {
    const headers = ['順番', '営業先名', '種別', '住所', '契約率', '平均契約日数', '最終接触', '備考'];
    const rows = routeData.visits.map((visit, index) => [
      index + 1,
      visit.name,
      visit.contactType || '医療機関',
      visit.address || '',
      visit.contractRate || '',
      visit.avgContractDays || '',
      visit.lastContact || '',
      visit.notes || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
      
    return '\uFEFF' + csvContent; // BOM付きUTF-8
  },

  resetBot() {
    // 状態リセット
    this.state = {
      currentStep: 'strategy',
      selectedStrategy: null,
      userLocation: null,
      conditions: [],
      maxVisits: 5,
      generatedRoute: null
    };
    
    // UI リセット
    document.querySelectorAll('.strategy-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    document.getElementById('locationStep').style.display = 'none';
    document.getElementById('conditionsStep').style.display = 'none';
    document.getElementById('locationDisplay').style.display = 'none';
    document.querySelector('.manual-location').style.display = 'none';
    
    document.querySelectorAll('input[name="condition"]').forEach(cb => {
      cb.checked = false;
    });
    
    document.getElementById('maxVisits').value = '5';
    document.getElementById('manualLocation').value = '';
    
    // モーダルを閉じる
    document.getElementById('routeModal').style.display = 'none';
    document.getElementById('analyticsModal').style.display = 'none';
    
    // チャットリセット
    document.getElementById('chatMessages').innerHTML = `
      <div class="message bot-message">
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <p>新しい営業ルートを作成しましょう。</p>
          <p>まずは営業戦略を選択してください：</p>
        </div>
      </div>
    `;
  },

  addBotMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <p>${text}</p>
      </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },

  addUserMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
      <div class="message-avatar">👤</div>
      <div class="message-content">
        <p>${text}</p>
      </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },

  showLoading() {
    const overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.id = "loadingOverlay";
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading"></div>
        <p>営業ルート生成中...</p>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  hideLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      overlay.remove();
    }
  }
};

// アプリ初期化
document.addEventListener("DOMContentLoaded", () => {
  SalesBot.init();
});