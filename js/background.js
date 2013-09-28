"use strict";

var tabList = {};

// This will execute whenever a tab has completed "loading"
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        tabList[tabId] =  {};
/*        chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, function(imgBlob) {
            tabList[tabId]["screencap"] = imgBlob;
        });*/
    }
});

chrome.tabs.onActivated.addListener(function(tabInfo) {
    var tabId = tabInfo.tabId;
    chrome.tabs.get(tabId, function(tab) {
        if (typeof tabList[tabId]["screencap"] === "undefined") {
            chrome.tabs.captureVisibleTab(tab.windowId, { format: "png"}, function(imgBlob) {

                tabList[tabId]["screencap"] = imgBlob;
                var canvas = null,
                    ctx = null;

                canvas = document.querySelector("#use-me");

                ctx = canvas.getContext('2d');
                ctx.drawImage(imgBlob, 0, 0, document.body.offsetWidth, document.body.offsetHeight);
            });
        }
    });
});
