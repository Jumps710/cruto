// 事故報告フォーム JavaScript

// 設定
const config = {
    woffId: 'EownaFs9auCN-igUa84MDA', // 本番環境のWOFF ID
    gasUrl: 'https://script.google.com/macros/s/AKfycbyaHucPNASJmzi_LLaIBuTAXtxxU-VZx4xOBeSXfbPzur_36Omq25ajThTHZ-M8Jk2lVw/exec'
};

// グローバル変数
let formData = {};
let photoData = {
    scene: [],
    otherVehicle: [],
    ownVehicle: [],
    license: []
};
let userOrganization = '';
let availableOffices = [];

// 初期化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 accident-report DOMContentLoaded開始');
    try {
        console.log('📱 WOFF初期化開始', {woffId: config.woffId});
        
        // WOFF初期化
        const profile = await WOFFManager.init(config.woffId);
        console.log('✅ WOFF初期化完了', profile);
        
        // 報告者名を設定
        document.getElementById('reporter').value = profile.displayName;
        console.log('👤 報告者名設定完了:', profile.displayName);
        
        // ユーザーの組織情報を取得
        console.log('🏢 ユーザー組織情報取得開始:', profile.userId);
        await getUserOrganization(profile.userId);
        
        // 今日の日付を設定
        const today = new Date();
        document.getElementById('incidentDate').value = today.toISOString().split('T')[0];
        console.log('📅 日付設定完了:', today.toISOString().split('T')[0]);
        
        // イベントリスナーの設定
        setupEventListeners();
        console.log('🎧 イベントリスナー設定完了');
        
        console.log('✅ 全初期化処理完了');
        
    } catch (error) {
        console.error('❌ 初期化エラー:', error);
        console.error('エラー詳細:', {
            message: error.message,
            stack: error.stack,
            config: config
        });
        alert('アプリの初期化に失敗しました。LINE WORKSアプリ内で開いてください。');
    }
});

// ユーザーの組織情報を取得
async function getUserOrganization(userId) {
    console.log('🏢 getUserOrganization開始', {userId, gasUrl: config.gasUrl});
    
    try {
        console.log('📡 GAS API呼び出し開始');
        const requestData = {
            action: 'getUserOrganization',
            userId: userId
        };
        console.log('📤 送信データ:', requestData);
        
        let response;
        try {
            // WOFF環境内かチェック
            if (typeof woff !== 'undefined' && woff.isInClient && woff.isInClient()) {
                console.log('🔧 WOFF環境内: woff.proxyCallを使用');
                // WOFF proxyCallを使用
                response = await woff.proxyCall(config.gasUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });
                console.log('📬 woff.proxyCall レスポンス:', response);
            } else {
                console.log('🌐 通常環境: fetchを使用');
                // 通常のfetchを使用（開発環境など）
                response = await fetch(config.gasUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });
            }
        } catch (fetchError) {
            console.error('📛 API呼び出しエラー:', fetchError);
            console.error('エラー詳細:', {
                name: fetchError.name,
                message: fetchError.message,
                stack: fetchError.stack,
                gasUrl: config.gasUrl
            });
            throw new Error('ネットワークエラー: ' + fetchError.message);
        }
        
        let result;
        
        // WOFF proxyCallの場合は直接JSONが返る
        if (typeof woff !== 'undefined' && woff.isInClient && woff.isInClient()) {
            console.log('📬 woff.proxyCall レスポンス（JSON）:', response);
            result = response;
        } else {
            // 通常のfetchの場合
            console.log('📬 fetch レスポンス受信', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            result = await response.json();
        }
        
        console.log('📋 パース結果:', result);
        
        if (result && result.orgUnitName) {
            userOrganization = result.orgUnitName;
            console.log('✅ 組織情報取得成功:', userOrganization);
            
            // 事業所フィールドを設定
            const officeDiv = document.getElementById('office').parentElement;
            console.log('🏗️ 事業所表示エリア更新開始');
            officeDiv.innerHTML = `
                <label class="required">事業所</label>
                <div class="office-display">
                    <span id="currentOffice">${userOrganization}</span>
                    <button type="button" id="changeOfficeBtn" class="btn-change-office">事業所を変更</button>
                </div>
                <select id="office" name="office" style="display: none;" required>
                    <option value="${userOrganization}">${userOrganization}</option>
                </select>
                <span class="error-message">事業所を選択してください</span>
            `;
            
            // 事業所変更ボタンのイベントリスナー
            document.getElementById('changeOfficeBtn').addEventListener('click', showOfficeSelector);
            console.log('🎯 事業所表示エリア更新完了');
            
        } else if (result && Array.isArray(result)) {
            // フォールバック: 事業所一覧を取得した場合
            console.log('⚠️ フォールバック: 事業所一覧取得', result);
            await loadOfficesFromResponse(result);
            
        } else {
            throw new Error('組織情報を取得できませんでした - result: ' + JSON.stringify(result));
        }
        
    } catch (error) {
        console.error('❌ 組織情報取得エラー:', error);
        console.error('エラー詳細:', {
            message: error.message,
            stack: error.stack,
            userId: userId,
            gasUrl: config.gasUrl
        });
        // フォールバック: 手動選択
        console.log('🔄 フォールバック: 事業所一覧取得開始');
        await loadOfficesFromSheet();
    }
}

// Sheetsから事業所一覧を取得
async function loadOfficesFromSheet() {
    console.log('📋 loadOfficesFromSheet開始');
    try {
        console.log('📡 getOffices API呼び出し開始');
        
        let response;
        let offices;
        
        // WOFF環境内かチェック
        if (typeof woff !== 'undefined' && woff.isInClient && woff.isInClient()) {
            console.log('🔧 WOFF環境内: woff.proxyCallを使用');
            // WOFF proxyCallを使用
            offices = await woff.proxyCall(config.gasUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'getOffices'
                })
            });
            console.log('📬 woff.proxyCall レスポンス（JSON）:', offices);
        } else {
            console.log('🌐 通常環境: fetchを使用');
            // 通常のfetchを使用
            response = await fetch(config.gasUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'getOffices'
                })
            });
            
            console.log('📬 getOffices レスポンス受信', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            offices = await response.json();
        }
        
        console.log('📋 事業所一覧パース結果:', offices);
        
        if (offices && Array.isArray(offices)) {
            availableOffices = offices;
            console.log('✅ 事業所一覧取得成功:', offices.length + '件');
            
            // 事業所選択肢を設定
            const officeSelect = document.getElementById('office');
            officeSelect.innerHTML = '<option value="">選択してください</option>';
            
            offices.forEach(office => {
                const option = document.createElement('option');
                option.value = office.value;
                option.textContent = office.name;
                officeSelect.appendChild(option);
            });
            
            officeSelect.style.display = 'block';
        }
        
    } catch (error) {
        console.error('事業所情報取得エラー:', error);
        alert('事業所情報の取得に失敗しました。');
    }
}

// 事業所選択ダイアログを表示
async function showOfficeSelector() {
    if (availableOffices.length === 0) {
        await loadOfficesFromSheet();
    }
    
    // 事業所選択モーダルを表示
    const modalHtml = `
        <div id="officeModal" class="modal show">
            <div class="modal-content">
                <h3>事業所を選択</h3>
                <div class="office-list">
                    ${availableOffices.map(office => `
                        <div class="office-option" data-value="${office.value}">
                            <input type="radio" id="office_${office.value}" name="officeSelect" value="${office.value}">
                            <label for="office_${office.value}">${office.name}</label>
                        </div>
                    `).join('')}
                </div>
                <div class="modal-buttons">
                    <button type="button" id="cancelOfficeBtn" class="btn-cancel">キャンセル</button>
                    <button type="button" id="confirmOfficeBtn" class="btn-confirm">決定</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 現在の選択を設定
    const currentOffice = document.getElementById('office').value || userOrganization;
    const currentRadio = document.querySelector(`input[name="officeSelect"][value="${currentOffice}"]`);
    if (currentRadio) {
        currentRadio.checked = true;
    }
    
    // イベントリスナー
    document.getElementById('cancelOfficeBtn').addEventListener('click', closeOfficeModal);
    document.getElementById('confirmOfficeBtn').addEventListener('click', confirmOfficeSelection);
}

// 事業所選択確定
function confirmOfficeSelection() {
    const selectedOffice = document.querySelector('input[name="officeSelect"]:checked');
    if (selectedOffice) {
        const officeValue = selectedOffice.value;
        const officeName = selectedOffice.nextElementSibling.textContent;
        
        // 表示を更新
        document.getElementById('currentOffice').textContent = officeName;
        document.getElementById('office').value = officeValue;
        
        closeOfficeModal();
    } else {
        alert('事業所を選択してください');
    }
}

// 事業所選択モーダルを閉じる
function closeOfficeModal() {
    const modal = document.getElementById('officeModal');
    if (modal) {
        modal.remove();
    }
}

// イベントリスナーの設定
function setupEventListeners() {
    // 事故種類の選択による表示切替
    document.querySelectorAll('input[name="accidentType"]').forEach(radio => {
        radio.addEventListener('change', handleAccidentTypeChange);
    });
    
    // 対物ありの場合の詳細表示
    document.querySelectorAll('input[name="propertyDamage"]').forEach(radio => {
        radio.addEventListener('change', handlePropertyDamageChange);
    });
    
    // 対人ありの場合の詳細表示
    document.querySelectorAll('input[name="personalInjury"]').forEach(radio => {
        radio.addEventListener('change', handlePersonalInjuryChange);
    });
    
    // 場所分類による詳細場所の表示
    document.getElementById('locationCategory').addEventListener('change', handleLocationCategoryChange);
    
    // 詳細場所でその他を選択した場合
    document.getElementById('detailLocation').addEventListener('change', handleDetailLocationChange);
    
    // GPS取得ボタン
    document.getElementById('getLocationBtn').addEventListener('click', getLocation);
    
    // 写真アップロード
    setupPhotoUpload('scenePhoto', 'scenePhotoUpload', 'scenePhotoPreview', 'scene');
    setupPhotoUpload('otherVehiclePhoto', 'otherVehiclePhotoUpload', 'otherVehiclePhotoPreview', 'otherVehicle');
    setupPhotoUpload('ownVehiclePhoto', 'ownVehiclePhotoUpload', 'ownVehiclePhotoPreview', 'ownVehicle');
    setupPhotoUpload('licensePhoto', 'licensePhotoUpload', 'licensePhotoPreview', 'license');
    
    // 送信ボタン
    document.getElementById('submitBtn').addEventListener('click', showConfirmModal);
    
    // モーダルボタン
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('confirmBtn').addEventListener('click', submitForm);
    
    // エラーメッセージのクリア
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('input', function() {
            clearError(this);
        });
        element.addEventListener('change', function() {
            clearError(this);
        });
    });
}

// 事故種類変更時の処理
function handleAccidentTypeChange(e) {
    const vehicleSection = document.getElementById('vehicleSection');
    const otherLocationSection = document.getElementById('otherLocationSection');
    const vehiclePhotos = document.getElementById('vehiclePhotos');
    
    if (e.target.value === 'vehicle') {
        vehicleSection.classList.add('active');
        vehiclePhotos.classList.add('active');
        otherLocationSection.style.display = 'none';
    } else {
        vehicleSection.classList.remove('active');
        vehiclePhotos.classList.remove('active');
        otherLocationSection.style.display = 'block';
    }
}

// 対物選択時の処理
function handlePropertyDamageChange(e) {
    const propertyDetails = document.getElementById('propertyDetails');
    if (e.target.value === 'yes') {
        propertyDetails.classList.add('active');
    } else {
        propertyDetails.classList.remove('active');
    }
}

// 対人選択時の処理
function handlePersonalInjuryChange(e) {
    const injuryDetails = document.getElementById('injuryDetails');
    const licensePhotoDiv = document.getElementById('licensePhotoDiv');
    
    if (e.target.value === 'yes') {
        injuryDetails.classList.add('active');
        licensePhotoDiv.style.display = 'block';
    } else {
        injuryDetails.classList.remove('active');
        licensePhotoDiv.style.display = 'none';
    }
}

// 場所分類変更時の処理
function handleLocationCategoryChange(e) {
    const detailLocationDiv = document.getElementById('detailLocationDiv');
    const otherLocationDiv = document.getElementById('otherLocationDiv');
    const detailLocation = document.getElementById('detailLocation');
    
    // 選択肢をクリア
    detailLocation.innerHTML = '<option value="">選択してください</option>';
    
    const locationOptions = {
        visit: ['利用者宅', '移動中', 'その他'],
        child: ['送迎中', '訓練中', 'その他'],
        facility: ['施設内', '施設外', 'その他']
    };
    
    if (e.target.value && locationOptions[e.target.value]) {
        detailLocationDiv.style.display = 'block';
        otherLocationDiv.style.display = 'none';
        
        locationOptions[e.target.value].forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            detailLocation.appendChild(option);
        });
    } else {
        detailLocationDiv.style.display = 'none';
        otherLocationDiv.style.display = 'none';
    }
}

// 詳細場所変更時の処理
function handleDetailLocationChange(e) {
    const otherLocationDiv = document.getElementById('otherLocationDiv');
    if (e.target.value === 'その他') {
        otherLocationDiv.style.display = 'block';
    } else {
        otherLocationDiv.style.display = 'none';
    }
}

// GPS位置情報取得
function getLocation() {
    const locationInput = document.getElementById('location');
    const loading = Utils.showLoading(locationInput.parentElement, 'GPS取得中...');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                locationInput.value = `緯度: ${lat}, 経度: ${lng}`;
                Utils.hideLoading(loading);
                clearError(locationInput);
            },
            function(error) {
                Utils.hideLoading(loading);
                alert('位置情報の取得に失敗しました。手動で入力してください。');
            }
        );
    } else {
        Utils.hideLoading(loading);
        alert('お使いのブラウザは位置情報をサポートしていません。');
    }
}

// 写真アップロード設定
function setupPhotoUpload(inputId, uploadDivId, previewId, photoType) {
    const input = document.getElementById(inputId);
    const uploadDiv = document.getElementById(uploadDivId);
    const preview = document.getElementById(previewId);
    
    uploadDiv.addEventListener('click', () => input.click());
    
    input.addEventListener('change', async function(e) {
        preview.innerHTML = '';
        photoData[photoType] = [];
        
        for (const file of Array.from(e.target.files)) {
            if (file.type.startsWith('image/')) {
                try {
                    const base64 = await Utils.fileToBase64(file);
                    photoData[photoType].push({
                        name: file.name,
                        data: base64
                    });
                    
                    // プレビュー表示
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        preview.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    console.error('画像処理エラー:', error);
                }
            }
        }
        
        if (photoType === 'scene' && photoData[photoType].length > 0) {
            clearError(input);
        }
    });
}

// エラー表示クリア
function clearError(element) {
    const errorMsg = element.parentElement.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.classList.remove('show');
    }
}

// エラー表示
function showError(element) {
    const errorMsg = element.parentElement.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.classList.add('show');
    }
}

// バリデーション
function validateForm() {
    let isValid = true;
    
    // 必須項目のチェック
    const requiredFields = ['incidentDate', 'incidentTime', 'accidentDetails'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            showError(field);
            isValid = false;
        }
    });
    
    // 事業所のチェック
    const office = document.getElementById('office').value;
    if (!office) {
        alert('事業所が設定されていません');
        isValid = false;
    }
    
    // 事故種類の選択チェック
    if (!document.querySelector('input[name="accidentType"]:checked')) {
        const radioGroup = document.querySelector('.radio-group');
        showError(radioGroup);
        isValid = false;
    }
    
    // 事故現場の写真チェック
    if (photoData.scene.length === 0) {
        showError(document.getElementById('scenePhoto'));
        isValid = false;
    }
    
    // 車両事故の場合の追加チェック
    const accidentType = document.querySelector('input[name="accidentType"]:checked');
    if (accidentType && accidentType.value === 'vehicle') {
        // 運転手名
        const driverName = document.getElementById('driverName');
        if (!driverName.value) {
            showError(driverName);
            isValid = false;
        }
        
        // 対物・対人の選択
        if (!document.querySelector('input[name="propertyDamage"]:checked')) {
            isValid = false;
        }
        if (!document.querySelector('input[name="personalInjury"]:checked')) {
            isValid = false;
        }
        
        // 対物ありの場合の詳細
        const propertyDamage = document.querySelector('input[name="propertyDamage"]:checked');
        if (propertyDamage && propertyDamage.value === 'yes') {
            const propertyDetails = document.getElementById('propertyDetailsText');
            if (!propertyDetails.value) {
                showError(propertyDetails);
                isValid = false;
            }
        }
        
        // 対人ありの場合の詳細
        const personalInjury = document.querySelector('input[name="personalInjury"]:checked');
        if (personalInjury && personalInjury.value === 'yes') {
            const injuryDetails = document.getElementById('injuryDetailsText');
            if (!injuryDetails.value) {
                showError(injuryDetails);
                isValid = false;
            }
        }
        
        // 発生場所
        const location = document.getElementById('location');
        if (!location.value) {
            showError(location);
            isValid = false;
        }
    } else {
        // その他の場合の場所チェック
        const locationCategory = document.getElementById('locationCategory');
        if (!locationCategory.value) {
            showError(locationCategory);
            isValid = false;
        }
        
        if (locationCategory.value) {
            const detailLocation = document.getElementById('detailLocation');
            if (!detailLocation.value) {
                showError(detailLocation);
                isValid = false;
            }
            
            if (detailLocation.value === 'その他') {
                const otherLocation = document.getElementById('otherLocation');
                if (!otherLocation.value) {
                    showError(otherLocation);
                    isValid = false;
                }
            }
        }
    }
    
    return isValid;
}

// 確認モーダル表示
function showConfirmModal() {
    if (!validateForm()) {
        alert('必須項目を入力してください');
        return;
    }
    
    // フォームデータ収集
    collectFormData();
    
    // 確認内容の生成
    const confirmContent = document.getElementById('confirmContent');
    confirmContent.innerHTML = generateConfirmContent();
    
    // モーダル表示
    document.getElementById('confirmModal').classList.add('show');
}

// フォームデータ収集
function collectFormData() {
    const form = document.getElementById('accidentReportForm');
    formData = Utils.formToObject(form);
    
    // 手動で値を設定
    formData.office = document.getElementById('office').value || userOrganization;
    
    // チェックボックスの値を収集
    const injuryTypes = [];
    document.querySelectorAll('input[name="injuryType"]:checked').forEach(cb => {
        injuryTypes.push(cb.value);
    });
    formData.injuryTypes = injuryTypes;
    
    // 写真データを追加
    formData.photos = photoData;
}

// 確認内容生成
function generateConfirmContent() {
    const accidentType = formData.accidentType === 'vehicle' ? '車両事故' : 'その他';
    const office = formData.office || userOrganization;
    
    let html = `
        <p><strong>報告者:</strong> ${formData.reporter}</p>
        <p><strong>事業所:</strong> ${office}</p>
        <p><strong>発生日:</strong> ${Utils.formatDate(formData.incidentDate)}</p>
        <p><strong>発生時刻:</strong> ${Utils.formatTime(formData.incidentTime)}</p>
        <p><strong>事故種類:</strong> ${accidentType}</p>
    `;
    
    if (formData.accidentType === 'vehicle') {
        html += `
            <p><strong>運転手:</strong> ${formData.driverName}</p>
            <p><strong>対物:</strong> ${formData.propertyDamage === 'yes' ? 'あり' : 'なし'}</p>
            <p><strong>対人:</strong> ${formData.personalInjury === 'yes' ? 'あり' : 'なし'}</p>
            <p><strong>発生場所:</strong> ${formData.location}</p>
        `;
    } else {
        const categorySelect = document.getElementById('locationCategory');
        const locationCategory = categorySelect.options[categorySelect.selectedIndex].text;
        html += `<p><strong>場所分類:</strong> ${locationCategory}</p>`;
        
        if (formData.detailLocation) {
            html += `<p><strong>詳細場所:</strong> ${formData.detailLocation}</p>`;
        }
        if (formData.otherLocation) {
            html += `<p><strong>その他の場所:</strong> ${formData.otherLocation}</p>`;
        }
    }
    
    html += `
        <p><strong>事故詳細:</strong><br>${formData.accidentDetails.replace(/\n/g, '<br>')}</p>
        <p><strong>写真:</strong> 事故現場 ${photoData.scene.length}枚`;
    
    if (formData.accidentType === 'vehicle') {
        if (photoData.otherVehicle.length > 0) {
            html += `, 相手の車 ${photoData.otherVehicle.length}枚`;
        }
        if (photoData.ownVehicle.length > 0) {
            html += `, 自分の車 ${photoData.ownVehicle.length}枚`;
        }
        if (photoData.license.length > 0) {
            html += `, 免許証 ${photoData.license.length}枚`;
        }
    }
    
    html += '</p>';
    
    return html;
}

// モーダルを閉じる
function closeModal() {
    document.getElementById('confirmModal').classList.remove('show');
}

// フォーム送信
async function submitForm() {
    const submitBtn = document.getElementById('confirmBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';
    
    try {
        // タイムスタンプ追加
        formData.timestamp = new Date().toISOString();
        formData.userId = WOFFManager.getUserId();
        formData.department = WOFFManager.getDepartment();
        
        console.log('送信データ:', formData);
        
        // GASに送信
        const response = await fetch(config.gasUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'submitAccidentReport',
                data: formData
            })
        });
        
        const result = await response.json();
        console.log('GAS応答:', result);
        
        if (result.success) {
            // 成功時は結果画面へ遷移
            localStorage.setItem('reportResult', JSON.stringify({
                success: true,
                reportId: result.reportId,
                timestamp: formData.timestamp
            }));
            window.location.href = 'result.html';
        } else {
            throw new Error(result.error || '送信に失敗しました');
        }
        
    } catch (error) {
        console.error('送信エラー:', error);
        alert('送信に失敗しました。もう一度お試しください。\nエラー: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = '送信する';
    }
}