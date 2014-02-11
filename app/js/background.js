"use strict";

Array.prototype.remove = function(from) {
    return this.splice( (from - 1), 1);
};

Array.prototype.add = function(from, item) {
    if( !item ){
      throw "Trying to add a null variable to array. -oops";
    }

    return this.splice(from, 1, item);
};

var tabList = [],
    tabListIndex = {}, // For checking to see if a tab already exists, and for reverse lookup of the tab in tabList array
    tabOpened = false,
    canvas = null,
    image = null,
    date = new Date(),
    overTabId = null,

    overTabWindowId = null;

document.addEventListener("DOMContentLoaded", function() {
    canvas = document.querySelector('canvas');
    image = document.querySelector('canvas');
});

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////      START CHROME INTERACTION          ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

//default overtab opener
var defaultOpener = chrome.tabs.create;

//get extension html url
var getExtensionUrl = function(){
  return chrome.extension.getURL('html/index.html');
};

//get the tab screenshot
var screenCap = function( windowId, options, callback ){
  return chrome.tabs.captureVisibleTab( windowId, options, callback );
};

//listen for tab states
chrome.tabs.onCreated.addListener( tabCreated );
chrome.tabs.onUpdated.addListener( tabUpdated );
chrome.tabs.onActivated.addListener( tabActivated );
chrome.tabs.onRemoved.addListener( tabRemoved );

//listen for a message
chrome.runtime.onMessage.addListener( onMessage );

//send message
var sendMessage = function( tabId, message, callback ){
  return chrome.runtime.sendMessage( tabId, message, callback );
};

//query for a tab
var tabQuery = function( queryInfo, callback ){
  return chrome.tabs.query( queryInfo, callback );
};

//get a tab by id
var getTab = function( tabId, callback ){
  return chrome.tabs.get( tabId, callback );
};

//clicking on the browser menu item
chrome.browserAction.onClicked.addListener( browserActionClick );

//bring a tab into focus
var tabFocus = function( tabId, windowId ){
    chrome.windows.update(windowId, {'focused': true}, function() {
      chrome.tabs.update(tabId, {'active': true}, function() {} );
    });
};
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////        END CHROME INTERACTION          ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////     START CHROME CALLBACK FUNCTIONS    ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

var tabCreated = function( tab ){

  if (typeof tab.tabId !== "undefined") { // The user passed in a tabInfo object, not a tab object
      // Is this tab already in our index?
      if (typeof tabListIndex[tab.tabId] === "undefined") {
          // We need to go and fetch the actual tab object now
          getTab( tab.tabId, function(tabObject) {
              if (tab.url.match(/^http.*:\/\//) || tab.title === "New Tab") {
                  // Add the tab object and index lookup into their respective arrays
                  tabList.push(tabObject);
                  tabListIndex[tabObject.id] = tabList.length - 1;
                  sendSingleTab(tabObject);

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
          sendSingleTab(tab);

          if (typeof callback !== "undefined") {
              callback(tab);
          }
      }
  }

};

var tabUpdated = function( tabId, changeInfo, tab ){

    updateTab(tab, function() {
        if (changeInfo.status === "complete") {
            tabQuery({ currentWindow: true, windowId: tab.windowId, active: true, status: "complete" }, function(tabs) {
                if (tabs.length > 0 && tabs[0].id == tab.id) {
                    captureScreen(tab);
                }
            });
        }
    });
};

var tabActivated = function( tabInfo ){
   var tabId = tabInfo.tabId;

    sanitizeTab(tabId, function(tab) {

        if (!screencapExists(tab)) {
            updateTab(tab, function(tab) {

                tabQuery({ currentWindow: true, windowId: tab.windowId, active: true, status: "complete" }, function(tabs) {
                    if (tabs.length > 0 && tabs[0].id == tab.id) {
                        captureScreen(tab);
                    }
                });
            });
        }
    });
};

var tabRemoved = function(){
  removeTab(tabId);
  if (tabId === overTabId) {
    console.log("Closed");
    tabOpened = false;
    overTabId = null;
    overTabWindowId = null;
  }
};

var onMessage = function( request, sender, sendResponse ){
  if ( request.message === "getList" ) {
    sendTabLists();
  }
};

var browserActionClicked = function( ){

  if ( !tabOpened ) {
    // Prevents mashing the button and opening duplicate Overtab tabs
    tabOpened = true;
    var func = localStorage['overTabFunc'];

    if( !func ){
      //default behavior
      func = defaultOpener;
    }

    var options = {
      'url' : getExtensionUrl()
    };

    //add more options here from local storage

    func( options, function(tab) {

        //do we want any checks here?

        overTabId = tab.id;
        overTabWindowId = tab.windowId;
    });

  }else {
    tabFocus( overTabId, overTabWindowId );
  }
};

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////       END CHROME CALLBACK FUNCTIONS    ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// This function will accept tab object, tab id, tab info, and a callback function.
// It will always pass into the callback function a tab object
function sanitizeTab(dirtyTab, callback) {
    var dirtyTabId = null;

    if (typeof dirtyTab === "undefined") {
        return false;
    } else {
        if (typeof dirtyTab.tabId !== "undefined" || typeof dirtyTab === "number") {
            dirtyTabId = dirtyTab.tabId || dirtyTab;
        }
    }

    // The input was a tab ID, so fetch the actual tab object
    if (typeof dirtyTabId !== "undefined" && dirtyTabId !== null) {
        getTab(dirtyTabId, function(tabObject) {
            if (typeof tabObject !== "undefined" && (tabObject.url.match(/^http.*:\/\//) || dirtyTab.title === "New Tab" )) {
                callback(tabObject);
            }
        });
    // The input was a tab object, run the callback directly on it :)
    } else if (typeof dirtyTab.id !== "undefined" && (dirtyTab.url.match(/^http.*:\/\//) || dirtyTab.title === "New Tab" )) {
        callback(dirtyTab);
    }
}

function sendSingleTab( tab ) {
    sanitizeTab(tab, function(tab) {
        console.log( tab );
        sendMessage(null, { message:"sendSingleTab", tab: tab });
    });
}

function addTab(tab, callback) {

    if (typeof tab.tabId !== "undefined") { // The user passed in a tabInfo object, not a tab object
        // Is this tab already in our index?
        if (typeof tabListIndex[tab.tabId] === "undefined") {
            // We need to go and fetch the actual tab object now
            getTab(tab.tabId, function(tabObject) {
                if (tab.url.match(/^http.*:\/\//) || tab.title === "New Tab") {
                    // Add the tab object and index lookup into their respective arrays
                    tabList.push(tabObject);
                    tabListIndex[tabObject.id] = tabList.length - 1;
                    sendSingleTab(tabObject);

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
            sendSingleTab(tab);

            if (typeof callback !== "undefined") {
                callback(tab);
            }
        }
    }
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

function sendRemoveTab( tabId ) {
    sendMessage(null, { message:"sendRemoveTab", tabId: tabId });
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
    tabList.remove(tabPosition);
    delete tabListIndex[tabId];

    reIndex(tabPosition);
    sendRemoveTab(tabId);
}

// Updates an existing tab entry, and calls the given callback afterwards (optional)
// If the tab doesn't exist yet, invoke the addTab function instead
function updateTab(tab, callback) {

    sanitizeTab(tab, function(tab) {
        var updated = false;

        if (tabList[tabListIndex[tab.id]]) {
            if (tabList[tabListIndex[tab.id]].url !== tab.url) {
                tabList[tabListIndex[tab.id]].url = tab.url;
                delete tabList[tabListIndex[tab.id]].screencap;
                delete tabList[tabListIndex[tab.id]].timestamp;
                updated = true;
            }

            if (tabList[tabListIndex[tab.id]].status !== tab.status) {
                tabList[tabListIndex[tab.id]].status = tab.status;
                updated = true;
            }

            if (tabList[tabListIndex[tab.id]].title !== tab.title) {
                tabList[tabListIndex[tab.id]].title = tab.title;
                updated = true;
            }

            //**Add new properties to track for updating here**//

            if (updated) {
                sendSingleTab(tab);
            }

            if (typeof callback !== "undefined") {
                callback(tab);
            }
        } else {
            tabCreated(tab, callback(tab));
        }
    });
}

// Expect an actual tab object
function tabExists(tab) {
    return typeof tabListIndex[tab.id] !== "undefined" ? true : false;
}

// Expect an actual tab object
function screencapExists(tab) {
    if (tabExists(tab)) {
        return typeof tabList[tabListIndex[tab.id]].screencap !== "undefined" ? true : false;
    } else {
        return false;
    }
}

function sendTabLists() {
    sendMessage(null, {message: "sendTabLists", tabList: tabList, tabListIndex: tabListIndex}, function() {});
}

function captureScreen(tab) {

    sanitizeTab(tab, function(tab) {

        screeenCap(tab.windowId, {format: "png"}, function(imgBlob) {
            var canvas = document.getElementById('canvas'),
                canvasContext = canvas.getContext('2d'),
                img = document.getElementById('img'),
                ratio = tab.height / tab.width,
                quarter;

            img.onload = function() {
                canvasContext.clearRect( 0, 0, canvas.width, canvas.height);
                if (ratio > 1) { // Screenshot is taller than it is wide
                    canvasContext.drawImage(this, 0, 0, canvas.width * window.devicePixelRatio, canvas.height * ratio * window.devicePixelRatio);
                } else {
                    canvasContext.drawImage(this, 0, 0, canvas.width * tab.width / tab.height * window.devicePixelRatio, canvas.height * window.devicePixelRatio);
                }

                tab.screencap = canvas.toDataURL();
                tab.timestampSinceCapture = date.getTime();
                if (tabExists(tab)) {
                    tabList[tabListIndex[tab.id]] = tab;
                    sendSingleTab(tabList[tabListIndex[tab.id]]);

                    if (!tab.favIconUrl || tab.favIconUrl === ''){

                        setTimeout(function() {
                            /// set favicon wherever it needs to be set here
                            console.log('delay tabId', tab.id);
                            getTab(tab.id, function(tab){

                              sendMessage(null, {message: "faviconTab", tab: tab}, function() {});
                            });

                        }, 4000);
                    }
                }
            };

            img.src = imgBlob; // Set the image to the dataUrl and invoke the onload function
        });
    });
}
