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

  //css margins for calculating horiz scroll:
  $scope.headerMargin = 80;
  $scope.nodeTopBottomMargin = 18;
  $scope.bodyXMargin = 16;
  $scope.nodeMargin = 38;

  $scope.windowHeight = 0;
  $scope.windowWidth= 0;

  $scope.overtabId;

  $scope.tabs = [];
  $scope.tabIndex = {};

  $scope.edges = {};
  $scope.edgesList = [];
  $scope.edgesParentIndex = {};

  $scope.onMessage = function(request, sender, sendResponse) {

    if( !request.hasOwnProperty( "id" ) || typeof request.id !== "number" ){
      console.log("error", "message was lacking an id", request );
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
          console.log("warn", "unkown message");
        break;
    }

    $scope.$apply();
  };

  $scope.overtabFocus = function( id ){
    //we know the id of where we just came from, do some stuff
    angular.element('#filter-input').focus();
  };

  $scope.tabClose = function( e ){
    closeTab( this.tab.id );
  };

  //get the local storage array of tabs
  $scope.getAllTabs = function(){

    lsGet( "OVERTAB_TAB_ID", function( result ){
      $scope.overtabId = result["OVERTAB_TAB_ID"];

      var parser = new Parser();

      //query for all the tabs

      tabsQuery( {}, function( chromeTabs ){
        for( var i=0; i< chromeTabs.length; i++ ){
          //see if we are gonna allow it
          var chromeTab = chromeTabs[i];

          /* do an lsget  == make a closure cause we're in a for loop*/
          lsGet( chromeTab.id, (function(){

            var tab = chromeTab;

            return function( result ){
              if( result && result.hasOwnProperty( tab.id ) ){

                var tabProtocol = parser.href(tab.url).protocol();
                var hostName = parser.href(tab.url).hostname();

                if ( tab.hasOwnProperty("id") && ALLOWED_PROTOCOLS.indexOf( tabProtocol ) !== -1 && tab.id != $scope.overtabId && tab.status === "complete" ){

                  $scope.addTab( tab, true );
                }
              }
            };

          })(chromeTab));
          /* end do an lsget */
        }
      });
    });
  };

  $scope.getChromeTab = function( tabId, callback ){
    getTab( tabId, callback );
  };

  $scope.tabEdgeSet = function( tab, callback ){

    if(!tab.hasOwnProperty( "openerTabId" ) ){
      return false;
    }

    var sibling_count = 0;
    $scope.edges[tab.id] = tab.openerTabId;

    if (typeof $scope.edgesParentIndex[tab.openerTabId] === 'undefined') {

      $scope.edgesParentIndex[tab.openerTabId] = [tab.id];
    }else{

      sibling_count = $scope.edgesParentIndex[tab.openerTabId].length++;

      $scope.edgesParentIndex[tab.openerTabId].push( tab.id );
    }

    //objectify this eventaully, please
    $scope.edgesList.push( [ tab.id, tab.openerTabId, sibling_count ] );

    callback();

  };

  $scope.tabEdgeRemove = function( tabId, callback ){

    //remove edge
    if(typeof typeof $scope.edges[tabId] !== "undefined" ){

      delete $scope.edges[tabId];
    }

    //let's look through all the edges to make sure its not a parent

    //look in parent edges
    if(typeof $scope.edgesParentIndex[tabId] !== 'undefined' ){
      for( var i=0; i<$scope.edgesParentIndex[tabId].length; i++ ){
        var edgeIndex = $scope.edgesParentIndex[tabId][i];
        delete $scope.edges[edgeIndex];

        delete $scope.edgesParentIndex[tabId][i];
      }

      delete $scope.edges[tabId];
    }

    callback();
  };

  //this may create some race conditions..... not sure what to do about this
  $scope.tabReplaced = function( tabId, oldTabId ){
    var index = $scope.tabs.valuePropertyIndex( "id", oldTabId );
    $scope.tabs[index].id = tabId;
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
      console.log("error", "ERROR: trying to add tab for tabId "+tab.id+" that already exists in scope.tabs");
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
      $scope.tabEdgeSet( tab, $scope.edgesRender );

      //scroll to the newest tab
      setTimeout(function() {
        window.scrollTo( $scope.windowWidth, 0);
      },1000);

      $scope.$apply();
    }
  };

  $scope.removeTab = function( tabId ) {
    if (tabId) {
      var tabPosition = $scope.tabs.valuePropertyIndex("id", tabId);
      if( tabPosition !== false ){

        $scope.tabEdgeRemove( tabId, $scope.edgesRender );

        $scope.tabs.remove(tabPosition);

        $scope.setWindowSize();

        $scope.edgesRender();
      }
    }
  };

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
    $scope.tabEdgeSet( oldTab, $scope.edgesRender );

    $scope.$apply();
  };

  $scope.updateScreenCap = function( tabId ){
    lsGet("screencap-"+tabId, function( result ){
      if( result.hasOwnProperty( "screencap-"+tabId ) ){
        var screencap = result["screencap-"+tabId];
        var tab = $scope.tabs.getByValueProperty( "id", tabId );

        if( ( tab.hasOwnProperty( "screencap" ) && tab.screencap != screencap ) || !tab.hasOwnProperty( "screencap" ) || !tab.screencap ){
          var tabIndex = $scope.tabs.valuePropertyIndex( "id", tabId );

          $scope.tabs[tabIndex]['screencap'] = screencap;

          $scope.$apply( function(){});
        }else{
          console.log( "warn", "couldnt set this records screencap: "+tabId );
        }

        screencap = null;
      }else{
        console.log( "warn", "we dont have this screen cap record: "+tabId );
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

        console.log("warn", "ERROR: in update didnt find tab "+tabId );
        $scope.addTab( chromeTab );
        return;
      }

      if( !chromeTab ){
        console.log("warn", "didnt find chrome tab: "+tabId );
        return false;
      }

      $scope.updateLocalTab( chromeTab, tab );
    });
  };

  $scope.switchToTab = function(tab) {
    tabFocus( tab.id, tab.windowId );
  };

  $scope.setWindowSize = function(){
    var i = document.getElementById('node-container').scrollWidth;
    var j = document.getElementById('node-container').scrollHeight;

    $scope.windowWidth = i;
    $scope.windowHeight = j;
    //$scope.windowWidth = document.getElementById('node-container').scrollWidth;
    //$scope.windowHeight = document.getElementById('node-container').scrollHeight;
    //$scope.apply();
  };

  $scope.edgesRender = function(){

    window.requestAnimationFrame(function(){
      $scope.setWindowSize();

      for( var i =0; i< $scope.edgesList.length; i++ ){
        var tabId = $scope.edgesList[i][0];
        var parentId = $scope.edgesList[i][1];

        //get the positions
        var edges = $scope.edgeCalc( tabId, parentId, i );

        if( edges ){

          //get the edge
          var elem = angular.element( '#line-'+tabId+'-'+parentId );

          //set the edge
          //offset it the size of one node and the margin of the edge container
          angular.element( elem ).attr( "y1", edges.y1 );
          angular.element( elem ).attr( "x1", edges.x1 );
          angular.element( elem ).attr( "y2", edges.y2 );
          angular.element( elem ).attr( "x2", edges.x2 );

          //set the size of the circle depending on how many connections there are
          var node_size = Math.abs( edges.offset * 0.02 );

          //set a circle at the parent
          //TODO: logic to not render if its already a parent
          var cir = angular.element( '#circle-'+tabId+'-'+parentId );
          angular.element( cir ).attr( "cy", edges.y2 );
          angular.element( cir ).attr( "cx", edges.x2 );
          angular.element( cir ).attr( "r", 5 + node_size );
        }
      }
    });
  };

  $scope.edgeCalc = function( tabId, parentTabId, edgeIndex ){

    var tabPos = angular.element( '#'+tabId ).offset(),
        pTabPos = angular.element( '#'+parentTabId ).offset();

    if( tabPos && pTabPos && tabPos.left && tabPos.top && pTabPos.left && pTabPos.top ){

      //calculate the offsets of all the things
      var offset = $scope.edgesList[edgeIndex][2];

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
          parent_top_offset = parent_top_offset + 14;
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
        parent_top_offset = parent_top_offset + 14;
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

  $scope.borderColor = function(){
    return rangeConstrict( this.tab.domainInt );
  };

  $scope.init = function() {

    //100 is just a guess, we should fix this later with something more scientific
    $scope.windowHeight = ( window.innerHeight - $scope.headerMargin ) -100; //correct for filter heder
    $scope.windowWidth = ( window.innerWidth - $scope.bodyXMargin );

    //get all the currently open tabs

    $scope.getAllTabs();

    //listen for a message
    //chrome.runtime.onMessage.addListener( $scope.onMessage );
    setMessageListener( $scope.onMessage );

  };
};
