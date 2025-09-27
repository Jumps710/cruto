// 蜈･騾髯｢蝣ｱ蜻翫ヵ繧ｩ繝ｼ繝 JavaScript

// 險ｭ螳・
const config = {
    woffId: '_2Todd08o2jPGgjmr_9Teg', // 譛ｬ逡ｪ迺ｰ蠅・・WOFF ID
    gasUrl: 'https://script.google.com/macros/s/AKfycby5fRaVu5vISA3dvflBAaYXtWtBGXRyWt9HpWYlAiWbqqHzyBxSAt6vpWn6NuWFk8Gj/exec'
};

// 繧ｰ繝ｭ繝ｼ繝舌Ν螟画焚
let formData = {};
let userOrganization = '';
let availableOffices = [];

// 繧ｭ繝｣繝・す繝･讖溯・
const cache = {
    offices: null,
    officesExpiry: null
};

// 蛻晄悄蛹・
document.addEventListener('DOMContentLoaded', async function() {
    console.log('噫 hospital-report DOMContentLoaded髢句ｧ・);
    
    // 縺ｾ縺壽怙蛻昴↓繧､繝吶Φ繝医Μ繧ｹ繝翫・繧定ｨｭ螳夲ｼ医ヵ繧ｩ繝ｼ繝謫堺ｽ懊ｒ蜊ｳ蠎ｧ縺ｫ譛牙柑蛹厄ｼ・
    setupEventListeners();
    console.log('而 繧､繝吶Φ繝医Μ繧ｹ繝翫・險ｭ螳壼ｮ御ｺ・ｼ亥━蜈亥ｮ溯｡鯉ｼ・);
    
    // 莉頑律縺ｮ譌･莉倥ｒ蜊ｳ蠎ｧ縺ｫ險ｭ螳・
    const today = new Date();
    document.getElementById('reportDate').value = today.toISOString().split('T')[0];
    console.log('套 蝣ｱ蜻頑律險ｭ螳壼ｮ御ｺ・', today.toISOString().split('T')[0]);
    
    try {
        console.log('導 WOFF蛻晄悄蛹夜幕蟋・, {woffId: config.woffId});
        
        // WOFF蛻晄悄蛹・
        const profile = await WOFFManager.init(config.woffId);
        console.log('笨・WOFF蛻晄悄蛹門ｮ御ｺ・, profile);
        
        // 蝣ｱ蜻願・錐繧定ｨｭ螳・
        document.getElementById('reporter').value = profile.displayName;
        console.log('側 蝣ｱ蜻願・錐險ｭ螳壼ｮ御ｺ・', profile.displayName);
        
        // 繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ邨・ｹ疲ュ蝣ｱ繧帝撼蜷梧悄縺ｧ蜿門ｾ暦ｼ医ヶ繝ｭ繝・く繝ｳ繧ｰ縺励↑縺・ｼ・
        console.log('召 繝ｦ繝ｼ繧ｶ繝ｼ邨・ｹ疲ュ蝣ｱ蜿門ｾ鈴幕蟋・', profile.userId);
        getUserOrganization(profile.userId).then(() => {
            console.log('笨・邨・ｹ疲ュ蝣ｱ蜿門ｾ怜ｮ御ｺ・);
        }).catch(error => {
            console.error('笶・邨・ｹ疲ュ蝣ｱ蜿門ｾ励お繝ｩ繝ｼ:', error);
        });
        
        // 繝ｪ繧｢繝ｫ繧ｿ繧､繝讀懃ｴ｢繧剃ｽｿ逕ｨ縺吶ｋ縺溘ａ縲√・繧ｹ繧ｿ繝・・繧ｿ縺ｮ莠句燕蜿門ｾ励・荳崎ｦ・
        
        console.log('笨・蝓ｺ譛ｬ蛻晄悄蛹門・逅・ｮ御ｺ・ｼ育ｵ・ｹ疲ュ蝣ｱ縺ｯ荳ｦ陦悟叙蠕嶺ｸｭ・・);
        
    } catch (error) {
        console.error('笶・蛻晄悄蛹悶お繝ｩ繝ｼ:', error);
        console.error('繧ｨ繝ｩ繝ｼ隧ｳ邏ｰ:', {
            message: error.message,
            stack: error.stack,
            config: config
        });
        
        // WOFF蛻晄悄蛹悶↓螟ｱ謨励＠縺ｦ繧ゅ√ヵ繧ｩ繝ｼ繝縺ｯ菴ｿ縺医ｋ繧医≧縺ｫ縺吶ｋ
        document.getElementById('reporter').value = '繝・せ繝医Θ繝ｼ繧ｶ繝ｼ';
        
        // 繝・ヵ繧ｩ繝ｫ繝医・莠区･ｭ謇驕ｸ謚櫁い繧定｡ｨ遉ｺ
        const officeContainer = document.getElementById('officeContainer');
        const officeSelect = document.getElementById('office');
        
        // 繝ｭ繝ｼ繝・ぅ繝ｳ繧ｰ繝｡繝・そ繝ｼ繧ｸ縺ｮ縺ｿ繧貞炎髯､
        const loadingMsg = officeContainer.querySelector('.loading-message');
        if (loadingMsg) loadingMsg.remove();
        
        // select繧定｡ｨ遉ｺ
        officeSelect.innerHTML = `
            <option value="">驕ｸ謚槭＠縺ｦ縺上□縺輔＞</option>
            <option value="譛ｬ遉ｾ">譛ｬ遉ｾ</option>
            <option value="髢｢譚ｱ謾ｯ蠎・>髢｢譚ｱ謾ｯ蠎・/option>
            <option value="髢｢隘ｿ謾ｯ蠎・>髢｢隘ｿ謾ｯ蠎・/option>
        `;
        officeSelect.style.display = 'block';
        
        console.log('笞・・WOFF蛻晄悄蛹門､ｱ謨・- 繝輔か繝ｼ繝縺ｯ蜍穂ｽ懷庄閭ｽ迥ｶ諷・);
    }
});

// 繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ邨・ｹ疲ュ蝣ｱ繧貞叙蠕・
async function getUserOrganization(userId) {
    try {
        const requestData = {
            action: 'getUserOrganization',
            userId: userId
        };
        
        let response;
        let result;
        
        try {
            // GET繝ｪ繧ｯ繧ｨ繧ｹ繝医〒繝代Λ繝｡繝ｼ繧ｿ縺ｨ縺励※騾∽ｿ｡・・ORS蝗樣∩・・
            const params = new URLSearchParams(requestData);
            const getUrl = `${config.gasUrl}?${params.toString()}`;
            
            console.log('[DEBUG] getUserOrganization 繝ｪ繧ｯ繧ｨ繧ｹ繝磯∽ｿ｡:', {
                url: getUrl,
                userId: requestData.userId,
                gasUrl: config.gasUrl
            });
            
            response = await fetch(getUrl, {
                method: 'GET',
                redirect: 'follow',
                mode: 'cors'
            });
            
            console.log('[DEBUG] getUserOrganization 繝ｬ繧ｹ繝昴Φ繧ｹ蜿嶺ｿ｡:', {
                status: response.status,
                ok: response.ok,
                statusText: response.statusText
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // 繝ｬ繧ｹ繝昴Φ繧ｹ繝・く繧ｹ繝医ｒ蜈医↓蜿門ｾ励＠縺ｦ繝ｭ繧ｰ蜃ｺ蜉・
            const responseText = await response.text();
            
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error('繝ｬ繧ｹ繝昴Φ繧ｹ縺ｮJSON隗｣譫舌↓螟ｱ謨・ ' + parseError.message);
            }
        } catch (fetchError) {
            throw new Error('繝阪ャ繝医Ρ繝ｼ繧ｯ繧ｨ繝ｩ繝ｼ: ' + fetchError.message);
        }
        
        if (result && result.orgUnitName) {
            userOrganization = result.orgUnitName;
            
            console.log('[DEBUG] 邨・ｹ疲ュ蝣ｱ蜿門ｾ玲・蜉・', {
                orgUnitName: result.orgUnitName,
                userOrganization: userOrganization
            });
            
            // 莠区･ｭ謇繝輔ぅ繝ｼ繝ｫ繝峨ｒ險ｭ螳・
            const officeContainer = document.getElementById('officeContainer');
            const officeSelect = document.getElementById('office');
            
            console.log('[DEBUG] DOM隕∫ｴ蜿門ｾ・', {
                officeContainer: !!officeContainer,
                officeSelect: !!officeSelect,
                officeContainerHTML: officeContainer ? officeContainer.innerHTML : 'null',
                officeSelectStyle: officeSelect ? officeSelect.style.display : 'null'
            });
            
            if (!officeContainer || !officeSelect) {
                console.error('[ERROR] 莠区･ｭ謇DOM隕∫ｴ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ:', {
                    officeContainer: !!officeContainer,
                    officeSelect: !!officeSelect
                });
                return;
            }
            
            console.log('女・・莠区･ｭ謇陦ｨ遉ｺ繧ｨ繝ｪ繧｢譖ｴ譁ｰ髢句ｧ・);
            
            // 繝ｭ繝ｼ繝・ぅ繝ｳ繧ｰ繝｡繝・そ繝ｼ繧ｸ繧貞炎髯､
            console.log('[DEBUG] 繝ｭ繝ｼ繝・ぅ繝ｳ繧ｰ繝｡繝・そ繝ｼ繧ｸ蜑企勁蜑・', officeContainer.innerHTML);
            officeContainer.innerHTML = '';
            console.log('[DEBUG] 繝ｭ繝ｼ繝・ぅ繝ｳ繧ｰ繝｡繝・そ繝ｼ繧ｸ蜑企勁蠕・', officeContainer.innerHTML);
            
            // 蜿門ｾ励＠縺溽ｵ・ｹ斐ｒ繝・ヵ繧ｩ繝ｫ繝医→縺励※險ｭ螳壹＠縲《elect繧定｡ｨ遉ｺ
            const optionHTML = `<option value="${userOrganization}">${userOrganization}</option>`;
            console.log('[DEBUG] 險ｭ螳壹☆繧九が繝励す繝ｧ繝ｳHTML:', optionHTML);
            
            officeSelect.innerHTML = optionHTML;
            officeSelect.value = userOrganization;
            officeSelect.style.display = 'block';
            
            console.log('[DEBUG] 莠区･ｭ謇險ｭ螳壼ｮ御ｺ・', {
                innerHTML: officeSelect.innerHTML,
                value: officeSelect.value,
                display: officeSelect.style.display,
                selectedIndex: officeSelect.selectedIndex
            });
            
            // 莠区･ｭ謇荳隕ｧ繧帝撼蜷梧悄縺ｧ蜿門ｾ励＠縺ｦ繝励Ν繝繧ｦ繝ｳ縺ｫ霑ｽ蜉
            loadOfficesFromSheet().then(() => {
                // 莠区･ｭ謇荳隕ｧ蜿門ｾ怜ｾ後∫樟蝨ｨ縺ｮ邨・ｹ斐′蜈磯ｭ縺ｫ陦ｨ遉ｺ縺輔ｌ繧九ｈ縺・ｪｿ謨ｴ
                if (availableOffices.length > 0) {
                    const currentOption = `<option value="${userOrganization}" selected>${userOrganization}</option>`;
                    const otherOptions = availableOffices
                        .filter(office => office.value !== userOrganization)
                        .map(office => `<option value="${office.value}">${office.name}</option>`)
                        .join('');
                    officeSelect.innerHTML = currentOption + otherOptions;
                }
            }).catch(error => {
                console.error('莠区･ｭ謇荳隕ｧ縺ｮ蜿門ｾ励↓螟ｱ謨・', error);
            });
            
            console.log('識 莠区･ｭ謇陦ｨ遉ｺ繧ｨ繝ｪ繧｢譖ｴ譁ｰ螳御ｺ・);
            
        } else if (result && Array.isArray(result)) {
            // 繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ: 莠区･ｭ謇荳隕ｧ繧貞叙蠕励＠縺溷ｴ蜷・
            console.log('笞・・繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ: 莠区･ｭ謇荳隕ｧ蜿門ｾ・, result);
            loadOfficesFromAPIResponse(result);
            
        } else {
            throw new Error('邨・ｹ疲ュ蝣ｱ繧貞叙蠕励〒縺阪∪縺帙ｓ縺ｧ縺励◆ - result: ' + JSON.stringify(result));
        }
        
    } catch (error) {
        console.error('笶・邨・ｹ疲ュ蝣ｱ蜿門ｾ励お繝ｩ繝ｼ:', error);
        console.error('繧ｨ繝ｩ繝ｼ隧ｳ邏ｰ:', {
            message: error.message,
            stack: error.stack,
            userId: userId,
            gasUrl: config.gasUrl
        });
        // 繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ: 謇句虚驕ｸ謚・
        console.log('売 繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ: 莠区･ｭ謇荳隕ｧ蜿門ｾ鈴幕蟋・);
        await loadOfficesFromSheet();
    }
}

// API繝ｬ繧ｹ繝昴Φ繧ｹ縺九ｉ莠区･ｭ謇荳隕ｧ繧定ｨｭ螳・
function loadOfficesFromAPIResponse(offices) {
    console.log('搭 loadOfficesFromAPIResponse髢句ｧ・);
    
    const officeContainer = document.getElementById('officeContainer');
    const officeSelect = document.getElementById('office');
    
    if (offices && Array.isArray(offices)) {
        availableOffices = offices;
        console.log('笨・莠区･ｭ謇荳隕ｧ蜿門ｾ玲・蜉・', offices.length + '莉ｶ');
        
        // 繝ｭ繝ｼ繝・ぅ繝ｳ繧ｰ繝｡繝・そ繝ｼ繧ｸ縺ｮ縺ｿ繧貞炎髯､
        const loadingMsg = officeContainer.querySelector('.loading-message');
        if (loadingMsg) loadingMsg.remove();
        
        // 莠区･ｭ謇驕ｸ謚櫁い繧定ｨｭ螳・
        officeSelect.innerHTML = '<option value="">驕ｸ謚槭＠縺ｦ縺上□縺輔＞</option>';
        
        offices.forEach(office => {
            const option = document.createElement('option');
            option.value = office.value;
            option.textContent = office.name;
            officeSelect.appendChild(option);
        });
        
        officeSelect.style.display = 'block';
    } else {
        console.log('笞・・辟｡蜉ｹ縺ｪ莠区･ｭ謇繝・・繧ｿ');
        loadOfficesFromSheet();
    }
}

// Sheets縺九ｉ莠区･ｭ謇荳隕ｧ繧貞叙蠕暦ｼ井ｺ区腐蝣ｱ蜻翫い繝励Μ縺ｨ蜷後§謌仙粥繝代ち繝ｼ繝ｳ・・
async function loadOfficesFromSheet() {
    // 繧ｭ繝｣繝・す繝･繝√ぉ繝・け
    if (cache.offices && cache.officesExpiry && Date.now() < cache.officesExpiry) {
        return loadOfficesFromCache();
    }
    
    try {
        // 莠区･ｭ謇諠・ｱ蜿門ｾ鈴幕蟋・
        // Promise.race縺ｧ繧ｿ繧､繝繧｢繧ｦ繝亥宛蠕｡
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('繧ｿ繧､繝繧｢繧ｦ繝・ 10遘剃ｻ･蜀・↓蠢懃ｭ斐′縺ゅｊ縺ｾ縺帙ｓ縺ｧ縺励◆')), 10000);
        });
        
        // GET譁ｹ蠑上〒繝代Λ繝｡繝ｼ繧ｿ騾∽ｿ｡・・etUserOrganization縺ｨ蜷後§謌仙粥繝代ち繝ｼ繝ｳ・・
        const requestData = {
            action: 'getOffices'
        };
        const params = new URLSearchParams(requestData);
        const getUrl = `${config.gasUrl}?${params.toString()}`;
        
        console.log('[DEBUG] getOffices 繝ｪ繧ｯ繧ｨ繧ｹ繝磯∽ｿ｡:', {
            url: getUrl,
            action: requestData.action,
            gasUrl: config.gasUrl
        });
        
        const fetchPromise = fetch(getUrl, {
            method: 'GET',
            redirect: 'follow',
            mode: 'cors'
        });
        
        console.log('[DEBUG] fetchPromise菴懈・螳御ｺ・√Ξ繧ｹ繝昴Φ繧ｹ蠕・ｩ滉ｸｭ...');
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const offices = await response.json();
        
        if (offices && Array.isArray(offices)) {
            // 繧ｭ繝｣繝・す繝･縺ｫ菫晏ｭ假ｼ・蛻・俣譛牙柑・・
            cache.offices = offices;
            cache.officesExpiry = Date.now() + (5 * 60 * 1000);
            
            availableOffices = offices;
            
            const officeContainer = document.getElementById('officeContainer');
            const officeSelect = document.getElementById('office');
            
            // 繝ｭ繝ｼ繝・ぅ繝ｳ繧ｰ繝｡繝・そ繝ｼ繧ｸ繧貞炎髯､
            officeContainer.innerHTML = '';
            
            // 莠区･ｭ謇驕ｸ謚櫁い繧定ｨｭ螳・
            officeSelect.innerHTML = '<option value="">驕ｸ謚槭＠縺ｦ縺上□縺輔＞</option>';
            
            offices.forEach(office => {
                const option = document.createElement('option');
                option.value = office.value;
                option.textContent = office.name;
                officeSelect.appendChild(option);
            });
            
            officeSelect.style.display = 'block';
            
        } else {
            throw new Error('辟｡蜉ｹ縺ｪ莠区･ｭ謇繝・・繧ｿ');
        }
        
    } catch (error) {
        console.error('莠区･ｭ謇諠・ｱ蜿門ｾ励お繝ｩ繝ｼ:', error);
        // 繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ: 繝・ヵ繧ｩ繝ｫ繝井ｺ区･ｭ謇
        loadDefaultOffices();
    }
}

// 繧ｭ繝｣繝・す繝･縺九ｉ莠区･ｭ謇荳隕ｧ繧定ｪｭ縺ｿ霎ｼ縺ｿ
function loadOfficesFromCache() {
    if (cache.offices && Array.isArray(cache.offices)) {
        availableOffices = cache.offices;
        
        const officeContainer = document.getElementById('officeContainer');
        const officeSelect = document.getElementById('office');
        
        // 繝ｭ繝ｼ繝・ぅ繝ｳ繧ｰ繝｡繝・そ繝ｼ繧ｸ縺ｮ縺ｿ繧貞炎髯､
        const loadingMsg = officeContainer.querySelector('.loading-message');
        if (loadingMsg) loadingMsg.remove();
        
        // 莠区･ｭ謇驕ｸ謚櫁い繧定ｨｭ螳・
        officeSelect.innerHTML = '<option value="">驕ｸ謚槭＠縺ｦ縺上□縺輔＞</option>';
        
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

// 繝・ヵ繧ｩ繝ｫ繝井ｺ区･ｭ謇縺ｮ險ｭ螳・
function loadDefaultOffices() {
    const defaultOffices = [
        { value: '譛ｬ遉ｾ', name: '譛ｬ遉ｾ' },
        { value: '髢｢譚ｱ謾ｯ蠎・, name: '髢｢譚ｱ謾ｯ蠎・ },
        { value: '髢｢隘ｿ謾ｯ蠎・, name: '髢｢隘ｿ謾ｯ蠎・ }
    ];
    
    availableOffices = defaultOffices;
    
    const officeContainer = document.getElementById('officeContainer');
    const officeSelect = document.getElementById('office');
    
    // 繝ｭ繝ｼ繝・ぅ繝ｳ繧ｰ繝｡繝・そ繝ｼ繧ｸ縺ｮ縺ｿ繧貞炎髯､
    const loadingMsg = officeContainer.querySelector('.loading-message');
    if (loadingMsg) loadingMsg.remove();
    
    // 莠区･ｭ謇驕ｸ謚櫁い繧定ｨｭ螳・
    officeSelect.innerHTML = '<option value="">驕ｸ謚槭＠縺ｦ縺上□縺輔＞</option>';
    
    defaultOffices.forEach(office => {
        const option = document.createElement('option');
        option.value = office.value;
        option.textContent = office.name;
        officeSelect.appendChild(option);
    });
    
    officeSelect.style.display = 'block';
}

// 繝槭せ繧ｿ繝・・繧ｿ縺ｯ繝ｪ繧｢繝ｫ繧ｿ繧､繝讀懃ｴ｢縺ｧ蜿門ｾ励☆繧九◆繧√∽ｺ句燕蜿門ｾ鈴未謨ｰ縺ｯ荳崎ｦ・

// 荳崎ｦ√↑髢｢謨ｰ繧貞炎髯､・医・繝ｫ繝繧ｦ繝ｳ驕ｸ謚槭↓螟画峩縺励◆縺溘ａ・・

// 繧､繝吶Φ繝医Μ繧ｹ繝翫・縺ｮ險ｭ螳・
function setupEventListeners() {
    // 蟇ｾ雎｡蛹ｺ蛻・・蛻・ｊ譖ｿ縺・
    document.querySelectorAll('input[name="entryType"]').forEach(radio => {
        radio.addEventListener('change', handleEntryTypeChange);
    });

    // 閼ｱ關ｽ逅・罰縺ｮ蛻・ｊ譖ｿ縺・
    document.querySelectorAll('input[name="reason"]').forEach(radio => {
        radio.addEventListener('change', handleReasonChange);
    });

    // 險ｺ譁ｭ蜷阪〒縲後◎縺ｮ莉悶阪ｒ驕ｸ謚槭＠縺溷ｴ蜷・
    document.getElementById('hospitalDiagnosis').addEventListener('change', () => {
        const otherDiv = document.getElementById('hospitalOtherDiagnosis');
        const diagnosis = document.getElementById('hospitalDiagnosis');
        otherDiv.style.display = diagnosis.value === '縺昴・莉・ ? 'block' : 'none';
    });

    // 繝ｪ繧｢繝ｫ繧ｿ繧､繝讀懃ｴ｢讖溯・
    try {
        setupUserAutocomplete();
        setupHospitalAutocomplete();
    } catch (autocompleteError) {
        console.error('[ERROR] 繧ｪ繝ｼ繝医さ繝ｳ繝励Μ繝ｼ繝亥・譛溷喧繧ｨ繝ｩ繝ｼ:', autocompleteError);
    }

    // 騾∽ｿ｡繝懊ち繝ｳ
    document.getElementById('submitBtn').addEventListener('click', showConfirmModal);

    // 繝｢繝ｼ繝繝ｫ繝懊ち繝ｳ
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('confirmBtn').addEventListener('click', submitForm);

    // 繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ縺ｮ繧ｯ繝ｪ繧｢
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('input', () => clearError(element));
        element.addEventListener('change', () => clearError(element));
    });

    handleEntryTypeChange();
    updateConditionalSections();
}

function getEntryType() {
    const selected = document.querySelector('input[name="entryType"]:checked');
    return selected ? selected.value : 'existing';
}

function handleEntryTypeChange() {
    const entryType = getEntryType();
    const isNew = entryType === 'new';
    const stopFields = ['stopDate', 'stopDiagnosis'];

    stopFields.forEach(id => {
        const field = document.getElementById(id);
        if (!field) return;
        field.disabled = isNew;
        if (isNew) {
            field.value = '';
            clearError(field);
        }
    });

    const userInput = document.getElementById('userName');
    const suggestions = document.getElementById('userSuggestions');
    const userHelpText = document.getElementById('userNameHelp');
    if (userInput) {
        if (isNew) {
            userInput.placeholder = '蛻ｩ逕ｨ閠・錐繧堤匳骭ｲ縺励※縺上□縺輔＞';
            userInput.setAttribute('data-entry-type', 'new');
            if (suggestions) {
                suggestions.classList.remove('show');
                suggestions.innerHTML = '';
            }
            if (userHelpText) {
                userHelpText.textContent = '蛻ｩ逕ｨ閠・錐繧堤匳骭ｲ縺励※縺上□縺輔＞';
            }
        } else {
            userInput.placeholder = '蛻ｩ逕ｨ閠・錐繧貞・蜉帙＠縺ｦ縺上□縺輔＞...';
            userInput.setAttribute('data-entry-type', 'existing');
            if (userHelpText) {
                userHelpText.textContent = '貍｢蟄励〒蜈･蜉帙＠縺ｦ縺上□縺輔＞';
            }
        }
    }

    updateConditionalSections();
}

function updateConditionalSections() {
    const entryType = getEntryType();
    const reasonInput = document.querySelector('input[name="reason"]:checked');
    const hospitalSection = document.getElementById('hospitalSection');
    const stopSection = document.getElementById('stopSection');

    if (!hospitalSection || !stopSection) {
        return;
    }

    if (reasonInput && reasonInput.value === 'hospital') {
        hospitalSection.classList.add('active');
    } else {
        hospitalSection.classList.remove('active');
    }

    if (entryType === 'existing' && reasonInput && reasonInput.value === 'stop') {
        stopSection.classList.add('active');
    } else {
        stopSection.classList.remove('active');
    }
}

// 閼ｱ關ｽ逅・罰螟画峩譎ゅ・蜃ｦ逅・
function handleReasonChange() {
    updateConditionalSections();
}

// 閾ｪ蜍戊｣懷ｮ梧ｩ溯・縺ｮ險ｭ螳・
function setupAutocomplete(inputId, suggestionsId, dataArray, nameField, subField) {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);
    let selectedIndex = -1;
    
    input.addEventListener('input', function() {
        if (getEntryType() === 'new') {
            suggestions.classList.remove('show');
            suggestions.innerHTML = '';
            selectedIndex = -1;
            return;
        }
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
            
            // 繧ｯ繝ｪ繝・け繧､繝吶Φ繝・
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
    
    // 繧ｭ繝ｼ繝懊・繝画桃菴・
    input.addEventListener('keydown', function(e) {
        if (getEntryType() === 'new') {
            return;
        }
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
    
    // 繝輔か繝ｼ繧ｫ繧ｹ繧貞､ｱ縺｣縺滓凾縺ｫ蛟呵｣懊ｒ髱櫁｡ｨ遉ｺ
    input.addEventListener('blur', function() {
        setTimeout(() => {
            suggestions.classList.remove('show');
        }, 200);
    });
}

// 蛻ｩ逕ｨ閠・､懃ｴ｢繧ｪ繝ｼ繝医さ繝ｳ繝励Μ繝ｼ繝・
function setupUserAutocomplete() {
    const input = document.getElementById('userName');
    const suggestions = document.getElementById('userSuggestions');
    let selectedIndex = -1;
    let searchTimeout = null;
    let currentSearchQuery = '';
    let isSearching = false;
    let searchSequence = 0; // 讀懃ｴ｢繝ｪ繧ｯ繧ｨ繧ｹ繝医・鬆・ｺ冗ｮ｡逅・
    
    if (!input || !suggestions) {
        console.error('蛻ｩ逕ｨ閠・､懃ｴ｢逕ｨDOM隕∫ｴ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ');
        return;
    }
    
    input.addEventListener('input', function() {
        const query = this.value.trim();
        
        // 蜑榊屓縺ｮ讀懃ｴ｢繧偵く繝｣繝ｳ繧ｻ繝ｫ
        clearTimeout(searchTimeout);
        
        suggestions.innerHTML = '';
        selectedIndex = -1;
        
        if (getEntryType() === 'new') {
            suggestions.classList.remove('show');
            suggestions.style.display = 'none';
            currentSearchQuery = '';
            isSearching = false;
            return;
        }

        // 繝・く繧ｹ繝医′蜑企勁縺輔ｌ縺溷ｴ蜷医・讀懃ｴ｢邨先棡繧偵け繝ｪ繧｢
        if (query.length < 2) {
            suggestions.classList.remove('show');
            suggestions.style.display = 'none';
            suggestions.innerHTML = '';
            currentSearchQuery = '';
            isSearching = false;
            return;
        }
        
        // 蜷後§繧ｯ繧ｨ繝ｪ縺ｮ蝣ｴ蜷医・驥崎､・､懃ｴ｢繧帝亟縺・
        if (query === currentSearchQuery && isSearching) {
            return;
        }
        
        currentSearchQuery = query;
        isSearching = true;
        
        // 讀懃ｴ｢繧ｷ繝ｼ繧ｱ繝ｳ繧ｹ逡ｪ蜿ｷ繧偵う繝ｳ繧ｯ繝ｪ繝｡繝ｳ繝・
        searchSequence++;
        const currentSequence = searchSequence;
        
        // 繝ｭ繝ｼ繝・ぅ繝ｳ繧ｰ陦ｨ遉ｺ
        suggestions.innerHTML = '<div class="suggestion-loading">剥 讀懃ｴ｢荳ｭ...</div>';
        suggestions.classList.add('show');
        suggestions.style.display = 'block';
        
        // 讀懃ｴ｢繝ｪ繧ｯ繧ｨ繧ｹ繝医ｒ驕・ｻｶ螳溯｡鯉ｼ・00ms縺ｫ遏ｭ邵ｮ・・
        searchTimeout = setTimeout(async () => {
            // 讀懃ｴ｢髢句ｧ区凾縺ｫ繧ｯ繧ｨ繝ｪ縺悟､画峩縺輔ｌ縺ｦ縺・↑縺・°遒ｺ隱・
            if (input.value.trim() !== currentSearchQuery) {
                isSearching = false;
                return;
            }
            
            console.log('蛻ｩ逕ｨ閠・､懃ｴ｢髢句ｧ・', query, '繧ｷ繝ｼ繧ｱ繝ｳ繧ｹ:', currentSequence);
            try {
                const params = new URLSearchParams({
                    action: 'searchUsers',
                    query: query
                });
                
                const requestUrl = `${config.gasUrl}?${params.toString()}`;
                
                const response = await fetch(requestUrl, {
                    method: 'GET',
                    mode: 'cors'
                });
                
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const results = await response.json();
                
                // 繝ｬ繧ｹ繝昴Φ繧ｹ蜿嶺ｿ｡譎ゅ↓繧ｷ繝ｼ繧ｱ繝ｳ繧ｹ逡ｪ蜿ｷ繧堤｢ｺ隱搾ｼ域怙譁ｰ縺ｮ讀懃ｴ｢邨先棡縺ｮ縺ｿ蜃ｦ逅・ｼ・
                if (currentSequence !== searchSequence) {
                    console.log('蜿､縺・､懃ｴ｢邨先棡繧堤┌隕・', currentSequence, '迴ｾ蝨ｨ:', searchSequence);
                    return;
                }
                
                // 繝ｬ繧ｹ繝昴Φ繧ｹ蜿嶺ｿ｡譎ゅ↓繧ｯ繧ｨ繝ｪ縺悟､画峩縺輔ｌ縺ｦ縺・↑縺・°遒ｺ隱・
                if (input.value.trim() !== currentSearchQuery) {
                    isSearching = false;
                    return;
                }
                
                console.log('讀懃ｴ｢邨先棡:', results, '繧ｷ繝ｼ繧ｱ繝ｳ繧ｹ:', currentSequence);
                console.log('邨先棡縺ｮ蝙・', typeof results);
                console.log('驟榊・縺九←縺・°:', Array.isArray(results));
                console.log('莉ｶ謨ｰ:', results ? results.length : 'null');
                
                // 讀懃ｴ｢邨先棡縺ｮ遒ｺ螳溘↑蛻､螳・
                if (Array.isArray(results) && results.length > 0) {
                    console.log('邨先棡縺ゅｊ - 繧ｵ繧ｸ繧ｧ繧ｹ繝郁｡ｨ遉ｺ');
                    const suggestionsHTML = results.map((user, index) => `
                        <div class="suggestion-item" data-index="${index}" data-value="${user.name}">
                            <div class="suggestion-name">${user.name}</div>
                        </div>
                    `).join('');
                    
                    suggestions.innerHTML = suggestionsHTML;
                    suggestions.classList.add('show');
                    suggestions.style.display = 'block';
                    
                    // 繧ｯ繝ｪ繝・け繧､繝吶Φ繝・
                    suggestions.querySelectorAll('.suggestion-item').forEach(item => {
                        item.addEventListener('click', function() {
                            input.value = this.dataset.value;
                            suggestions.classList.remove('show');
                            suggestions.style.display = 'none';
                            suggestions.innerHTML = '';
                            currentSearchQuery = '';
                            isSearching = false;
                            clearError(input);
                        });
                    });
                } else if (Array.isArray(results) && results.length === 0) {
                    // 讀懃ｴ｢縺梧ｭ｣蟶ｸ縺ｫ螳御ｺ・＠縲∫ｵ先棡縺・莉ｶ縺ｮ蝣ｴ蜷医・縺ｿ縲瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆縲阪ｒ陦ｨ遉ｺ
                    console.log('蛻ｩ逕ｨ閠・､懃ｴ｢: 讀懃ｴ｢螳御ｺ・∫ｵ先棡0莉ｶ - 隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆陦ｨ遉ｺ');
                    suggestions.innerHTML = '<div class="suggestion-no-results">隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆</div>';
                    suggestions.classList.add('show');
                    suggestions.style.display = 'block';
                } else {
                    // 荳肴ｭ｣縺ｪ繝ｬ繧ｹ繝昴Φ繧ｹ縺ｮ蝣ｴ蜷医・繧ｨ繝ｩ繝ｼ縺ｨ縺励※謇ｱ縺・
                    console.log('蛻ｩ逕ｨ閠・､懃ｴ｢: 荳肴ｭ｣縺ｪ繝ｬ繧ｹ繝昴Φ繧ｹ蠖｢蠑・- 蛟呵｣憺撼陦ｨ遉ｺ');
                    suggestions.classList.remove('show');
                    suggestions.style.display = 'none';
                }
                
                isSearching = false;
            } catch (error) {
                console.error('蛻ｩ逕ｨ閠・､懃ｴ｢繧ｨ繝ｩ繝ｼ:', error.message);
                suggestions.classList.remove('show');
                isSearching = false;
            }
        }, 200);
    });
    
    // 繧ｭ繝ｼ繝懊・繝画桃菴懊・譌｢蟄倥・螳溯｣・ｒ菴ｿ逕ｨ
    setupKeyboardNavigation(input, suggestions);
}

// 蛹ｻ逋よｩ滄未讀懃ｴ｢繧ｪ繝ｼ繝医さ繝ｳ繝励Μ繝ｼ繝・
function setupHospitalAutocomplete() {
    const input = document.getElementById('hospitalName');
    const suggestions = document.getElementById('hospitalSuggestions');
    let selectedIndex = -1;
    let searchTimeout = null;
    let currentSearchQuery = '';
    let isSearching = false;
    let searchSequence = 0; // 讀懃ｴ｢繝ｪ繧ｯ繧ｨ繧ｹ繝医・鬆・ｺ冗ｮ｡逅・
    
    if (!input || !suggestions) {
        console.error('蛹ｻ逋よｩ滄未讀懃ｴ｢逕ｨDOM隕∫ｴ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ');
        return;
    }
    
    // 繧､繝吶Φ繝医Μ繧ｹ繝翫・縺後い繧ｿ繝・メ縺輔ｌ縺溘％縺ｨ繧堤､ｺ縺吶・繝ｼ繧ｫ繝ｼ
    input.setAttribute('data-listener-attached', 'true');
    
    input.addEventListener('input', function() {
        const query = this.value.trim();
        
        // 蜑榊屓縺ｮ讀懃ｴ｢繧偵く繝｣繝ｳ繧ｻ繝ｫ
        clearTimeout(searchTimeout);
        
        suggestions.innerHTML = '';
        selectedIndex = -1;
        
        // 繝・く繧ｹ繝医′蜑企勁縺輔ｌ縺溷ｴ蜷医・讀懃ｴ｢邨先棡繧偵け繝ｪ繧｢
        if (query.length < 2) {
            suggestions.classList.remove('show');
            suggestions.style.display = 'none';
            suggestions.innerHTML = '';
            currentSearchQuery = '';
            isSearching = false;
            return;
        }
        
        // 蜷後§繧ｯ繧ｨ繝ｪ縺ｮ蝣ｴ蜷医・驥崎､・､懃ｴ｢繧帝亟縺・
        if (query === currentSearchQuery && isSearching) {
            return;
        }
        
        currentSearchQuery = query;
        isSearching = true;
        
        // 讀懃ｴ｢繧ｷ繝ｼ繧ｱ繝ｳ繧ｹ逡ｪ蜿ｷ繧偵う繝ｳ繧ｯ繝ｪ繝｡繝ｳ繝・
        searchSequence++;
        const currentSequence = searchSequence;
        
        // 繝ｭ繝ｼ繝・ぅ繝ｳ繧ｰ陦ｨ遉ｺ
        suggestions.innerHTML = '<div class="suggestion-loading">剥 讀懃ｴ｢荳ｭ...</div>';
        suggestions.classList.add('show');
        suggestions.style.display = 'block';
        
        // 讀懃ｴ｢繝ｪ繧ｯ繧ｨ繧ｹ繝医ｒ驕・ｻｶ螳溯｡鯉ｼ・00ms縺ｫ遏ｭ邵ｮ・・
        searchTimeout = setTimeout(async () => {
            // 讀懃ｴ｢髢句ｧ区凾縺ｫ繧ｯ繧ｨ繝ｪ縺悟､画峩縺輔ｌ縺ｦ縺・↑縺・°遒ｺ隱・
            if (input.value.trim() !== currentSearchQuery) {
                isSearching = false;
                return;
            }
            try {
                const params = new URLSearchParams({
                    action: 'searchHospitals',
                    query: query
                });
                
                const requestUrl = `${config.gasUrl}?${params.toString()}`;
                
                const response = await fetch(requestUrl, {
                    method: 'GET',
                    mode: 'cors'
                });
                
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const results = await response.json();
                
                // 繝ｬ繧ｹ繝昴Φ繧ｹ蜿嶺ｿ｡譎ゅ↓繧ｷ繝ｼ繧ｱ繝ｳ繧ｹ逡ｪ蜿ｷ繧堤｢ｺ隱搾ｼ域怙譁ｰ縺ｮ讀懃ｴ｢邨先棡縺ｮ縺ｿ蜃ｦ逅・ｼ・
                if (currentSequence !== searchSequence) {
                    console.log('蜿､縺・現逋よｩ滄未讀懃ｴ｢邨先棡繧堤┌隕・', currentSequence, '迴ｾ蝨ｨ:', searchSequence);
                    return;
                }
                
                // 繝ｬ繧ｹ繝昴Φ繧ｹ蜿嶺ｿ｡譎ゅ↓繧ｯ繧ｨ繝ｪ縺悟､画峩縺輔ｌ縺ｦ縺・↑縺・°遒ｺ隱・
                if (input.value.trim() !== currentSearchQuery) {
                    isSearching = false;
                    return;
                }
                
                // 讀懃ｴ｢邨先棡縺ｮ遒ｺ螳溘↑蛻､螳・
                if (Array.isArray(results) && results.length > 0) {
                    const suggestionsHTML = results.map((hospital, index) => `
                        <div class="suggestion-item" data-index="${index}" data-value="${hospital.name}">
                            <div class="suggestion-name">${hospital.name}</div>
                            ${hospital.area ? `<div class="suggestion-reading">${hospital.area}</div>` : ''}
                        </div>
                    `).join('');
                    
                    suggestions.innerHTML = suggestionsHTML;
                    suggestions.classList.add('show');
                    suggestions.style.display = 'block';
                    
                    // 繧ｯ繝ｪ繝・け繧､繝吶Φ繝・
                    suggestions.querySelectorAll('.suggestion-item').forEach(item => {
                        item.addEventListener('click', function() {
                            input.value = this.dataset.value;
                            suggestions.classList.remove('show');
                            suggestions.style.display = 'none';
                            suggestions.innerHTML = '';
                            currentSearchQuery = '';
                            isSearching = false;
                            clearError(input);
                        });
                    });
                } else if (Array.isArray(results) && results.length === 0) {
                    // 讀懃ｴ｢縺梧ｭ｣蟶ｸ縺ｫ螳御ｺ・＠縲∫ｵ先棡縺・莉ｶ縺ｮ蝣ｴ蜷医・縺ｿ縲瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆縲阪ｒ陦ｨ遉ｺ
                    suggestions.innerHTML = '<div class="suggestion-no-results">隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆</div>';
                    suggestions.classList.add('show');
                    suggestions.style.display = 'block';
                } else {
                    // 荳肴ｭ｣縺ｪ繝ｬ繧ｹ繝昴Φ繧ｹ縺ｮ蝣ｴ蜷医・繧ｨ繝ｩ繝ｼ縺ｨ縺励※謇ｱ縺・
                    suggestions.classList.remove('show');
                    suggestions.style.display = 'none';
                }
                
                isSearching = false;
            } catch (error) {
                console.error('蛹ｻ逋よｩ滄未讀懃ｴ｢繧ｨ繝ｩ繝ｼ:', error.message);
                suggestions.classList.remove('show');
                isSearching = false;
            }
        }, 200);
    });
    
    // 繧ｭ繝ｼ繝懊・繝画桃菴懊・譌｢蟄倥・螳溯｣・ｒ菴ｿ逕ｨ
    setupKeyboardNavigation(input, suggestions);
}

// 繧ｭ繝ｼ繝懊・繝峨リ繝薙ご繝ｼ繧ｷ繝ｧ繝ｳ蜈ｱ騾壽ｩ溯・
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
    
    // 繝輔か繝ｼ繧ｫ繧ｹ繧貞､ｱ縺｣縺滓凾縺ｫ蛟呵｣懊ｒ髱櫁｡ｨ遉ｺ
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

// 繧ｨ繝ｩ繝ｼ陦ｨ遉ｺ繧ｯ繝ｪ繧｢
function clearError(element) {
    const errorMsg = element.parentElement.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.classList.remove('show');
    }
}

// 繧ｨ繝ｩ繝ｼ陦ｨ遉ｺ
function showError(element) {
    const errorMsg = element.parentElement.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.classList.add('show');
    }
}

// 繝舌Μ繝・・繧ｷ繝ｧ繝ｳ
function validateForm() {
    let isValid = true;

    const entryType = getEntryType();

    // 蠢・磯・岼縺ｮ繝√ぉ繝・け
    const requiredFields = ['reportDate', 'userName'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            showError(field);
            isValid = false;
        }
    });

    // 莠区･ｭ謇縺ｮ繝√ぉ繝・け
    const office = document.getElementById('office').value;
    if (!office) {
        alert('莠区･ｭ謇縺瑚ｨｭ螳壹＆繧後※縺・∪縺帙ｓ');
        isValid = false;
    }

    // 閼ｱ關ｽ逅・罰縺ｮ驕ｸ謚槭メ繧ｧ繝・け
    const reason = document.querySelector('input[name="reason"]:checked');
    if (!reason) {
        const radioGroup = document.querySelector('.radio-group');
        showError(radioGroup);
        isValid = false;
    }

    // 蜈･髯｢縺ｮ蝣ｴ蜷医・霑ｽ蜉繝√ぉ繝・け
    if (reason && reason.value === 'hospital') {
        const hospitalFields = ['hospitalDate', 'hospitalName', 'hospitalDiagnosis'];
        hospitalFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value) {
                showError(field);
                isValid = false;
            }
        });

        const diagnosis = document.getElementById('hospitalDiagnosis');
        if (diagnosis.value === '縺昴・莉・) {
            const otherDiagnosis = document.getElementById('hospitalOtherDiagnosisText');
            if (!otherDiagnosis.value) {
                showError(otherDiagnosis);
                isValid = false;
            }
        }
    }

    // 荳ｭ豁｢縺ｮ蝣ｴ蜷医・霑ｽ蜉繝√ぉ繝・け・域里蟄倥Ξ繧ｳ繝ｼ繝峨・縺ｿ・・
    if (reason && reason.value === 'stop' && entryType === 'existing') {
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

// 遒ｺ隱阪Δ繝ｼ繝繝ｫ陦ｨ遉ｺ
function showConfirmModal() {
    if (!validateForm()) {
        alert('蠢・磯・岼繧貞・蜉帙＠縺ｦ縺上□縺輔＞');
        return;
    }
    
    // 繝輔か繝ｼ繝繝・・繧ｿ蜿朱寔
    collectFormData();
    
    // 遒ｺ隱榊・螳ｹ縺ｮ逕滓・
    const confirmContent = document.getElementById('confirmContent');
    confirmContent.innerHTML = generateConfirmContent();
    
    // 繝｢繝ｼ繝繝ｫ陦ｨ遉ｺ
    document.getElementById('confirmModal').classList.add('show');
}

// 繝輔か繝ｼ繝繝・・繧ｿ蜿朱寔
function collectFormData() {
    const form = document.getElementById('hospitalReportForm');
    formData = Utils.formToObject(form);

    // 謇句虚縺ｧ蛟､繧定ｨｭ螳・
    formData.entryType = getEntryType();
    formData.office = document.getElementById('office').value || userOrganization;
    formData.reason = document.querySelector('input[name="reason"]:checked').value;
    formData.contractEnd = document.getElementById('contractEnd').checked;

    if (formData.entryType === 'new') {
        formData.stopDate = '';
        formData.stopDiagnosis = '';
    }
}

// 遒ｺ隱榊・螳ｹ逕滓・
function generateConfirmContent() {
    const entryType = formData.entryType || 'existing';
    const reasonLabel = formData.reason === 'hospital' ? '蜈･髯｢' : '荳ｭ豁｢';
    const office = formData.office || userOrganization;

    let html = '';
    html += `<p><strong>蝣ｱ蜻願・</strong> ${formData.reporter}</p>`;
    html += `<p><strong>莠区･ｭ謇:</strong> ${office}</p>`;
    html += `<p><strong>蝣ｱ蜻頑律:</strong> ${Utils.formatDate(formData.reportDate)}</p>`;
    html += `<p><strong>蛻ｩ逕ｨ閠・錐:</strong> ${formData.userName}</p>`;
    html += `<p><strong>蝣ｱ蜻顔炊逕ｱ:</strong> ${reasonLabel}</p>`;

    if (formData.reason === 'hospital') {
        html += `<p><strong>蜈･髯｢譌･:</strong> ${Utils.formatDate(formData.hospitalDate)}</p>`;
        html += `<p><strong>蜈･髯｢蜈・</strong> ${formData.hospitalName}</p>`;
        html += `<p><strong>險ｺ譁ｭ蜷・</strong> ${formData.hospitalDiagnosis === '縺昴・莉・ ? formData.hospitalOtherDiagnosisText : formData.hospitalDiagnosis}</p>`;
    } else if (entryType === 'existing') {
        html += `<p><strong>荳ｭ豁｢譌･:</strong> ${Utils.formatDate(formData.stopDate)}</p>`;
        html += `<p><strong>險ｺ譁ｭ蜷・</strong> ${formData.stopDiagnosis}</p>`;
    }

    if (formData.resumeDate) {
        html += `<p><strong>騾髯｢譌･繝ｻ蜀埼幕譌･:</strong> ${Utils.formatDate(formData.resumeDate)}</p>`;
    }

    if (formData.contractEnd) {
        html += `<p><strong>螂醍ｴ・ｵゆｺ・</strong> 縺ｯ縺・/p>`;
    }

    if (formData.remarks) {
        html += `<p><strong>蛯呵・</strong><br>${formData.remarks.replace(/\n/g, '<br>')}</p>`;
    }

    return html;
}

// 繝｢繝ｼ繝繝ｫ繧帝哩縺倥ｋ
function closeModal() {
    document.getElementById('confirmModal').classList.remove('show');
}

// 繝輔か繝ｼ繝騾∽ｿ｡
async function submitForm() {
    const submitBtn = document.getElementById('confirmBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '騾∽ｿ｡荳ｭ...';
    
    try {
        // 繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝苓ｿｽ蜉
        formData.timestamp = new Date().toISOString();
        formData.userId = WOFFManager.getUserId();
        formData.department = WOFFManager.getDepartment();
        
        console.log('騾∽ｿ｡繝・・繧ｿ:', formData);
        
        // GAS縺ｫ騾∽ｿ｡
        const payload = new URLSearchParams();
        payload.append('action', 'submitHospitalReport');
        payload.append('data', JSON.stringify(formData));

        const response = await fetch(config.gasUrl, {
            method: 'POST',
            body: payload
        });
        
        const result = await response.json();
        console.log('GAS蠢懃ｭ・', result);
        
        if (result.success) {
            // 謌仙粥譎ゅ・邨先棡逕ｻ髱｢縺ｸ驕ｷ遘ｻ
            localStorage.setItem('reportResult', JSON.stringify({
                success: true,
                reportId: result.reportId,
                timestamp: formData.timestamp
            }));
            window.location.href = 'result.html';
        } else {
            throw new Error(result.error || '騾∽ｿ｡縺ｫ螟ｱ謨励＠縺ｾ縺励◆');
        }
        
    } catch (error) {
        console.error('騾∽ｿ｡繧ｨ繝ｩ繝ｼ:', error);
        alert('騾∽ｿ｡縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲ゅｂ縺・ｸ蠎ｦ縺願ｩｦ縺励￥縺縺輔＞縲・n繧ｨ繝ｩ繝ｼ: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = '騾∽ｿ｡縺吶ｋ';
    }
}

