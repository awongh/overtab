var edgeRender = function(){

  setPosition = function( scope, elem, attrs ){
    console.log( "edge render", elem );
  };

  return {
    restrict: 'A',
    link: setPosition 
  };
};
