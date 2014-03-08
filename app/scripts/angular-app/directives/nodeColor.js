"use strict";

var nodeColor = function(){

  var fill = d3.scale.category20();

  return {
      restrict: 'A',
      link: function( scope, elem, attrs ){

        var borderWidth = attrs.nodeColor;

        if(typeof scope.tab.domainInt !== 'undefined'){
          //call the thing
          var color = fill( scope.tab.domainInt );

          elem.css( 'border', borderWidth+'px solid '+color);
        }
      }
  };
};
