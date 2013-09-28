"use strict";

var tabList = {},
    tabOpened = false;

// This will execute whenever a tab has completed "loading"
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        captureScreen(tab);
    }
});

chrome.tabs.onActivated.addListener(function(tabInfo) {
    var tabId = tabInfo.tabId;

    chrome.tabs.get(tabId, function(tab) {
        captureScreen(tab);
    });
});

function captureScreen(tab) {
    chrome.tabs.captureVisibleTab(tab.windowId, {format: "png"}, function(imgBlob) {
        // Check to see if this is a Chrome internal page. If so, don't capture it
        if (!tab.url.match(/^chrome:\/\//)) {
            if (typeof tabList[tab.id] === "undefined") {
                tabList[tab.id] =  {};
            }

            tabList[tab.id]["screencap"] = imgBlob;
            chrome.runtime.sendMessage("", tabList, function() {})

            // Work in progress code for shrinking the image
            var canvas = null,
                ctx = null;

            canvas = document.querySelector("#use-me");

            ctx = canvas.getContext('2d');
            // Img Blog is a Data URI that cannot be directly drawn into Canvas
            //ctx.drawImage(imgBlob, 0, 0, document.body.offsetWidth, document.body.offsetHeight);
        }
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
