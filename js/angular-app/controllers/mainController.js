"use strict";

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Array.prototype.remove = function(from, to) {
    //console.log("Length? ", from < 0 ? this.length + from : from);
    //wtf??? lol
    window.lol = this;
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

var mainController = function($scope, $rootScope, $timeout, $filter) {
    //css margins for calculating horiz scroll:
    $scope.headerMargin = 80;
    $scope.nodeTopBottomMargin = 18;
    $scope.bodyXMargin = 16;
    $scope.nodeMargin = 38;

    //var $filter = $injector.get('$filter');
    //$scope.fill = null;

    $scope.windowHeight = 0;
    $scope.windowWidth= 0;

    $scope.tabs = [];
    $scope.tabIndex = {};

    $scope.edges = {};
    $scope.edgesList = [];
    $scope.edgesParentIndex = {};

    // Do stuff here
    $scope.init = function() {
        console.log( "init" );

        //100 is just a guess, we should fix this later with something more scientific
        $scope.windowHeight = ( window.innerHeight - $scope.headerMargin ) -100; //correct for filter heder
        $scope.windowWidth = ( window.innerWidth - $scope.bodyXMargin );

        chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {

            switch ( request.message ) {
                case "sendTabLists":
                    if (request.tabList && request.tabListIndex) {
                        $scope.tabs = request.tabList;
                        $scope.tabIndex = request.tabListIndex;

                        angular.forEach($scope.tabs, function(tab, k){
                            var domain = $filter('domainExtraction')(tab.url);
                            tab["searchDomain"] = domain;
                            tab["domainInt"] = $scope.getDomainInt( domain );
                            //console.log( "send tab lists", domain, $scope.getDomainInt( domain ) );
                            //console.log( "last tab list set" );

                            //set all the edges
                            if(typeof tab.openerTabId !== 'undefined'){
                              var sibling_count = 0;

                              $scope.edges[tab.id] = tab.openerTabId;

                              if (typeof $scope.edgesParentIndex[tab.openerTabId] === 'undefined') {

                                $scope.edgesParentIndex[tab.openerTabId] = [tab.id];
                              }else{
                                //add an offset amount
                                sibling_count = $scope.edgesParentIndex[tab.openerTabId].length++;

                                $scope.edgesParentIndex[tab.openerTabId].push( tab.id ); 
                              }

                              $scope.edgesList.push( [ tab.id, tab.openerTabId, sibling_count ] );
                            }
                        });

                        //render the edges
                        $scope.edgesRender();

                        //we have an existing set of tabs. is there a finished rendering function?
                        setTimeout(function() {
                          window.scrollTo( window.innerWidth, 0);
                        },1000)
                    }
                    break;

                case "sendSingleTab":
                    if (request.tab) {
                        var tab = request.tab,
                            domain = $filter('domainExtraction')(tab.url),
                            oldDomain;

                        if (typeof $scope.tabIndex[tab.id] === 'undefined') {
                            tab["searchDomain"] = domain;
                            tab["domainInt"] = $scope.getDomainInt( domain );
                            //console.log( "send single tab", domain, $scope.getDomainInt( domain ) );

                            //set the edge
                            //openerTabId
                            if(typeof tab.openerTabId !== 'undefined'){

                              var sibling_count = 0;
                              $scope.edges[tab.id] = tab.openerTabId;

                              if (typeof $scope.edgesParentIndex[tab.openerTabId] === 'undefined') {

                                $scope.edgesParentIndex[tab.openerTabId] = [tab.id];
                              }else{

                                sibling_count = $scope.edgesParentIndex[tab.openerTabId].length++;

                                $scope.edgesParentIndex[tab.openerTabId].push( tab.id ); 
                              }

                              $scope.edgesList.push( [ tab.id, tab.openerTabId, sibling_count ] );

                            }

                            //render the edges
                            $scope.edgesRender();

                            $scope.tabIndex[tab.id] = $scope.tabs.length;
                            $scope.tabs[$scope.tabIndex[tab.id]] = tab;

                        } else {
                            oldDomain = $filter('domainExtraction')($scope.tabs[$scope.tabIndex[tab.id]].url);

                            if ( oldDomain !== domain ) {
                                //console.log( "tab index IS defined ", domain, $scope.getDomainInt( domain ) );

                                //get rid of edge if this is a parent edge
                            }

                            //we shouldn't have to do this??
                            tab["searchDomain"] = domain;
                            tab["domainInt"] = $scope.getDomainInt( domain );
                            $scope.tabs[$scope.tabIndex[tab.id]] = tab;
                            // Fetch the non-loaded version of the tab from the 'undefined' favIconUrl pile, and remove it
                        }

                        setTimeout(function() {
                          window.scrollTo( $scope.windowWidth, 0);
                        },1000)
                    }
                    break;

                case "sendRemoveTab":
                    //console.log("BEFORE:");
                    //console.log("ID: ", request.tabId, "Length: ", $scope.tabs.length);
                    //console.log("Tab Index: ", $scope.tabIndex);
                    //console.log("Index: ",$scope.tabIndex[request.tabId]);
                    if (request.tabId) {
                        var tabId = request.tabId,
                            tabPosition = $scope.tabIndex[tabId];

                        //remove edge
                        if(typeof typeof $scope.edges[tabId] !== "undefined" ){

                          delete $scope.edges[tabId];

                        }

                        //let's look through all the edges to make sure its not a parent

                        //look in parent edges
                        if(typeof $scope.edgesParentIndex[tabId] !== 'undefined' ){
                          for( var i=0; i<$scope.edgesParentIndex[tabId].length; i++ ){
                            var id = $scope.edgesParentIndex[tabId][i];
                            delete $scope.edges[id];

                            delete $scope.edgesParentIndex[tabId][i];
                          }

                          delete $scope.edges[tabId];
                        }

                        $scope.tabs.remove(tabPosition);
                        delete $scope.tabIndex[tabId];
                        $scope.reIndex(tabPosition);

                        $scope.setWindowSize();

                    }
                    //console.log("AFTER:");
                    //console.log("ID: ", request.tabId, "Length: ", $scope.tabs.length);
                    //console.log("Tab Index: ", $scope.tabIndex);
                    //console.log("Index: ",$scope.tabIndex[request.tabId]);
                    break;
            }

            //console.log( request );
            //console.log( sender );
            //console.log( sendResponse );
            $scope.$apply();
        });

        chrome.runtime.sendMessage(null, {message: "getList"}, function() {});
    }

    $scope.emptyDomain = function(domain) {
        return Object.size(domain) <= 1 ? 'hidden' : '';
    }

    $scope.switchToTab = function(tabId) {
        chrome.tabs.update(tabId, {'active': true}, function() {} );
    }

    $scope.reIndex = function(tabPosition) {
        for (var tabIndex in $scope.tabIndex) {
            if ($scope.tabIndex.hasOwnProperty(tabIndex)) {
                if ($scope.tabIndex[tabIndex] >= tabPosition) {
                    $scope.tabIndex[tabIndex] -= 1;
                }
            }
        }
    }

    $scope.getDomainInt = function( domain ) {
      var domainInt = 0,
          scale = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          word = domain.toUpperCase();

      for( var i=0; i < word.length; i++ ){
        domainInt += scale.indexOf( word[i] );
      }

      return domainInt;
    }

    $scope.setWindowSize = function(){
      var i = document.getElementById('node-container').scrollWidth;
      var j = document.getElementById('node-container').scrollHeight;
      console.log( "width", i, "height", j );

      $scope.windowWidth = i; 
      $scope.windowHeight = j;
      //$scope.windowWidth = document.getElementById('node-container').scrollWidth;
      //$scope.windowHeight = document.getElementById('node-container').scrollHeight;
      //$scope.apply();
    }

    $scope.edgesRender = function(){

      requestAnimationFrame(function(){
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
            var node_size = Math.abs( edges.offset * .02 )

            //set a circle at the parent
            //TODO: logic to not render if its already a parent
            var cir = angular.element( '#circle-'+tabId+'-'+parentId );
            angular.element( cir ).attr( "cy", edges.y2 );
            angular.element( cir ).attr( "cx", edges.x2 );
            angular.element( cir ).attr( "r", 5 + node_size );
          }
        }
      });
    }

    $scope.edgeCalc = function( tabId, parentTabId, edgeIndex ){

      var tabPos = angular.element( '#'+tabId ).offset(),
          pTabPos = angular.element( '#'+parentTabId ).offset();

      if( tabPos && pTabPos && tabPos.left && tabPos.top && pTabPos.left && pTabPos.top ){

        //calculate the offsets of all the things

        //try to make the ends point to different locations on the child
        var side_offset = 0;
        var offset = $scope.edgesList[edgeIndex][2];
        offset = offset * 17 + 3;


        var child_side_offset = 0;
        var parent_side_offset = 0;
        var child_top_offset = 0;
        var parent_top_offset = 0;

        //determine the side offset:
        //if a higher than b, a -> no offset, b offset to bottom
        //if b higher than a, b -> no offset, a offset to bottom

        var box_width = 165;
        var box_height = 180;

        if( pTabPos.top > tabPos.top ){ //parent is higher than child

          child_top_offset = box_height;
        }else if( pTabPos.top < tabPos.top ){ //child is higher than parent

          parent_top_offset = box_height;
        }

        if( pTabPos.left > tabPos.left ){

          child_side_offset = box_width;
        }else if( pTabPos.left < tabPos.left ){

          parent_side_offset = box_width;
        }else if( pTabPos.left == tabPos.left ){

          side_offset = box_width - offset;
        }

        return {
          x1:tabPos.left + side_offset + child_side_offset,
          y1:tabPos.top + offset + child_top_offset,
          x2:pTabPos.left + parent_side_offset,
          y2:pTabPos.top + parent_top_offset,
          offset:offset
        };
      }
    }
}
