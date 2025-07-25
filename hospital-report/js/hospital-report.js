// 入退院報告フォーム JavaScript

// 設定
const config = {
    woffId: 'Exth8PXun2d80vxUyBamIw', // 本番環境のWOFF ID
    gasUrl: 'https://script.google.com/macros/s/AKfycbyL58-LDmfXvfXkYbj-LL9PPrnDZreH0RPg1-io0xgdNgICh30_VUBa1SZebAqk4hBxoA/exec'
};

// グローバル変数
let formData = {};
let userOrganization = '';
let availableOffices = [];
let users = [];
let hospitals = [];

// 初期化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 hospital-report DOMContentLoaded開始');
    
    // まず最初にイベントリスナーを設定（フォーム操作を即座に有効化）
    setupEventListeners();
    console.log('🎧 イベントリスナー設定完了（優先実行）');
    
    // 今日の日付を即座に設定
    const today = new Date();
    document.getElementById('incidentDate').value = today.toISOString().split('T')[0];
    console.log('📅 日付設定完了:', today.toISOString().split('T')[0]);
    
    try {
        console.log('📱 WOFF初期化開始', {woffId: config.woffId});
        
        // WOFF初期化
        const profile = await WOFFManager.init(config.woffId);
        console.log('✅ WOFF初期化完了', profile);
        
        // 報告者名を設定
        document.getElementById('reporter').value = profile.displayName;
        console.log('👤 報告者名設定完了:', profile.displayName);
        
        // ユーザーの組織情報を非同期で取得（ブロッキングしない）
        console.log('🏢 ユーザー組織情報取得開始:', profile.userId);
        getUserOrganization(profile.userId).then(() => {
            console.log('✅ 組織情報取得完了');
        }).catch(error => {
            console.error('❌ 組織情報取得エラー:', error);
        });
        
        // マスタデータを非同期で取得（ブロッキングしない）
        console.log('📊 マスタデータ取得開始');
        loadMasterData().then(() => {
            console.log('✅ マスタデータ取得完了');
        }).catch(error => {
            console.error('❌ マスタデータ取得エラー:', error);
        });
        
        console.log('✅ 基本初期化処理完了（組織情報・マスタデータは並行取得中）');
        
    } catch (error) {
        console.error('❌ 初期化エラー:', error);
        console.error('エラー詳細:', {
            message: error.message,
            stack: error.stack,
            config: config
        });
        
        // WOFF初期化に失敗しても、フォームは使えるようにする
        document.getElementById('reporter').value = 'テストユーザー';
        
        // デフォルトの事業所選択肢を表示
        const officeContainer = document.getElementById('officeContainer');
        const officeSelect = document.getElementById('office');
        
        // ローディングメッセージを削除
        officeContainer.innerHTML = '';
        
        // selectを表示
        officeSelect.innerHTML = `
            <option value="">選択してください</option>
            <option value="本社">本社</option>
            <option value="関東支店">関東支店</option>
            <option value="関西支店">関西支店</option>
        `;
        officeSelect.style.display = 'block';
        
        console.log('⚠️ WOFF初期化失敗 - フォームは動作可能状態');
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
        let result;
        
        try {
            console.log('🌐 GAS API呼び出し開始');
            // GETリクエストでパラメータとして送信（CORS回避）
            const params = new URLSearchParams(requestData);
            const getUrl = `${config.gasUrl}?${params.toString()}`;
            console.log('🌐 GET URL:', getUrl);
            
            response = await fetch(getUrl, {
                method: 'GET',
                redirect: 'follow',
                mode: 'cors'
            });
            
            console.log('📬 レスポンス受信', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            result = await response.json();
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
        
        console.log('📋 パース結果:', result);
        
        if (result && result.orgUnitName) {
            userOrganization = result.orgUnitName;
            console.log('✅ 組織情報取得成功:', userOrganization);
            
            // 事業所フィールドを設定
            const officeContainer = document.getElementById('officeContainer');
            const officeSelect = document.getElementById('office');
            
            console.log('🏗️ 事業所表示エリア更新開始');
            
            // ローディングメッセージを削除
            officeContainer.innerHTML = '';
            
            // 取得した組織をデフォルトとして設定し、selectを表示
            officeSelect.innerHTML = `<option value="${userOrganization}">${userOrganization}</option>`;
            officeSelect.value = userOrganization;
            officeSelect.style.display = 'block';
            
            // 事業所一覧を非同期で取得してプルダウンに追加
            loadOfficesFromSheet().then(() => {
                // 事業所一覧取得後、現在の組織が先頭に表示されるよう調整
                if (availableOffices.length > 0) {
                    const currentOption = `<option value="${userOrganization}" selected>${userOrganization}</option>`;
                    const otherOptions = availableOffices
                        .filter(office => office.value !== userOrganization)
                        .map(office => `<option value="${office.value}">${office.name}</option>`)
                        .join('');
                    officeSelect.innerHTML = currentOption + otherOptions;
                }
            }).catch(error => {
                console.error('事業所一覧の取得に失敗:', error);
            });
            
            console.log('🎯 事業所表示エリア更新完了');
            
        } else if (result && Array.isArray(result)) {
            // フォールバック: 事業所一覧を取得した場合
            console.log('⚠️ フォールバック: 事業所一覧取得', result);
            loadOfficesFromAPIResponse(result);
            
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

// APIレスポンスから事業所一覧を設定
function loadOfficesFromAPIResponse(offices) {
    console.log('📋 loadOfficesFromAPIResponse開始');
    
    const officeContainer = document.getElementById('officeContainer');
    const officeSelect = document.getElementById('office');
    
    if (offices && Array.isArray(offices)) {
        availableOffices = offices;
        console.log('✅ 事業所一覧取得成功:', offices.length + '件');
        
        // ローディングメッセージを削除
        officeContainer.innerHTML = '';
        
        // 事業所選択肢を設定
        officeSelect.innerHTML = '<option value="">選択してください</option>';
        
        offices.forEach(office => {
            const option = document.createElement('option');
            option.value = office.value;
            option.textContent = office.name;
            officeSelect.appendChild(option);
        });
        
        officeSelect.style.display = 'block';
    } else {
        console.log('⚠️ 無効な事業所データ');
        loadOfficesFromSheet();
    }
}

// Sheetsから事業所一覧を取得（最適化版 - GET方式・キャッシュ・タイムアウト）
async function loadOfficesFromSheet() {
    console.log('📋 loadOfficesFromSheet開始（入退院報告最適化版）');
    
    try {
        console.log('📡 getOffices API呼び出し開始（GET方式 + 5秒タイムアウト）');
        
        // Promise.raceでタイムアウト制御（短めに設定）
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('タイムアウト: 5秒以内に応答がありませんでした')), 5000);
        });
        
        // GET方式でパラメータ送信
        const requestData = { action: 'getOffices' };
        const params = new URLSearchParams(requestData);
        const getUrl = `${config.gasUrl}?${params.toString()}`;
        
        const fetchPromise = fetch(getUrl, {
            method: 'GET',
            redirect: 'follow',
            mode: 'cors'
        });
        
        console.log('🌐 GET URL:', getUrl);
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        console.log('📬 getOffices レスポンス受信', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const offices = await response.json();
        console.log('📋 事業所一覧パース結果:', offices);
        
        if (offices && Array.isArray(offices)) {
            availableOffices = offices;
            console.log('✅ 事業所一覧取得成功:', offices.length + '件');
            
            // 現在のofficeSelectの状態を確認
            const officeSelect = document.getElementById('office');
            if (officeSelect.style.display === 'none') {
                // まだ表示されていない場合のみ、ローディングメッセージを削除
                const officeContainer = document.getElementById('officeContainer');
                officeContainer.innerHTML = '';
                
                officeSelect.innerHTML = '<option value="">選択してください</option>';
                
                offices.forEach(office => {
                    const option = document.createElement('option');
                    option.value = office.value;
                    option.textContent = office.name;
                    officeSelect.appendChild(option);
                });
                
                officeSelect.style.display = 'block';
            }
        } else {
            throw new Error('事業所データが無効な形式です');
        }
        
    } catch (error) {
        console.error('事業所情報取得エラー:', error);
        
        // フォールバック: 基本的な事業所選択肢を提供
        console.log('🔄 フォールバック: 基本事業所選択肢を提供');
        
        const defaultOffices = [
            { value: '本社', name: '本社' },
            { value: '関東支店', name: '関東支店' },
            { value: '関西支店', name: '関西支店' }
        ];
        
        availableOffices = defaultOffices;
        
        const officeContainer = document.getElementById('officeContainer');
        const officeSelect = document.getElementById('office');
        
        officeContainer.innerHTML = '';
        officeSelect.innerHTML = '<option value="">選択してください</option>';
        
        defaultOffices.forEach(office => {
            const option = document.createElement('option');
            option.value = office.value;
            option.textContent = office.name;
            officeSelect.appendChild(option);
        });
        
        officeSelect.style.display = 'block';
        
        // 非ブロッキング通知
        setTimeout(() => {
            alert('事業所情報の取得に時間がかかっています。基本的な選択肢を表示しています。');
        }, 100);
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

// 不要な関数を削除（プルダウン選択に変更したため）

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