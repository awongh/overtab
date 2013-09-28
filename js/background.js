var tabList = {};

// This will execute whenever a tab has completed "loading"
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        tabList[tabId] =  {};
        tabList[tabId]["tab"] = tab;
        chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, function(imgBlob) {
            tabList[tabId]["screencap"] = imgBlob;
        });
    }
});
