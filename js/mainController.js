"use strict";

var mainController = function($scope) {

    $scope.tabs = [];

    // Do stuff here
    $scope.init = function() {
      console.log( "init" );
     
    }

    chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {

      console.log( "here" );

      sendResponse({farewell: "goodbye"});



      if( request.tabs ) $scope.tabs = request.tabs;

      console.log( request );
      console.log( sender );
      console.log( sendResponse );

      console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");

    });

    $scope.$watch($scope.tabs, function() {
      //render the thing
      console.log( "babs!" );
    }); // initialize the watch
}
