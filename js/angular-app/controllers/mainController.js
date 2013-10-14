"use strict";

Array.prototype.remove = function(from, to) {
    console.log("Length? ", from < 0 ? this.length + from : from);
    window.lol = this;
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

var mainController = function($scope, $injector) {
    var $filter = $injector.get('$filter');

    $scope.tabs = [];
    $scope.tabIndex = {};

    $scope.tree = {};
    $scope.tree['undefined'] = {};

    // Do stuff here
    $scope.init = function() {
        console.log( "init" );

        chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {

            switch ( request.message ) {
                case "sendTabLists":
                    if (request.tabList && request.tabListIndex) {
                        $scope.tabs = request.tabList;
                        $scope.tabIndex = request.tabListIndex;

                        angular.forEach($scope.tabs, function(tab, k){
                            var domain = $filter('domainExtraction')(tab.url);
                            if (typeof $scope.tree[domain] === "undefined") {
                                $scope.tree[domain] = {};
                            }
                            $scope.tree[domain][tab.id] = tab;
                        });
                    }
                    break;

                case "sendSingleTab":
                    console.log("Single: ", request.tab);
                    if (request.tab) {
                        var tab = request.tab,
                            domain = $filter('domainExtraction')(tab.url);

                        // This is a new domain!
                        if (typeof $scope.tree[domain] === "undefined") {
                            $scope.tree[request.tab.favIconUrl] = {};
                        }

                        if (typeof $scope.tabIndex[tab.id] === 'undefined') {
                            $scope.tabIndex[tab.id] = $scope.tabs.length;
                            $scope.tabs[$scope.tabIndex[tab.id]] = tab;

                            $scope.tree[domain][tab.id] = tab;
                        } else {
                            $scope.tabs[tab.id] = tab;
                            $scope.tree[domain][tab.id] = tab;
                            // Fetch the non-loaded version of the tab from the 'undefined' favIconUrl pile, and remove it
                            if (typeof $scope.tree["undefined"][tab.id] !== "undefined") {
                                delete $scope.tree["undefined"][tab.id];
                            }
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
                            tabPosition = $scope.tabIndex[tabId],
                            domain = $filter('domainExtraction')($scope.tabs[tabPosition].url);

                        $scope.tabs.remove(tabPosition);
                        delete $scope.tabIndex[tabId];

                        delete $scope.tree[domain][tabId];

                        $scope.reIndex(tabPosition);
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

    $scope.reIndex = function(tabPosition) {
        for (var tabIndex in $scope.tabIndex) {
            if ($scope.tabIndex.hasOwnProperty(tabIndex)) {
                if ($scope.tabIndex[tabIndex] >= tabPosition) {
                    $scope.tabIndex[tabIndex] -= 1;
                }
            }
        }
    }
}
