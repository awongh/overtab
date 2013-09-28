"use strict";

var tabList = {};

var tabOpened = false;

function getTabList() {
    return tabList;
}

// This will execute whenever a tab has completed "loading"
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        captureScreen(tab);
    }
});

chrome.tabs.onActivated.addListener(function(tabInfo) {
    var tabId = tabInfo.tabId;
    chrome.tabs.get(tabId, function(tab) {
        if (typeof tabList[tabId]["screencap"] === "undefined") {
            captureScreen(tab);
        }
    });
});

function captureScreen(tab) {
    chrome.tabs.captureVisibleTab(tab.windowId, { format: "png"}, function(imgBlob) {
        if (typeof tabList[tabId] === "undefined") {
            tabList[tabId] =  {};
        }
        tabList[tabId]["screencap"] = imgBlob;
        chrome.runtime.sendMessage(null, tabList, null)

        // Work in progress code for shrinking the image
        var canvas = null,
            ctx = null;

        canvas = document.querySelector("#use-me");

        ctx = canvas.getContext('2d');
        ctx.drawImage(imgBlob, 0, 0, document.body.offsetWidth, document.body.offsetHeight);
    });
}

chrome.browserAction.onClicked.addListener(function(tab) {
  console.log( tabOpened );

  if( tabOpened ){
    
    //do something else
    return true;
  }

  chrome.tabs.create({'url': chrome.extension.getURL('index.html')}, function(tab) {
    // Tab opened.
    console.log("opened");
    tabOpened = true;

  });
});

