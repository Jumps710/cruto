// 入退院報告WOFF JavaScript
const HospitalReport = {
  // 設定
  config: {
    woffId: "YOUR_WOFF_ID", // 実際のWOFF IDに変更
    gasUrl: "https://script.google.com/macros/s/YOUR_GAS_URL/exec" // 実際のGAS URLに変更
  },
  
  // データ
  offices: [],
  users: [],
  hospitals: [],
  
  // 自動補完の状態
  autocomplete: {
    users: {
      currentIndex: -1,
      suggestions: []
    },
    hospitals: {
      currentIndex: -1,
      suggestions: []
    }
  },

  async init() {
    try {
      // WOFF初期化
      const profile = await WOFFManager.init(this.config.woffId);
      this.setUserInfo(profile);
      
      // マスタデータを取得
      await Promise.all([
        this.loadOffices(),
        this.loadUsers(),
        this.loadHospitals()
      ]);
      
      // イベントリスナー設定
      this.setupEventListeners();
      
      console.log("✅ 入退院報告アプリ初期化完了");
    } catch (error) {
      console.error("❌ 初期化エラー:", error);
      this.showError("アプリの初期化に失敗しました");
    }
  },

  setUserInfo(profile) {
    const reporterInput = document.getElementById("reporter");
    if (reporterInput && profile) {
      reporterInput.value = profile.displayName || "";
    }
  },

  async loadOffices() {
    try {
      const response = await fetch(`${this.config.gasUrl}?action=getOffices`);
      const result = await response.json();
      
      if (result.status === "success") {
        this.offices = result.data;
        this.populateOfficeSelect();
      }
    } catch (error) {
      console.error("事業所リスト取得エラー:", error);
      // フォールバック
      this.offices = [
        { id: "main", name: "本社" },
        { id: "branch1", name: "支社1" }
      ];
      this.populateOfficeSelect();
    }
  },

  async loadUsers() {
    try {
      const response = await fetch(`${this.config.gasUrl}?action=getUsers`);
      const result = await response.json();
      
      if (result.status === "success") {
        this.users = result.data;
      }
    } catch (error) {
      console.error("利用者リスト取得エラー:", error);
      // フォールバック用ダミーデータ
      this.users = [
        { id: "user1", name: "山田太郎", office: "本社", birthDate: "1950-01-01" },
        { id: "user2", name: "佐藤花子", office: "支社1", birthDate: "1955-03-15" }
      ];
    }
  },

  async loadHospitals() {
    try {
      const response = await fetch(`${this.config.gasUrl}?action=getHospitals`);
      const result = await response.json();
      
      if (result.status === "success") {
        this.hospitals = result.data;
      }
    } catch (error) {
      console.error("医療機関リスト取得エラー:", error);
      // フォールバック用ダミーデータ
      this.hospitals = [
        { id: "hosp1", name: "○○総合病院", area: "エリア1", address: "○○市○○町1-1" },
        { id: "hosp2", name: "△△クリニック", area: "エリア2", address: "△△市△△町2-2" }
      ];
    }
  },

  populateOfficeSelect() {
    const select = document.getElementById("office");
    this.offices.forEach(office => {
      const option = document.createElement("option");
      option.value = office.id;
      option.textContent = office.name;
      select.appendChild(option);
    });
  },

  setupEventListeners() {
    const form = document.getElementById("hospitalForm");
    const modal = document.getElementById("modal");
    const closeModal = document.querySelector(".close");
    const confirmBtn = document.getElementById("confirmSubmit");
    const editBtn = document.getElementById("editBtn");

    // 脱落理由の変更
    document.querySelectorAll('input[name="dropoutReason"]').forEach(radio => {
      radio.addEventListener("change", this.handleDropoutReasonChange.bind(this));
    });

    // 診断名の変更（入院）
    document.querySelectorAll('input[name="diagnosis"]').forEach(radio => {
      radio.addEventListener("change", this.handleDiagnosisChange.bind(this));
    });

    // 利用者名の自動補完
    this.setupAutocomplete("userName", "userSuggestions", this.searchUsers.bind(this));

    // 医療機関の自動補完
    this.setupAutocomplete("hospital", "hospitalSuggestions", this.searchHospitals.bind(this));

    // フォーム送信
    form.addEventListener("submit", this.handleFormSubmit.bind(this));

    // モーダル
    closeModal.addEventListener("click", () => modal.style.display = "none");
    editBtn.addEventListener("click", () => modal.style.display = "none");
    confirmBtn.addEventListener("click", this.handleConfirmSubmit.bind(this));

    // モーダル外クリック
    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  },

  handleDropoutReasonChange(e) {
    const hospitalizationSection = document.getElementById("hospitalizationSection");
    const discontinuationSection = document.getElementById("discontinuationSection");
    const dischargeDateLabel = document.getElementById("dischargeDateLabel");
    
    if (e.target.value === "hospitalization") {
      hospitalizationSection.style.display = "block";
      discontinuationSection.style.display = "none";
      dischargeDateLabel.textContent = "退院日:";
      
      // 必須項目の設定
      document.querySelector('input[name="hospitalizationDate"]').required = true;
      document.querySelector('input[name="hospital"]').required = true;
      document.querySelector('input[name="discontinuationDate"]').required = false;
      document.querySelector('textarea[name="discontinuationDiagnosis"]').required = false;
    } else {
      hospitalizationSection.style.display = "none";
      discontinuationSection.style.display = "block";
      dischargeDateLabel.textContent = "再開日:";
      
      // 必須項目の設定
      document.querySelector('input[name="hospitalizationDate"]').required = false;
      document.querySelector('input[name="hospital"]').required = false;
      document.querySelector('input[name="discontinuationDate"]').required = true;
      document.querySelector('textarea[name="discontinuationDiagnosis"]').required = true;
    }
  },

  handleDiagnosisChange(e) {
    const otherDiagnosisGroup = document.getElementById("otherDiagnosisGroup");
    const otherDiagnosisInput = document.querySelector('input[name="otherDiagnosis"]');
    
    if (e.target.value === "その他") {
      otherDiagnosisGroup.style.display = "block";
      otherDiagnosisInput.required = true;
    } else {
      otherDiagnosisGroup.style.display = "none";
      otherDiagnosisInput.required = false;
    }
  },

  setupAutocomplete(inputId, suggestionsId, searchFunction) {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);
    const autocompleteType = inputId === "userName" ? "users" : "hospitals";
    
    let debounceTimer;

    input.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim();
      
      if (query.length < 1) {
        this.hideSuggestions(suggestionsId);
        return;
      }
      
      debounceTimer = setTimeout(() => {
        searchFunction(query, suggestionsId);
      }, 300);
    });

    input.addEventListener("keydown", (e) => {
      const currentSuggestions = this.autocomplete[autocompleteType].suggestions;
      const currentIndex = this.autocomplete[autocompleteType].currentIndex;
      
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          this.navigateSuggestions(autocompleteType, "down", suggestionsId);
          break;
        case "ArrowUp":
          e.preventDefault();
          this.navigateSuggestions(autocompleteType, "up", suggestionsId);
          break;
        case "Enter":
          e.preventDefault();
          if (currentIndex >= 0 && currentSuggestions[currentIndex]) {
            this.selectSuggestion(autocompleteType, currentIndex, inputId, suggestionsId);
          }
          break;
        case "Escape":
          this.hideSuggestions(suggestionsId);
          break;
      }
    });

    // フォーカスアウト時の処理
    input.addEventListener("blur", (e) => {
      // 少し遅延させてクリックイベントを処理できるようにする
      setTimeout(() => {
        this.hideSuggestions(suggestionsId);
      }, 200);
    });
  },

  searchUsers(query, suggestionsId) {
    const filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.office.toLowerCase().includes(query.toLowerCase())
    );

    this.autocomplete.users.suggestions = filteredUsers;
    this.autocomplete.users.currentIndex = -1;
    this.displaySuggestions(filteredUsers, suggestionsId, this.formatUserSuggestion);
  },

  searchHospitals(query, suggestionsId) {
    const filteredHospitals = this.hospitals.filter(hospital =>
      hospital.name.toLowerCase().includes(query.toLowerCase()) ||
      hospital.area.toLowerCase().includes(query.toLowerCase()) ||
      hospital.address.toLowerCase().includes(query.toLowerCase())
    );

    this.autocomplete.hospitals.suggestions = filteredHospitals;
    this.autocomplete.hospitals.currentIndex = -1;
    this.displaySuggestions(filteredHospitals, suggestionsId, this.formatHospitalSuggestion);
  },

  formatUserSuggestion(user) {
    return `
      <div class="suggestion-primary">${user.name}</div>
      <div class="suggestion-secondary">${user.office} - ${user.birthDate}</div>
    `;
  },

  formatHospitalSuggestion(hospital) {
    return `
      <div class="suggestion-primary">${hospital.name}</div>
      <div class="suggestion-secondary">${hospital.area} - ${hospital.address}</div>
    `;
  },

  displaySuggestions(items, suggestionsId, formatFunction) {
    const suggestions = document.getElementById(suggestionsId);
    
    if (items.length === 0) {
      suggestions.innerHTML = '<div class="suggestion-item">該当する項目が見つかりません</div>';
      suggestions.style.display = "block";
      return;
    }

    suggestions.innerHTML = items.map((item, index) => {
      return `<div class="suggestion-item" data-index="${index}">${formatFunction(item)}</div>`;
    }).join("");

    // クリックイベントの設定
    suggestions.querySelectorAll(".suggestion-item").forEach((item, index) => {
      item.addEventListener("click", () => {
        const autocompleteType = suggestionsId.includes("user") ? "users" : "hospitals";
        const inputId = suggestionsId.includes("user") ? "userName" : "hospital";
        this.selectSuggestion(autocompleteType, index, inputId, suggestionsId);
      });
    });

    suggestions.style.display = "block";
  },

  navigateSuggestions(autocompleteType, direction, suggestionsId) {
    const suggestions = this.autocomplete[autocompleteType].suggestions;
    const currentIndex = this.autocomplete[autocompleteType].currentIndex;
    let newIndex;

    if (direction === "down") {
      newIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1;
    }

    this.autocomplete[autocompleteType].currentIndex = newIndex;
    this.highlightSuggestion(suggestionsId, newIndex);
  },

  highlightSuggestion(suggestionsId, index) {
    const suggestions = document.getElementById(suggestionsId);
    const items = suggestions.querySelectorAll(".suggestion-item");
    
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add("highlighted");
      } else {
        item.classList.remove("highlighted");
      }
    });
  },

  selectSuggestion(autocompleteType, index, inputId, suggestionsId) {
    const suggestion = this.autocomplete[autocompleteType].suggestions[index];
    const input = document.getElementById(inputId);
    
    if (suggestion) {
      input.value = suggestion.name;
      this.hideSuggestions(suggestionsId);
      
      // 選択成功のフィードバック
      input.classList.add("field-success");
      setTimeout(() => {
        input.classList.remove("field-success");
      }, 1000);
    }
  },

  hideSuggestions(suggestionsId) {
    const suggestions = document.getElementById(suggestionsId);
    suggestions.style.display = "none";
    suggestions.innerHTML = "";
  },

  handleFormSubmit(e) {
    e.preventDefault();
    
    // バリデーション
    if (!this.validateForm()) {
      return;
    }
    
    // 確認モーダルを表示
    this.showConfirmationModal();
  },

  validateForm() {
    let isValid = true;
    const form = document.getElementById("hospitalForm");
    const formData = new FormData(form);
    
    // 必須項目のチェック
    const requiredFields = form.querySelectorAll("[required]");
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add("field-error");
        isValid = false;
      } else {
        field.classList.remove("field-error");
      }
    });
    
    if (!isValid) {
      this.showError("必須項目を入力してください");
    }
    
    return isValid;
  },

  showConfirmationModal() {
    const form = document.getElementById("hospitalForm");
    const formData = new FormData(form);
    const modal = document.getElementById("modal");
    const summary = document.getElementById("modalSummary");
    
    const data = Object.fromEntries(formData.entries());
    
    let summaryHTML = `
      <div class="summary-section">
        <h4>基本情報</h4>
        <p><strong>報告者:</strong> ${WOFFManager.getDisplayName()}</p>
        <p><strong>事業所:</strong> ${this.getOfficeName(data.office)}</p>
        <p><strong>発生日時:</strong> ${Utils.formatDate(data.date)} ${Utils.formatTime(data.time)}</p>
      </div>
      
      <div class="summary-section">
        <h4>利用者情報</h4>
        <p><strong>利用者名:</strong> ${data.userName}</p>
        <p><strong>脱落理由:</strong> ${data.dropoutReason === 'hospitalization' ? '入院' : '中止'}</p>
      </div>
    `;
    
    // 入院詳細
    if (data.dropoutReason === 'hospitalization') {
      const diagnosisText = data.diagnosis === 'その他' ? data.otherDiagnosis : data.diagnosis;
      summaryHTML += `
        <div class="summary-section">
          <h4>入院詳細</h4>
          <p><strong>入院日:</strong> ${Utils.formatDate(data.hospitalizationDate)}</p>
          <p><strong>入院先:</strong> ${data.hospital}</p>
          <p><strong>診断名:</strong> ${diagnosisText}</p>
        </div>
      `;
    }
    
    // 中止詳細
    if (data.dropoutReason === 'discontinuation') {
      summaryHTML += `
        <div class="summary-section">
          <h4>中止詳細</h4>
          <p><strong>中止日:</strong> ${Utils.formatDate(data.discontinuationDate)}</p>
          <p><strong>診断名:</strong> ${data.discontinuationDiagnosis}</p>
        </div>
      `;
    }
    
    // 今後の予定
    summaryHTML += `
      <div class="summary-section">
        <h4>今後の予定</h4>
        ${data.dischargeDate ? `<p><strong>${data.dropoutReason === 'hospitalization' ? '退院日' : '再開日'}:</strong> ${Utils.formatDate(data.dischargeDate)}</p>` : ''}
        <p><strong>契約状況:</strong> ${data.contractEnded ? '契約終了' : '契約継続'}</p>
      </div>
    `;
    
    // 備考
    if (data.notes) {
      summaryHTML += `
        <div class="summary-section">
          <h4>備考</h4>
          <p>${data.notes}</p>
        </div>
      `;
    }
    
    summary.innerHTML = summaryHTML;
    modal.style.display = "block";
  },

  getOfficeName(officeId) {
    const office = this.offices.find(o => o.id === officeId);
    return office ? office.name : officeId;
  },

  async handleConfirmSubmit() {
    const form = document.getElementById("hospitalForm");
    const formData = new FormData(form);
    const modal = document.getElementById("modal");
    
    // ローディング表示
    this.showLoading();
    
    try {
      const data = Object.fromEntries(formData.entries());
      
      // APIに送信するデータ
      const submitData = {
        action: "submit",
        reporter: WOFFManager.getDisplayName(),
        userId: WOFFManager.getUserId(),
        office: data.office,
        date: data.date,
        time: data.time,
        userName: data.userName,
        dropoutReason: data.dropoutReason,
        contractEnded: data.contractEnded === "true",
        notes: data.notes || ""
      };
      
      // 入院の場合
      if (data.dropoutReason === "hospitalization") {
        submitData.hospitalizationDate = data.hospitalizationDate;
        submitData.hospital = data.hospital;
        submitData.diagnosis = data.diagnosis === "その他" ? data.otherDiagnosis : data.diagnosis;
        submitData.dischargeDate = data.dischargeDate;
      }
      
      // 中止の場合
      if (data.dropoutReason === "discontinuation") {
        submitData.discontinuationDate = data.discontinuationDate;
        submitData.discontinuationDiagnosis = data.discontinuationDiagnosis;
        submitData.restartDate = data.dischargeDate;
      }
      
      // GASに送信
      const response = await fetch(this.config.gasUrl, {
        method: "POST",
        body: new URLSearchParams(submitData)
      });
      
      const result = await response.json();
      
      if (result.status === "success") {
        // 成功時は完了画面に遷移
        window.location.href = "result.html";
      } else {
        throw new Error(result.message || "送信に失敗しました");
      }
      
    } catch (error) {
      console.error("送信エラー:", error);
      this.showError("送信中にエラーが発生しました: " + error.message);
    } finally {
      this.hideLoading();
      modal.style.display = "none";
    }
  },

  showLoading() {
    const overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.id = "loadingOverlay";
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading"></div>
        <p>送信中...</p>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  hideLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      overlay.remove();
    }
  },

  showError(message) {
    // 既存のエラーメッセージを削除
    const existingError = document.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }
    
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    
    const container = document.querySelector(".container");
    container.insertBefore(errorDiv, container.firstChild);
    
    // スクロールしてエラーメッセージを表示
    errorDiv.scrollIntoView({ behavior: "smooth", block: "center" });
    
    // 5秒後に自動削除
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }
};

// アプリ初期化
document.addEventListener("DOMContentLoaded", () => {
  HospitalReport.init();
});