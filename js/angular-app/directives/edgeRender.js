var edgeRender = function( timer ){

  setPosition = function( scope, elem, attrs, ctrl ){

    //call some timeout madness here

    var hello = function () {
      var tabOnePos = angular.element( '#'+scope.tabId ).offset();
      var tabTwoPos = angular.element( '#'+scope.parentId ).offset();

      console.log( "pos", tabOnePos, tabTwoPos );

      //calculate the thing

      //which is higher?

      var width = 178;
      var height = 199;

      var left, top,
        bottom = 0,
        right = 0;

      //further to the left
      if( tabOnePos.left < tabTwoPos.left ){
        right = tabTwoPos.left - tabOnePos.left;
        left = tabOnePos.left;
      }else if( tabOnePos.left == tabTwoPos.left ){
        left = tabOnePos.left;

      }else if( tabOnePos.left > tabTwoPos.left ){
        right = tabOnePos.left - tabTwoPos.left;
        left = tabTwoPos.left;
      }

      //closest to the top
      if( tabOnePos.top < tabTwoPos.top ){
        bottom = tabTwoPos.top - tabOnePos.top;
        top = tabOnePos.top;
      }else if( tabOnePos.top == tabTwoPos.top ){
        top = tabOnePos.top;
      }else if(tabOnePos.top > tabTwoPos.top){
        bottom = tabOnePos.top - tabTwoPos.top;
        top = tabTwoPos.top;
      }

      elem.css("top", top);
      elem.css("left", left);
      elem.css("height", bottom);
      elem.css("width", right);

      console.log( "top", top, "bottom", bottom, "left", left, "right", right );

    }

    timer(hello, 2000);

  };

  return {
    link: setPosition 
  };
};


            
