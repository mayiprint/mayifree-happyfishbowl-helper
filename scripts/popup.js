document.addEventListener('DOMContentLoaded', function () {
    function IsNum(s) {
        if (s != null && s != "") {
            return !isNaN(s);
        }
        return false;
    }
    // 載入設定選項
    chrome.storage.local.get(['autoScroll', 'ratio', 'infoShow', 'blockAdNew','speedRange'], function (result) { //'blockAd', 
        document.getElementById("auto-scroll").checked = result.autoScroll == true ? true : false;
        // document.getElementById("block-ad").checked = result.blockAd == true ? true : false;
        document.getElementById("info-show").checked = result.infoShow == false ? false : true;
        document.getElementById("block-ad-new").checked = result.blockAdNew == true ? true : false;
        console.log(result.speedRange)
        document.getElementById("speedRange").value = result.speedRange || 1;
        document.getElementById("speedValue").textContent = result.speedRange || 1;
        if (IsNum(result.ratio)) {
            document.getElementById("ratio").innerHTML = "最後遊戲執行縮放比:" + result.ratio + "%";
        }
    });

    // 更改設定
    function updateStorageAndDisplay(elementId, storageKey, refreshElementId) {
        const isChecked = document.getElementById(elementId).checked;
        chrome.storage.local.set({ [storageKey]: isChecked }, function () { });
        if (refreshElementId) {
            const obj = document.getElementById(refreshElementId);
            if (obj) {
                obj.style.display = '';
            }
        }
    }
    document.getElementById('info-show').addEventListener('click', function () {
        updateStorageAndDisplay('info-show', 'infoShow', 'refresh-danger');
    });
    document.getElementById('auto-scroll').addEventListener('click', function () {
        updateStorageAndDisplay('auto-scroll', 'autoScroll', 'refresh-danger');
    });
    document.getElementById('block-ad-new').addEventListener('click', function () {
        updateStorageAndDisplay('block-ad-new', 'blockAdNew', 'refresh-danger');
    });

    // 調整速度
    const speedRange = document.getElementById("speedRange");
    const speedValue = document.getElementById("speedValue");
    const resetSpeedButton = document.getElementById("resetSpeed");
    speedValue.textContent = speedRange.value;
    speedRange.oninput = function () {
      speedValue.textContent = this.value;
      if (IsNum(this.value)) {
        chrome.storage.local.set({ speedRange: this.value }, function () { });
      }
    }
    // 監聽重設按鈕點擊
    resetSpeedButton.onclick = function () {
        speedRange.value = 1.0;
        speedValue.textContent = 1.0;
        chrome.storage.local.set({ speedRange: 1.0 }, function () { });
    }
});
