"use strict";

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////        CONVINIENCE CLASSES             ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)){ size++; }
  }
  return size;
};

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

  if( this.indexOf( val )  === -1 ){
    return false;
  }

  return true;

};

Array.prototype.removeValue = function( val ){

  var i = this.indexOf( val );

  if( i  === -1 ){
    return false;
  }

  return this.remove( i );
};

//WARNING, can't be looking for value of -1 in this array!!!
Array.prototype.getByValue = function( val ){
  var i = this.indexOf( val );

  if( i !== -1 ){
    return this[i];
  }

  return false;
};

Array.prototype.getByValueProperty = function( key, val ){
  for( var i=0; i < this.length; i++){
    if( this[i] && this[i].hasOwnProperty( key ) && this[i][key] == val ){
      return this[i];
    }
  }

  return false;
};

Array.prototype.hasValueProperty = function( key, val ){
  if( this.getByValueProperty( key, val ) === false ){
    return false;
  }

  return true;
};

Array.prototype.valuePropertyIndex = function( key, val ){
 for( var i=0; i < this.length; i++){
    if( this[i] && this[i].hasOwnProperty( key ) && this[i][key] === val ){
      return i;
    }
  }

  return false;
};

//calculate an integer average given an array of numbers
Array.prototype.intAverage = function(){
  var total = 0;
  var length = 0;
  for( var i=0; i<this.length; i++ ){
    if( typeof this[i] == "number" ){
      length++;
      total += this[i];
    }
  }

  return Math.round( total/length );
}

var DISALLOWED_SCREENCAP_URLS = [
  "chrome://newtab/"
];

var ALLOWED_PROTOCOLS = [
  "file:",
  "http:",
  "https:",
  "chrome:"
];

var Parser = function(){
  this.parser = document.createElement('a');
};

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
};

var stringToInt = function( str ){
  var retInt = 0,
    scale = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    word = str.toUpperCase();

  for( var i=0; i < word.length; i++ ){
    retInt += scale.indexOf( word[i] );
  }

  return retInt;
};

//make the domainInt a number in the range
//of colors we've specified
function rangeConstrict( num ){
  //max1 == number of colors
  //max2 == given spec, possible maximum of url stringtoint given <2048 chars
  //http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers

  var min1 = 1,
    max1 = 61,
    min2 = 1,
    max2 = 1638;

  var num1 = (num - min1) / (max1 - min1);
  var num2 = (num1 * (max2 - min2)) + min2;

  //golden ratio is .6...
  //this evenly distributes the numbers b/c most will not
  //be anywhere near 1638
  num2 += 0.618033988749895;
  return Math.abs( Math.round( num2 %= max1 ) );
}

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////      END CONVINIENCE CLASSES           ////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

var service, tracker;

function initAnalyticsConfig(config) {
  //do options stuff here

  lsGet( "analytics", function( result ){
    var permitted = true;

    if( result && result.hasOwnProperty( "analytics" ) && result.analytics == false ){
      permitted = false;
    }

    config.setTrackingPermitted(permitted);
  });
}

function analyticsEvent( viewName ) {
  // Initialize the Analytics service object with the name of your app.
  service = analytics.getService('overtab.com');
  service.getConfig().addCallback(initAnalyticsConfig);

  // Get a Tracker using your Google Analytics app Tracking ID.
  tracker = service.getTracker('UA-51085352-1');

  // Record an "appView" each time the user launches your app or goes to a new
  // screen within the app.
  tracker.sendAppView(viewName);
}

"use strict";

//options array
//define the possible values in the options checker, inside of background
var options = [
  //values: tab, window
  {
    name : "opener",
    type : "radio"
  },
  {
    name : "analytics",
    type : "checkbox"
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

var getTabCount = function( callback ){

  tabsQuery({}, function(result) {

    var count = 0;

    for( var i = 0; i< result.length; i++ ){
      if( isVerifiedTabUrl( result[i] ) ){
        count++;
      }
    }

    callback( count );
  });
};

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

var isExtensionUrl = function( url ){
  if( url == extensionUrl("index.html") || url == extensionUrl("options.html") ){
    return true;
  }

  return false;
};

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
    }while (i < tabs.length && !isVerifiedTabUrl( tabs[i] ) );

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
        if( oldTabId ){
          tabEvent( oldTabId, "overtab" );
        }
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

"use strict";

var setMessageListener = function( callback ){
  //chrome.runtime.onMessage.addListener( $scope.onMessage );
  chrome.runtime.onMessage.addListener( callback );
};

"use strict";

var mainController = function($scope, $rootScope, $timeout, $filter) {

  //what properties should tab update look for???
  $scope.tabUpdateProperties = [
    "index",
    "windowId",
    "openerTabId",
    "active",
    "url",
    "title",
    "favIconUrl",
    "status"
  ];

  $scope.overtabId;

  $scope.tabs = [];
  //$scope.tabIndex = {};

  $scope.edges = [];
  $scope.edgesChildIndex = {};
  $scope.edgesParentIndex = {};
  $scope.currentEdgeFilter = "";

  $scope.edgesToRender = [];

  $scope.showEdges = true;

  /**************************************************/
  /**********      typeahead stuff       ************/
  /**************************************************/

  $scope.typeaheadOptions = {
    hint: true,
    highlight: true,
    minLength: 1
  };

  $scope.bloodhoundData = null;

  $scope.typeaheadData = [];

  $scope.dataTokenizer = function( d ){

    var tokenize = "";

    if( d.hasOwnProperty( "url" ) ){

      //concatenate all the fileds
      var url = d.url;
      var parser = new Parser().href( url );

      //include the whole url
      tokenize = parser.href( url ).hostname();

      //this hostname doesn't do exactly what it
      //looks like, but it works ok
      //news.ycombinator.com -> news ycombinator.com
      //makes sure ycomb[...] is found
      var hostname = parser.host().replace("."," ");
      var path = parser.pathname().replace("/"," ");
      var search = parser.search().replace("&"," ");

      //include the parsed one
      tokenize += " "+ hostname + " " + path + " " + search;
    }

    if( d.hasOwnProperty( "title" ) ){
      tokenize += " "+d.title;
    }

    //console.log( "yes toknizin this: "+tokenize);

    return Bloodhound.tokenizers.whitespace(tokenize);
  };

  $scope.initTypeahead = function(){

    // Instantiate the bloodhound suggestion engine
    $scope.bloodhoundData = new Bloodhound({
      //init both the tokenizers
      datumTokenizer: $scope.dataTokenizer,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      //the max number of suggestions in the dropdown:
      limit:10,
      local: $scope.tabs
    });

    // initialize the bloodhound suggestion engine
    $scope.bloodhoundData.initialize();

    $scope.typeaheadData = [
      {
        displayKey: 'title',
        source: $scope.bloodhoundData.ttAdapter()
      }
    ];

  };

  $scope.indexAllTabs = function(){
    angular.forEach( $scope.tabs, function( tab, key ){
      $scope.addSearchValue( tab );
    });
  };

  $scope.addSearchValue = function ( tab ) {
    $scope.bloodhoundData.add({
      title: tab.title,
      url: tab.url,
      id: tab.id
    });
  };

  //that's right, anytime a tab is removed, reindex the entire thing
  $scope.resetSearch = function(){
    //var d = new Date();
    $scope.bloodhoundData.clear();
    $scope.indexAllTabs();
    //console.log( "**end:", d.getTime() );
  };

  //this sest the behaviour that the input resets when electing something
  //from the input dropdown menu
  //we are also dealing with this in the tab filter
  $scope.$on('typeahead:selected', function(scope, element, attrs){
    $scope.tabFilterInput = angular.element('#filter-input').val();
    angular.element('#filter-input').typeahead("close");
  });


  $scope.$on('typeahead:cursorchanged', function(scope, element, attrs){
    $scope.tabHighlight( attrs.id );
  });


  /**************************************************/
  /**********   end typeahead stuff      ************/
  /**************************************************/

  $scope.onMessage = function(request, sender, sendResponse) {

    if( !request.hasOwnProperty( "id" ) || typeof request.id !== "number" ){
      console.log("this message is misformed.", request);
      return;
    }

    switch ( request.message ) {
      case "overtab":
        //we just focused on this thingy
        if( request.id ){
          $scope.overtabFocus( request.id );
        }
        break;

      case "created":

        $scope.createTab( request.id );
        break;

      case "replaced":
        //replace a tab
        $scope.tabReplaced( request.id, request.oldId );
        break;

      case "pre-update":
      case "updated":
      case "favicon":
      case "activated":

        $scope.updateTab( request.id );
        break;

      case "screencap":
        $scope.updateScreenCap( request.id );

        break;

      case "removed":
        $scope.removeTab( request.id );
        break;

      default:
          console.log("we aren't doing anything for this message: "+request.message, request);
        break;
    }

    $scope.$apply();
  };

  $scope.overtabFocus = function( id ){

    //we know the id of where we just came from, do some stuff
    angular.element('#filter-input').focus().select();

    $scope.tabHighlight( id );
  };

  $scope.tabHighlight = function( id ){

    var tabIndex = $scope.tabs.valuePropertyIndex( "id", id );
    if( id && typeof tabIndex == "number" && tabIndex != -1 ){

      $scope.tabs[tabIndex].fromtab = true;

      $scope.scrollToNode( id );

      $timeout(function(){
        if( $scope.tabs.hasOwnProperty( tabIndex ) ){
          $scope.tabs[tabIndex].fromtab = false;
        }
      },2000);
    }else{
      console.log("WKUHIURIUEYIUIEW: "+id+" "+tabIndex);
    }
  };

  $scope.scrollToNode = function( id, callback ){
    var duration = 500;
    var easing = 'swing';

    var scrollPane = angular.element('html, body');
    var scrollTo = angular.element('#'+id);

    var offset = ( angular.element(window).height() ) / 2;

    var scrollOffset = scrollTo.offset();

    if( scrollOffset && scrollOffset.hasOwnProperty( top ) && scrollOffset.top ){
      var scrollY = scrollTo.offset().top - offset;

      scrollPane.animate({scrollTop : scrollY }, duration, easing, function(){
        if (typeof callback == 'function') { callback.call(this); }
      });
    }
  };

  $scope.tabClose = function( ){
    closeTab( this.tab.id );
  };

  //get the local storage array of tabs
  $scope.getAllTabs = function(){

    getOvertabId( function( overtabTab ){

      if( overtabTab ){
        $scope.overtabId = overtabTab.id;
      }

      var parser = new Parser();

      //query for all the tabs
      tabsQuery( {}, function( chromeTabs ){

        angular.forEach( chromeTabs, function( tab, key ){
          lsGet( tab.id, function( result ){

            if( result && result.hasOwnProperty( tab.id ) ){

              var tabProtocol = parser.href(tab.url).protocol();
              var hostName = parser.href(tab.url).hostname();

              if ( tab.hasOwnProperty("id") && ALLOWED_PROTOCOLS.indexOf( tabProtocol ) !== -1 && tab.id != $scope.overtabId && tab.status === "complete" ){

                //tell add tab we might have a screenshot or something
                $scope.addTab( tab, true );
              }
            }

          });
        });
        /* end lsget */

        //cheat and use a timeout to start the search indexing of the tabs we just got
        //also make sure the edges will render
        $timeout( function(){
          $scope.indexAllTabs();
          $scope.currentEdgesRender();
          angular.element('#filter-input').focus().select();
        },1);
      });
    });
  };

  $scope.getChromeTab = function( tabId, callback ){
    getTab( tabId, callback );
  };

  //TODO: deal with edges??
  //this may create some race conditions..... not sure what to do about this
  $scope.tabReplaced = function( tabId, oldTabId ){
    //var index = $scope.tabs.valuePropertyIndex( "id", oldTabId );
    //$scope.tabs[index].id = tabId;
    //console.log($scope.tabs[index], tabId, oldTabId);
    $scope.removeTab( oldTabId );
    $scope.createTab( tabId );
  };

  $scope.createTab = function( tabId ){

    //get a tab object from local storage, etc
    $scope.getChromeTab( tabId, $scope.addTab );
  };

  $scope.addTab = function( tab, doUpdate ){

    if (!tab) {
      return false;
    }

    //make sure it doesnt already exist for some reason??
    if( $scope.tabs.hasValueProperty("id", tab.id ) ){
      //console.log("error", "ERROR: trying to add tab for tabId "+tab.id+" that already exists in scope.tabs");
      return false;
    }

    var parser = new Parser();

    var domain = parser.href( tab.url ).hostname();

    tab.searchDomain = domain;

    tab.domainInt = 0;

    if( tab.hasOwnProperty( "url" ) && parser.href(tab.url).protocol() !== "chrome:" ){
      tab.domainInt = stringToInt( domain );
    }

    if( tab.hasOwnProperty( "favIconUrl" ) && parser.href(tab.favIconUrl).protocol() === "chrome:" ){
      delete tab.favIconUrl;
    }

    //try to add it in depending on parent
    if( tab.hasOwnProperty( "openerTabId" ) && tab.openerTabId ){
      var index = $scope.tabs.valuePropertyIndex( "id", tab.openerTabId );

      //no index, just add to end
      if( index === false ){
        index = -1;
      }else{
        index++;
      }

      $scope.tabs.add( index, tab );
    }else{
      $scope.tabs.push(tab);
    }

    //if we are calling this from add all tabs.....
    if( doUpdate === true ){
      $scope.updateTab( tab.id );
    }else{

      //set the edge
      //afterwards render all the edges
      $scope.tabEdgeSet( tab, $scope.currentEdgesRender );

      //scroll to the newest tab
      setTimeout(function() {
        window.scrollTo( $scope.windowWidth, 0);
      },1000);

      $scope.$apply();
    }

    $scope.resetSearch();
  };

  $scope.removeTab = function( tabId ) {
    if (tabId) {
      var tabPosition = $scope.tabs.valuePropertyIndex("id", tabId);
      if( tabPosition !== false ){

        $scope.tabEdgeRemove( tabId, $scope.currentEdgesRender );

        $scope.tabs.remove(tabPosition);

        $scope.resetSearch();
      }
    }
  };

  //TODO: change the name of oldtab and newtab - confusing
  $scope.updateLocalTab = function( newTab, oldTab ){
    var parser = new Parser();

    //run through each property of the tab and update it in the list of objects
    for( var i=0; i<$scope.tabUpdateProperties.length; i++ ){
      var property = $scope.tabUpdateProperties[i];

      if( property == "favIconUrl"
        && newTab.hasOwnProperty( "favIconUrl" )
        && parser.href(newTab.favIconUrl).protocol() === "chrome:"
      ){
        continue;
      }

      //update the domain int
      if( property == "url" ){

        var parser = new Parser();

        if( newTab.hasOwnProperty( "url" )
          && oldTab.url !== newTab.url
          && parser.href(newTab.url).protocol() !== "chrome:" )
        {

          var domain = parser.href( newTab.url ).hostname();
          oldTab.searchDomain = domain;

          //recalculate the domain int if its different
          oldTab.domainInt = stringToInt( domain );
        }
      }

      if( typeof newTab[property] !== "undefined"
        && newTab[property]
        && newTab[property] !== oldTab[property]
      ){
        oldTab[property] = newTab[property];
      }

    }

    //go and passively try to update the screenshot
    $scope.updateScreenCap( newTab.id );

    //we can see if we need to update the edges here.
    //has the domain changed?
    //or something else?
    $scope.tabEdgeSet( oldTab, $scope.currentEdgesRender );

    //$scope.addSearchValue( oldTab );
    $scope.resetSearch();

    $scope.$apply();
  };

  $scope.updateScreenCap = function( tabId ){
    lsGet("screencap-"+tabId, function( result ){
      if( result.hasOwnProperty( "screencap-"+tabId ) ){
        var screencap = result["screencap-"+tabId];
        var tab = $scope.tabs.getByValueProperty( "id", tabId );

        if( ( tab.hasOwnProperty( "screencap" ) && tab.screencap != screencap ) || !tab.hasOwnProperty( "screencap" ) || !tab.screencap ){
          var tabIndex = $scope.tabs.valuePropertyIndex( "id", tabId );

          if( typeof tabIndex == "number" && tabIndex != -1 ){

            $scope.tabs[tabIndex]['screencap'] = screencap;

            $scope.$apply( function(){});

          }
        }else{
          //console.log( "warn", "couldnt set this records screencap: "+tabId );
        }

        screencap = null;
      }else{
        //console.log( "warn", "we dont have this screen cap record: "+tabId );
      }

      result = null;
    });
  };

  $scope.updateTab = function( tabId ){

    //get the tab from chrome
    $scope.getChromeTab( tabId, function( chromeTab ){

      var tab = $scope.tabs.getByValueProperty("id", tabId );

      var parser = new Parser();

      if( !tab ){

        //could it be that this is not an accurate tab we are adding here????
        //what kind of race condition cpould exist here that:
        //we are adding a tab only on update, we got it from a query, then what???

        //console.log("warn", "ERROR: in update didnt find tab "+tabId );
        $scope.addTab( chromeTab );
        return;
      }

      if( !chromeTab ){
        //console.log("warn", "didnt find chrome tab: "+tabId );
        return false;
      }

      $scope.updateLocalTab( chromeTab, tab );
    });
  };

  $scope.switchToTab = function(tab) {
    tabFocus( tab.id, tab.windowId );
  };

  $scope.catchTabFilter = function( tabs ){

    //try to see if there are any edges in this and then set them

    var output = [];
    angular.forEach( tabs, function( tab, key ){
      if( $scope.edgesChildIndex[tab.id] != "undefined" ){

        if( tab.hasOwnProperty("openerTabId") && $scope.edgesParentIndex[tab.openerTabId] != "undefined" ){
          output.push( {tabId:tab.id,parentId:tab.openerTabId} );
        }
      }
    });

    $scope.edgesToRender = output;

    return tabs;
  };

  /**************************************************/
  /**********         edge stuff         ************/
  /**************************************************/

  $scope.edgeShow = function(){
    if( $scope.showEdges == true ){
      $scope.showEdges = false;
    }else{
      //render the edges in case something has changed since we hid them
      $scope.currentEdgesRender();
      $scope.showEdges = true;
    }
  };

  $scope.$on('onLastRepeatEvent', function(scope, element, attrs){

    $timeout( function(){
      $scope.edgesRender( $scope.edgesToRender );
    },200);
  });

  $scope.tabEdgeSet = function( tab, callback ){

    if( !tab.hasOwnProperty( "id" ) || !tab.hasOwnProperty( "openerTabId" ) ){
      return false;
    }

    //see if it already exists
    if( $scope.edgesChildIndex.hasOwnProperty( tab.id ) ){
      //do the callback anyways (probably edge rendering)
      callback();
      return false;
    }

    $scope.edgesChildIndex[tab.id] = tab.openerTabId;

    if (typeof $scope.edgesParentIndex[tab.openerTabId] === 'undefined') {

      $scope.edgesParentIndex[tab.openerTabId] = [];
      $scope.edgesParentIndex[tab.openerTabId].push( tab.id );
    }else{

      $scope.edgesParentIndex[tab.openerTabId].push( tab.id );
    }

    $scope.edges.push( { tabId: tab.id, parentId: tab.openerTabId } );

    callback();

  };

  $scope.tabEdgeRemove = function( tabId, callback ){

    var k = $scope.edges.valuePropertyIndex("tabId", tabId);

    if( k ){
      $scope.edges.remove(k);

      //look in parent edges
      if(typeof $scope.edgesParentIndex[tabId] !== 'undefined' ){
        for( var i=0; i<$scope.edgesParentIndex[tabId].length; i++ ){

          var edgeIndex = $scope.edgesParentIndex[tabId][i];

          delete $scope.edgesChildIndex[edgeIndex];
        }

        delete $scope.edgesParentIndex[tabId];
      }
    }

    //make sure it renders, put it in a timeout
    $timeout( function(){
      callback();
    },300);
  };

  $scope.currentEdgesRender = function( ){
    $scope.edgesRender( $scope.edges );
  };

  $scope.edgesRender = function( edgesList ){

    for( var i =0; i< $scope.edges.length; i++ ){

      var found = false;

      if( !$scope.edges[i] ){
        continue;
      }

      var tabId = $scope.edges[i].tabId,
        parentId = $scope.edges[i].parentId;

      //get the edge
      var elem = angular.element( '#line-'+tabId+'-'+parentId ),
        cir = angular.element( '#circle-'+tabId+'-'+parentId );

      //determine if its in the edge list
      for( var j=0; j < edgesList.length; j++ ){
        if( edgesList[j].tabId == tabId && edgesList[j].parentId == parentId ){
          found = true;
          break;
        }
      }

      if( found ){

        //get the positions
        var edges = $scope.edgeCalc( tabId, parentId, i );

        //if we didnt find any tabs this will return false
        if( edges ){

          //set the edge
          //offset it the size of one node and the margin of the edge container
          angular.element( elem ).attr( "y1", edges.y1 );
          angular.element( elem ).attr( "x1", edges.x1 );
          angular.element( elem ).attr( "y2", edges.y2 );
          angular.element( elem ).attr( "x2", edges.x2 );

          //set the size of the circle depending on how many connections there are
          //var node_size = Math.abs( edges.offset * 0.02 );
          var node_size = 0;

          //set a circle at the parent
          angular.element( cir ).attr( "cy", edges.y2 );
          angular.element( cir ).attr( "cx", edges.x2 );
          angular.element( cir ).attr( "r", 5 + node_size );


          angular.element( elem ).fadeIn(150);
          angular.element( cir ).fadeIn(150);

          continue;
        }
      }

      //this is what we do anywyas
      angular.element( elem ).fadeOut(150);
      angular.element( cir ).fadeOut(150);
    }
  };

  $scope.edgeCalc = function( tabId, parentTabId, edgeIndex ){

    var tabPos = angular.element( '#'+tabId ).offset(),
        pTabPos = angular.element( '#'+parentTabId ).offset();

    if( tabPos && pTabPos && tabPos.left && tabPos.top && pTabPos.left && pTabPos.top ){

      //calculate the offsets of all the things
      //var offset = $scope.edgesList[edgeIndex][2];
      var offset = 0;

      var child_side_offset = -4;
      var parent_side_offset = 0;
      var child_top_offset = -6;
      var parent_top_offset = -2;

      //determine the side offset:
      //if a higher than b, a -> no offset, b offset to bottom
      //if b higher than a, b -> no offset, a offset to bottom

      var box_width = 165;
      var box_height = 185;

      if( pTabPos.top > tabPos.top ){ //parent is lower than child

        child_top_offset = child_top_offset + box_height;

        if( pTabPos.left != tabPos.left ){

          child_top_offset = child_top_offset - 12
        }else if( ptabPos.left == pTabPos.left ){
          child_side_offset = child_side_offset + 12;
        }

        if( pTabPos.left < tabPos.left ){

          //move the parent edge down
          //is the child above the parent
          parent_top_offset = parent_top_offset + 22;
        }

      }else if( pTabPos.top < tabPos.top ){ //child is lower than parent

        parent_top_offset = parent_top_offset + box_height;

        if( pTabPos.left < tabPos.left ){
          child_side_offset = child_side_offset + 12;
        }else if( pTabPos.left > tabPos.left || pTabPos.left == tabPos.left ){
          parent_side_offset = parent_side_offset + 14;
        }

      }else if( pTabPos.top == tabPos.top ){
        child_top_offset = child_top_offset + 12;
        parent_top_offset = parent_top_offset + 22;
      }

      //parent to right of child
      if( pTabPos.left > tabPos.left ){

        child_side_offset = child_side_offset + box_width;

        //move child to the left
        child_side_offset = child_side_offset - 11;

      //child to right of parent
      }else if( pTabPos.left < tabPos.left ){

        parent_side_offset = parent_side_offset + box_width;

        parent_side_offset = parent_side_offset + 4;

      //on top of eachother
      }else if( pTabPos.left == tabPos.left ){

        child_side_offset = child_side_offset + box_width;

        //offset it to the left subtract more than above
        //closebox offset
        child_side_offset = child_side_offset - 19;
      }

      return {
        x1:tabPos.left + child_side_offset,
        y1:tabPos.top + child_top_offset,
        x2:pTabPos.left + parent_side_offset,
        y2:pTabPos.top + parent_top_offset,
        offset:offset
      };
    }
  };

  /**************************************************/
  /**********      end edge stuff        ************/
  /**************************************************/

  $scope.domainFilter = function(tab){

    if( tab.hasOwnProperty( "searchDomain" ) && tab.searchDomain ){
      $timeout( function(){

        var input = angular.element('#filter-input');
        input.typeahead('val', tab.searchDomain).trigger('input').select();
      });
    }
  };

  $scope.borderColor = function(){
    return rangeConstrict( this.tab.domainInt );
  };

  $scope.init = function() {

    analyticsEvent( "overtabApp" );

    $scope.initTypeahead();

    //get all the currently open tabs
    $scope.getAllTabs();

    //listen for a message
    setMessageListener( $scope.onMessage );
  };
};

"use strict";

var tabFilter = function( ) {

    return function(tabs, input) {

      if( typeof input == "object" ){
        for( var i=0; i< tabs.length; i++ ){
          if( tabs[i].url == input.url ){

            //this will only ever have one thing
            this.switchToTab( tabs[i] );

            //we can do this if we want to display this one tab
            //return [ tabs[i] ];
          }
        }
      }

      if( input && typeof input != "object" ){

        var results = this.bloodhoundData.index.get( input );

        var output = tabs.filter(function(tab) {

          var t = results.getByValueProperty("id", tab.id );

          if (t) {
            return t;
          }

        });

        //let it know we need to render edges
        //when this event is recieved it will fire the
        //edge render function.
        //*hopefully* this will be after the output is returned
        //processed by catchtabfilter
        //and assigned to the scope variable!!
        this.$emit('onLastRepeatEvent');

        return output;

      }else{
        return tabs;
      }

    };
}

var onLastRepeat = function(){

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
        if (scope.$last) setTimeout(function(){
            scope.$emit('onLastRepeatEvent', element, attrs);
        }, 1);
    }
  };
};

"use strict";

var overtabApp = angular.module('overtab', ['siyfion.sfTypeahead','ngAnimate']);

overtabApp.config(function($filterProvider, $compileProvider){

    //lets expose the provider to the module!
    overtabApp.register = {};
    overtabApp.register.filter = $filterProvider.register;

    //make sure angular can get chrome stuff
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|data|mailto|chrome-extension):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|data|mailto|chrome-extension):/);
    // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
})
.filter('tabFilter', tabFilter)
.controller('mainController', ['$scope', '$rootScope', '$timeout', '$filter', mainController])
.directive('onLastRepeat', onLastRepeat);
