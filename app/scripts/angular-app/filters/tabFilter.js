"use strict";

var tabFilter = function( ) {
    return function(tabs, input) {

      if( input ){

        //setup the regex
        /*
        var t=inpu.split('');
        var h = t.join('\\w*.*');  //replace(/\W/, ""), 'i');
        var e = h.replace(/\W/, "");
        var reg = new RegExp(e, 'i');

        console.log( "error", reg );
        */

        var reg = new RegExp(input.split('').join('\\w*.*').replace(/\W/, ""), 'i');

        //array of values
        var output = tabs.filter(function(tab) {

          if (tab.url.match(reg) || tab.title.match(reg)) {
            return tab;
          }

        });

        //let it know we need to render edges
        //when this event is recieved it will fire the
        //edge render function.
        //*hopefully* this will be after the output is returned
        //processed by catchtabfilter
        //and assigned to the scope variable!!
        this.$emit('onLastRepeatEvent');

        return output;

      }else{
        return tabs;
      }

    };
}
