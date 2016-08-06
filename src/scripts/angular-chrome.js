"use strict";

var setMessageListener = function( callback ){
  //chrome.runtime.onMessage.addListener( $scope.onMessage );
  chrome.runtime.onMessage.addListener( callback );
};
