var onLastRepeat = function(){

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
        if (scope.$last) setTimeout(function(){
            scope.$emit('onLastRepeatEvent', element, attrs);
        }, 1);
    }
  };
};
