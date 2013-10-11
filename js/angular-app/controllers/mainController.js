"use strict";

var mainController = function($scope) {

    $scope.tabs = [];
    $scope.tabsIndex = {};

    $scope.tree = {};

    // Do stuff here
    $scope.init = function() {
        console.log( "init" );

        chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {

            switch ( request.message ) {
                case "sendTabLists":
                    if (request.tabList && request.tabListIndex) {
                        $scope.$apply(function() {
                            $scope.tabs = request.tabList;
                            $scope.tabIndex = request.tabListIndex;

                            angular.forEach($scope.tabs, function(tab, k){
                                if (typeof $scope.tree[tab.favIconUrl] === "undefined") {
                                    $scope.tree[tab.favIconUrl] = {};
                                }
                                $scope.tree[tab.favIconUrl][$scope.tabIndex[tab.id]] = tab;
                            });

                        });
                    }
                    break;

                case "sendSingleTab":
                    if (request.tab) {
                        $scope.$apply(function() {
                            if (typeof $scope.tabIndex[request.tab.id] === 'undefined') {
                                $scope.tabIndex[request.tab.id] = $scope.tabs.length;
                                $scope.tabs[$scope.tabIndex[request.tab.id]] = request.tab;

                                if (typeof $scope.tree[request.tab.favIconUrl] === "undefined") {
                                    $scope.tree[request.tab.favIconUrl] = {};
                                }
                                $scope.tree[request.tab.favIconUrl][$scope.tabIndex[request.tab.id]] = request.tab;
                            } else {
                                if (typeof $scope.tree[request.tab.favIconUrl] === "undefined") {
                                    $scope.tree[request.tab.favIconUrl] = {};
                                }
                                $scope.tabs[$scope.tabIndex[request.tab.id]] = request.tab;
                                $scope.tree[request.tab.favIconUrl][$scope.tabIndex[request.tab.id]] = request.tab;
                            }
                        });
                    }
                    break;

                case "sendRemoveTab":
                    if (request.tabId) {
                        $scope.$apply(function() {
                            // Removal shizz
                        });
                    }
                    break;
            }
            console.log($scope.tree);

            //console.log( request );
            //console.log( sender );
            //console.log( sendResponse );
        });

        chrome.runtime.sendMessage(null, {message: "getList"}, function() {});
    }
}
