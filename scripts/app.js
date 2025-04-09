function IsNum(s) {
    if (s != null && s != "") {
        return !isNaN(s);
    }
    return false;
}
function onlyShowGameView() {
    // 僅顯示遊戲畫面(隱藏非開水畫面新方法，直接移動遊戲畫面到最頂層)
    var obj = document.getElementsByTagName("iframe");
    if (obj && typeof obj[0] !== 'undefined') {
        for (var i = 0; i < obj.length; i++){
            if(obj[i].id == "iframe_canvas_on_ig"){
                obj = obj[i].parentNode;
                obj.style.position = 'fixed';
                obj.style.width = "100vw";
                obj.style.height = "100vh";
                obj.style.overflow = "scroll";
                obj.style.background = 'white';
                obj.style.zIndex = 3;
                obj.style.left = "0px";
                obj.style.top = "0px";
                obj = document.getElementsByTagName("iframe")[i];
                while (obj.parentNode != null) {
                    obj.style.zIndex = 3;
                    obj = obj.parentNode;
                }
                return true;
            }
        }
    }
    return false;
}

function updateZoomIndicator() {
    // 提供網頁現在真正縮放比(因為window縮放比不一定是100%，再疊加瀏覽器縮放比，會顯示不一樣的)
    let i = window.devicePixelRatio - 1;
    i = 100 + (i / 0.0125);
    if (IsNum(i)) {
        chrome.storage.local.set({ 'ratio': i }, function () { });
    }
}

let closeShowGameView = false; // 是否已經執行隱藏非開水畫面新方法
let isEnabledShare = false; // 是否已經執行替換分享功能
let isEnabledAutoScroll = false; // 是否已經執行自動捲動
function main() {
    // 只有在Facebook網站才執行
    if (location.hostname == "apps.facebook.com" && closeShowGameView == false) {
        chrome.storage.local.get(['blockAdNew'], function (result) {
            // 僅顯示遊戲畫面(隱藏非開水畫面新方法，直接移動遊戲畫面到最頂層)
            if (typeof result.blockAdNew !== 'undefined' && result.blockAdNew == true) {
                closeShowGameView = onlyShowGameView();
            }
        });
    }

    chrome.storage.local.get(['infoShow', 'autoScroll'], function (result) {
        if ((typeof result.infoShow === 'undefined' || result.infoShow == true) && isEnabledShare == false) {
            //替代遊戲分享功能(原本需要分享到FB首頁，但很多人不喜歡，所以添加此功能)
            // background會替換官方JS檔案，但分享會受到原本iFrame大小限制，無法顯示所有內容，因此這裡需要改變畫框大小
            const obj = document.getElementById("iframe_canvas");
            if (obj) {
                obj.height = '1200';
                obj.style.height = '1200px';
                isEnabledShare = true;
            }
        }

        // 自動捲動到開水畫面
        if (typeof result.autoScroll !== 'undefined' && result.autoScroll == true && isEnabledAutoScroll == false) {
            if (document.getElementById('iframe_canvas') != null) {
                document.getElementById('iframe_canvas').scrollIntoView();
                isEnabledAutoScroll = true;
            }
        }
    });
}

// 注入替換官方分享功能的JS檔案Function
let intervalId;
let startTime = Date.now();
let count = 0;
function injectSns() {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL('scripts/sns.js');
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    count = count + 1;
    if (count > 6) {
        clearInterval(intervalId);
    }
}

// 傳遞速度設定給speed.js
function loadSpeedSettingsAndRespond() {
    chrome.storage.local.get(['speedRange'], function (result) {
        if (typeof result.speedRange !== 'undefined' && IsNum(result.speedRange)) {
            window.postMessage({ type: "SETTINGS", settings: { speedSetting: parseFloat(result.speedRange) } }, "*");
        }
    });
}
window.addEventListener("message", function(event) {
    if (event.data.type === "GET_SETTINGS_REQUEST") {
        loadSpeedSettingsAndRespond();
    }
}, false);

// 擴充只會在遊戲畫面執行
if (location.hostname == "fishbowl.he-games.com" || location.hostname == "bot.ipv4.site" || (location.hostname == "apps.facebook.com" && location.href.indexOf("happyfishbowl") !== -1)) {

    // 取得遊戲縮放比
    updateZoomIndicator();
    window.addEventListener('resize', function () {
        updateZoomIndicator();
    });

    
    main(); // 第一次執行main()

    // 注入分享功能(每隔5秒執行一次，只執行6次，等於30秒後不再執行)
    if (location.hostname == "fishbowl.he-games.com" || location.hostname == "bot.ipv4.site") {
        chrome.storage.local.get(['infoShow'], function (result) {
            if (typeof result.infoShow === 'undefined' || (result.infoShow == true)) {
                intervalId = setInterval(injectSns, 5000);
            }
        });
    }

    // 只在開水遊戲網站才執行
    if (location.hostname == "fishbowl.he-games.com" || location.hostname == "bot.ipv4.site") {
        // 開水遊戲會把不同版本Token存放在cookie中，當cookie長度過長，傳給server時會出現錯誤，因此清除cookie
        chrome.runtime.sendMessage({ command: "ClearCookies" }, function (response) { });
    }

    // 動態新增元素時，觸發main()
    const observer = new MutationObserver(mutations => {
        main();
    });
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // 注入速度調整JS
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL('scripts/speed.js');
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    
    // 監聽速度設定變更
    chrome.storage.onChanged.addListener(function(changes, areaName) {
        if (areaName === 'local') {
          for (let key in changes) {
            let storageChange = changes[key];
            if (key == "speedRange"){
                if(IsNum(storageChange.newValue)){
                    window.postMessage({ type: "SETTINGS", settings: { speedSetting: parseFloat(storageChange.newValue) } }, "*");
                }
            }
          }
        }
    });
}
