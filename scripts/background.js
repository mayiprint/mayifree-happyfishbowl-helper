//Todo:未完成
function helpUrlCheck(url) {
    if ((url.indexOf("happyfishbowl") >= 0 && url.indexOf("share.jsp") >= 0 && url.indexOf("apps.facebook.com") >= 0) && url.indexOf("uid") >= 0) {
        return true;
    }
    return false;
}
function helpUrlOnClick(info, tab) {
    if (helpUrlCheck(info.linkUrl)) {
        if (gPos != null) {
            document.body.appendChild('Heeeelk' + gPos.clientX + '\nPosition Y: ' + gPos.clientY);
            alert('Heeeelk');
        }
    }
}


//刪除樂元素cookies
function clearCookies() {
    chrome.cookies.getAll({
        domain: ".he-games.com"
    }, function (cookies) {
        for (var i = 0; i < cookies.length; i++) {
            //console.log("移除" + cookies[i].name);
            chrome.cookies.remove({
                url: "https://he-games.com/",
                name: cookies[i].name
            });
        }
    });
    chrome.cookies.getAll({
        domain: ".fishbowl.he-games.com"
    }, function (cookies) {
        for (var i = 0; i < cookies.length; i++) {
            //console.log("移除" + cookies[i].name);
            chrome.cookies.remove({
                url: "https://fishbowl.he-games.com",
                name: cookies[i].name
            });
        }
    });
}

// 監聽content scripts傳遞過來指令
chrome.runtime.onMessage.addListener(function (message, sender, callback) {
    console.log('傳遞', message.command);
    if (message.command === 'ClearCookies') {
        clearCookies();
    }
});

// 更改遊戲FPS需要替換官方JS
const url = "https://fish.mayifree.com/dist/js/game/fm.js?" + Math.random();
const rule = {
    "id": 1,
    "priority": 1,
    "action": {
        "type": "redirect",
        "redirect": {
            "url": url
        }
    },
    "condition": {
        "urlFilter": "/common_h5/fm/fm_0_*.js*",
        "domains": ["fishbowl.he-games.com", "bot.ipv4.site"],
        "resourceTypes": ["script"]
    }
};
chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [rule],
    removeRuleIds: [1]
}, () => {
    if (chrome.runtime.lastError) {
        console.error("Error adding rule: ", chrome.runtime.lastError);
    } else {
        console.log("Rule added successfully.");
    }
});

// 創建右下選單
chrome.runtime.onInstalled.addListener(function () {
    const gameLinks = [
        { lang: "zh", label: "中文" },
        { lang: "us", label: "英文" },
        { lang: "fr", label: "法文" },
        { lang: "es", label: "西班牙" }
    ];

    const frameRates = [
        { rate: "low", label: "低幀率" },
        { rate: "middle", label: "中幀率" },
        { rate: "base", label: "普通幀率" }
    ];

    // 遊戲連結選單
    chrome.contextMenus.create({
        id: "game",
        type: "normal",
        title: "遊戲連結",
        contexts: ["all"]
    });
    frameRates.forEach(frame => {
        gameLinks.forEach(link => {
            chrome.contextMenus.create({
                id: `game-${link.lang}-${frame.rate}`,
                title: `開心水族箱(${link.label})-${frame.label}`,
                type: "normal",
                contexts: ["all"],
                parentId: "game"
            });
        });
        // 在每種幀率的語言選單後加入分隔線
        chrome.contextMenus.create({
            id: `game-separator-${frame.rate}`,
            title: "分隔線",
            type: "separator",
            contexts: ["all"],
            parentId: "game"
        });
    });

    // 相關連結選項
    chrome.contextMenus.create({
        id: "link",
        type: "normal",
        title: "相關連結",
        contexts: ["all"]
    });
    // 相關連結子選單
    const relatedLinks = [
        { id: "link-group", title: "Easy 開心餵食器社團" },
        { id: "link-mayi", title: "MayiFree-開心水族箱" },
        { id: "link-pay", title: "開心水族箱儲值專區" },
        { id: "link-myap", title: "開心水族箱快樂開寶箱" }
    ];
    relatedLinks.forEach(link => {
        chrome.contextMenus.create({
            id: link.id,
            title: link.title,
            type: "normal",
            contexts: ["all"],
            parentId: "link"
        });
    });
});
// 監聽右鍵選單按下事件
chrome.contextMenus.onClicked.addListener((info, tabs) => {
    const menuItemId = info.menuItemId;
    let url = "";

    const baseUrl = "https://apps.facebook.com/happyfishbowl";

    const urlMap = {
        "game-zh": `${baseUrl}/`,
        "game-us": `${baseUrl}_en_us/`,
        "game-fr": `${baseUrl}_fr_fr/`,
        "game-es": `${baseUrl}_es_es/`,
        "link-group": "https://www.facebook.com/groups/819844528089417/",
        "link-pay": "http://payment.he-games.com/view/tw_hp.jsp?app_id=9000100101",
        "link-myap": "https://app.myap.tw/happyfish/",
        "link-mayi": "https://fish.mayifree.com/"
    };

    // 檢查是否為遊戲連結，如果是則處理幀率
    if (menuItemId.startsWith("game-")) {
        const parts = menuItemId.split("-");
        const lang = parts[1];
        const frameRate = parts[2] || "base"; // 預設為 base

        let langCode = "";
        switch (lang) {
            case "zh":
                langCode = "";
                break;
            case "us":
                langCode = "_en_us";
                break;
            case "fr":
                langCode = "_fr_fr";
                break;
            case "es":
                langCode = "_es_es";
                break;
        }
        url = `${baseUrl}${langCode}/?fps=${frameRate}`;
    } else if (urlMap[menuItemId]) {
        url = urlMap[menuItemId];
    } else {
        url = "https://fish.mayifree.com/"; // 預設網址
    }

    chrome.tabs.create({ url: url });
});