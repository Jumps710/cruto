// WOFF共通初期化モジュール - クリーン版 v20250722002
const WOFFManager = {
  profile: null,
  
  async init(woffId) {
    try {
      // woff SDKが存在するか確認
      if (typeof woff === 'undefined') {
        throw new Error('WOFF SDKがロードされていません');
      }
      
      await woff.init({ woffId });
      
      if (!woff.isInClient()) {
        // 開発環境での実行を許可
        // throw new Error("このアプリはLINE WORKSアプリ内でのみ使用できます。");
      }
      
      this.profile = await woff.getProfile();
      
      return this.profile;
    } catch (err) {
      console.error("[ERROR] WOFF初期化エラー:", err);
      throw err;
    }
  },
  
  getDisplayName() {
    return this.profile?.displayName || "";
  },
  
  getUserId() {
    return this.profile?.userId || "";
  },
  
  getDepartment() {
    return this.profile?.department || "";
  }
};

// 共通ユーティリティ
const Utils = {
  // フォームデータをオブジェクトに変換
  formToObject(form) {
    const formData = new FormData(form);
    const obj = {};
    for (let [key, value] of formData.entries()) {
      obj[key] = value;
    }
    return obj;
  },
  
  // 日付フォーマット
  formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  },
  
  // 時刻フォーマット
  formatTime(time) {
    const [h, m] = time.split(':');
    return `${h}時${m}分`;
  },
  
  // Base64画像処理
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  
  // ローディング表示
  showLoading(element, message = "処理中...") {
    const loading = document.createElement("div");
    loading.className = "loading-container";
    loading.innerHTML = `<span>${message}</span><div class="loading"></div>`;
    element.appendChild(loading);
    return loading;
  },
  
  hideLoading(loadingElement) {
    if (loadingElement) {
      loadingElement.remove();
    }
  }
};