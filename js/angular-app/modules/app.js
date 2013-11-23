var overtabApp = angular.module('overtab', [])
    overtabApp.config(['$filterProvider',
        function ($filterProvider) {

            //lets expose the provider to the module!
            overtabApp.register = {};
            overtabApp.register.filter = $filterProvider.register;
        }])
    .filter('domainExtraction', domainExtractionFilter)
    .controller('mainController', ['$scope', '$rootScope', '$timeout', '$filter', mainController])
    .directive('nodeColor', nodeColor)

overtabApp.run( function($rootScope) { 
  $rootScope.edgeCalc = function( tabOneId, tabTwoId ){

  console.log( 'tab 1 id ',tabOneId, 'tab 2 id', tabTwoId);

  var tabOnePos = angular.element( '#'+tabOneId ).offset(),
      tabTwoPos = angular.element( '#'+tabTwoId ).offset();

  if( typeof tabOnePos == "undefined" || typeof tabTwoPos == "undefined" ){
    console.log("undef!!!", tabOnePos, tabTwoPos );
    return false;
  }

  var left, 
      top,
      bottom,
      right,
      leftOne = tabOnePos.left,
      leftTwo = tabTwoPos.left,
      topOne = tabOnePos.top,
      topTwo = tabTwoPos.top;

    //further to the left
    if( leftOne < leftTwo ){
      right = leftTwo;
      left = leftOne;
    }else if( leftOne == leftTwo ){
      left = leftOne;
      right = leftOne;

    }else if( leftOne > leftTwo ){
      right = leftOne;
      left = leftTwo;
    }

    //closest to the top
    if( topOne < topTwo ){
      bottom = topTwo; 
      top = topOne;
    }else if( topOne == topTwo ){
      top = topOne;
      bottom = topOne;
    }else if(topOne > topTwo){
      bottom = topOne; 
      top = topTwo;
    }

    //console.log( "top", top, "bottom", bottom, "left", left, "right", right );

    return { x1:left, y1:top, x2:right, y2:bottom };
  }
});
