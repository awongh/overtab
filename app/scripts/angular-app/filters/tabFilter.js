"use strict";

var tabFilter = function( ) {

    return function(tabs, input) {

      if( typeof input == "object" ){
        for( var i=0; i< tabs.length; i++ ){
          if( tabs[i].url == input.url ){

            //this will only ever have one thing
            this.switchToTab( tabs[i] );

            //we can do this if we want to display this one tab
            //return [ tabs[i] ];
          }
        }
      }

      if( input && typeof input != "object" ){

        var results = this.bloodhoundData.index.get( input );

        var output = tabs.filter(function(tab) {

          var t = results.getByValueProperty("id", tab.id );

          if (t) {
            return t;
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
