"use strict";

var tabList = [],
    tabListIndex = {}, // For checking to see if a tab already exists, and for reverse lookup of the tab in tabList array
    tabOpened = false,
    canvas = null,
    image = null,
    Date = new Date();

document.addEventListener("DOMContentLoaded", function() {
    canvas = document.querySelector('canvas');
    image = document.querySelector('canvas');
});

function addTab(tab) {

    if (typeof tab.tabId !== "undefined") { // The user passed in a tabInfo object, not a tab object
        // Is this tab already in our index?
        if (typeof tabListIndex[tab.tabId] === "undefined") {
            // We need to go and fetch the actual tab object now
            chrome.tabs.get(tab.tabId, function(tabObject) {

                // Add the tab object and index lookup into their respective arrays
                tabList.push(tabObject);
                tabListIndex[tabObject.id] = tabList.length - 1;
            });
        }
    } else if (typeof tab.id !== "undefined") { // The object is (probably) a tab object, yay!
        // Is this tab already in our index?
        if (typeof tabListIndex[tab.id] === "undefined") {
            // Add the tab index and object into their respective arrays
            tabList.push(tab);
            tabListIndex[tab.id] = tabList.length - 1;
        }
    }
    updateTabLists();
}

function removeTab(tab) {
    updateTabLists();
}

function updateTabLists() {
    chrome.runtime.sendMessage("", {tabList: tabList, tabListIndex: tabListIndex}, function() {})
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
        captureScreen(tab);
    });
});

function captureScreen(tab) {

    // Check to see if this is a Chrome internal page. If so, don't capture it
    if (tab.url.match(/^http.*:\/\//)) {
        chrome.tabs.captureVisibleTab(tab.windowId, {format: "png"}, function(imgBlob) {
            tab["screencap"] = imgBlob;
            tab["timestamp"] = Date.getTime();
            addTab(tab);

            // Work in progress code for shrinking the image
            var ctx = null;

            ctx = canvas.getContext('2d');
            // Img Blog is a Data URI that cannot be directly drawn into Canvas
            //ctx.drawImage(imgBlob, 0, 0, document.body.offsetWidth, document.body.offsetHeight);
        });
    }
}

chrome.browserAction.onClicked.addListener(function(tab) {
  console.log( tabOpened );

  if( !tabOpened ){

    chrome.tabs.create({'url': chrome.extension.getURL('index.html')}, function(tab) {
      // Tab opened.
      console.log("opened");
      tabOpened = true;

    });

  } else {
    console.log( "here" );

    var tabs = [ 
      { id:2 },
      { id:2 },
      { id:2 },
      { id:2 },
      { id:2 },
      { id:2 },
      { id:2 },
      { id:2 },
      { id:2 },
      { id:2 },
      { id:2 },
      { id:2 }
    ]; 

    chrome.runtime.sendMessage(null, tabs, function(response) {
        console.log(response.farewell);
    });
  }
});
