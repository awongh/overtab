"use strict";

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Array.prototype.remove = function(from, to) {
    console.log("Length? ", from < 0 ? this.length + from : from);
    //wtf??? lol
    window.lol = this;
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

var mainController = function($scope, $filter) {
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

    $scope.edges = [];
    $scope.edgesIndex = {};
    $scope.edgesParentIndex = {};

    // Do stuff here
    $scope.init = function() {
        console.log( "init" );

        $scope.windowHeight = ( window.innerHeight - $scope.headerMargin ); //correct for filter heder
        $scope.windowWidth = ( window.innerWidth - $scope.bodyXMargin );

        //$scope.fill = d3.scale.category20();

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
                            console.log( "send tab lists", domain, $scope.getDomainInt( domain ) );
                            $scope.setWindowWidth();
                            console.log( "last tab list set" );
                        });

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

                        console.log( tab );
                        console.log( $scope.edges );

                        if (typeof $scope.tabIndex[tab.id] === 'undefined') {
                            tab["searchDomain"] = domain;
                            tab["domainInt"] = $scope.getDomainInt( domain );
                            console.log( "send single tab", domain, $scope.getDomainInt( domain ) );

                            //set the edge
                            //openerTabId
                            if(typeof tab.openerTabId !== "undefined"){
                              $scope.edgesIndex[tab.id] = $scope.edges.length;
                              $scope.edges[$scope.edgesIndex[tab.id]] = tab.openerTabId;

                              if (typeof $scope.edgesParentIndex[tab.openerTabId] === 'undefined') {

                                $scope.edgesParentIndex[tab.openerTabId] = [tab.id];
                              }else{
                                $scope.edgesParentIndex[tab.openerTabId].push( tab.id ); 
                              }

                            }

                            $scope.tabIndex[tab.id] = $scope.tabs.length;
                            $scope.tabs[$scope.tabIndex[tab.id]] = tab;

                            $scope.setWindowWidth();
                        } else {
                            oldDomain = $filter('domainExtraction')($scope.tabs[$scope.tabIndex[tab.id]].url);

                            if ( oldDomain !== domain ) {
                                console.log( "tab index IS defined ", domain, $scope.getDomainInt( domain ) );

                                //get rid of edge if this is a parent edge
                            }

                            //we shouldn't have to do this??
                            tab["searchDomain"] = domain;
                            tab["domainInt"] = $scope.getDomainInt( domain );
                            $scope.tabs[$scope.tabIndex[tab.id]] = tab;
                            // Fetch the non-loaded version of the tab from the 'undefined' favIconUrl pile, and remove it
                        }
                    }
                    break;

                case "sendRemoveTab":
                    console.log("BEFORE:");
                    console.log("ID: ", request.tabId, "Length: ", $scope.tabs.length);
                    console.log("Tab Index: ", $scope.tabIndex);
                    console.log("Index: ",$scope.tabIndex[request.tabId]);
                    if (request.tabId) {
                        var tabId = request.tabId,
                            tabPosition = $scope.tabIndex[tabId];

                        $scope.tabs.remove(tabPosition);

                        delete $scope.tabIndex[tabId];

                        $scope.reIndex(tabPosition);

                        //remove edge


                        if(typeof tab.openerTabId !== "undefined"){
                          var edgePosition = $scope.edgesIndex[tabId];

                          $scope.edges.remove( edgePosition );
                          delete $scope.edgesIndex[tabId];

                          //look in parent edges
                          for( var i=0; i<$scope.edgesParentIndex[tabId].length; i++ ){
                            if( $scope.edgesParentIndex[tabId][i] === tabId ){
                              delete $scope.edgesParentIndex[tabId][i];
                            }
                          }
                        }

                        $scope.setWindowWidth();
                    }
                    console.log("AFTER:");
                    console.log("ID: ", request.tabId, "Length: ", $scope.tabs.length);
                    console.log("Tab Index: ", $scope.tabIndex);
                    console.log("Index: ",$scope.tabIndex[request.tabId]);
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

    $scope.setWindowWidth = function() {
      var s = $scope.tabs.length;

      //calculate an imaginary grid 
      //make sure to keep this up to date w/ css
      var nodeWidth = 150 + $scope.nodeMargin;
      var nodeHeight = 180 + $scope.nodeTopBottomMargin;

      var curr_per_col = Math.floor( $scope.windowHeight / nodeHeight );

      var curr_per_row = Math.floor( $scope.windowWidth / nodeWidth );

      if( Math.floor(curr_per_col * curr_per_row) < s ){
        window.innerWidth = $scope.windowWidth + nodeWidth;
        $scope.windowWidth = $scope.windowWidth + nodeWidth;

        setTimeout(function() {
          window.scrollTo( ( window.innerWidth ), 0);
        },1)
      }
    }

    $scope.edgePosition = function( edge ){
      debugger;
    }

    //we need to think about this as the function that operates on 
    //nodes: b/c it keeps their position
    /*
      dirModule.directive('nodePosition', function() {
        return {
            scope: true,
            link: function (scope, $element, attrs) {
              //get the things about the thing
              //set something like $scope.tabs[tabid].xPosition = $element.x;
              //$element.css("left", $scope.lastX + 'px');
            }
        }
      }); 
    */
}
