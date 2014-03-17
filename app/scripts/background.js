"use strict";

//VARIABLES

  var THUMBSIZE = 150,
      SCREEN_CROP_RATIO = 1;

  var OVERTAB_TAB_ID = null,
      OVERTAB_WINDOW_ID = null,
      OVERTAB_DEFAULT_OPEN_FUNC = chrome.tabs.create;

function tabEvent( id, message ){
  sendMessage(null, {message: message, id: id});
}

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////     START CHROME CALLBACK FUNCTIONS    ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

var tabCreated = function( tab ){

  var parser = new Parser();

  var tabProtocol = parser.href(tab.url).protocol();
  var hostName = parser.href(tab.url).hostname();

  //what conditions do we want to accept add adding a tab?
  if (typeof tab.id !== "undefined" && ALLOWED_PROTOCOLS.indexOf( tabProtocol ) !== -1 && tab.id != OVERTAB_TAB_ID ){

    var setObj = {};
    setObj[tab.id] = tab.url;
    setObj["screencap-"+tab.id] = "";
    setObj["screencap-url-"+tab.id] = "";

    lsSet( setObj, function(){
      //ok we set it, send an event
      tabEvent( tab.id, "created" );
    });
  }else{
    //this might be the overtab tab, or options tab or soemthing
    console.log( "error", "ERROR: something happened on create:", tab );
  }
};

var tabUpdated = function( tabId, changeInfo, tab ){

  var parser = new Parser();

  var tabProtocol = parser.href(tab.url).protocol();
  var hostName = parser.href(tab.url).hostname();

  if ( typeof tab.id !== "undefined" && ALLOWED_PROTOCOLS.indexOf( tabProtocol ) !== -1 && tabId != OVERTAB_TAB_ID ){

    var id = tab.id;
    lsGet( id, function( result ){
      //commenting this out, incase we dont need it.
      //it was here in case tabcreated failed in some way. we shall see
      if( !result || !result.hasOwnProperty( id ) ){
        //its not inside the thing

        var setObj = {};
        setObj[tab.id] = tab.url;
        setObj["screencap-"+tab.id] = "";
        setObj["screencap-url-"+tab.id] = "";

        lsSet( setObj, function(){

          //ok we set it, send an event
          tabEvent( id, "pre-update" );

          screenCap( tab );
        });
      }else{
        //don't make it too noisy with messages
        if( changeInfo.status == "complete" ){
          tabEvent( id, "updated" );
          screenCap( tab );
        }
      }
    });

  }else{
    //this might be the overtab tab, or options tab or soemthing
    console.log( "warn", "WARNING: update: not correct protocol", tab );
  }
};

var screenCap = function( tab ){

  //get the current screencap url
  var screenCapUrlId = "screencap-url-"+tab.id;
  lsGet( screenCapUrlId, function( screenCapUrl ){

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
      if ( result.id == tab.id && result.windowId == tab.windowId && oldUrl != result.url && DISALLOWED_SCREENCAP_URLS.indexOf(result.url) === -1 ) {
        generateScreenCap(result.windowId, {format: "png"}, function( blob ){

          var canvas = document.createElement('canvas'),
            canvasContext = canvas.getContext('2d');

          canvas.width = THUMBSIZE;
          canvas.height = THUMBSIZE;

          var img = document.createElement('img');

          img.onload = function() {

            var cropLength = THUMBSIZE / SCREEN_CROP_RATIO,
              height, width;

            //figure out the size to draw the image.

            //height is ratio corrected, so that we are fitting the
            //screencrop's amount into the thumb height.
            //the viewport of thumbsize is the visible portion of the screen_crop ratio's

            if( this.height < this.width ){ //landscape

              height = cropLength;

              //figure out the ratio-calculated length of the adjacent side
              //increase the longer side:
              //computed length * local ratio <-- always > 1
              width = cropLength * ( this.width / this.height );
            }else{
              width = cropLength;

              height = cropLength * ( this.height / this.width );
            }

            var capId = "screencap-"+tab.id;
            var setObj = {};

            canvasContext.clearRect( 0, 0, canvas.width, canvas.height);
            canvasContext.drawImage(this, 0, 0, width, height);

            setObj[capId] = canvas.toDataURL();
            setObj["screncap-url-"+tab.id] = result.url;

            lsSet( setObj, function(){
              //storage is set, ready for ng app to get it
              tabEvent( tab.id, "screencap" );
            });

            canvas = undefined;
            canvasContext = undefined;
          };

          img.src = blob; // Set the image to the dataUrl and invoke the onload function
          blob = undefined;
          img = undefined;

        });
      }else{
        console.log( "warn", "no active window found for this event" );
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
        tabEvent( id, "activated" );

        getTab( id, function( tab ){

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
  //console.log("notify", "message request:", request);
};

var openOverTab = function( ){

  lsGet( "opener", function( result ){

    var openerMethod,
      method = result["opener"];

    switch( method ){
      case "window":
        openerMethod = chrome.windows.create;
        break;
      default:
        openerMethod = chrome.tabs.create;
    }

    var options = {
      'url' : getExtensionUrl()
    };

    //add more options here from local storage
    openerMethod( options, function(tab) {

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

          getTab( tabIdResult.OVERTAB_TAB_ID, function( tab ){

            //what kind of check do we need here??
            if( tab && typeof tab.id !== "undefined" ){

              lsGet( "OVERTAB_WINDOW_ID", function( windowIdResult ){

                if( windowIdResult && windowIdResult !== null && windowIdResult.hasOwnProperty( "OVERTAB_WINDOW_ID" ) && windowIdResult["OVERTAB_WINDOW_ID"] !== null ){

                  OVERTAB_WINDOW_ID = windowIdResult.OVERTAB_WINDOW_ID;
                  tabFocus( OVERTAB_TAB_ID, OVERTAB_WINDOW_ID );

                }else{
                  openOverTab();
                }
              });
            }else{
              openOverTab();
            }
          });
        }else{
          openOverTab();
        }

      });
  }else {
    tabFocus( OVERTAB_TAB_ID, OVERTAB_WINDOW_ID );
  }
};

var getAllTabs = function(){
  lsGet( "OVERTAB_TAB_ID", function( result ){

    var overtabId = null;

    if( result.hasOwnProperty( "OVERTAB_TAB_ID" ) ){
      overtabId = result["OVERTAB_TAB_ID"];
    }

    var parser = new Parser();

    //query for all the tabs

    tabsQuery( {}, function( chromeTabs ){
      console.log("notify", "query all tabs", chromeTabs );
      for( var i=0; i< chromeTabs.length; i++ ){
        //see if we are gonna allow it
        var tab = chromeTabs[i];

        var tabProtocol = parser.href(tab.url).protocol();
        var hostName = parser.href(tab.url).hostname();

        if ( typeof tab.id !== "undefined" && ALLOWED_PROTOCOLS.indexOf( tabProtocol ) !== -1 && tab.id != overtabId && tab.status === "complete" ){

          tabCreated( tab );
        }
      }
    });
  });
};

var tabReplaced = function( newTabId, oldTabId ){

  //replace the old tab with the new one
  console.log("warn", "WARN: a tab was replaced" );
};

var startup = function(){
  chrome.storage.local.clear();
  //set some local storage stuff???
  console.log("notify", "startup" );

  getAllTabs();
};

var shutdown = function(){
  chrome.storage.local.clear();
  //console.log("notify", "shutdown" );
};

var install = function( details ){
  chrome.storage.local.clear();
  //set some options????
  getAllTabs();

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

chrome.runtime.onSuspend.addListener( function(){ console.log("notify", "suspended"); });
chrome.runtime.onSuspendCanceled.addListener( function(){ console.log("notify", "suspend cancelled"); });

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////        END CHROME INTERACTION          ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
