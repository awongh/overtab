"use strict";

var mainController = function($scope) {

    $scope.tabs = [];
    $scope.tabsIndex = {};

    // Do stuff here
    $scope.init = function() {
        console.log( "init" );

        chrome.runtime.sendMessage(null, {message: "getList"}, function() {});

        chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
            if( request.tabList && request.tabListIndex) {
                $scope.$apply(function() {
                    console.log("applying...!", request.tabList);
                    $scope.tabs = request.tabList;
                    $scope.tabsList = request.tabListIndex;
                });
            }

            console.log( request );
            console.log( sender );
            console.log( sendResponse );
        });
    }
}
