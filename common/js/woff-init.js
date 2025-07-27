// WOFF共通初期化モジュール - クリーン版 v20250722002
const WOFFManager = {
  profile: null,
  
  async init(woffId) {
    try {
      if (typeof woff === 'undefined') {
        throw new Error('WOFF SDKがロードされていません');
      }
      
      await woff.init({ woffId });
      this.profile = await woff.getProfile();
      
      return this.profile;
    } catch (err) {
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
  
  // Base64画像処理（高圧縮設定）
  async fileToBase64(file, maxWidth = 800, quality = 0.6) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 元画像のサイズを取得
        let { width, height } = img;
        
        // 最大幅を超える場合は縮小
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Canvasサイズを設定
        canvas.width = width;
        canvas.height = height;
        
        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height);
        
        // Base64に変換（JPEG、指定品質）
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64.split(',')[1]);
      };
      
      img.onerror = reject;
      
      // ファイルからData URLを作成
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
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