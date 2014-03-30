"use strict";

var tabFilter = function( ) {
    return function(input) {

      var inpu = this.tabFilter;

      if( inpu ){

        /*
        var t=inpu.split('');
        var h = t.join('\\w*.*');  //replace(/\W/, ""), 'i');
        var e = h.replace(/\W/, "");
        var reg = new RegExp(e, 'i');

        console.log( "error", reg );
        */

        var reg = new RegExp(inpu.split('').join('\\w*.*').replace(/\W/, ""), 'i');

        //array of values
        var output = input.filter(function(tab) {

          if (tab.url.match(reg) || tab.title.match(reg)) {
            return tab;
          }

        });

        return output;

      }else{
        return input;
      }

    };
}
