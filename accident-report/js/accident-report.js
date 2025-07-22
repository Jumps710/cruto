// 事故報告フォーム JavaScript - GPS詳細版 v20250722002

// 設定
const config = {
    woffId: 'EownaFs9auCN-igUa84MDA', // 本番環境のWOFF ID
    gasUrl: 'https://script.google.com/macros/s/AKfycbyL58-LDmfXvfXkYbj-LL9PPrnDZreH0RPg1-io0xgdNgICh30_VUBa1SZebAqk4hBxoA/exec',
    googleMapsApiKey: 'AIzaSyBXFx41RFCdHGEN-ZFcuCt3kmQW1UIBeS8' // Google Maps Geocoding API
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

// キャッシュ機能
const cache = {
    offices: null,
    officesExpiry: null,
    CACHE_DURATION: 5 * 60 * 1000 // 5分間キャッシュ
};

// 初期化
document.addEventListener('DOMContentLoaded', async function() {
    // まず最初にイベントリスナーを設定（フォーム操作を即座に有効化）
    setupEventListeners();
    
    try {
        // WOFF初期化
        const profile = await WOFFManager.init(config.woffId);
        
        // 報告者名を設定
        document.getElementById('reporter').value = profile.displayName;
        
        // 今日の日付を設定（即座に実行）
        const today = new Date();
        document.getElementById('incidentDate').value = today.toISOString().split('T')[0];
        
        // ユーザーの組織情報を非同期で取得（ブロッキングしない）
        getUserOrganization(profile.userId);
        
        
    } catch (error) {
        // 初期化エラー
        
        // WOFF初期化に失敗しても、フォームは使えるようにする
        document.getElementById('reporter').value = 'テストユーザー';
        const today = new Date();
        document.getElementById('incidentDate').value = today.toISOString().split('T')[0];
        
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
    
    try {
        const requestData = {
            action: 'getUserOrganization',
            userId: userId
        };
        
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
                ok: response.ok,
                url: response.url,
                headers: Array.from(response.headers.entries())
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // レスポンステキストを先に取得してログ出力
            const responseText = await response.text();
            console.log('📄 レスポンステキスト:', responseText.substring(0, 200));
            
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ JSON解析エラー:', parseError);
                console.error('📄 完全なレスポンス:', responseText);
                throw new Error('レスポンスのJSON解析に失敗: ' + parseError.message);
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
    
    if (offices && Array.isArray(offices)) {
        availableOffices = offices;
        console.log('✅ 事業所一覧取得成功:', offices.length + '件');
        
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
        console.log('⚠️ 無効な事業所データ');
        return loadOfficesFromSheet();
    }
}

// Sheetsから事業所一覧を取得（10秒タイムアウト付き、GET方式に変更）
async function loadOfficesFromSheet() {
    console.log('📋 loadOfficesFromSheet開始（最適化版）');
    
    // キャッシュチェック
    if (cache.offices && cache.officesExpiry && Date.now() < cache.officesExpiry) {
        console.log('📦 キャッシュから事業所データを取得');
        return loadOfficesFromCache();
    }
    
    try {
        console.log('📡 getOffices API呼び出し開始（GET方式 + タイムアウト）');
        
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
            
            // キャッシュに保存
            cache.offices = offices;
            cache.officesExpiry = Date.now() + cache.CACHE_DURATION;
            
            console.log('✅ 事業所一覧取得成功:', offices.length + '件（キャッシュ更新）');
            
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
        
        // ユーザーに通知（非ブロッキング）
        setTimeout(() => {
            alert('事業所情報の取得に時間がかかっています。基本的な選択肢を表示しています。');
        }, 100);
    }
}

// キャッシュから事業所データを読み込み
function loadOfficesFromCache() {
    console.log('📦 キャッシュから事業所一覧を設定');
    
    const offices = cache.offices;
    availableOffices = offices;
    
    const officeSelect = document.getElementById('office');
    officeSelect.innerHTML = '<option value="">選択してください</option>';
    
    offices.forEach(office => {
        const option = document.createElement('option');
        option.value = office.value;
        option.textContent = office.name;
        officeSelect.appendChild(option);
    });
    
    officeSelect.style.display = 'block';
    console.log('✅ キャッシュから事業所一覧設定完了:', offices.length + '件');
}

// 不要な関数を削除（プルダウン選択に変更したため）

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
async function getLocation() {
    const locationInput = document.getElementById('location');
    const loading = Utils.showLoading(locationInput.parentElement, 'GPS取得中...');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // 住所を取得
                try {
                    const address = await getAddressFromCoordinates(lat, lng);
                    if (address) {
                        locationInput.value = address;
                        // 座標情報も保持（データ属性として）
                        locationInput.setAttribute('data-lat', lat);
                        locationInput.setAttribute('data-lng', lng);
                    } else {
                        // 住所取得に失敗した場合は座標を表示
                        locationInput.value = `緯度: ${lat.toFixed(6)}, 経度: ${lng.toFixed(6)}`;
                    }
                } catch (error) {
                    console.error('住所取得エラー:', error);
                    locationInput.value = `緯度: ${lat.toFixed(6)}, 経度: ${lng.toFixed(6)}`;
                }
                
                Utils.hideLoading(loading);
                clearError(locationInput);
            },
            function(error) {
                Utils.hideLoading(loading);
                alert('位置情報の取得に失敗しました。手動で入力してください。');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        Utils.hideLoading(loading);
        alert('お使いのブラウザは位置情報をサポートしていません。');
    }
}

// 座標から住所を取得する関数
async function getAddressFromCoordinates(lat, lng) {
    console.log('[GPS] 住所取得開始:', {lat, lng});
    
    // Google Maps Geocoding API を優先使用（詳細な住所情報を取得）
    const googleApiKey = config.googleMapsApiKey;
    
    if (googleApiKey) {
        try {
            console.log('[GPS] Google Maps API使用');
            // result_typeパラメータで詳細な住所を要求し、zoomレベル相当の精度指定
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}&language=ja&result_type=street_address|premise|subpremise&location_type=ROOFTOP|RANGE_INTERPOLATED`
            );
            const data = await response.json();
            
            console.log('[GPS] Google API応答:', data);
            
            if (data.status === 'OK' && data.results.length > 0) {
                console.log('[GPS] Google API全結果:', data.results);
                
                // より詳細な住所を優先して選択
                let bestResult = data.results[0];
                
                // street_address タイプの結果があれば優先
                for (const result of data.results) {
                    console.log('[GPS] 結果タイプ:', result.types, result.formatted_address);
                    if (result.types.includes('street_address') || result.types.includes('premise')) {
                        bestResult = result;
                        break;
                    }
                }
                
                // Google APIから詳細住所を構築（address_componentsを使用）
                const detailedAddress = buildDetailedAddressFromGoogle(bestResult);
                console.log('[GPS] Google詳細住所構築完了:', detailedAddress);
                console.log('[GPS] 最終住所結果:', detailedAddress || bestResult.formatted_address);
                
                return detailedAddress || bestResult.formatted_address;
            } else {
                console.log('[GPS] Google API結果なし:', data.status);
            }
        } catch (error) {
            console.error('❌ Google Geocoding APIエラー:', error);
        }
    }
    
    // 無料の代替案: Nominatim (OpenStreetMap) を使用
    console.log('[GPS] Nominatimにフォールバック');
    try {
        // zoom=19で最高詳細度、addressdetails=1で構造化住所情報を取得
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ja&zoom=19&addressdetails=1&extratags=1&namedetails=1`,
            {
                headers: {
                    'User-Agent': 'Cruto-Accident-Report/1.0'
                }
            }
        );
        const data = await response.json();
        
        console.log('[GPS] Nominatim API応答:', data);
        
        if (data && data.display_name) {
            // 日本の住所形式に詳細整形
            const detailedAddress = formatDetailedJapaneseAddress(data);
            console.log('[GPS] Nominatim住所整形完了:', detailedAddress);
            return detailedAddress;
        }
    } catch (error) {
        console.error('❌ Nominatim APIエラー:', error);
    }
    
    return null;
}

// Google Maps APIのaddress_componentsから詳細住所を構築
function buildDetailedAddressFromGoogle(result) {
    if (!result.address_components) return null;
    
    console.log('[GPS] Google address_components解析:', result.address_components);
    
    let formatted = '';
    let streetNumber = '';
    let route = '';
    let sublocality = '';
    let locality = '';
    let administrativeArea = '';
    let premise = '';
    
    // address_componentsから各要素を抽出
    result.address_components.forEach(component => {
        const types = component.types;
        console.log('[GPS] コンポーネント:', component.long_name, types);
        
        if (types.includes('street_number')) {
            streetNumber = component.long_name; // 番地
        }
        if (types.includes('route')) {
            route = component.long_name; // 通り名
        }
        if (types.includes('premise')) {
            premise = component.long_name; // 建物名
        }
        if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
            sublocality = component.long_name; // 丁目など
        }
        if (types.includes('locality')) {
            locality = component.long_name; // 市区町村
        }
        if (types.includes('administrative_area_level_1')) {
            administrativeArea = component.long_name; // 都道府県
        }
    });
    
    // 日本の住所形式で構築
    if (administrativeArea) formatted += administrativeArea;
    if (locality) formatted += locality;
    if (sublocality) formatted += sublocality;
    
    // 番地情報を追加（street_numberが最も重要）
    if (streetNumber) {
        formatted += streetNumber;
        console.log('[GPS] 番地追加:', streetNumber);
    } else if (route && route.match(/\d+/)) {
        // routeに数字が含まれている場合は番地として使用
        const routeNumber = route.match(/\d+/)[0];
        formatted += routeNumber;
        console.log('[GPS] route番地追加:', routeNumber);
    }
    
    // 建物名があれば追加
    if (premise) {
        formatted += ' ' + premise;
    }
    
    console.log('[GPS] Google構築結果:', formatted);
    return formatted || null;
}

// 日本の住所形式に詳細整形する関数（番地まで取得）
function formatDetailedJapaneseAddress(data) {
    if (!data.address) return data.display_name;
    
    const addr = data.address;
    let formatted = '';
    
    console.log('[GPS] 住所構造解析:', addr);
    
    // 都道府県
    if (addr.state || addr.province) {
        formatted += addr.state || addr.province;
    }
    
    // 市区町村
    if (addr.city || addr.town || addr.municipality) {
        formatted += addr.city || addr.town || addr.municipality;
    }
    
    // 区・特別区
    if (addr.city_district || addr.suburb) {
        formatted += addr.city_district || addr.suburb;
    }
    
    // 町・丁目（複数パターンに対応）
    if (addr.quarter || addr.neighbourhood || addr.residential) {
        formatted += addr.quarter || addr.neighbourhood || addr.residential;
    }
    
    // 番地・号（詳細な住所番号）
    let houseInfo = '';
    
    // house_number（番地）
    if (addr.house_number) {
        houseInfo += addr.house_number;
    }
    
    // postcode（郵便番号）から詳細情報を推定
    if (addr.postcode && !houseInfo) {
        // 郵便番号がある場合、より具体的な位置を示唆
        console.log('[GPS] 郵便番号から位置推定:', addr.postcode);
    }
    
    // 番地情報がない場合、追加の方法で番地を推定
    if (!houseInfo) {
        // 1. road（道路名）から推定
        if (addr.road) {
            console.log('[GPS] 道路名から位置推定:', addr.road);
            const roadMatch = addr.road.match(/(\d+)/);
            if (roadMatch) {
                houseInfo = roadMatch[1];
            }
        }
        
        // 2. display_nameから番地を抽出（例: "12-34, 国府台4丁目"）
        if (!houseInfo && data.display_name) {
            console.log('[GPS] display_nameから番地抽出:', data.display_name);
            // 日本の住所パターン: "数字-数字" または "数字番地"
            const addressMatch = data.display_name.match(/(\d+(?:-\d+)?(?:番地?)?)/);
            if (addressMatch) {
                houseInfo = addressMatch[1];
                console.log('[GPS] display_nameから番地発見:', houseInfo);
            }
        }
        
        // 3. より詳細な座標で再検索（最後の手段）
        if (!houseInfo) {
            console.log('[GPS] 番地情報なし');
        }
    }
    
    if (houseInfo) {
        formatted += houseInfo;
    }
    
    // 建物名・施設名
    if (addr.amenity || addr.building || addr.shop || addr.office) {
        const facilityName = addr.amenity || addr.building || addr.shop || addr.office;
        formatted += ' ' + facilityName;
    }
    
    // 具体的な場所の名前（name）
    if (data.name && data.name !== formatted) {
        formatted += ' (' + data.name + ')';
    }
    
    console.log('[GPS] 整形結果:', formatted);
    
    return formatted || data.display_name;
}

// 従来の関数も残す（互換性のため）
function formatJapaneseAddress(data) {
    return formatDetailedJapaneseAddress(data);
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
        
        // GASに送信（GET方式 - 確実な疎通のため）
        console.log('🚀 フォーム送信開始（GET方式）');
        
        // URLSearchParamsで送信（getUserOrganizationと同じ成功パターン）
        const params = new URLSearchParams();
        params.append('action', 'submitAccidentReport');
        
        // フォームデータの各項目を個別に追加
        params.append('reporter', formData.reporter || '');
        params.append('userId', formData.userId || '');
        params.append('department', formData.department || '');
        params.append('office', formData.office || '');
        params.append('incidentDate', formData.incidentDate || '');
        params.append('incidentTime', formData.incidentTime || '');
        params.append('accidentType', formData.accidentType || '');
        params.append('location', formData.location || '');
        params.append('locationCategory', formData.locationCategory || '');
        params.append('detailLocation', formData.detailLocation || '');
        params.append('otherLocation', formData.otherLocation || '');
        params.append('driverName', formData.driverName || '');
        params.append('propertyDamage', formData.propertyDamage || '');
        params.append('propertyDetailsText', formData.propertyDetailsText || '');
        params.append('personalInjury', formData.personalInjury || '');
        params.append('injuryTypes', JSON.stringify(formData.injuryTypes || []));
        params.append('injuryDetailsText', formData.injuryDetailsText || '');
        params.append('accidentDetails', formData.accidentDetails || '');
        params.append('timestamp', formData.timestamp || new Date().toISOString());
        
        // 写真データは一旦除外（後で対応）
        // TODO: Base64写真データの追加
        
        let response;
        try {
            console.log('📡 GET リクエスト送信中...');
            
            const getUrl = `${config.gasUrl}?${params.toString()}`;
            console.log('🌐 送信URL長:', getUrl.length);
            
            response = await fetch(getUrl, {
                method: 'GET',
                redirect: 'follow',
                mode: 'cors'
            });
            
            console.log('📬 レスポンス受信:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                url: response.url
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (fetchError) {
            console.error('📛 fetch エラー:', fetchError);
            throw new Error('ネットワークエラー: ' + fetchError.message);
        }
        
        let result;
        try {
            const responseText = await response.text();
            console.log('📄 レスポンステキスト:', responseText.substring(0, 500));
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ JSON解析エラー:', parseError);
            throw new Error('レスポンス解析エラー: ' + parseError.message);
        }
        
        console.log('📋 解析結果:', result);
        
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