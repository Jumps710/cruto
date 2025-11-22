// 事故報告フォーム JavaScript - URLSearchParams + 画質改喁E�� v20250728001

// 設宁E
const config = {
    woffId: 'EownaFs9auCN-igUa84MDA', // 本番環墁E�EWOFF ID
   gasUrl: 'https://script.google.com/macros/s/AKfycby5fRaVu5vISA3dvflBAaYXtWtBGXRyWt9HpWYlAiWbqqHzyBxSAt6vpWn6NuWFk8Gj/exec', // Cruto様本番環墁E
    
   // gasUrl: 'https://script.google.com/macros/s/AKfycby5fRaVu5vISA3dvflBAaYXtWtBGXRyWt9HpWYlAiWbqqHzyBxSAt6vpWn6NuWFk8Gj/exec', // 村松チE��チE

    
    googleMapsApiKey: 'AIzaSyCdhA4t8flujiYex2OddJCkFv4u6nWvi9w' // Google Maps Geocoding API
};

(function ensureVConsole() {
    if (typeof window === 'undefined') {
        return;
    }

    const boot = () => {
        if (!window.vConsole && window.VConsole) {
            window.vConsole = new window.VConsole({ theme: 'dark' });
            console.log('[debug] vConsole initialized');
        }
    };

    if (window.VConsole) {
        boot();
    } else {
        const script = document.createElement('script');
        script.src = '../common/js/vconsole.min.js?v=20251004001';
        script.addEventListener('load', boot);
        script.addEventListener('error', () => console.warn('[debug] vConsole failed to load'));
        document.head.appendChild(script);
    }
})();


// グローバル変数
let formData = {};
let photoData = {
    scene: [],
    property: [],
    otherVehicle: [],
    ownVehicle: [],
    license: []
};
let userOrganization = '';
let availableOffices = [];

// キャチE��ュ機�E
const cache = {
    offices: null,
    officesExpiry: null,
    CACHE_DURATION: 5 * 60 * 1000 // 5刁E��キャチE��ュ
};

// 強制キャチE��ュクリア
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });
}

// 初期匁E
document.addEventListener('DOMContentLoaded', async function() {
    // バ�Eジョン確認用ログ�E�確認後削除�E�E
    console.log('🔄 Script loaded: v20250728001, DOMContentLoaded fired');
    
    // フォーム要素の存在確誁E
    const form = document.getElementById('accidentReportForm');
    const reporter = document.getElementById('reporter');
    const officeContainer = document.getElementById('officeContainer');
    
    console.log('📋 Elements check:', {
        form: !!form,
        reporter: !!reporter,
        officeContainer: !!officeContainer
    });
    
    if (!form) {
        console.error('❁Eフォーム要素が見つかりません');
        return;
    }
    
    try {
        // まず最初にイベントリスナ�Eを設定（フォーム操作を即座に有効化！E
        console.log('⚙︁ESetting up event listeners...');
        setupEventListeners();
        const initialType = document.querySelector('input[name="accidentType"]:checked')?.value;
setScenePhotoRequired(initialType === 'vehicle');

        console.log('✁EEvent listeners setup complete');
    } catch (eventError) {
        console.error('❁EEvent listener setup failed:', eventError);
        return;
    }
    
    try {
        // WOFF初期匁E
        console.log('🔄 Starting WOFF initialization...');
        const profile = await WOFFManager.init(config.woffId);
        console.log('✁EWOFF initialization successful:', profile);
        
        // 報告老E��を設宁E
        document.getElementById('reporter').value = profile.displayName;
        console.log('👤 Reporter name set:', profile.displayName);
        
        // 今日の日付を設定（即座に実行！E
        const today = new Date();
        document.getElementById('incidentDate').value = today.toISOString().split('T')[0];
        console.log('📅 Date set:', today.toISOString().split('T')[0]);
        
        // ユーザーの絁E��情報を非同期で取得（ブロチE��ングしなぁE��E
        console.log('🏢 Getting user organization...');
        getUserOrganization(profile.userId);
        
        
    } catch (error) {
        // 初期化エラー
        console.error('初期化エラー:', error);
        
        // WOFF初期化に失敗しても、フォームは使えるようにする
        document.getElementById('reporter').value = 'チE��トユーザー';
        const today = new Date();
        document.getElementById('incidentDate').value = today.toISOString().split('T')[0];
        
        // チE��ォルト�E事業所選択肢を表示
        const officeContainer = document.getElementById('officeContainer');
        const officeSelect = document.getElementById('office');
        
        // ローチE��ングメチE��ージを削除
        officeContainer.innerHTML = '';
        
        // selectを表示
        officeSelect.innerHTML = `
            <option value="">選択してください</option>
            <option value="本社">本社</option>
            <option value="関東支庁E>関東支庁E/option>
            <option value="関西支庁E>関西支庁E/option>
        `;
        officeSelect.style.display = 'block';
        
    }
});

// ユーザーの絁E��情報を取征E
async function getUserOrganization(userId) {
    try {
        const requestData = {
            action: 'getUserOrganization',
            userId: userId
        };
        
        let response;
        let result;
        
        try {
            // GETリクエストでパラメータとして送信�E�EORS回避�E�E
            const params = new URLSearchParams(requestData);
            const getUrl = `${config.gasUrl}?${params.toString()}`;
            
            response = await fetch(getUrl, {
                method: 'GET',
                redirect: 'follow',
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // レスポンスチE��ストを先に取得してログ出劁E
            const responseText = await response.text();
            
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                    throw new Error('レスポンスのJSON解析に失敁E ' + parseError.message);
            }
        } catch (fetchError) {
            throw new Error('ネットワークエラー: ' + fetchError.message);
        }
        
        if (result && result.orgUnitName) {
            userOrganization = result.orgUnitName;
            
            // 事業所フィールドを設宁E
            const officeContainer = document.getElementById('officeContainer');
            const officeSelect = document.getElementById('office');
            
            // ローチE��ングメチE��ージを削除
            officeContainer.innerHTML = '';
            
            // 取得した絁E��をチE��ォルトとして設定し、selectを表示
            officeSelect.innerHTML = `<option value="${userOrganization}">${userOrganization}</option>`;
            officeSelect.value = userOrganization;
            officeSelect.style.display = 'block';
            
            // 事業所一覧を非同期で取得してプルダウンに追加
            loadOfficesFromSheet().then(() => {
                // 事業所一覧取得後、現在の絁E��が先頭に表示されるよぁE��整
                if (availableOffices.length > 0) {
                    const currentOption = `<option value="${userOrganization}" selected>${userOrganization}</option>`;
                    const otherOptions = availableOffices
                        .filter(office => office.value !== userOrganization)
                        .map(office => `<option value="${office.value}">${office.name}</option>`)
                        .join('');
                    officeSelect.innerHTML = currentOption + otherOptions;
                }
            }).catch(error => {
                console.error('事業所一覧の取得に失敁E', error);
            });
            
        } else if (result && Array.isArray(result)) {
            // フォールバック: 事業所一覧を取得した場吁E
            loadOfficesFromAPIResponse(result);
            
        } else {
            throw new Error('絁E��情報を取得できませんでした - result: ' + JSON.stringify(result));
        }
        
    } catch (error) {
        console.error('絁E��情報取得エラー:', error);
        // フォールバック: 手動選抁E
        await loadOfficesFromSheet();
    }
}

// APIレスポンスから事業所一覧を設宁E
function loadOfficesFromAPIResponse(offices) {
    if (offices && Array.isArray(offices)) {
        availableOffices = offices;
        
        const officeContainer = document.getElementById('officeContainer');
        const officeSelect = document.getElementById('office');
        
        // ローチE��ングメチE��ージを削除
        officeContainer.innerHTML = '';
        
        // 事業所選択肢を設宁E
        officeSelect.innerHTML = '<option value="">選択してください</option>';
        
        offices.forEach(office => {
            const option = document.createElement('option');
            option.value = office.value;
            option.textContent = office.name;
            officeSelect.appendChild(option);
        });
        
        officeSelect.style.display = 'block';
    } else {
        return loadOfficesFromSheet();
    }
}

// Sheetsから事業所一覧を取得！E0秒タイムアウト付き、GET方式に変更�E�E
async function loadOfficesFromSheet() {
    // キャチE��ュチェチE��
    if (cache.offices && cache.officesExpiry && Date.now() < cache.officesExpiry) {
        return loadOfficesFromCache();
    }
    
    try {
        // 事業所惁E��取得開姁E
        // Promise.raceでタイムアウト制御
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('タイムアウチE 10秒以冁E��応答がありませんでした')), 10000);
        });
        
        // GET方式でパラメータ送信�E�EetUserOrganizationと同じ成功パターン�E�E
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
        
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const offices = await response.json();
        
        if (offices && Array.isArray(offices)) {
            availableOffices = offices;
            
            // キャチE��ュに保孁E
            cache.offices = offices;
            cache.officesExpiry = Date.now() + cache.CACHE_DURATION;
            
            console.log('✁E事業所一覧取得�E劁E', offices.length + '件�E�キャチE��ュ更新�E�E);
            
            // 現在のofficeSelectの状態を確誁E
            const officeSelect = document.getElementById('office');
            if (officeSelect.style.display === 'none') {
                // まだ表示されてぁE��ぁE��合�Eみ、ローチE��ングメチE��ージを削除
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
            throw new Error('事業所チE�Eタが無効な形式でぁE);
        }
        
    } catch (error) {
        console.error('事業所惁E��取得エラー:', error);
        
        // フォールバック: 基本皁E��事業所選択肢を提侁E
        
        const defaultOffices = [
            { value: '本社', name: '本社' },
            { value: '関東支庁E, name: '関東支庁E },
            { value: '関西支庁E, name: '関西支庁E }
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
        
        // ユーザーに通知�E�非ブロチE��ング�E�E
        setTimeout(() => {
            alert('事業所惁E��の取得に時間がかかってぁE��す。基本皁E��選択肢を表示してぁE��す、E);
        }, 100);
    }
}

// キャチE��ュから事業所チE�Eタを読み込み
function loadOfficesFromCache() {
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
}

// 不要な関数を削除�E��Eルダウン選択に変更したため�E�E

// イベントリスナ�Eの設宁E
function setupEventListeners() {
    // 事故種類�E選択による表示刁E��
    document.querySelectorAll('input[name="accidentType"]').forEach(radio => {
        radio.addEventListener('change', handleAccidentTypeChange);
    });
    
    // 対物ありの場合�E詳細表示
    document.querySelectorAll('input[name="propertyDamage"]').forEach(radio => {
        radio.addEventListener('change', handlePropertyDamageChange);
    });
    
    // 対人ありの場合�E詳細表示
    document.querySelectorAll('input[name="personalInjury"]').forEach(radio => {
        radio.addEventListener('change', handlePersonalInjuryChange);
    });
    
    // 場所刁E��による詳細場所の表示
    const locationCategory = document.getElementById('locationCategory');
    if (locationCategory) {
        locationCategory.addEventListener('change', handleLocationCategoryChange);
    }
    
    // 詳細場所でそ�E他を選択した場吁E
    const detailLocation = document.getElementById('detailLocation');
    if (detailLocation) {
        detailLocation.addEventListener('change', handleDetailLocationChange);
    }
    
    // GPS取得�Eタン
    const getLocationBtn = document.getElementById('getLocationBtn');
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', getLocation);
    }
    
    // 写真アチE�EローチE
    setupPhotoUpload('scenePhoto', 'scenePhotoUpload', 'scenePhotoPreview', 'scene');
    setupPhotoUpload('otherVehiclePhoto', 'otherVehiclePhotoUpload', 'otherVehiclePhotoPreview', 'otherVehicle');
    setupPhotoUpload('ownVehiclePhoto', 'ownVehiclePhotoUpload', 'ownVehiclePhotoPreview', 'ownVehicle');
    setupPhotoUpload('propertyPhoto', 'propertyPhotoUpload', 'propertyPhotoPreview', 'property');
    setupPhotoUpload('licensePhoto', 'licensePhotoUpload', 'licensePhotoPreview', 'license');
    
    // 送信ボタン
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', showConfirmModal);
    }
    
    // モーダルボタン
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    if (cancelBtn && confirmBtn) {
        cancelBtn.addEventListener('click', closeModal);
        confirmBtn.addEventListener('click', submitForm);
    }
    
    // エラーメチE��ージのクリア
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('input', function() {
            clearError(this);
        });
        element.addEventListener('change', function() {
            clearError(this);
        });
    });
}


// 事故種類変更時�E処琁E
function handleAccidentTypeChange(e) {
    const vehicleSection = document.getElementById('vehicleSection');
    const otherLocationSection = document.getElementById('otherLocationSection');
    const vehiclePhotos = document.getElementById('vehiclePhotos');
    const locationCategory = document.getElementById('locationCategory');
    const detailLocation = document.getElementById('detailLocation');
    const otherLocation = document.getElementById('otherLocation');
    const otherAccidentCategory = document.getElementById('otherAccidentCategory');
    const detailLocationDiv = document.getElementById('detailLocationDiv');
    const otherLocationDiv = document.getElementById('otherLocationDiv');

    if (e.target.value === 'vehicle') {
        vehicleSection.classList.add('active');
        vehiclePhotos.classList.add('active');
        otherLocationSection.style.display = 'none';

        if (locationCategory) {
            locationCategory.value = '';
        }
        if (detailLocation) {
            detailLocation.value = '';
            if (detailLocationDiv) {
                detailLocationDiv.style.display = 'none';
            }
        }
        if (otherLocation) {
            otherLocation.value = '';
            if (otherLocationDiv) {
                otherLocationDiv.style.display = 'none';
            }
        }
        if (otherAccidentCategory) {
            otherAccidentCategory.value = '';
        }
    } else {
        vehicleSection.classList.remove('active');
        vehiclePhotos.classList.remove('active');
        otherLocationSection.style.display = 'block';
    }
    setScenePhotoRequired(e.target.value === 'vehicle');
}

function setScenePhotoRequired(isRequired) {
    const sceneInput = document.getElementById('scenePhoto');
    const sceneLabel = document.querySelector('#scenePhotoUpload')?.parentElement?.querySelector('label');
    if (!sceneInput) return;
    if (isRequired) {
        sceneInput.setAttribute('required', 'required');
        sceneLabel?.classList.add('required');
    } else {
        sceneInput.removeAttribute('required');
        sceneLabel?.classList.remove('required');
        clearError(sceneInput);  // エラー表示が�EてぁE��ら消す
    }
}


// 対物選択時の処琁E
function handlePropertyDamageChange(e) {
    const propertyDetails = document.getElementById('propertyDetails');
    const propertyPhotoDiv = document.getElementById('propertyPhotoDiv');
    
    if (e.target.value === 'yes') {
        propertyDetails.classList.add('active');
        propertyPhotoDiv.style.display = 'block';
    } else {
        propertyDetails.classList.remove('active');
        propertyPhotoDiv.style.display = 'none';
    }
}

// 対人選択時の処琁E
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

// 場所刁E��変更時�E処琁E
function handleLocationCategoryChange(e) {
    const detailLocationDiv = document.getElementById('detailLocationDiv');
    const otherLocationDiv = document.getElementById('otherLocationDiv');
    const detailLocation = document.getElementById('detailLocation');
    
    // 選択肢をクリア
    detailLocation.innerHTML = '<option value="">選択してください</option>';
    
    const locationOptions = {
        '訪省E: ['ご利用老E��E, 'そ�E仁E],
        '小�E': ['活動スペ�Eス', 'トイレ', '屋夁E, 'そ�E仁E],
        '施設': ['屁E��', '共有スペ�Eス', 'トイレ', '浴室', '中庭', '玁E��剁E, '駐車場', '階段', 'そ�E仁E]
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

// 詳細場所変更時�E処琁E
function handleDetailLocationChange(e) {
    const otherLocationDiv = document.getElementById('otherLocationDiv');
    if (e.target.value === 'そ�E仁E) {
        otherLocationDiv.style.display = 'block';
    } else {
        otherLocationDiv.style.display = 'none';
    }
}

// GPS位置惁E��取征E
async function getLocation() {
    const locationInput = document.getElementById('location');
    const loading = Utils.showLoading(locationInput.parentElement, 'GPS取得中...');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // 住所を取征E
                try {
                    const address = await getAddressFromCoordinates(lat, lng);
                    if (address) {
                        locationInput.value = address;
                        // 座標情報も保持�E�データ属性として�E�E
                        locationInput.setAttribute('data-lat', lat);
                        locationInput.setAttribute('data-lng', lng);
                    } else {
                        // 住所取得に失敗した場合�E座標を表示
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
                alert('位置惁E��の取得に失敗しました。手動で入力してください、E);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        Utils.hideLoading(loading);
        alert('お使ぁE�Eブラウザは位置惁E��をサポ�EトしてぁE��せん、E);
    }
}

// 座標から住所を取得する関数
async function getAddressFromCoordinates(lat, lng) {
    console.log('[GPS] 住所取得開姁E', {lat, lng});
    
    // Google Maps Geocoding API を優先使用�E�詳細な住所惁E��を取得！E
    const googleApiKey = config.googleMapsApiKey;
    
    if (googleApiKey) {
        try {
            console.log('[GPS] Google Maps API使用');
            // result_typeパラメータで詳細な住所を要求し、zoomレベル相当�E精度持E��E
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}&language=ja&result_type=street_address|premise|subpremise&location_type=ROOFTOP|RANGE_INTERPOLATED`
            );
            const data = await response.json();
            
            if (data.status === 'OK' && data.results.length > 0) {
                // より詳細な住所を優先して選抁E
                let bestResult = data.results[0];
                
                // street_address タイプ�E結果があれ�E優允E
                for (const result of data.results) {
                    if (result.types.includes('street_address') || result.types.includes('premise')) {
                        bestResult = result;
                        break;
                    }
                }
                
                // Google APIのformatted_addressから日本を除去して使用
                const formattedAddress = cleanJapaneseAddress(bestResult.formatted_address);
                console.log('📍 住所取得完亁E', formattedAddress);
                
                // Google Maps APIレスポンスをログに送信
                try {
                    await logGoogleMapsResponse({
                        coordinates: { lat, lng },
                        googleResponse: data,
                        extractedAddress: {
                            fullAddress: formattedAddress,
                            originalFormatted: bestResult.formatted_address,
                            houseNumber: extractHouseNumberFromResult(bestResult)
                        },
                        source: 'accident-report'
                    });
                } catch (logError) {
                    // ログ送信エラーは表示しなぁE
                }
                
                return formattedAddress;
            }
        } catch (error) {
            console.error('❁EGoogle Maps APIエラー:', error.message);
        }
    }
    
    // フォールバック: Nominatim (OpenStreetMap) を使用
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ja&zoom=19&addressdetails=1&extratags=1&namedetails=1`,
            {
                headers: {
                    'User-Agent': 'Cruto-Accident-Report/1.0'
                }
            }
        );
        const data = await response.json();
        
        if (data && data.display_name) {
            const detailedAddress = formatDetailedJapaneseAddress(data);
            console.log('📍 住所取得完亁E(Nominatim):', detailedAddress);
            return detailedAddress;
        }
    } catch (error) {
        console.error('❁ENominatim APIエラー:', error.message);
    }
    
    return null;
}

// Google Maps APIのaddress_componentsから詳細住所を構篁E
function buildDetailedAddressFromGoogle(result) {
    if (!result.address_components) return null;
    
    console.log('[GPS] Google address_components解极E', result.address_components);
    
    let formatted = '';
    let streetNumber = '';
    let route = '';
    let sublocality = '';
    let locality = '';
    let administrativeArea = '';
    let premise = '';
    let subpremise = '';
    let postalCode = '';
    
    // address_componentsから吁E��素を抽出�E�郵便番号は除外！E
    result.address_components.forEach(component => {
        const types = component.types;
        console.log('[GPS] コンポ�EネンチE', component.long_name, types);
        
        // 郵便番号は記録するが住所には含めなぁE
        if (types.includes('postal_code')) {
            postalCode = component.long_name;
            console.log('[GPS] 郵便番号検�E�E�除外！E', postalCode);
            return; // 郵便番号は住所構築に使用しなぁE
        }
        
        if (types.includes('street_number')) {
            streetNumber = component.long_name; // 基本番地
            console.log('[GPS] 基本番地:', streetNumber);
        }
        if (types.includes('subpremise')) {
            subpremise = component.long_name; // 建物冁E��号
            console.log('[GPS] 建物冁E��号:', subpremise);
        }
        if (types.includes('route')) {
            route = component.long_name; // 通り吁E
        }
        if (types.includes('premise')) {
            premise = component.long_name; // 建物吁E
        }
        if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
            sublocality = component.long_name; // 丁目など
        }
        if (types.includes('locality')) {
            locality = component.long_name; // 市区町杁E
        }
        if (types.includes('administrative_area_level_1')) {
            administrativeArea = component.long_name; // 都道府県
        }
    });
    
    // 日本の住所形式で構篁E
    if (administrativeArea) formatted += administrativeArea;
    if (locality) formatted += locality;
    if (sublocality) formatted += sublocality;
    
    // 番地惁E��を構築（国府台4-6-6形式！E
    let houseNumberPart = '';
    if (streetNumber) {
        houseNumberPart = streetNumber;
        console.log('[GPS] 基本番地設宁E', streetNumber);
        
        // subpremiseがあれ�E追加�E�例！E-6-6の-6-6部刁E��E
        if (subpremise) {
            // subpremiseが既にハイフンを含んでぁE��かチェチE��
            if (subpremise.includes('-')) {
                houseNumberPart += '-' + subpremise;
            } else {
                houseNumberPart += '-' + subpremise;
            }
            console.log('[GPS] 詳細番地追加:', houseNumberPart);
        }
        
        formatted += houseNumberPart;
    } else if (route && route.match(/\d+/)) {
        // routeに数字が含まれてぁE��場合�E番地として使用
        const routeNumber = route.match(/\d+/)[0];
        formatted += routeNumber;
        console.log('[GPS] route番地追加:', routeNumber);
    }
    
    // 建物名があれば追加
    if (premise) {
        formatted += ' ' + premise;
    }
    
    console.log('[GPS] Google構築結果:', formatted);
    console.log('[GPS] 除外された郵便番号:', postalCode);
    return formatted || null;
}

// 日本の住所形式に詳細整形する関数�E�番地まで取得！E
function formatDetailedJapaneseAddress(data) {
    if (!data.address) return data.display_name;
    
    const addr = data.address;
    let formatted = '';
    
    console.log('[GPS] 住所構造解极E', addr);
    
    // 都道府県
    if (addr.state || addr.province) {
        formatted += addr.state || addr.province;
    }
    
    // 市区町杁E
    if (addr.city || addr.town || addr.municipality) {
        formatted += addr.city || addr.town || addr.municipality;
    }
    
    // 区・特別区
    if (addr.city_district || addr.suburb) {
        formatted += addr.city_district || addr.suburb;
    }
    
    // 町・丁目�E�褁E��パターンに対応！E
    if (addr.quarter || addr.neighbourhood || addr.residential) {
        formatted += addr.quarter || addr.neighbourhood || addr.residential;
    }
    
    // 番地・号�E�詳細な住所番号�E�E
    let houseInfo = '';
    
    // house_number�E�番地�E�E
    if (addr.house_number) {
        houseInfo += addr.house_number;
    }
    
    // postcode�E�郵便番号�E�から詳細惁E��を推宁E
    if (addr.postcode && !houseInfo) {
        // 郵便番号がある場合、より�E体的な位置を示唁E
        console.log('[GPS] 郵便番号から位置推宁E', addr.postcode);
    }
    
    // 番地惁E��がなぁE��合、追加の方法で番地を推宁E
    if (!houseInfo) {
        // 1. road�E�道路名）から推宁E
        if (addr.road) {
            console.log('[GPS] 道路名から位置推宁E', addr.road);
            const roadMatch = addr.road.match(/(\d+)/);
            if (roadMatch) {
                houseInfo = roadMatch[1];
            }
        }
        
        // 2. display_nameから番地を抽出�E�郵便番号を除外！E
        if (!houseInfo && data.display_name) {
            console.log('[GPS] display_nameから番地抽出:', data.display_name);
            // 郵便番号パターンを除夁E 3桁E4桁�E郵便番号なので除夁E
            // 番地パターン: 1-2桁�E番地�E�侁E 4-6-6, 15-23�E�E
            const addressMatch = data.display_name.match(/(?:^|[^\d])(\d{1,2}(?:-\d{1,2}){1,2})(?:[^\d]|$)/);
            if (addressMatch && !addressMatch[1].match(/^\d{3}-\d{4}$/)) {
                houseInfo = addressMatch[1];
                console.log('[GPS] display_nameから番地発要E', houseInfo);
            }
        }
        
        // 3. より詳細な座標で再検索�E�最後�E手段�E�E
        if (!houseInfo) {
            console.log('[GPS] 番地惁E��なぁE);
        }
    }
    
    if (houseInfo) {
        formatted += houseInfo;
    }
    
    // 建物名�E施設吁E
    if (addr.amenity || addr.building || addr.shop || addr.office) {
        const facilityName = addr.amenity || addr.building || addr.shop || addr.office;
        formatted += ' ' + facilityName;
    }
    
    // 具体的な場所の名前�E�Eame�E�E
    if (data.name && data.name !== formatted) {
        formatted += ' (' + data.name + ')';
    }
    
    console.log('[GPS] 整形結果:', formatted);
    
    return formatted || data.display_name;
}

// 従来の関数も残す�E�互換性のため�E�E
function formatJapaneseAddress(data) {
    return formatDetailedJapaneseAddress(data);
}

/**
 * 事故報告データを新しい構造に変換
 */
function buildReportData(formData, photoData) {
    // 事故種類を日本語に変換
    const accidentTypeJp = formData.accidentType === 'vehicle' ? '車両事故' : 'そ�E仁E;
    
    const baseData = {
        // 基本惁E��
        reporterName: formData.reporter,
        office: formData.office,
        incidentDate: formData.incidentDate,
        incidentTime: formData.incidentTime,
        accidentType: accidentTypeJp,
        location: formData.location,
        details: formData.accidentDetails,
        
        // 写真チE�Eタ
        photos: {
            scene: photoData.scene || []
        }
    };
    
    // 条件刁E��データを追加
    if (formData.accidentType === 'other') {
        // そ�E他事故の頁E��
        baseData.otherAccidentCategory = formData.otherAccidentCategory;
        baseData.locationCategory = formData.locationCategory;
        baseData.locationDetail = formData.detailLocation;
        baseData.locationNote = formData.otherLocation;
        
    } else if (formData.accidentType === 'vehicle') {
        // 車両事故の頁E��
        baseData.driverName = formData.driverName;
        baseData.propertyDamage = formData.propertyDamage;
        baseData.propertyDetails = formData.propertyDetailsText;
        baseData.personalInjury = formData.personalInjury;
        baseData.personalDetails = formData.injuryDetailsText;
        
        // 負傷惁E���E�チェチE��ボックスの状態を取得！E
        const injurySelf = document.getElementById('injurySelf')?.checked ? 'あり' : '';
        const injuryPassenger = document.getElementById('injuryPassenger')?.checked ? 'あり' : '';
        const injuryOther = document.getElementById('injuryOther')?.checked ? 'あり' : '';
        const injuryDetailsText = formData.injuryDetailsText || '';
        
        baseData.injury = {
            self: injurySelf,
            selfDetails: injurySelf ? injuryDetailsText : '',
            passenger: injuryPassenger,
            passengerDetails: injuryPassenger ? injuryDetailsText : '',
            other: injuryOther,
            otherDetails: injuryOther ? injuryDetailsText : ''
        };
        
        // 車両事故の追加写真�E�条件に関係なく�Eて追加�E�E
        baseData.photos.property = photoData.property || [];
        baseData.photos.otherVehicle = photoData.otherVehicle || [];
        baseData.photos.ownVehicle = photoData.ownVehicle || [];
        baseData.photos.license = photoData.license || [];
    }
    
    // チE�Eタ構築完亁E
    
    return baseData;
}

/**
 * Google Maps APIのformatted_addressから不要な部刁E��除去
 */
function cleanJapaneseAddress(formattedAddress) {
    if (!formattedAddress) return '';
    
    let cleanedAddress = formattedAddress;
    
    // 末尾の「日本」を除去
    cleanedAddress = cleanedAddress.replace(/、E\s*日本$/, '');
    
    // 先頭の「日本、」も除去
    cleanedAddress = cleanedAddress.replace(/^日本、\s*/, '');
    
    // 郵便番号パターンを除去�E�例：、E72-0827、E72-0827�E�E
    cleanedAddress = cleanedAddress.replace(/、E\d{3}-?\d{4}\s*/, '');
    
    // 先頭の郵便番号パターンも除去
    cleanedAddress = cleanedAddress.replace(/^\d{3}-?\d{4}\s*/, '');
    
    // 余�Eなスペ�Eスとカンマを渁E��化
    cleanedAddress = cleanedAddress.replace(/^\s*,?\s*/, ''); // 先頭のカンマとスペ�Eス
    cleanedAddress = cleanedAddress.replace(/\s*,?\s*$/, ''); // 末尾のカンマとスペ�Eス
    cleanedAddress = cleanedAddress.replace(/\s+/g, ''); // 褁E��スペ�Eスを削除
    
    console.log('[GPS] 住所渁E��化:', formattedAddress, '->', cleanedAddress);
    return cleanedAddress;
}

/**
 * Google Maps APIレスポンスをGASにログとして送信
 */
async function logGoogleMapsResponse(data) {
    try {
        const response = await fetch(config.gasUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'logGoogleMapsResponse',
                ...data
            })
        });
        
        const result = await response.json();
        console.log('[GPS] ログ送信完亁E', result);
        return result;
    } catch (error) {
        console.error('[GPS] ログ送信失敁E', error);
        throw error;
    }
}

/**
 * Google Maps APIの結果から番地�E�Eouse number�E�を抽出
 */
function extractHouseNumberFromResult(result) {
    if (!result || !result.address_components) return '';
    
    let streetNumber = '';
    let subpremise = '';
    let postalCode = '';
    
    result.address_components.forEach(component => {
        const types = component.types;
        
        // 郵便番号は除外（ログ用に記録のみ�E�E
        if (types.includes('postal_code')) {
            postalCode = component.long_name;
            return; // 番地構築には使用しなぁE
        }
        
        if (types.includes('street_number')) {
            streetNumber = component.long_name;
        }
        if (types.includes('subpremise')) {
            subpremise = component.long_name;
        }
    });
    
    // 番地の構築（例！E-6-6�E�E
    let houseNumber = '';
    if (streetNumber) {
        houseNumber = streetNumber;
        if (subpremise) {
            // 既にハイフンが含まれてぁE��かチェチE��
            if (!subpremise.startsWith('-')) {
                houseNumber += '-' + subpremise;
            } else {
                houseNumber += subpremise;
            }
        }
    }
    
    console.log('[GPS] 抽出した番地:', houseNumber, '除外郵便番号:', postalCode);
    return houseNumber;
}

// 画像圧縮設宁E
const imageConfig = {
    // 高画質設定（より大きいサイズと高品質�E�E
    maxWidth: 1200,    // 600 ↁE1200
    maxHeight: 900,    // 450 ↁE900
    quality: 0.85,     // 0.5 ↁE0.85 (85%品質)
    enableCompression: true  // falseで圧縮無効化可能
};

// 画像圧縮�E�高画質対応版�E�E
async function compressImageDirect(file) {
    // 圧縮が無効化されてぁE��場合�E允E��像をそ�Eまま返す
    if (!imageConfig.enableCompression) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result.split(",")[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const maxWidth = imageConfig.maxWidth;
                const maxHeight = imageConfig.maxHeight;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                const compressed = canvas.toDataURL("image/jpeg", imageConfig.quality);
                resolve(compressed.split(",")[1]);
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 写真アチE�Eロード設宁E
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
                    console.log(`📷 画像�E琁E��姁E ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
                    
                    // 画像を直接圧縮�E�参老E��プリ準拠�E�E
                    const base64 = await compressImageDirect(file);
                    const compressedSize = base64.length * 0.75 / 1024; // Base64サイズからおおよそのKBを計箁E
                    
                    console.log(`📷 圧縮完亁E ${file.name} ↁE${compressedSize.toFixed(1)}KB`);
                    
                    photoData[photoType].push({
                        name: file.name,
                        data: base64,
                        originalSize: file.size,
                        compressedSize: base64.length
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
                    console.error('画像�E琁E��ラー:', error);
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

// バリチE�Eション
function validateForm() {
    let isValid = true;
    
    // 忁E��頁E��のチェチE��
    const requiredFields = ['incidentDate', 'incidentTime', 'accidentDetails'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            showError(field);
            isValid = false;
        }
    });
    
    // 事業所のチェチE��
    const office = document.getElementById('office').value;
    if (!office) {
        alert('事業所が設定されてぁE��せん');
        isValid = false;
    }
    
    // 事故種類�E選択チェチE��
    if (!document.querySelector('input[name="accidentType"]:checked')) {
        const radioGroup = document.querySelector('.radio-group');
        showError(radioGroup);
        isValid = false;
    }
    
        const selectedType = document.querySelector('input[name="accidentType"]:checked')?.value;
    if (selectedType === 'vehicle' && photoData.scene.length === 0) {
        showError(document.getElementById('scenePhoto'));
        isValid = false;
    }

    // 車両事故の場合�E追加チェチE��
    const accidentType = document.querySelector('input[name="accidentType"]:checked');
    if (accidentType && accidentType.value === 'vehicle') {
        // 運転手名
        const driverName = document.getElementById('driverName');
        if (!driverName.value) {
            showError(driverName);
            isValid = false;
        }
        
        // 対物・対人の選抁E
        if (!document.querySelector('input[name="propertyDamage"]:checked')) {
            isValid = false;
        }
        if (!document.querySelector('input[name="personalInjury"]:checked')) {
            isValid = false;
        }
        
        // 対物ありの場合�E詳細
        const propertyDamage = document.querySelector('input[name="propertyDamage"]:checked');
        if (propertyDamage && propertyDamage.value === 'yes') {
            const propertyDetails = document.getElementById('propertyDetailsText');
            if (!propertyDetails.value) {
                showError(propertyDetails);
                isValid = false;
            }
        }
        
        // 対人ありの場合�E詳細
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
        // そ�E他�E場合�E場所チェチE��
        const otherAccidentCategory = document.getElementById('otherAccidentCategory');
        if (!otherAccidentCategory.value) {
            showError(otherAccidentCategory);
            isValid = false;
        }

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
            
            if (detailLocation.value === 'そ�E仁E) {
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
        alert('忁E��頁E��を�E力してください');
        return;
    }
    
    // フォームチE�Eタ収集
    collectFormData();
    
    // 確認�E容の生�E
    const confirmContent = document.getElementById('confirmContent');
    confirmContent.innerHTML = generateConfirmContent();
    
    // モーダル表示
    document.getElementById('confirmModal').classList.add('show');
}

// フォームチE�Eタ収集
function collectFormData() {
    const form = document.getElementById('accidentReportForm');
    formData = Utils.formToObject(form);
    
    // 手動で値を設宁E
    formData.office = document.getElementById('office').value || userOrganization;
    formData.otherAccidentCategory = document.getElementById('otherAccidentCategory')?.value || '';

    // チェチE��ボックスの値を収雁E
    const injuryTypes = [];
    document.querySelectorAll('input[name="injuryType"]:checked').forEach(cb => {
        injuryTypes.push(cb.value);
    });
    formData.injuryTypes = injuryTypes;

    // 写真チE�Eタを追加
    formData.photos = photoData;
}

// 確認�E容生�E
function generateConfirmContent() {
    const accidentType = formData.accidentType === 'vehicle' ? '車両事故' : 'そ�E仁E;
    const office = formData.office || userOrganization;
    
    let html = `
        <p><strong>報告老E</strong> ${formData.reporter}</p>
        <p><strong>事業所:</strong> ${office}</p>
        <p><strong>発生日:</strong> ${Utils.formatDate(formData.incidentDate)}</p>
        <p><strong>発生時刻:</strong> ${Utils.formatTime(formData.incidentTime)}</p>
        <p><strong>事故種顁E</strong> ${accidentType}</p>
    `;
    
    if (formData.accidentType === 'vehicle') {
        html += `
            <p><strong>運転扁E</strong> ${formData.driverName}</p>
            <p><strong>対物:</strong> ${formData.propertyDamage === 'yes' ? 'あり' : 'なぁE}</p>
            <p><strong>対人:</strong> ${formData.personalInjury === 'yes' ? 'あり' : 'なぁE}</p>
            <p><strong>発生場所:</strong> ${formData.location}</p>
        `;
    } else {
        const categorySelect = document.getElementById('locationCategory');
        const locationCategory = categorySelect.options[categorySelect.selectedIndex].text;
        const otherAccidentCategory = document.getElementById('otherAccidentCategory');
        const accidentCategoryText = otherAccidentCategory && otherAccidentCategory.value
            ? otherAccidentCategory.options[otherAccidentCategory.selectedIndex].text
            : '未選抁E;

        html += `<p><strong>事故種顁E</strong> ${accidentCategoryText}</p>`;
        html += `<p><strong>事業所刁E��E</strong> ${locationCategory}</p>`;

        if (formData.detailLocation) {
            html += `<p><strong>詳細場所:</strong> ${formData.detailLocation}</p>`;
        }
        if (formData.otherLocation) {
            html += `<p><strong>そ�E他�E場所:</strong> ${formData.otherLocation}</p>`;
        }
    }
    
    html += `
        <p><strong>事故詳細:</strong><br>${formData.accidentDetails.replace(/\n/g, '<br>')}</p>
        <p><strong>写真:</strong> 事故現場 ${photoData.scene.length}枚`;
    
    if (formData.accidentType === 'vehicle') {
        if (photoData.otherVehicle.length > 0) {
            html += `, 相手�E軁E${photoData.otherVehicle.length}枚`;
        }
        if (photoData.ownVehicle.length > 0) {
            html += `, 自刁E�E軁E${photoData.ownVehicle.length}枚`;
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

// フォーム送信�E�高速化対応！E
async function submitForm() {
    const submitBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const sendingMessage = document.getElementById('sendingMessage');
    
    submitBtn.disabled = true;
    cancelBtn.disabled = true;
    sendingMessage.style.display = 'block';

    let jsonSizeBytes = 0;
    let jsonSizeKB = '0';
    let totalPhotos = 0;
 // 送信中メチE��ージを表示
    
    // プログレス表示用
    let progressStep = 0;
    const progressSteps = ['チE�Eタ準備中...', '画像�E琁E��...', '送信中...', '保存中...'];
    
    const updateProgress = () => {
        if (progressStep < progressSteps.length) {
            submitBtn.textContent = progressSteps[progressStep];
            progressStep++;
        }
    };
    
    updateProgress(); // チE�Eタ準備中...
    
    try {
        // タイムスタンプ追加
        formData.timestamp = new Date().toISOString();
        
        updateProgress(); // 画像�E琁E��...
        
        // 新しいチE�Eタ構造に変換
        const reportData = buildReportData(formData, photoData);
        
        // チE��チE��: 送信チE�Eタ確誁E
        console.log('🚚 送信チE�Eタ確誁E', {
            scene: photoData.scene?.length || 0,
            property: photoData.property?.length || 0,
            otherVehicle: photoData.otherVehicle?.length || 0,
            ownVehicle: photoData.ownVehicle?.length || 0,
            license: photoData.license?.length || 0
        });

        // チE�EタサイズチェチE��
        jsonSizeBytes = JSON.stringify(reportData).length;
        jsonSizeKB = (jsonSizeBytes / 1024).toFixed(1);
        totalPhotos = Object.values(reportData.photos).flat().length;

        console.log('📝 事故報告送信開姁E', {
            事故種別: reportData.accidentType,
            写真枚数: totalPhotos,
            チE�Eタサイズ: `${jsonSizeKB}KB`
        });

        // チE�Eタサイズ制限チェチE���E�E枚�E画像でめEMB以冁E��収まるよぁE��整�E�E
        if (jsonSizeBytes > 2 * 1024 * 1024) { // 2MB以丁E
            throw new Error(`チE�Eタサイズが大きすぎまぁE(${jsonSizeKB}KB)。画像を減らすか、より小さぁE��像を使用してください。`);
        }
        
        updateProgress(); // 送信中...
        
        // URLSearchParams形式で送信�E�参老E��プリ準拠�E�E
        const formDataParams = new URLSearchParams();
        formDataParams.append('action', 'submitAccidentReport');
        formDataParams.append('reporterName', reportData.reporterName || '');
        formDataParams.append('office', reportData.office || '');
        formDataParams.append('incidentDate', reportData.incidentDate || '');
        formDataParams.append('incidentTime', reportData.incidentTime || '');
        formDataParams.append('accidentType', reportData.accidentType || '');
        formDataParams.append('location', reportData.location || '');
        formDataParams.append('details', reportData.details || '');
        
        // 車両事故の場合�E追加フィールチE
        if (reportData.accidentType === '車両事故') {
            formDataParams.append('driverName', reportData.driverName || '');
            formDataParams.append('propertyDamage', reportData.propertyDamage || '');
            formDataParams.append('propertyDetails', reportData.propertyDetails || '');
            formDataParams.append('personalInjury', reportData.personalInjury || '');
            formDataParams.append('personalDetails', reportData.personalDetails || '');
            if (reportData.injury) {
                formDataParams.append('injurySelf', reportData.injury.self || '');
                formDataParams.append('injurySelfDetails', reportData.injury.selfDetails || '');
                formDataParams.append('injuryPassenger', reportData.injury.passenger || '');
                formDataParams.append('injuryPassengerDetails', reportData.injury.passengerDetails || '');
                formDataParams.append('injuryOther', reportData.injury.other || '');
                formDataParams.append('injuryOtherDetails', reportData.injury.otherDetails || '');
            }
        } else if (reportData.accidentType === 'そ�E仁E) {
            // そ�E他事故の場合�E追加フィールチE
            formDataParams.append('otherAccidentCategory', reportData.otherAccidentCategory || '');
            formDataParams.append('locationCategory', reportData.locationCategory || '');
            formDataParams.append('locationDetail', reportData.locationDetail || '');
            formDataParams.append('locationNote', reportData.locationNote || '');
        }
        
        // 写真チE�Eタを個別に追加
        const photos = reportData.photos || {};
        Object.keys(photos).forEach(photoType => {
            if (photos[photoType] && photos[photoType].length > 0) {
                photos[photoType].forEach((photo, index) => {
                    formDataParams.append(`photo_${photoType}_${index}`, photo.data);
                    formDataParams.append(`photoName_${photoType}_${index}`, photo.name);
                });
            }
        });
        
        console.log('[INFO] Payload summary:', {
            photoCount: totalPhotos,
            dataSizeKB: jsonSizeKB,
            urlSearchParamsLength: formDataParams.toString().length
        });
        const response = await fetch(config.gasUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formDataParams
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        const result = JSON.parse(responseText);
        
        if (result.success) {
            updateProgress(); // 保存中...
            
            console.log('✁E事故報告送信完亁E', { 
                報告ID: result.reportId, 
                写真数: result.photoCount 
            });
            
            // 少し征E��てから画面遷移�E�ユーザーに保存完亁E��視覚的に伝える！E
            setTimeout(() => {
                localStorage.setItem('reportResult', JSON.stringify({
                    success: true,
                    reportId: result.reportId,
                    timestamp: reportData.timestamp
                }));
                window.location.href = 'result.html';
            }, 500);
        } else {
            throw new Error(result.error || '送信に失敗しました');
        }
        
    } catch (error) {
        console.error('❁E送信エラー:', error.message);
        alert('送信に失敗しました。もぁE��度お試しください、Enエラー: ' + error.message);
        submitBtn.disabled = false;
        cancelBtn.disabled = false;
        submitBtn.textContent = '送信する';
        sendingMessage.style.display = 'none'; // 送信中メチE��ージを非表示
    }
}

