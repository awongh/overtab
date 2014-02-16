"use strict";

//VARIABLES

  var OVERTAB_TAB_ID = null,
      OVERTAB_WINDOW_ID = null,
      OVERTAB_DEFAULT_OPEN_FUNC = chrome.tabs.create,
      OVERTAB_ARRAY;

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////        CONVINIENCE CLASSES             ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

Array.prototype.remove = function(from) {
    return this.splice(from, 1);
};

Array.prototype.add = function(from, item) {
    if( !item ){
      throw "Trying to add a null variable to array. -oops";
    }

    return this.splice(from, 0, item);
};

Array.prototype.hasValue = function( val ){

  if( this.indexOf( val ) ){
    return true;
  }

  return false;
};

Array.prototype.removeValue = function( val ){

  var i = this.indexOf( val );
  if( i ){
    return this.remove( i );
  }

  return false;
};

var Parser = function(){
  this.parser = document.createElement('a');
}

Parser.prototype = {
  href : function( href ){
    this.parser.href = href;
    return this;
  },

  protocol : function(){
    return this.parser.protocol;
  },

  hostname : function(){
    return this.parser.hostname;
  },

  port : function(){
    return this.parser.port;
  },

  pathname : function(){
    return this.parser.pathname;
  },

  search : function(){
    return this.parser.search;
  },

  hash : function(){
    return this.parser.hash;
  },

  host : function(){
    return this.parser.host;
  }
}

var lsArrayGet = function(){
  if( typeof OVERTAB_ARRAY === "undefined"){
    var array_string = localStorage.getItem( "OVERTAB_ARRAY" );
    OVERTAB_ARRAY = array_string.split(",");
  }

  return OVERTAB_ARRAY;
}

var lsArraySet = function( val ){

  OVERTAB_ARRAY = lsArrayGet();

  OVERTAB_ARRAY.push( val );

  return localStorage.setItem( "OVERTAB_ARRAY", OVERTAB_ARRAY )
}

var lsArrayRemove = function( val ){
  OVERTAB_ARRAY = lsArrayGet();

  OVERTAB_ARRAY.push( val );

  //remove it
  OVERTAB_ARRAY.removeValue( val );

  return localStorage.setItem( "OVERTAB_ARRAY", OVERTAB_ARRAY )
}

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

  console.log( "tabcreated - undefined", tab.id );
  console.log( "tabcreated - url", tab.url );
  console.log( "tabcreated - title", tab.title );

  var parser = new Parser();

  var tabProtocol = parser.href(tab.url).protocol();
  var hostName = parser.href(tab.url).hostname();

  //what conditions do we want to accept add adding a tab?
  if (typeof tab.id !== "undefined"
    && ( (tabProtocol === "http:" || tabProtocol === "https:" || hostName === "newtab" ) ) ) {

      var id = tab.id;
      if ( !localStorage.getItem( id ) ) {

          //ya, we are storing nothing in here
          localStorage.setItem( id, "no-screencap");

          //set it in the array of things
          if( !lsArrayGet().hasValue( id ) ){
            lsArraySet( id );
          }

          //send it off to the angular app
          tabEvent( id, "created" );
      }else{
        console.log( "ERROR: ls, tab already in there on create!" );
      }
  }else{
    //this might be the overtab tab, or options tab or soemthing
    console.log( "ERROR: something happened on create:", tab );
    console.log( "http:",tabProtocol === "http:");
    console.log( "https:",tabProtocol === "https:");
    console.log( "hostname", hostName, hostName === "newtab" );
  }
};

var tabUpdated = function( tabId, changeInfo, tab ){
    console.log( "tabupdated", changeInfo.status );

    if( !localStorage.getItem( tabId ) ){
      console.log( "ERROR: updated but not in lc:", tabId, changeInfo, tab );
      return;
    }

    tabEvent( tabId, "updated" );
};

function getFavicon(id){
  setTimeout(function() {
    /// set favicon wherever it needs to be set here
    getTab(id, function(tab){
      if( tab.favIconUrl ){
        tabEvent( id, "favicon" );
      }
    });

  }, 4000);
}

var tabActivated = function( tabInfo ){
  console.log( "tabactiviated", tabInfo );
  var tabId = tabInfo.tabId;

  if( !localStorage.getItem( tabId ) ){
    console.log( "ERROR: activated but not in lc:", tabInfo);
    return;
  }

  tabEvent( tabId, "activated" );

  if( localStorage.getItem( tabId ) !== "no-screencap" ){
    //we already have a screencap for this
    console.log( "already has a screenshot" );
  }

  //needs to be "active" and "complete" to screenshot
  var activeCompleteQuery = {
    currentWindow: true,
    windowId: tabInfo.windowId,
    active: true,
    status: "complete"
  };

  tabQuery(activeCompleteQuery, function(result) {
    if (result.id == tabId) {
      screenCap(tabInfo.windowId, {format: "png"}, function( blob ){
        localStorage.setItem( tabId, blob );
        tabEvent( tabId, "screencap" );
      });

      //go off to get a favicon
      getFavicon(tabId);
    }
  });
};

var tabRemoved = function( tabId, removeInfo ){

  localStorage.removeItem(tabId);

  lsArrayRemove( tabId );

  if (tabId === OVERTAB_TAB_ID) {
    //console.log("Closed");
    OVERTAB_TAB_ID = null;
    OVERTAB_WINDOW_ID = null;
  }
};

var onMessage = function( request, sender, sendResponse ){
  if ( request.message === "getList" ) {
    sendTabLists();
  }
};

var browserActionClick = function( ){

  if ( OVERTAB_TAB_ID === null ) {
    // Prevents mashing the button and opening duplicate Overtab tabs
    var func = localStorage.getItem( "OVERTAB_OPEN_FUNC" );

    if( !func ){
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

        localStorage.setItem( "OVERTAB_TAB_ID", OVERTAB_TAB_ID );
        localStorage.setItem( "OVERTAB_WINDOW_ID", OVERTAB_WINDOW_ID );
    });

  }else {
    tabFocus( OVERTAB_TAB_ID, OVERTAB_WINDOW_ID );
  }
};

var tabReplaced = function( newTabId, oldTabId ){

  //replace the old tab with the new one
  console.log( "ERROR: a tab was replaced" );
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

//default overtab opener
var defaultOpener = chrome.tabs.create;

//get extension html url
var getExtensionUrl = function(){
  return chrome.extension.getURL('index.html');
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

//query for a single tab
var tabQuery = function( queryInfo, callback ){
  return chrome.tabs.query( queryInfo, function( tabs ){
    if (tabs.length > 0 && tabs[0].id) {
        callback(tabs[0]);
    }else{
      console.log( "WARNING: your tab query failed", queryInfo, tabs );
    }
  });
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

//if a tab is replaced (only for prerender)
chrome.tabs.onReplaced.addListener( tabReplaced )

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////        END CHROME INTERACTION          ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
