"use strict";

//VARIABLES

  var OVERTAB_TAB_ID = null,
      OVERTAB_WINDOW_ID = null,
      OVERTAB_DEFAULT_OPEN_FUNC = chrome.tabs.create,
      OVERTAB_ARRAY = [];

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
      //commenting this out, incase we dont need it.
      //it was here in case tabcreated failed in some way. we shall see
      if( !result || !result.hasOwnProperty( id ) ){
        //its not inside the thing
        console.log("warn", "WARNING: update, couldnt find thing" );
        //maybe the create failed b/c it wasnt a thing yet. put it in ls
        console.log( "notify", "updated about to set:", id, result.url, "======");

        var setObj = {};
        setObj[tab.id] = tab.url;
        setObj["screencap-"+tab.id] = "";
        setObj["screencap-url-"+tab.id] = "";

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
      console.log("warn", "we couldnt find this screencap record:", screenCapUrlId, tabId, tab);
      return false;
    }

    //extract the value;
    var oldUrl = screenCapUrl[screenCapUrlId];

    if( tab.url == oldUrl ){
      //we already took this screencap
      console.log("notify", "we already took this cap:", screenCapUrl);
      return false;
    }

    //needs to be "active" and "complete" to screencap
    var activeCompleteQuery = {
      currentWindow: true,
      windowId: tab.windowId,
      active: true,
      status: "complete"
    };

    tabQuery(activeCompleteQuery, function(result) {
      console.log( "notify", "screencap: ", screenCapUrl, result, tab, "----------");
      if ( result.id == tab.id && result.windowId == tab.windowId && oldUrl != result.url && DISALLOWED_SCREENCAP_URLS.indexOf(result.url) === -1 ) {
        generateScreenCap(result.windowId, {format: "png"}, function( blob ){

          //get the canvas
          //and stuff
          var canvas = document.createElement('canvas');

          //start the proc w/ canvas

          var img = document.createElement('img'),
            ratio = tab.height / tab.width,
            canvasContext = canvas.getContext('2d'),
            width = canvas.width * tab.width / tab.height * window.devicePixelRatio,
            height = canvas.height * window.devicePixelRatio;

          if (ratio > 1) { // Screenshot is taller than it is wide
            width = canvas.width * window.devicePixelRatio;
            height = canvas.height * ratio * window.devicePixelRatio;
          }

          img.onload = function() {
            //ok we need to get the result out from here somehow

            var capId = "screencap-"+tab.id;
            var setObj = {};

            console.log( "notify", "screencap about to set:", capId, "======");

            canvasContext.clearRect( 0, 0, canvas.width, canvas.height);
            canvasContext.drawImage(this, 0, 0, width, height);

            setObj[capId] = canvas.toDataURL();
            setObj["screncap-url-"+tab.id] = result.url;

            lsSet( setObj, function(){
              //storage is set, ready for ng app to get it
              tabEvent( tab.id, "screencap" );
              console.log("notify", "screencap done");
            });
          };

          img.src = blob; // Set the image to the dataUrl and invoke the onload function

        });
      }else{
        console.log( "notify", "NOTIFY: no active window found for this event" );
      }
    });
  });
};

//do we need this???
//when do we take a screen shot and its not updated??
var tabActivated = function( tabInfo ){

  var id = tabInfo.tabId;

  lsGet( id, function( result ){
    if( result && result !== null && result.hasOwnProperty( id ) ){
        console.log( "warn", "about to try screencap in activated", result );
        tabEvent( id, "activated" );

        getTab( id, function( tab ){
          console.log( "error", "WUUUTT, result", tab );

          //what kind of check do we need here??
          if( tab && typeof tab.id !== "undefined" ){
            screenCap( tab );
          }
        });
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
    lsSet( { "OVERTAB_TAB_ID" : null, "OVERTAB_WINDOW_ID" : null } );
  }else{
    lsRemove(tabId, function(){
      tabEvent( tabId, "removed" );
    });
  }
};

var onMessage = function( request, sender, sendResponse ){
  console.log("notify", "message request:", request);
};

var openOverTab = function( ){

  lsGet( "OVERTAB_OPEN_FUNC", function( func ){

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
};

var browserActionClick = function( ){

  if ( OVERTAB_TAB_ID === null || OVERTAB_WINDOW_ID === null ) {

      lsGet( "OVERTAB_TAB_ID", function( tabIdResult ){

        if( tabIdResult && tabIdResult !== null && tabIdResult.hasOwnProperty( "OVERTAB_TAB_ID" ) && tabIdResult["OVERTAB_TAB_ID"] !== null ){
          OVERTAB_TAB_ID = tabIdResult;
        }else{
          openOverTab();
          return;
        }

        lsGet( "OVERTAB_WINDOW_ID", function( windowIdResult ){

          if( windowIdResult && windowIdResult !== null && windowIdResult.hasOwnProperty( "OVERTAB_WINDOW_ID" ) && windowIdResult["OVERTAB_WINDOW_ID"] !== null ){

            OVERTAB_WINDOW_ID = windowIdResult;
            tabFocus( OVERTAB_TAB_ID, OVERTAB_WINDOW_ID );

          }else{
            openOverTab();
          }
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

//get the tab screencap
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

chrome.runtime.onSuspend.addListener( function(){ copnsole.log("notify", "suspended"); });
chrome.runtime.onSuspendCanceled.addListener( function(){ copnsole.log("notify", "suspend cancelled"); });

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////        END CHROME INTERACTION          ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
