"use strict";

//VARIABLES

  var OVERTAB_TAB_ID = null,
      OVERTAB_WINDOW_ID = null,
      OVERTAB_DEFAULT_OPEN_FUNC = chrome.tabs.create,
      OVERTAB_ARRAY = [],
      LOG_LEVEL = "vvv",
      ALLOWED_PROTOCOLS = [
        "http:",
        "https:",
        "chrome:"
      ];

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////        CONVINIENCE CLASSES             ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

var lsGet = function( id, callback ){
  console.log( "notify", "local storage  get: ", id );
  chrome.storage.local.get( String( id) , callback );
};

var lsSet = function( thing, callback ){
  console.log( "notify", "local storage  set: ", thing );
  chrome.storage.local.set( thing, callback );
};

var lsRemove = function( tabId, callback ){
  if( typeof callback === "function" ){
    var id = String( tabId );
    chrome.storage.local.remove( [ id, "screencap-"+id, "screencap-url-"+id ], callback );
  }else{
    console.log( "warn", "lsremove callback not defined", callback );
  }
};

var logger = console.log;

console.log = function(){
  //argument types:
  //  vvv:
  //    notify, warn, errors
  //  vv:
  //    warn, errors
  //  v:
  //    errors
  //  production:
  //    log errors to google analytics

  if( arguments.length >= 2 ){
    var type = arguments[0];

    switch( LOG_LEVEL ){
      case "production":
        //do some google analytics error reporting
        break;
      case "v":
        if( type == "errors" ){
          logger.apply( this, arguments );
        }
        break;
      case "vv":
        if( type == "errors" || type == "warn" ){
          logger.apply( this, arguments );
        }
        break;
      case "vvv":
        logger.apply( this, arguments );
        break;
    }
  }
};

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////      END CONVINIENCE CLASSES           ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

function tabEvent( id, message ){
  sendMessage(null, {message: message, id: id});
}

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////     START CHROME CALLBACK FUNCTIONS    ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

var tabCreated = function( tab ){

  console.log( "notify", "tabcreated - undefined", tab.id );
  console.log( "notify", "tabcreated - url", tab.url );
  console.log( "notify", "tabcreated - title", tab.title );

  var parser = new Parser();

  var tabProtocol = parser.href(tab.url).protocol();
  var hostName = parser.href(tab.url).hostname();

  //what conditions do we want to accept add adding a tab?
  if (typeof tab.id !== "undefined" && ALLOWED_PROTOCOLS.indexOf( tabProtocol ) !== -1 && tab.id != OVERTAB_TAB_ID ){

    var setObj = {};
    setObj[tab.id] = tab.url;
    setObj["screencap-"+tab.id] = "";
    setObj["screencap-url-"+tab.id] = "";

    console.log( "notify", "created about to set:", tab.id, tab.url, "======");

    lsSet( setObj, function(){
      //ok we set it, send an event
      tabEvent( tab.id, "created" );
    });
  }else{
    //this might be the overtab tab, or options tab or soemthing
    console.log( "error", "ERROR: something happened on create:", tab );
    console.log( "error", "protocol:",tabProtocol, "hostname", hostName);
  }
};

var tabUpdated = function( tabId, changeInfo, tab ){

  var parser = new Parser();

  var tabProtocol = parser.href(tab.url).protocol();
  var hostName = parser.href(tab.url).hostname();

  if ( typeof tab.id !== "undefined" && ALLOWED_PROTOCOLS.indexOf( tabProtocol ) !== -1 && tabId != OVERTAB_TAB_ID ){

    var id = tab.id;
    lsGet( id, function( result ){
      console.log( "notify", "lsget: result:", result, chrome.runtime.lastError );
      if( !result || !result.hasOwnProperty( id ) ){
        //its not inside the thing
        console.log("warn", "WARNING: update, couldnt find thing" );
        //maybe the create failed b/c it wasnt a thing yet. put it in ls
        console.log( "notify", "updated about to set:", id, result.url, "======");

        var setObj = {};
        setObj[id] = tab.url;
        lsSet( setObj, function(){

          console.log("notify", "ls is set, let's do the screencap", result );
          //ok we set it, send an event
          tabEvent( id, "pre-update" );

          screenCap( tab );
        });
      }else{
        //don't make it too noisy with messages
        console.log("notify", "we know its a thing, update complete", changeInfo, result, tab);
        console.log("notify", !result, !result.hasOwnProperty( id ));

        console.log( "warn", "about to DO scap", result );
        if( changeInfo.status == "complete" ){
          tabEvent( id, "updated" );
          screenCap( tab );
        }
      }
    });

  }else{
    //this might be the overtab tab, or options tab or soemthing
    console.log( "warn", "WARNING: update: not correct protocol", tab );
    console.log( "warn", "protocol:",tabProtocol, "hostname", hostName);
  }
};

var screenCap = function( tab ){

  //get the current screencap url
  var screenCapUrlId = "screencap-url-"+tab.id;
  lsGet( screenCapUrlId, function( screenCapUrl ){

    console.log( "warn", "OUR RESULT", screenCapUrl );
    if( !screenCapUrl || !screenCapUrl.hasOwnProperty( screenCapUrlId ) ){
      //didnt find!!
      console.log("warn", "we couldnt find this record:", screenCapUrlId, tab, tab);
      return false;
    }

    //extract the value;
    var oldUrl = screenCapUrl[screenCapUrlId];

    if( tab.url == oldUrl ){
      //we already took this screencap
      console.log("notify", "we already took this cap:", screenCapUrl);
      return false;
    }

    //needs to be "active" and "complete" to screenshot
    var activeCompleteQuery = {
      currentWindow: true,
      windowId: tab.windowId,
      active: true,
      status: "complete"
    };

    tabQuery(activeCompleteQuery, function(result) {
      console.log( "notify", "screencap: ", screenCapUrl, result, tab, "----------");
      if ( result.id == tab.id && result.windowId == tab.windowId && oldUrl != result.url ) {
        generateScreenCap(result.windowId, {format: "png"}, function( blob ){

          var capId = "screencap-"+tab.id;
          var setObj = {};

          console.log( "notify", "screencap about to set:", capId, result.url, "======");

          setObj[capId] = blob;
          setObj["screncap-url-"+tab.id] = result.url;

          lsSet( setObj, function(){
            //storage is set, ready for ng app to get it
            tabEvent( tab.id, "screencap" );
            console.log("notify", "screenshot done");
          });
        });
      }else{
        console.log( "notify", "NOTIFY: no active window found for this event" );
      }
    });
  });
};

var tabActivated = function( tabInfo ){

  var id = tabInfo.tabId;

  lsGet( id, function( result ){
    if( result && result !== null && result.hasOwnProperty( id ) ){
        tabEvent( id, "activated" );
    }else{
      console.log( "warn", "tab activated but not found in ls", result );
    }

  });
};

var tabRemoved = function( tabId, removeInfo ){

  if (tabId === OVERTAB_TAB_ID) {
    //console.log("Closed");
    OVERTAB_TAB_ID = null;
    OVERTAB_WINDOW_ID = null;
  }else{
    lsRemove(tabId, function(){
      tabEvent( tabId, "removed" );
    });
  }
};

var onMessage = function( request, sender, sendResponse ){
  console.log("notify", "message request:", request);
};

var browserActionClick = function( ){

  if ( OVERTAB_TAB_ID === null ) {
    // Prevents mashing the button and opening duplicate Overtab tabs
    var func = lsGet( "OVERTAB_OPEN_FUNC", function( func ){

      //this is a hack, needs to be fixed with switch statement
      if( !func || typeof func["OVERTAB_OPEN_FUNC"] == "undefined" ){
        //default behavior
        func = OVERTAB_DEFAULT_OPEN_FUNC;
      }

      var options = {
        'url' : getExtensionUrl()
      };

      //add more options here from local storage

      func( options, function(tab) {

          //do we want any checks here?

          OVERTAB_TAB_ID = tab.id;
          OVERTAB_WINDOW_ID = tab.windowId;

          lsSet( { "OVERTAB_TAB_ID" : OVERTAB_TAB_ID, "OVERTAB_WINDOW_ID" : OVERTAB_WINDOW_ID } );
      });
    });
  }else {
    tabFocus( OVERTAB_TAB_ID, OVERTAB_WINDOW_ID );
  }
};

var tabReplaced = function( newTabId, oldTabId ){

  //replace the old tab with the new one
  console.log("warn", "ERROR: a tab was replaced" );
};

var startup = function(){
  //chrome.storage.local.clear();
  //set some local storage stuff???
  console.log("notify", "startup" );
};

var shutdown = function(){
  //delete local storage stuff????
  console.log("notify", "shutdown" );
};

var install = function( details ){
  chrome.storage.local.clear();
  //set some options????
  console.log("notify", "installed", details.reason, details.previousVersion );
};

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////       END CHROME CALLBACK FUNCTIONS    ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////      START CHROME INTERACTION          ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

chrome.runtime.onStartup.addListener( startup );
chrome.runtime.onSuspend.addListener( shutdown );
chrome.runtime.onInstalled.addListener( install );

//default overtab opener
var defaultOpener = chrome.tabs.create;

//get extension html url
var getExtensionUrl = function(){
  return chrome.extension.getURL('index.html');
};

//listen for a message
chrome.runtime.onMessage.addListener( onMessage );

//get the tab screenshot
//this needs to run the web worker
var generateScreenCap = function( windowId, options, callback ){
  console.log( "notify", "gen screen cap" );
  return chrome.tabs.captureVisibleTab( windowId, options, callback );
};

//listen for tab states
chrome.tabs.onCreated.addListener( tabCreated );
chrome.tabs.onUpdated.addListener( tabUpdated );

chrome.tabs.onActivated.addListener( tabActivated );
chrome.tabs.onRemoved.addListener( tabRemoved );

//clicking on the browser menu item
chrome.browserAction.onClicked.addListener( browserActionClick );

//if a tab is replaced (only for prerender)
chrome.tabs.onReplaced.addListener( tabReplaced );

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////        END CHROME INTERACTION          ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
