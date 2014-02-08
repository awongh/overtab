var nodeColor = function(){

  var fill = d3.scale.category20();

  setColor = function( scope, elem, attrs ){

    var borderWidth = attrs.nodeColor;

    if(typeof scope.tab.domainInt !== 'undefined'){
      var color = fill( scope.tab.domainInt );
      elem.css( 'border', borderWidth+'px solid '+color);
    }
    //console.log("here!", scope.tab, scope.tab.domain, scope.tab.domainInt, color);
  };

  return {
    restrict: 'A',
    link: setColor 
  };
};
