"use strict";

var edgeFilter = function( ) {
    return function(edges, input) {

      if( input ){


        //get all the tabs


        //filter all the tabs


        //filter the edges against the tabs

        /*
        var t=inpu.split('');
        var h = t.join('\\w*.*');  //replace(/\W/, ""), 'i');
        var e = h.replace(/\W/, "");
        var reg = new RegExp(e, 'i');

        console.log( "error", reg );
        */

        var reg = new RegExp(input.split('').join('\\w*.*').replace(/\W/, ""), 'i');

        var that = this;

        //array of values
        var output = edges.filter(function(edge) {

          var tab1 = that.tabs.getByValueProperty( "id", edge.tabId );
          var tab2 = that.tabs.getByValueProperty( "id", edge.parentId );

          if ( tab1 && tab2 && ( tab1.url.match(reg) || tab1.title.match(reg)) && ( tab2.url.match(reg) || tab2.title.match(reg)) ){

            return edge
          }

        });

        this.edgesRender( output );

        return output;

      }else{
        this.edgesRender( edges );
        return edges;
      }

    };
}
