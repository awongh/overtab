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
    window.lol = this;
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

var mainController = function($scope, $filter) {
    //var $filter = $injector.get('$filter');
    $scope.fill = null;

    $scope.windowHeight = 0;
    $scope.windowWidth= 0;

    $scope.tabs = [];
    $scope.tabIndex = {};

    // Do stuff here
    $scope.init = function() {
        console.log( "init" );
        
        $scope.windowHeight = ( window.inerHeight - 100 ); //correct for filter heder
        $scope.windowWidth = window.innerWidth;

        $scope.fill = d3.scale.category20();

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
                            $scope.setWindowWidth();
                        });
                    }
                    break;

                case "sendSingleTab":
                    if (request.tab) {
                        var tab = request.tab,
                            domain = $filter('domainExtraction')(tab.url),
                            oldDomain;

                        if (typeof $scope.tabIndex[tab.id] === 'undefined') {
                            $scope.tabIndex[tab.id] = $scope.tabs.length;
                            $scope.tabs[$scope.tabIndex[tab.id]] = tab;
                            tab["searchDomain"] = domain;
                            tab["domainInt"] = $scope.getDomainInt( domain );

                            $scope.setWindowWidth();
                        } else {
                            oldDomain = $filter('domainExtraction')($scope.tabs[$scope.tabIndex[tab.id]].url);
                            if ( oldDomain !== domain ) {
                                tab["searchDomain"] = domain;
                                tab["domainInt"] = $scope.domainInt( domain );
                            }
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
      var nodeWidth = 150 + 14;
      var nodeHeight = 180 + 12;

      var curr_per_col = Math.floor( $scope.windowHeight / nodeHeight );
      var curr_per_row = Math.floor( $scope.windowWidth / nodeWidth );

      console.log( "nodes per col:",curr_per_col, "nodes per row:" ,curr_per_row, "est size",Math.floor(curr_per_col * curr_per_row), "size",s);

      if( Math.floor(curr_per_col * curr_per_row) < s ){
        //window.innerWidth = $scope.windowWidth + nodeWidth;
        $scope.windowWidth = $scope.windowWidth + nodeWidth;
      }
    }
}
