// 調整速度
let speedConfig = {
    speed: 1.0,
    cbDateNowChecked: true,
};
// 監聽來自擴充功能的設定
window.addEventListener("message", function(event) {
  if (event.data.type === "SETTINGS") {
    let settings = event.data.settings;
    let speedSetting = settings.speedSetting;
    
    speedConfig.speed = speedSetting;
  }
}, false);


// 載入後立即發送請求取得設定
window.postMessage({ type: "GET_SETTINGS_REQUEST" }, "*");

const originalDateNow = Date.now;
let dateNowValue = null;
let previusDateNowValue = null;
Date.now = () => {
    const originalValue = originalDateNow();
    if (dateNowValue) {
        dateNowValue +=
            (originalValue - previusDateNowValue) *
            (speedConfig.cbDateNowChecked ? speedConfig.speed : 1);
    } else {
        dateNowValue = originalValue;
    }
    previusDateNowValue = originalValue;
    return Math.floor(dateNowValue);
};