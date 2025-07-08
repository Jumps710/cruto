// 事故報告WOFF JavaScript
const AccidentReport = {
  // 設定
  config: {
    woffId: "8Fo2NCnUsmTkXxVSzJ5CNQ", // 実際のWOFF IDに変更
    gasUrl: "https://script.google.com/macros/s/YOUR_GAS_URL/exec" // 実際のGAS URLに変更
  },
  
  // データ
  photos: {},
  offices: [],
  
  // 位置情報設定
  locationOptions: {
    visiting: [
      { value: "user_home", text: "ご利用者宅" },
      { value: "other", text: "その他" }
    ],
    pediatric: [
      { value: "activity_space", text: "活動スペース" },
      { value: "toilet", text: "トイレ" },
      { value: "outdoor", text: "屋外" },
      { value: "other", text: "その他" }
    ],
    facility: [
      { value: "room", text: "居室" },
      { value: "common_space", text: "共有スペース" },
      { value: "toilet", text: "トイレ" },
      { value: "bathroom", text: "浴室" },
      { value: "courtyard", text: "中庭" },
      { value: "entrance", text: "玄関前" },
      { value: "parking", text: "駐車場" },
      { value: "stairs", text: "階段" },
      { value: "other", text: "その他" }
    ]
  },

  async init() {
    try {
      // WOFF初期化
      const profile = await WOFFManager.init(this.config.woffId);
      this.setUserInfo(profile);
      
      // 事業所リストを取得
      await this.loadOffices();
      
      // イベントリスナー設定
      this.setupEventListeners();
      
      console.log("✅ 事故報告アプリ初期化完了");
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
      // フォールバック用のデフォルト事業所
      this.offices = [
        { id: "main", name: "本社", address: "" },
        { id: "branch1", name: "支社1", address: "" }
      ];
      this.populateOfficeSelect();
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
    const form = document.getElementById("accidentForm");
    const modal = document.getElementById("modal");
    const closeModal = document.querySelector(".close");
    const confirmBtn = document.getElementById("confirmSubmit");
    const editBtn = document.getElementById("editBtn");

    // 事故種類の変更
    document.querySelectorAll('input[name="accidentType"]').forEach(radio => {
      radio.addEventListener("change", this.handleAccidentTypeChange.bind(this));
    });

    // 発生場所の変更
    document.getElementById("location").addEventListener("change", this.handleLocationChange.bind(this));

    // 対人の変更（車両事故）
    document.querySelectorAll('input[name="personalDamage"]').forEach(radio => {
      radio.addEventListener("change", this.handlePersonalDamageChange.bind(this));
    });

    // 位置情報取得
    document.getElementById("getLocationBtn").addEventListener("click", this.getCurrentLocation.bind(this));

    // 写真アップロード
    ["photo1", "photo2", "photo3", "photo4"].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("change", (e) => this.handlePhotoUpload(e, id));
      }
    });

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

  handleAccidentTypeChange(e) {
    const vehicleSection = document.getElementById("vehicleAccidentSection");
    const vehiclePhotoSection = document.getElementById("vehiclePhotoSection");
    
    if (e.target.value === "vehicle") {
      vehicleSection.style.display = "block";
      vehiclePhotoSection.style.display = "block";
      // 車両事故の場合は必須項目を設定
      document.querySelector('input[name="driverName"]').required = true;
    } else {
      vehicleSection.style.display = "none";
      vehiclePhotoSection.style.display = "none";
      // その他の場合は必須解除
      document.querySelector('input[name="driverName"]').required = false;
    }
  },

  handleLocationChange(e) {
    const locationDetail = document.getElementById("locationDetail");
    const locationDetailGroup = document.getElementById("locationDetailGroup");
    const locationOtherGroup = document.getElementById("locationOtherGroup");
    
    // 既存のオプションをクリア
    locationDetail.innerHTML = '<option value="">選択してください</option>';
    
    if (e.target.value && this.locationOptions[e.target.value]) {
      // 詳細選択肢を表示
      locationDetailGroup.style.display = "block";
      
      this.locationOptions[e.target.value].forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        locationDetail.appendChild(optionElement);
      });
      
      // その他選択時の処理
      locationDetail.addEventListener("change", (event) => {
        if (event.target.value === "other") {
          locationOtherGroup.style.display = "block";
          document.getElementById("locationOther").required = true;
        } else {
          locationOtherGroup.style.display = "none";
          document.getElementById("locationOther").required = false;
        }
      });
    } else {
      locationDetailGroup.style.display = "none";
      locationOtherGroup.style.display = "none";
    }
  },

  handlePersonalDamageChange(e) {
    const injuryDetails = document.getElementById("injuryDetails");
    const licensePhotoGroup = document.getElementById("licensePhotoGroup");
    
    if (e.target.value === "あり") {
      injuryDetails.style.display = "block";
      licensePhotoGroup.style.display = "block";
    } else {
      injuryDetails.style.display = "none";
      licensePhotoGroup.style.display = "none";
    }
  },

  async getCurrentLocation() {
    const btn = document.getElementById("getLocationBtn");
    const locationInput = document.getElementById("locationGPS");
    
    btn.disabled = true;
    btn.textContent = "取得中...";
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      locationInput.value = `緯度: ${latitude.toFixed(6)}, 経度: ${longitude.toFixed(6)}`;
      
      // 逆ジオコーディング（オプション）
      try {
        const address = await this.reverseGeocode(latitude, longitude);
        if (address) {
          locationInput.value += ` (${address})`;
        }
      } catch (error) {
        console.warn("住所取得に失敗:", error);
      }
      
    } catch (error) {
      console.error("位置情報取得エラー:", error);
      this.showError("位置情報の取得に失敗しました。手動で入力してください。");
    } finally {
      btn.disabled = false;
      btn.textContent = "現在地を取得";
    }
  },

  async reverseGeocode(lat, lng) {
    // 実際のプロジェクトではGoogle Maps APIなどを使用
    // ここではダミー実装
    return null;
  },

  async handlePhotoUpload(event, inputId) {
    const file = event.target.files[0];
    const fileNameSpan = event.target.nextElementSibling;
    const previewDiv = document.getElementById(`preview${inputId.slice(-1)}`);
    
    if (file) {
      try {
        fileNameSpan.textContent = file.name;
        
        // Base64変換
        const base64 = await Utils.fileToBase64(file);
        this.photos[inputId] = {
          base64: base64,
          name: file.name,
          type: this.getPhotoType(inputId)
        };
        
        // プレビュー表示
        const img = document.createElement("img");
        img.src = `data:image/jpeg;base64,${base64}`;
        previewDiv.innerHTML = "";
        previewDiv.appendChild(img);
        
      } catch (error) {
        console.error("画像処理エラー:", error);
        this.showError("画像の処理に失敗しました");
      }
    } else {
      fileNameSpan.textContent = "ファイル未選択";
      previewDiv.innerHTML = "";
      delete this.photos[inputId];
    }
  },

  getPhotoType(inputId) {
    const types = {
      photo1: "scene",
      photo2: "other_car",
      photo3: "my_car",
      photo4: "license"
    };
    return types[inputId] || "other";
  },

  handleFormSubmit(e) {
    e.preventDefault();
    
    // 写真の必須チェック
    if (Object.keys(this.photos).length === 0) {
      this.showError("最低1枚の写真をアップロードしてください");
      return;
    }
    
    // 確認モーダルを表示
    this.showConfirmationModal();
  },

  showConfirmationModal() {
    const form = document.getElementById("accidentForm");
    const formData = new FormData(form);
    const modal = document.getElementById("modal");
    const summary = document.getElementById("modalSummary");
    
    const data = Object.fromEntries(formData.entries());
    
    // 負傷詳細の処理
    const injuryTypes = Array.from(document.querySelectorAll('input[name="injuryType"]:checked'))
      .map(cb => cb.value);
    
    let summaryHTML = `
      <div class="summary-section">
        <h4>基本情報</h4>
        <p><strong>報告者:</strong> ${WOFFManager.getDisplayName()}</p>
        <p><strong>事業所:</strong> ${this.getOfficeName(data.office)}</p>
        <p><strong>発生日時:</strong> ${Utils.formatDate(data.date)} ${Utils.formatTime(data.time)}</p>
        <p><strong>事故種類:</strong> ${data.accidentType === 'vehicle' ? '車両事故' : 'その他'}</p>
      </div>
      
      <div class="summary-section">
        <h4>発生場所</h4>
        <p><strong>場所:</strong> ${this.getLocationText(data.location, data.locationDetail, data.locationOther)}</p>
      </div>
    `;
    
    // 車両事故の詳細
    if (data.accidentType === 'vehicle') {
      summaryHTML += `
        <div class="summary-section">
          <h4>車両事故詳細</h4>
          <p><strong>運転手:</strong> ${data.driverName}</p>
          <p><strong>対物:</strong> ${data.propertyDamage}</p>
          <p><strong>対人:</strong> ${data.personalDamage}</p>
          ${injuryTypes.length > 0 ? `<p><strong>負傷:</strong> ${injuryTypes.join(', ')}</p>` : ''}
          ${data.locationGPS ? `<p><strong>GPS位置:</strong> ${data.locationGPS}</p>` : ''}
        </div>
      `;
    }
    
    summaryHTML += `
      <div class="summary-section">
        <h4>事故内容</h4>
        <p>${data.details}</p>
      </div>
      
      <div class="summary-section">
        <h4>写真</h4>
        <div class="photo-summary">
    `;
    
    Object.values(this.photos).forEach(photo => {
      summaryHTML += `
        <div class="summary-photo">
          <img src="data:image/jpeg;base64,${photo.base64}" style="max-width: 100px; max-height: 100px;">
          <p>${photo.name}</p>
        </div>
      `;
    });
    
    summaryHTML += `</div></div>`;
    
    summary.innerHTML = summaryHTML;
    modal.style.display = "block";
  },

  getOfficeName(officeId) {
    const office = this.offices.find(o => o.id === officeId);
    return office ? office.name : officeId;
  },

  getLocationText(location, detail, other) {
    const locationTexts = {
      visiting: "訪看",
      pediatric: "小児",
      facility: "施設"
    };
    
    let text = locationTexts[location] || location;
    
    if (detail) {
      const detailOption = this.locationOptions[location]?.find(opt => opt.value === detail);
      text += ` - ${detailOption?.text || detail}`;
      
      if (detail === "other" && other) {
        text += ` (${other})`;
      }
    }
    
    return text;
  },

  async handleConfirmSubmit() {
    const form = document.getElementById("accidentForm");
    const formData = new FormData(form);
    const modal = document.getElementById("modal");
    
    // ローディング表示
    this.showLoading();
    
    try {
      // 送信データの準備
      const data = Object.fromEntries(formData.entries());
      
      // 負傷詳細の収集
      const injuryTypes = Array.from(document.querySelectorAll('input[name="injuryType"]:checked'))
        .map(cb => cb.value);
      
      const injuries = {
        types: injuryTypes,
        detail: data.injuryDetail || ""
      };
      
      // 位置情報の処理
      const locationGPS = data.locationGPS || data.locationManual || "";
      
      // APIに送信するデータ
      const submitData = {
        action: "submit",
        reporter: WOFFManager.getDisplayName(),
        userId: WOFFManager.getUserId(),
        office: data.office,
        date: data.date,
        time: data.time,
        accidentType: data.accidentType,
        location: data.location,
        locationDetail: data.locationDetail === "other" ? data.locationOther : data.locationDetail,
        details: data.details,
        photos: JSON.stringify(Object.values(this.photos))
      };
      
      // 車両事故の追加データ
      if (data.accidentType === "vehicle") {
        submitData.driverName = data.driverName;
        submitData.propertyDamage = data.propertyDamage;
        submitData.personalDamage = data.personalDamage;
        submitData.injuries = JSON.stringify(injuries);
        submitData.locationGPS = locationGPS;
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
    
    // 3秒後に自動削除
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }
};

// アプリ初期化
document.addEventListener("DOMContentLoaded", () => {
  AccidentReport.init();
});