"use strict";

//options array
//define the possible values in the options checker, inside of background
var options = [
  //values: tab, window
  {
    name : "opener",
    type : "radio"
  }

  //example other kinds of inputs for options
  //name == class on individual
  /*

  {
    name : "test4",
    type : "select"
  },
  { name: "test3", type:"text" }

  */
];

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////      SHARED CHROME INTERACTION         ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
var isExtensionUrl = function( url ){
  if( url == extensionUrl("index.html") || url == extensionUrl("options.html") ){
    return true;
  }

  return false;
}

var extensionUrl = function( path ){
  return chrome.extension.getURL( path );
};

//query for a single tab
var tabQuery = function( queryInfo, callback ){
  chrome.tabs.query( queryInfo, function( tabs ){

    //this is a hack for when a dev window is open...
    //make sure we can find one good tab
    var rtabs = [],
      i=0;

    do{
      if (tabs[i] && tabs[i].id) {
        rtabs.push( tabs[i] );
      }
      i++;
    }while (i < tabs.length && !isVerifiedTabUrl( tab ) );

    if (rtabs.length > 0 ) {
        callback(rtabs[0]);
    }else{
      //console.log( "warn", "WARNING: your tab query failed", queryInfo, tabs );
      callback(false);
    }
  });
};

var tabsQuery = function( queryInfo, callback ){
  return chrome.tabs.query( queryInfo, callback );
};

//get a tab by id
var getTab = function( tabId, callback ){
  return chrome.tabs.get( tabId, callback );
};

//bring a tab into focus
var tabFocus = function( tabId, windowId, oldTabId ){
    chrome.windows.update(windowId, {'focused': true}, function() {
      chrome.tabs.update(tabId, {'active': true}, function() {
        //message the thing to say the tab
        tabEvent( oldTabId, "overtab" );
      });
    });
};

var tabEvent = function( id, message ){
  sendMessage(null, {message: message, id: id});
}

//send message
var sendMessage = function( tabId, message, callback ){
  return chrome.runtime.sendMessage( tabId, message, callback );
};

var lsGet = function( id, callback ){
  chrome.storage.local.get( String( id) , callback );
};

var lsSet = function( thing, callback ){
  chrome.storage.local.set( thing, callback );
  thing = undefined;
};

var lsRemove = function( tabId, callback ){
  if( typeof callback === "function" ){
    var id = String( tabId );
    chrome.storage.local.remove( [ id, "screencap-"+id, "screencap-url-"+id ], callback );
  }else{
    //what do we want to do here???
    //console.log( "warn", "lsremove callback not defined", callback );
  }
};

var chromeBadge = function( text ){
  chrome.browserAction.setBadgeText( {text: String(text)} );
};

var closeTab = function( tabId ){
  chrome.tabs.remove( tabId, function() {
    //what should we do here
  });
};
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////     END SHARED CHROME INTERACTION      ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////            GET OVERTAB TAB ID          ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

var getOvertabId = function( callback ){
  var query = {
    url: extensionUrl('index.html')
  };

  tabQuery(query, function(tab) {

    if( tab ){
      callback( tab );
    }else{
      callback( false );
    }
  });
}

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////          END GET OVERTAB TAB ID        ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////     CHROME MEMORY DEV STUFF            ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

var getMemory = function(){
  chrome.system.memory.getInfo(function(info){
    var availableCapacity = info.availableCapacity, capacity = info.capacity;
    //console.log( "available: "+availableCapacity, "total: "+capacity );
    //console.log( "available: "+availableCapacity );

    if( availableCapacity < 21000000 ){
      alert( "about to run out of memory" );
    }

    if( OVERTAB_TAB_ID ){

      chrome.processes.getProcessIdForTab(OVERTAB_TAB_ID, function(processId){

        var pId = processId;

        chrome.processes.getProcessInfo(processId, true, function(processes){

          var ps = [];

          for( var i in processes ){
            if( processes.hasOwnProperty(i) ){
              ps.push( processes[i] );
            }
          }

          var process = ps[0];

          //console.log( "using:" + process.privateMemory );

        /*
          console.log( "process"
           , process.id
           , process.privateMemory
           , process.osProcessId
           , process.tabs.length
           , process.title
           , process.type
          );
         */
        });
      });

    }
  });
};
