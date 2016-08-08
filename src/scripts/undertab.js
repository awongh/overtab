import chromeHelper from 'scripts/shared/chrome'
import image from 'scripts/image'

let ggg = function(){

  var DISALLOWED_SCREENCAP_URLS = [
    "chrome://newtab/"
  ];

  //VARIABLES

    var THUMBSIZE = 150,
        SCREEN_CROP_RATIO = 1;

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////     START CHROME CALLBACK FUNCTIONS    ////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  var setTabCount = function(){
    chromeHelper.getTabCount( chromeHelper.chromeBadge );
  };

  var tabCreated = function( tab ){

    if( chromeHelper.isVerifiedTabUrl( tab ) ){

      var setObj = {};
      setObj[tab.id] = tab.url;
      setObj["screencap-"+tab.id] = "";
      setObj["screencap-url-"+tab.id] = "";

      chromeHelper.lsSet( setObj, function(){
        //ok we set it, send an event
        chromeHelper.tabEvent( tab.id, "created" );

        setTabCount();
      });
    }else{
      //this might be the overtab tab, or options tab or soemthing
      //console.log( "error", "ERROR: something happened on create:", tab );
    }
  };

  var tabUpdated = function( tabId, changeInfo, tab ){

    if( chromeHelper.isVerifiedTabUrl( tab ) ){

      var id = tab.id;
      chromeHelper.lsGet( id, function( result ){
        //commenting this out, incase we dont need it.
        //it was here in case tabcreated failed in some way. we shall see
        if( !result || !result.hasOwnProperty( id ) ){
          //its not inside the thing

          var setObj = {};
          setObj[tab.id] = tab.url;
          setObj["screencap-"+tab.id] = "";
          setObj["screencap-url-"+tab.id] = "";

          chromeHelper.lsSet( setObj, function(){

            //ok we set it, send an event
            chromeHelper.tabEvent( id, "pre-update" );

            //screenCap( tab );
          });
        }else{
          //don't make it too noisy with messages
          if( changeInfo.status == "complete" ){
            chromeHelper.tabEvent( id, "updated" );
            screenCap( tab );
          }
        }
      });

    }else{
      //this might be the overtab tab, or options tab or soemthing
      //console.log( "warn", "WARNING: update: not correct protocol", tab, tabId );
    }
  };

  //get the tab screencap
  //this needs to run the web worker
  var generateScreenCap = function( windowId, options, callback ){
    chrome.tabs.captureVisibleTab( windowId, options, callback );
  };



  var screenCap = function( tab ){

    //var start = new Date().getTime();

    //get the current screencap url
    var screenCapUrlId = "screencap-url-"+tab.id;
    chromeHelper.lsGet( screenCapUrlId, function( screenCapUrl ){

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

      chromeHelper.tabQuery(activeCompleteQuery, function(result) {
        if ( result.id == tab.id && result.windowId == tab.windowId && oldUrl != result.url && DISALLOWED_SCREENCAP_URLS.indexOf(result.url) === -1 ) {

          generateScreenCap(result.windowId, {format: "jpeg",quality:1}, function(blob){

            if( blob ){

              var blobLength = blob.length;

              image.processImage( tab.id, result.url, blob, result.width, result.height, function(){
                //what goes here?

              });
              blob = undefined;

            }
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

    chromeHelper.lsGet( id, function( result ){
      if( result && result !== null && result.hasOwnProperty( id ) ){
          chromeHelper.tabEvent( id, "activated" );

          chromeHelper.getTab( id, function( tab ){

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
    chromeHelper.getOvertabId( function( tab ){

      if (tab.id != tabId ) {
        chromeHelper.lsRemove(tabId, function(){
          chromeHelper.tabEvent( tabId, "removed" );

          setTabCount();
        });
      }
    });
  };

  var onMessage = function( request, sender, sendResponse ){
    //console.log("notify", "message request:", request);
  };

  var getAllTabs = function(){

    chromeHelper.getOvertabId( function( overtabTab ){

      var overtabId = null;

      if( overtabTab ){
        overtabId = overtabTab.id;
      }

      //query for all the tabs
      chromeHelper.tabsQuery( {}, function( chromeTabs ){
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
    //console.log("WARN: XXXXXXX a tab was replaced", newTabId, oldTabId );

    //TODO: we might not be able to do a get on oldtabit....

    //what kind of race conditions will we get when we are trying to set this???
    chromeHelper.lsGet( oldTabId, function( result ){
      if( result && result.hasOwnProperty( oldTabId ) ){

        chromeHelper.lsRemove(oldTabId, function(){
          tabReplaceSet( newTabId, oldTabId );
        });

      }else{
        tabReplaceSet( newTabId, oldTabId );
      }
    });
  };

  var tabReplaceSet = function( newTabId, oldTabId ){


    chromeHelper.getTab( newTabId, function( tab ){

      if( tab && typeof tab.id !== "undefined" ){

        //reset the thing
        var setObj = {};
        setObj[newTabId] = tab.url;
        setObj["screencap-"+newTabId] = "";
        setObj["screencap-url-"+newTabId] = "";

        chromeHelper.lsSet( setObj, function(){

          //ok we set it, send an event
          chromeHelper.sendMessage(null, {message: "replaced", id: newTabId, oldId: oldTabId});
        });

      }else{
        //are we waiting long enough for this? possible other race conditions??
        //console.log("tab replace: couldn't get tab with id: "+newTabId);
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
    chromeHelper.tabsQuery(urlQuery, function(result) {

      for( var i=0; i<result.length; i++ ){
        chromeHelper.closeTab( result[i].id );
      }
    });
  };

  var startup = function(){
    analyticsEvent( "startup" );

    reset();

    getAllTabs();
  };

  var shutdown = function(){
    reset();
  };

  var install = function( details ){
    analyticsEvent( "install" );

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

  var getTabScreenCount = function( callback ){

    //get all the tabs, see if they have screencaps in local storage
    chromeHelper.tabsQuery( {}, function( chromeTabs ){

      var last = chromeTabs.length -1;
      var screenCount = 0;

      for( var i=0; i< chromeTabs.length; i++ ){

        var tabId = chromeTabs[i].id;

        //for loop closure, rename things for clarity
        (function outer(id, ci){
          chromeHelper.lsGet( "screencap-"+id, function(result){
            //do we have a result
            if( result.hasOwnProperty( "screencap-"+id ) && result["screencap-"+id] ){
              screenCount++;
            }

            //on the last element do the callback
            if( last == ci ){
              callback( screenCount );
            }
          });
        })(tabId, i)
      }
    });
  };

  var actionClick = function( ){

    //before we change the tab, get the current active tab
    chromeHelper.tabQuery({ active:true }, function(tab) {

      var oldTabId = 0;

      if( tab ){
        var oldTabId = tab.id;
      }

      chromeHelper.getOvertabId( function( tab ){

        if( tab ){
          chromeHelper.tabFocus( tab.id, tab.windowId, oldTabId );
        }else{
          //create the tab
          openOverTab( oldTabId );
        }

      });
    });
  };

  //get extension html url
  var getExtensionUrl = function(){
    return chrome.extension.getURL('index.html');
  };

  //we are hard coding without static globals the default overtab behavior!!!!
  //( the default switch )
  //it opens in a new tab
  var openOverTab = function( oldTabId ){

    chromeHelper.lsGet( "opener", function( result ){

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
        chromeHelper.tabEvent( oldTabId, "opening-overtab" );
      });

    });
  };

  return {
    setTabCount : setTabCount,
    tabCreated : tabCreated,
    tabUpdated : tabUpdated,
    generateScreenCap : generateScreenCap,
    screenCap : screenCap,
    tabActivated : tabActivated,
    tabRemoved : tabRemoved,
    onMessage : onMessage,
    getAllTabs : getAllTabs,
    tabReplaced : tabReplaced,
    tabReplaceSet : tabReplaceSet,
    reset : reset,
    startup : startup,
    shutdown : shutdown,
    install : install,
    getTabScreenCount : getTabScreenCount,
    actionClick : actionClick,
    openOverTab : openOverTab
  };
};

export default ggg()
