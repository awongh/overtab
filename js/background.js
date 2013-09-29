"use strict";

var tabList = [],
    tabListIndex = {}, // For checking to see if a tab already exists, and for reverse lookup of the tab in tabList array
    tabOpened = false,
    canvas = null,
    image = null,
    Date = new Date();

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

document.addEventListener("DOMContentLoaded", function() {
    canvas = document.querySelector('canvas');
    image = document.querySelector('canvas');
});

// Function accepts a tab object that should have the key "screencap" populated with an image Data Uri
function addScreencap(tab) {
    if (typeof tabListIndex[tab.id] !== "undefined") {
        tabList[tabListIndex[tab.id]].screencap = tab.screencap;
        updateTabLists();
    }
}

function addTab(tab, callback) {

    if (typeof tab.tabId !== "undefined") { // The user passed in a tabInfo object, not a tab object
        // Is this tab already in our index?
        if (typeof tabListIndex[tab.tabId] === "undefined") {
            // We need to go and fetch the actual tab object now
            chrome.tabs.get(tab.tabId, function(tabObject) {
                if (tab.url.match(/^http.*:\/\//) || tab.title === "New Tab") {
                    // Add the tab object and index lookup into their respective arrays
                    tabList.push(tabObject);
                    tabListIndex[tabObject.id] = tabList.length - 1;
                    updateTabLists();
                    
                    if (typeof callback !== "undefined") {
                        callback(tabObject);
                    }
                }
            });
        }
    } else if (typeof tab.id !== "undefined" && (tab.url.match(/^http.*:\/\//) || tab.title === "New Tab")) { // The object is (probably) a tab object, yay!
        // Is this tab already in our index?
        if (typeof tabListIndex[tab.id] === "undefined") {
            // Add the tab index and object into their respective arrays
            tabList.push(tab);
            tabListIndex[tab.id] = tabList.length - 1;
            updateTabLists();

            if (typeof callback !== "undefined") {
                callback(tab);
            }
        }
    }
}

function removeTab(tab) {
    var tabId = null,
        tabPosition = null;

    if (typeof tab.tabId !== "undefined") { // The user passed in a tabInfo object, not a tab object
        // Is this tab still in our index?
        if (typeof tabListIndex[tab.tabId] !== "undefined") {
            tabId = tab.tabId;
        } else {
            return false;
        }
    } else if (typeof tab.id !== "undefined") { // The object is (probably) a tab object, yay!
        // Is this tab still in our index?
        if (typeof tabListIndex[tab.id] !== "undefined") {
            tabId = tab.id;
        } else {
            return false;
        }
    } else if (typeof tab === "number") { // The variable is the tab ID as an integer
        // Is this tab still in our index?
        if (typeof tabListIndex[tab] !== "undefined") {
            tabId = tab;
        } else {
            return false;
        }
    }

    tabPosition = tabListIndex[tabId];
    tabList.remove(tabListIndex[tabId]);
    delete tabListIndex[tabId];

    reIndex(tabPosition);
    updateTabLists();
}

function sanitizeTab(tab, callback) {
    var tabId = null,
        tabPosition = null;

    if (typeof tab.tabId !== "undefined") { // The user passed in a tabInfo object, not a tab object
        // Is this tab still in our index?
        if (typeof tabListIndex[tab.tabId] !== "undefined") {
            tabId = tab.tabId;
        } else {
            return false;
        }
    } else if (typeof tab.id !== "undefined") { // The object is (probably) a tab object, yay!
        // Is this tab still in our index?
        if (typeof tabListIndex[tab.id] !== "undefined") {
            tabId = tab.id;
        } else {
            return false;
        }
    } else if (typeof tab === "number") { // The variable is the tab ID as an integer
        // Is this tab still in our index?
        if (typeof tabListIndex[tab] !== "undefined") {
            tabId = tab;
        } else {
            return false;
        }
    }}

// Updates an existing tab entry, and calls the given callback afterwards (optional)
function updateTab(tab, callback) {
    sanitizeTab(tab, function(tab) {
        if (typeof callback !== "undefined") {
            callback(tab);
        }
    });
}

// This function re-indexes the tabListIndex after a tab is removed from the tabList array
// so that the reverse index in tabListIndex is still pointing to the right Array element
function reIndex(tabPosition) {
    for (var tabIndex in tabListIndex) {
        if (tabListIndex.hasOwnProperty(tabIndex)) {
            if (tabListIndex[tabIndex] >= tabPosition) {
                tabListIndex[tabIndex] -= 1;
            }
        }
    }
}

function tabExists(tab) {
    return typeof tabListIndex[tab.id] !== "undefined" ? true : false;
}

function screencapExists(tab) {
    if (tabExists(tab)) {
        return typeof tabList[tabListIndex[tab.id]].screencap !== "undefined" ? true : false;
    } else {
        return false;
    }
}

function updateTabLists() {
    chrome.runtime.sendMessage("", {tabList: tabList, tabListIndex: tabListIndex}, function() {});
}

// This will execute whenever a tab has completed "loading"
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    updateTab(tab);
    console.log("Being updated: ", changeInfo);
    if (changeInfo.status === "complete") {
        chrome.tabs.query({ currentWindow: true, windowId: tab.windowId, active: true, status: "complete" }, function(tabs) {
            console.log(tabs);
            console.log(tab);
            if (tabs.length > 0 && tabs[0].id == tab.id) {
                captureScreen(tab);
            }
        });
    }
});

chrome.tabs.onCreated.addListener(function(tab) {
    addTab(tab);
});

chrome.tabs.onActivated.addListener(function(tabInfo) {
    var tabId = tabInfo.tabId;

    chrome.tabs.get(tabId, function(tab) {
        addTab(tab, function(tab) {
            chrome.tabs.query({ currentWindow: true, windowId: tab.windowId, active: true, status: "complete" }, function(tabs) {
                if (tabs.length > 0 && tabs[0].id == tab.id) {
                    captureScreen(tab);
                }
            });
        });
    });
});

function captureScreen(tab) {

    // Check to see if this is a Chrome internal page. If so, don't capture it
    if ((tab.url.match(/^http.*:\/\//) || tab.title === "New Tab") && !screencapExists(tab)) {
        chrome.tabs.captureVisibleTab(tab.windowId, {format: "png"}, function(imgBlob) {
            tab["screencap"] = imgBlob;
            tab["timestamp"] = Date.getTime();
            if (tabExists(tab)) {
                addScreencap(tab);
            }

            // Work in progress code for shrinking the image
            //var ctx = null;

            //ctx = canvas.getContext('2d');
            // Img Blog is a Data URI that cannot be directly drawn into Canvas
            //ctx.drawImage(imgBlob, 0, 0, document.body.offsetWidth, document.body.offsetHeight);
        });
    }
}

chrome.runtime.onMessage.addListener( function( request, sender, sendResponse) {
    if ( request.message === "getList" ) {
        updateTabLists();
    }
});

chrome.browserAction.onClicked.addListener(function(tab) {
    console.log( tabOpened );

    if ( !tabOpened ) {

        chrome.tabs.create({'url': chrome.extension.getURL('index.html')}, function(tab) {
        // Tab opened.
        console.log("opened");
        tabOpened = true;

    });
  }
});

chrome.tabs.onRemoved.addListener(function( tabId, removeInfo ) {
    removeTab(tabId);
});
