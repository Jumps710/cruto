// 入退院報告フォーム JavaScript

// 設定
const config = {
    woffId: 'Exth8PXun2d80vxUyBamIw', // 本番環境のWOFF ID
    gasUrl: 'https://script.google.com/macros/s/AKfycbyaHucPNASJmzi_LLaIBuTAXtxxU-VZx4xOBeSXfbPzur_36Omq25ajThTHZ-M8Jk2lVw/exec'
};

// グローバル変数
let formData = {};
let userOrganization = '';
let availableOffices = [];
let users = [];
let hospitals = [];

// 初期化
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // WOFF初期化
        const profile = await WOFFManager.init(config.woffId);
        
        // 報告者名を設定
        document.getElementById('reporter').value = profile.displayName;
        
        // ユーザーの組織情報を取得
        await getUserOrganization(profile.userId);
        
        // 今日の日付を設定
        const today = new Date();
        document.getElementById('incidentDate').value = today.toISOString().split('T')[0];
        
        // マスタデータを取得
        await loadMasterData();
        
        // イベントリスナーの設定
        setupEventListeners();
        
    } catch (error) {
        console.error('初期化エラー:', error);
        alert('アプリの初期化に失敗しました。LINE WORKSアプリ内で開いてください。');
    }
});

// ユーザーの組織情報を取得
async function getUserOrganization(userId) {
    try {
        const response = await fetch(config.gasUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getUserOrganization',
                userId: userId
            })
        });
        
        const result = await response.json();
        
        if (result && result.orgUnitName) {
            userOrganization = result.orgUnitName;
            
            // 事業所フィールドを設定
            document.getElementById('currentOffice').textContent = userOrganization;
            document.getElementById('office').value = userOrganization;
            
        } else {
            throw new Error('組織情報を取得できませんでした');
        }
        
    } catch (error) {
        console.error('組織情報取得エラー:', error);
        // フォールバック: 手動選択
        await loadOfficesFromSheet();
    }
}

// Sheetsから事業所一覧を取得
async function loadOfficesFromSheet() {
    try {
        const response = await fetch(config.gasUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getOffices'
            })
        });
        
        const offices = await response.json();
        
        if (offices && Array.isArray(offices)) {
            availableOffices = offices;
            
            // 事業所選択肢を設定
            const officeSelect = document.getElementById('office');
            officeSelect.innerHTML = '<option value="">選択してください</option>';
            
            offices.forEach(office => {
                const option = document.createElement('option');
                option.value = office.value;
                option.textContent = office.name;
                officeSelect.appendChild(option);
            });
            
            // 表示を変更
            document.querySelector('.office-display').style.display = 'none';
            officeSelect.style.display = 'block';
        }
        
    } catch (error) {
        console.error('事業所情報取得エラー:', error);
        alert('事業所情報の取得に失敗しました。');
    }
}

// マスタデータ取得
async function loadMasterData() {
    try {
        // 利用者マスタと医療機関マスタを並行で取得
        const [usersResponse, hospitalsResponse] = await Promise.all([
            fetch(config.gasUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'getUsers' })
            }),
            fetch(config.gasUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'getHospitals' })
            })
        ]);
        
        const usersData = await usersResponse.json();
        const hospitalsData = await hospitalsResponse.json();
        
        if (usersData && Array.isArray(usersData)) {
            users = usersData;
        }
        
        if (hospitalsData && Array.isArray(hospitalsData)) {
            hospitals = hospitalsData;
        }
        
    } catch (error) {
        console.error('マスタデータ取得エラー:', error);
    }
}

// 事業所選択ダイアログを表示
async function showOfficeSelector() {
    if (availableOffices.length === 0) {
        await loadOfficesFromSheet();
    }
    
    // 事業所選択モーダルを表示
    const officeList = document.getElementById('officeList');
    officeList.innerHTML = availableOffices.map(office => `
        <div class="office-option" data-value="${office.value}">
            <input type="radio" id="office_${office.value}" name="officeSelect" value="${office.value}">
            <label for="office_${office.value}">${office.name}</label>
        </div>
    `).join('');
    
    // 現在の選択を設定
    const currentOffice = document.getElementById('office').value || userOrganization;
    const currentRadio = officeList.querySelector(`input[value="${currentOffice}"]`);
    if (currentRadio) {
        currentRadio.checked = true;
    }
    
    document.getElementById('officeModal').classList.add('show');
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
    document.getElementById('officeModal').classList.remove('show');
}

// イベントリスナーの設定
function setupEventListeners() {
    // 脱落理由の選択による表示切替
    document.querySelectorAll('input[name="reason"]').forEach(radio => {
        radio.addEventListener('change', handleReasonChange);
    });
    
    // 診断名で「その他」を選択した場合
    document.getElementById('hospitalDiagnosis').addEventListener('change', function() {
        const otherDiv = document.getElementById('hospitalOtherDiagnosis');
        if (this.value === 'その他') {
            otherDiv.style.display = 'block';
        } else {
            otherDiv.style.display = 'none';
        }
    });
    
    // 自動補完機能
    setupAutocomplete('userName', 'userSuggestions', users, 'name', 'reading');
    setupAutocomplete('hospitalName', 'hospitalSuggestions', hospitals, 'name', 'area');
    
    // 事業所変更ボタン
    const changeOfficeBtn = document.getElementById('changeOfficeBtn');
    if (changeOfficeBtn) {
        changeOfficeBtn.addEventListener('click', showOfficeSelector);
    }
    
    // 送信ボタン
    document.getElementById('submitBtn').addEventListener('click', showConfirmModal);
    
    // モーダルボタン
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('confirmBtn').addEventListener('click', submitForm);
    
    // 事業所モーダルボタン
    document.getElementById('cancelOfficeBtn').addEventListener('click', closeOfficeModal);
    document.getElementById('confirmOfficeBtn').addEventListener('click', confirmOfficeSelection);
    
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

// 脱落理由変更時の処理
function handleReasonChange(e) {
    const hospitalSection = document.getElementById('hospitalSection');
    const stopSection = document.getElementById('stopSection');
    
    if (e.target.value === 'hospital') {
        hospitalSection.classList.add('active');
        stopSection.classList.remove('active');
    } else {
        hospitalSection.classList.remove('active');
        stopSection.classList.add('active');
    }
}

// 自動補完機能の設定
function setupAutocomplete(inputId, suggestionsId, dataArray, nameField, subField) {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);
    let selectedIndex = -1;
    
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        suggestions.innerHTML = '';
        selectedIndex = -1;
        
        if (value.length < 1) {
            suggestions.classList.remove('show');
            return;
        }
        
        const filtered = dataArray.filter(item => 
            item[nameField].toLowerCase().includes(value) ||
            (item[subField] && item[subField].toLowerCase().includes(value))
        ).slice(0, 10);
        
        if (filtered.length > 0) {
            suggestions.innerHTML = filtered.map((item, index) => `
                <div class="suggestion-item" data-index="${index}" data-value="${item[nameField]}">
                    <div class="suggestion-name">${item[nameField]}</div>
                    ${item[subField] ? `<div class="suggestion-reading">${item[subField]}</div>` : ''}
                </div>
            `).join('');
            
            suggestions.classList.add('show');
            
            // クリックイベント
            suggestions.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', function() {
                    input.value = this.dataset.value;
                    suggestions.classList.remove('show');
                    clearError(input);
                });
            });
        } else {
            suggestions.classList.remove('show');
        }
    });
    
    // キーボード操作
    input.addEventListener('keydown', function(e) {
        const items = suggestions.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            input.value = items[selectedIndex].dataset.value;
            suggestions.classList.remove('show');
            clearError(input);
        } else if (e.key === 'Escape') {
            suggestions.classList.remove('show');
        }
    });
    
    function updateSelection(items) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
    
    // フォーカスを失った時に候補を非表示
    input.addEventListener('blur', function() {
        setTimeout(() => {
            suggestions.classList.remove('show');
        }, 200);
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
    const requiredFields = ['incidentDate', 'incidentTime', 'userName'];
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
    
    // 脱落理由の選択チェック
    const reason = document.querySelector('input[name="reason"]:checked');
    if (!reason) {
        const radioGroup = document.querySelector('.radio-group');
        showError(radioGroup);
        isValid = false;
    }
    
    // 入院の場合の追加チェック
    if (reason && reason.value === 'hospital') {
        const hospitalFields = ['hospitalDate', 'hospitalName', 'hospitalDiagnosis'];
        hospitalFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value) {
                showError(field);
                isValid = false;
            }
        });
        
        // その他の診断名のチェック
        const diagnosis = document.getElementById('hospitalDiagnosis');
        if (diagnosis.value === 'その他') {
            const otherDiagnosis = document.getElementById('hospitalOtherDiagnosisText');
            if (!otherDiagnosis.value) {
                showError(otherDiagnosis);
                isValid = false;
            }
        }
    }
    
    // 中止の場合の追加チェック
    if (reason && reason.value === 'stop') {
        const stopFields = ['stopDate', 'stopDiagnosis'];
        stopFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value) {
                showError(field);
                isValid = false;
            }
        });
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
    const form = document.getElementById('hospitalReportForm');
    formData = Utils.formToObject(form);
    
    // 手動で値を設定
    formData.office = document.getElementById('office').value || userOrganization;
    formData.reason = document.querySelector('input[name="reason"]:checked').value;
    formData.contractEnd = document.getElementById('contractEnd').checked;
}

// 確認内容生成
function generateConfirmContent() {
    const reason = formData.reason === 'hospital' ? '入院' : '中止';
    const office = formData.office || userOrganization;
    
    let html = `
        <p><strong>報告者:</strong> ${formData.reporter}</p>
        <p><strong>事業所:</strong> ${office}</p>
        <p><strong>発生日付:</strong> ${Utils.formatDate(formData.incidentDate)}</p>
        <p><strong>発生時間:</strong> ${Utils.formatTime(formData.incidentTime)}</p>
        <p><strong>利用者名:</strong> ${formData.userName}</p>
        <p><strong>脱落理由:</strong> ${reason}</p>
    `;
    
    if (formData.reason === 'hospital') {
        html += `
            <p><strong>入院日:</strong> ${Utils.formatDate(formData.hospitalDate)}</p>
            <p><strong>入院先:</strong> ${formData.hospitalName}</p>
            <p><strong>診断名:</strong> ${formData.hospitalDiagnosis === 'その他' ? formData.hospitalOtherDiagnosisText : formData.hospitalDiagnosis}</p>
        `;
    } else {
        html += `
            <p><strong>中止日:</strong> ${Utils.formatDate(formData.stopDate)}</p>
            <p><strong>診断名:</strong> ${formData.stopDiagnosis}</p>
        `;
    }
    
    if (formData.resumeDate) {
        html += `<p><strong>退院日・再開日:</strong> ${Utils.formatDate(formData.resumeDate)}</p>`;
    }
    
    if (formData.contractEnd) {
        html += `<p><strong>契約終了:</strong> はい</p>`;
    }
    
    if (formData.remarks) {
        html += `<p><strong>備考:</strong><br>${formData.remarks.replace(/\n/g, '<br>')}</p>`;
    }
    
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
                action: 'submitHospitalReport',
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