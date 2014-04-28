"use strict";

//VARIABLES

  var THUMBSIZE = 150,
      SCREEN_CROP_RATIO = 1;

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////     START CHROME CALLBACK FUNCTIONS    ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

//make sure it's a real tab, not dev-tools, or something
var isVerifiedTabUrl = function( tab ){
  if( tab.hasOwnProperty( "url" ) ){
    var parser = new Parser();

    var tabProtocol = parser.href(tab.url).protocol();
    var hostName = parser.href(tab.url).hostname();

    //what conditions do we want to accept add adding a tab?
    if (
      tab.hasOwnProperty( "id" )
      && ALLOWED_PROTOCOLS.indexOf( tabProtocol ) !== -1
      && !isExtensionUrl( tab.url ) )
    {
      return true;
    }
  }

  return false;
};

var setTabCount = function(){
  tabsQuery({}, function(result) {

    var count = 0;

    for( var i = 0; i< result.length; i++ ){
      if( isVerifiedTabUrl( result[i] ) ){
        count++;
      }
    }

    chromeBadge( count );
  });
};

var tabCreated = function( tab ){

  if( isVerifiedTabUrl( tab ) ){

    var setObj = {};
    setObj[tab.id] = tab.url;
    setObj["screencap-"+tab.id] = "";
    setObj["screencap-url-"+tab.id] = "";

    lsSet( setObj, function(){
      //ok we set it, send an event
      tabEvent( tab.id, "created" );

      setTabCount();
    });
  }else{
    //this might be the overtab tab, or options tab or soemthing
    //console.log( "error", "ERROR: something happened on create:", tab );
  }
};

var tabUpdated = function( tabId, changeInfo, tab ){

  if( isVerifiedTabUrl( tab ) ){

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

          //screenCap( tab );
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
    //console.log( "warn", "WARNING: update: not correct protocol", tab, tabId );
  }
};

var screenCap = function( tab ){

  var start = new Date().getTime();

  //get the current screencap url
  var screenCapUrlId = "screencap-url-"+tab.id;
  lsGet( screenCapUrlId, function( screenCapUrl ){

    if( !screenCapUrl || !screenCapUrl.hasOwnProperty( screenCapUrlId ) ){
      //didnt find!!
      //console.log("warn", "we couldnt find this screencap record:", screenCapUrlId, tabId, tab);
      return false;
    }

    //extract the value;
    var oldUrl = screenCapUrl[screenCapUrlId];

    if( tab.url == oldUrl ){
      //we already took this screencap
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

        memoryCheck( function(){
          generateScreenCap(result.windowId, {format: "jpeg",quality:1}, function(blob){

            var blobLength = blob.length;

            processImage( tab.id, result.url, blob, result.width, result.height, function(){

              //getMemory();
              setMemoryStatistics( blobLength );
            });
            blob = undefined;
          });
        });
      }else{
        //console.log( "warn", "screencap: no active window found >> result: "+result.id+" tab: "+tab.id+" old url: "+oldUrl);
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
          }else{
            //console.log( "warn", "tab activated but not in get");
          }
        });
    }else{
      //console.log( "warn", "tab activated but not found in ls: tabid: "+id, result );
    }

  });
};

var tabRemoved = function( tabId, removeInfo ){
  getOvertabId( function( tab ){

    if (tab.id != tabId ) {
      lsRemove(tabId, function(){
        tabEvent( tabId, "removed" );

        setTabCount();
      });
    }
  });
};

var onMessage = function( request, sender, sendResponse ){
  //console.log("notify", "message request:", request);
};

//we are hard coding without static globals the default overtab behavior!!!!
//( the default switch )
//it opens in a new tab
var openOverTab = function( oldTabId ){

  lsGet( "opener", function( result ){

    var openerMethod,
      method = result["opener"];


    var options = {
      'url' : getExtensionUrl()
    };

    switch( method ){
      case "window":
        options["focused"] = true;
        openerMethod = chrome.windows.create;
        break;
      default:
        options["active"] = true;
        openerMethod = chrome.tabs.create;
    }

    //add more options here from local storage
    openerMethod( options, function(chromeObj) {

      //do we want any checks here?
      //if the opener method is window, do we still get all these params???
      if( chromeObj.hasOwnProperty("tabs") && chromeObj.tabs.length > 0 ){
        //get the tab index of the thing thats active
        var result = chromeObj.tabs.getByValueProperty( "active", true );

        if( result ){
          chromeObj = result;
        }else{
          //console.log( "error", "we couldnt find an active tab in the return value");
          return;
        }
      }

      //send a message that says the old tab
      tabEvent( oldTabId, "opening-overtab" );
    });

  });
};

var browserActionClick = function( ){

  //before we change the tab, get the current active tab
  tabQuery({ active:true }, function(tab) {

    var oldTabId = 0;

    if( tab ){
      var oldTabId = tab.id;
    }

    getOvertabId( function( tab ){

      if( tab ){
        tabFocus( tab.id, tab.windowId, oldTabId );
      }else{
        //create the tab
        openOverTab( oldTabId );
      }

    });
  });
};

var getAllTabs = function(){

  getOvertabId( function( tab ){

    var overtabId = null;

    if( tab ){
      overtabId = tab.id;
    }

    //query for all the tabs
    tabsQuery( {}, function( chromeTabs ){
      //console.log("notify", "query all tabs", chromeTabs );
      for( var i=0; i< chromeTabs.length; i++ ){
        //see if we are gonna allow it
        var tab = chromeTabs[i];

        if( isVerifiedTabUrl( tab ) && tab.id != overtabId && tab.status === "complete" ){
          tabCreated( tab );
        }
      }
    });
  });
};

var tabReplaced = function( newTabId, oldTabId ){

  //replace the old tab with the new one
  //console.log("warn", "WARN: XXXXXXX a tab was replaced" );

  //TODO: we might not be able to do a get on oldtabit....

  //what kind of race conditions will we get when we are trying to set this???
  lsGet( oldTabId, function( result ){
    if( result && !result.hasOwnProperty( oldTabId ) ){

      //reset the thing
      var setObj = {};
      setObj[newTabId] = result.url;
      setObj["screencap-"+newTabId] = "";
      setObj["screencap-url-"+newTabId] = "";

      lsSet( setObj, function(){

        //ok we set it, send an event
        sendMessage(null, {message: "replaced", id: newTabId, oldId: oldTabId});
      });
    }else{
      //console.log("warn", "couldnt find tab on replace");
    }
  });
};

var reset = function(){

  //do some cleanup

  chrome.storage.local.clear();

  //doesnt matter which url we are getting, it will
  //cover whatever exteension things that are open
  var indexUrl = extensionUrl('index.html');

  var parser = new Parser();

  var urlString = parser.href(indexUrl).protocol() + "//" + parser.href(indexUrl).hostname() + "/*";

  var urlQuery = {
    url : urlString
  };

  //query for these and if they are found, close them
  tabsQuery(urlQuery, function(result) {

    for( var i=0; i<result.length; i++ ){
      closeTab( result[i].id );
    }
  });
};

var startup = function(){

  reset();

  getAllTabs();
};

var shutdown = function(){
  reset();
};

var install = function( details ){
  reset();

  getAllTabs();
};

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////       END CHROME CALLBACK FUNCTIONS    ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////      MEMORY CHECKING FOR EXTENSION     ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

var memoryCheck = function( callback ){
  //get the average mem usage
  lsGet( "memory_usage_average", function( result ){

    chrome.system.memory.getInfo(function(info){
      var availableCapacity = info.availableCapacity, capacity = info.capacity;

      if( result.hasOwnProperty("memory_usage_average") && result.memory_usage_average.length > 0 ){

        var average = result.memory_usage_average.intAverage();

        //console.log("we have: "+availableCapacity+" and we might use: "+average+" of total: "+capacity);

        //give us a safety cushion
        if( availableCapacity < ( average*2 ) ){

          //do some stuff here
          console.log("not doing screencap");
          return;
        }
      }

      callback();
    });
  });
};

var setMemoryStatistics = function( blobLength ){
  lsGet( "memory_usage_average", function( result ){

    var average = [];

    if( result.hasOwnProperty("memory_usage_average") && result.memory_usage_average.length > 0 ){
      average = result.memory_usage_average;
    }

    average.push( blobLength );

    //set
    lsSet( {"memory_usage_average":average} );
  });
};

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////    END MEMORY CHECKING FOR EXTENSION   ////////////////
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

//get extension html url
var getExtensionUrl = function(){
  return chrome.extension.getURL('index.html');
};

//listen for a message
chrome.runtime.onMessage.addListener( onMessage );

//get the tab screencap
//this needs to run the web worker
var generateScreenCap = function( windowId, options, callback ){
  chrome.tabs.captureVisibleTab( windowId, options, callback );
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

chrome.runtime.onSuspend.addListener( function(){
  //console.log("notify", "suspended");
});
chrome.runtime.onSuspendCanceled.addListener( function(){
  //console.log("notify", "suspend cancelled");
});

var getCurrentTab = function( callback ){
  chrome.tabs.getCurrent( callback );
};

chrome.commands.onCommand.addListener(function(command) {
  switch( command ){
    case "open-overtab":
      browserActionClick();
      break;
  }
});
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////        END CHROME INTERACTION          ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
