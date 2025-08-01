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

// キャッシュ機能
const cache = {
    offices: null,
    officesExpiry: null
};

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
        
        // リアルタイム検索を使用するため、マスタデータの事前取得は不要
        
        console.log('✅ 基本初期化処理完了（組織情報は並行取得中）');
        
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
        
        // ローディングメッセージのみを削除
        const loadingMsg = officeContainer.querySelector('.loading-message');
        if (loadingMsg) loadingMsg.remove();
        
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
    try {
        const requestData = {
            action: 'getUserOrganization',
            userId: userId
        };
        
        let response;
        let result;
        
        try {
            // GETリクエストでパラメータとして送信（CORS回避）
            const params = new URLSearchParams(requestData);
            const getUrl = `${config.gasUrl}?${params.toString()}`;
            
            console.log('[DEBUG] getUserOrganization リクエスト送信:', {
                url: getUrl,
                userId: requestData.userId,
                gasUrl: config.gasUrl
            });
            
            response = await fetch(getUrl, {
                method: 'GET',
                redirect: 'follow',
                mode: 'cors'
            });
            
            console.log('[DEBUG] getUserOrganization レスポンス受信:', {
                status: response.status,
                ok: response.ok,
                statusText: response.statusText
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // レスポンステキストを先に取得してログ出力
            const responseText = await response.text();
            
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('レスポンスのJSON解析に失敗: ' + parseError.message);
            }
        } catch (fetchError) {
            throw new Error('ネットワークエラー: ' + fetchError.message);
        }
        
        if (result && result.orgUnitName) {
            userOrganization = result.orgUnitName;
            
            console.log('[DEBUG] 組織情報取得成功:', {
                orgUnitName: result.orgUnitName,
                userOrganization: userOrganization
            });
            
            // 事業所フィールドを設定
            const officeContainer = document.getElementById('officeContainer');
            const officeSelect = document.getElementById('office');
            
            console.log('[DEBUG] DOM要素取得:', {
                officeContainer: !!officeContainer,
                officeSelect: !!officeSelect,
                officeContainerHTML: officeContainer ? officeContainer.innerHTML : 'null',
                officeSelectStyle: officeSelect ? officeSelect.style.display : 'null'
            });
            
            if (!officeContainer || !officeSelect) {
                console.error('[ERROR] 事業所DOM要素が見つかりません:', {
                    officeContainer: !!officeContainer,
                    officeSelect: !!officeSelect
                });
                return;
            }
            
            console.log('🏗️ 事業所表示エリア更新開始');
            
            // ローディングメッセージを削除
            console.log('[DEBUG] ローディングメッセージ削除前:', officeContainer.innerHTML);
            officeContainer.innerHTML = '';
            console.log('[DEBUG] ローディングメッセージ削除後:', officeContainer.innerHTML);
            
            // 取得した組織をデフォルトとして設定し、selectを表示
            const optionHTML = `<option value="${userOrganization}">${userOrganization}</option>`;
            console.log('[DEBUG] 設定するオプションHTML:', optionHTML);
            
            officeSelect.innerHTML = optionHTML;
            officeSelect.value = userOrganization;
            officeSelect.style.display = 'block';
            
            console.log('[DEBUG] 事業所設定完了:', {
                innerHTML: officeSelect.innerHTML,
                value: officeSelect.value,
                display: officeSelect.style.display,
                selectedIndex: officeSelect.selectedIndex
            });
            
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
        
        // ローディングメッセージのみを削除
        const loadingMsg = officeContainer.querySelector('.loading-message');
        if (loadingMsg) loadingMsg.remove();
        
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

// Sheetsから事業所一覧を取得（事故報告アプリと同じ成功パターン）
async function loadOfficesFromSheet() {
    // キャッシュチェック
    if (cache.offices && cache.officesExpiry && Date.now() < cache.officesExpiry) {
        return loadOfficesFromCache();
    }
    
    try {
        // 事業所情報取得開始
        // Promise.raceでタイムアウト制御
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('タイムアウト: 10秒以内に応答がありませんでした')), 10000);
        });
        
        // GET方式でパラメータ送信（getUserOrganizationと同じ成功パターン）
        const requestData = {
            action: 'getOffices'
        };
        const params = new URLSearchParams(requestData);
        const getUrl = `${config.gasUrl}?${params.toString()}`;
        
        console.log('[DEBUG] getOffices リクエスト送信:', {
            url: getUrl,
            action: requestData.action,
            gasUrl: config.gasUrl
        });
        
        const fetchPromise = fetch(getUrl, {
            method: 'GET',
            redirect: 'follow',
            mode: 'cors'
        });
        
        console.log('[DEBUG] fetchPromise作成完了、レスポンス待機中...');
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const offices = await response.json();
        
        if (offices && Array.isArray(offices)) {
            // キャッシュに保存（5分間有効）
            cache.offices = offices;
            cache.officesExpiry = Date.now() + (5 * 60 * 1000);
            
            availableOffices = offices;
            
            const officeContainer = document.getElementById('officeContainer');
            const officeSelect = document.getElementById('office');
            
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
            throw new Error('無効な事業所データ');
        }
        
    } catch (error) {
        console.error('事業所情報取得エラー:', error);
        // フォールバック: デフォルト事業所
        loadDefaultOffices();
    }
}

// キャッシュから事業所一覧を読み込み
function loadOfficesFromCache() {
    if (cache.offices && Array.isArray(cache.offices)) {
        availableOffices = cache.offices;
        
        const officeContainer = document.getElementById('officeContainer');
        const officeSelect = document.getElementById('office');
        
        // ローディングメッセージのみを削除
        const loadingMsg = officeContainer.querySelector('.loading-message');
        if (loadingMsg) loadingMsg.remove();
        
        // 事業所選択肢を設定
        officeSelect.innerHTML = '<option value="">選択してください</option>';
        
        cache.offices.forEach(office => {
            const option = document.createElement('option');
            option.value = office.value;
            option.textContent = office.name;
            officeSelect.appendChild(option);
        });
        
        officeSelect.style.display = 'block';
    } else {
        loadDefaultOffices();
    }
}

// デフォルト事業所の設定
function loadDefaultOffices() {
    const defaultOffices = [
        { value: '本社', name: '本社' },
        { value: '関東支店', name: '関東支店' },
        { value: '関西支店', name: '関西支店' }
    ];
    
    availableOffices = defaultOffices;
    
    const officeContainer = document.getElementById('officeContainer');
    const officeSelect = document.getElementById('office');
    
    // ローディングメッセージのみを削除
    const loadingMsg = officeContainer.querySelector('.loading-message');
    if (loadingMsg) loadingMsg.remove();
    
    // 事業所選択肢を設定
    officeSelect.innerHTML = '<option value="">選択してください</option>';
    
    defaultOffices.forEach(office => {
        const option = document.createElement('option');
        option.value = office.value;
        option.textContent = office.name;
        officeSelect.appendChild(option);
    });
    
    officeSelect.style.display = 'block';
}

// マスタデータはリアルタイム検索で取得するため、事前取得関数は不要

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
    
    // リアルタイム検索機能
    console.log('[DEBUG] オートコンプリート機能初期化開始');
    try {
        setupUserAutocomplete();
        console.log('[DEBUG] 利用者オートコンプリート初期化完了');
        
        setupHospitalAutocomplete();
        console.log('[DEBUG] 医療機関オートコンプリート初期化完了');
        
        // テスト1: 基本API接続テスト
        console.log('[TEST] 基本API接続テスト開始');
        fetch(config.gasUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                console.log('[TEST] 基本API接続結果:', data);
            })
            .catch(error => {
                console.error('[TEST] 基本API接続エラー:', error);
            });
        
        // テスト2: searchUsers APIを直接呼び出し
        console.log('[TEST] searchUsers API直接テスト開始');
        const testParams = new URLSearchParams({
            action: 'searchUsers',
            query: '山田'
        });
        const testUrl = `${config.gasUrl}?${testParams.toString()}`;
        console.log('[TEST] テストURL:', testUrl);
        
        fetch(testUrl, {
            method: 'GET',
            mode: 'cors'
        }).then(response => {
            console.log('[TEST] searchUsers テストレスポンス:', {
                status: response.status,
                ok: response.ok,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });
            return response.text();
        }).then(responseText => {
            console.log('[TEST] searchUsers レスポンステキスト:', responseText);
            try {
                const data = JSON.parse(responseText);
                console.log('[TEST] searchUsers テスト結果:', data);
            } catch (parseError) {
                console.error('[TEST] JSON parse エラー:', parseError);
                console.log('[TEST] Raw response:', responseText);
            }
        }).catch(error => {
            console.error('[TEST] searchUsers テストエラー:', error);
        });
        
    } catch (autocompleteError) {
        console.error('[ERROR] オートコンプリート初期化エラー:', autocompleteError);
    }
    
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

// 利用者検索オートコンプリート
function setupUserAutocomplete() {
    const input = document.getElementById('userName');
    const suggestions = document.getElementById('userSuggestions');
    let selectedIndex = -1;
    let searchTimeout = null;
    
    console.log('[DEBUG] setupUserAutocomplete 実行開始');
    console.log('[DEBUG] DOM要素確認:', {
        input: !!input,
        suggestions: !!suggestions,
        inputId: input ? input.id : 'null',
        suggestionsId: suggestions ? suggestions.id : 'null'
    });
    
    if (!input || !suggestions) {
        console.error('[ERROR] 利用者検索用DOM要素が見つかりません:', {
            input: !!input,
            suggestions: !!suggestions
        });
        return;
    }
    
    input.addEventListener('input', function() {
        const query = this.value.trim();
        console.log('[DEBUG] 利用者検索入力イベント:', {
            query: query,
            length: query.length
        });
        
        suggestions.innerHTML = '';
        selectedIndex = -1;
        
        if (query.length < 1) {
            suggestions.classList.remove('show');
            console.log('[DEBUG] クエリが短すぎるため検索をスキップ');
            return;
        }
        
        console.log('[DEBUG] 検索リクエスト準備:', {
            query: query,
            gasUrl: config.gasUrl
        });
        
        // 検索リクエストを遅延実行（300ms）
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            try {
                const params = new URLSearchParams({
                    action: 'searchUsers',
                    query: query
                });
                
                const requestUrl = `${config.gasUrl}?${params.toString()}`;
                console.log('[DEBUG] 利用者検索API呼び出し:', {
                    url: requestUrl,
                    query: query
                });
                
                const response = await fetch(requestUrl, {
                    method: 'GET',
                    mode: 'cors'
                });
                
                console.log('[DEBUG] 利用者検索APIレスポンス:', {
                    status: response.status,
                    ok: response.ok,
                    statusText: response.statusText
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const results = await response.json();
                console.log('[DEBUG] 利用者検索結果:', {
                    results: results,
                    length: results ? results.length : 0
                });
                
                if (results && results.length > 0) {
                    const suggestionsHTML = results.map((user, index) => `
                        <div class="suggestion-item" data-index="${index}" data-value="${user.name}">
                            <div class="suggestion-name">${user.name}</div>
                            ${user.status ? `<div class="suggestion-reading">${user.status}</div>` : ''}
                        </div>
                    `).join('');
                    
                    console.log('[DEBUG] サジェスト表示:', {
                        suggestionsHTML: suggestionsHTML,
                        resultCount: results.length,
                        suggestionsElement: suggestions,
                        suggestionsVisible: suggestions.offsetParent !== null,
                        suggestionsRect: suggestions.getBoundingClientRect()
                    });
                    
                    suggestions.innerHTML = suggestionsHTML;
                    suggestions.classList.add('show');
                    
                    // 強制的に表示
                    suggestions.style.display = 'block';
                    suggestions.style.visibility = 'visible';
                    suggestions.style.opacity = '1';
                    
                    console.log('[DEBUG] サジェスト表示完了:', {
                        innerHTML: suggestions.innerHTML,
                        classList: suggestions.classList.toString(),
                        computedStyle: window.getComputedStyle(suggestions),
                        offsetParent: suggestions.offsetParent,
                        clientRect: suggestions.getBoundingClientRect()
                    });
                    
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
            } catch (error) {
                console.error('[ERROR] 利用者検索エラー:', {
                    error: error.message,
                    stack: error.stack,
                    query: query,
                    gasUrl: config.gasUrl
                });
                suggestions.classList.remove('show');
            }
        }, 300);
    });
    
    // キーボード操作は既存の実装を使用
    setupKeyboardNavigation(input, suggestions);
}

// 医療機関検索オートコンプリート
function setupHospitalAutocomplete() {
    const input = document.getElementById('hospitalName');
    const suggestions = document.getElementById('hospitalSuggestions');
    let selectedIndex = -1;
    let searchTimeout = null;
    
    console.log('[DEBUG] setupHospitalAutocomplete 実行開始');
    console.log('[DEBUG] DOM要素確認:', {
        input: !!input,
        suggestions: !!suggestions,
        inputId: input ? input.id : 'null',
        suggestionsId: suggestions ? suggestions.id : 'null'
    });
    
    if (!input || !suggestions) {
        console.error('[ERROR] 医療機関検索用DOM要素が見つかりません:', {
            input: !!input,
            suggestions: !!suggestions
        });
        return;
    }
    
    input.addEventListener('input', function() {
        const query = this.value.trim();
        console.log('[DEBUG] 医療機関検索入力イベント:', {
            query: query,
            length: query.length
        });
        
        suggestions.innerHTML = '';
        selectedIndex = -1;
        
        if (query.length < 1) {
            suggestions.classList.remove('show');
            console.log('[DEBUG] クエリが短すぎるため検索をスキップ');
            return;
        }
        
        console.log('[DEBUG] 医療機関検索リクエスト準備:', {
            query: query,
            gasUrl: config.gasUrl
        });
        
        // 検索リクエストを遅延実行（300ms）
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            try {
                const params = new URLSearchParams({
                    action: 'searchHospitals',
                    query: query
                });
                
                const requestUrl = `${config.gasUrl}?${params.toString()}`;
                console.log('[DEBUG] 医療機関検索API呼び出し:', {
                    url: requestUrl,
                    query: query
                });
                
                const response = await fetch(requestUrl, {
                    method: 'GET',
                    mode: 'cors'
                });
                
                console.log('[DEBUG] 医療機関検索APIレスポンス:', {
                    status: response.status,
                    ok: response.ok,
                    statusText: response.statusText
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const results = await response.json();
                console.log('[DEBUG] 医療機関検索結果:', {
                    results: results,
                    length: results ? results.length : 0
                });
                
                if (results && results.length > 0) {
                    const suggestionsHTML = results.map((hospital, index) => `
                        <div class="suggestion-item" data-index="${index}" data-value="${hospital.name}">
                            <div class="suggestion-name">${hospital.name}</div>
                            ${hospital.area ? `<div class="suggestion-reading">${hospital.area}</div>` : ''}
                        </div>
                    `).join('');
                    
                    console.log('[DEBUG] 医療機関サジェスト表示:', {
                        suggestionsHTML: suggestionsHTML,
                        resultCount: results.length
                    });
                    
                    suggestions.innerHTML = suggestionsHTML;
                    suggestions.classList.add('show');
                    
                    console.log('[DEBUG] 医療機関サジェスト表示完了:', {
                        innerHTML: suggestions.innerHTML,
                        classList: suggestions.classList.toString(),
                        display: suggestions.style.display
                    });
                    
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
            } catch (error) {
                console.error('[ERROR] 医療機関検索エラー:', {
                    error: error.message,
                    stack: error.stack,
                    query: query,
                    gasUrl: config.gasUrl
                });
                suggestions.classList.remove('show');
            }
        }, 300);
    });
    
    // キーボード操作は既存の実装を使用
    setupKeyboardNavigation(input, suggestions);
}

// キーボードナビゲーション共通機能
function setupKeyboardNavigation(input, suggestions) {
    let selectedIndex = -1;
    
    input.addEventListener('keydown', function(e) {
        const items = suggestions.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            input.value = items[selectedIndex].dataset.value;
            suggestions.classList.remove('show');
            clearError(input);
        } else if (e.key === 'Escape') {
            suggestions.classList.remove('show');
        }
    });
    
    // フォーカスを失った時に候補を非表示
    input.addEventListener('blur', function() {
        setTimeout(() => {
            suggestions.classList.remove('show');
        }, 200);
    });
    
    function updateSelection(items, selectedIndex) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
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