let ggg = function(){

  var calcDimensions = function( w, h ){
     var cropLength = THUMBSIZE / SCREEN_CROP_RATIO,
        height, width;

      //figure out the size to draw the image.

      //height is ratio corrected, so that we are fitting the
      //screencrop's amount into the thumb height.
      //the viewport of thumbsize is the visible portion of the screen_crop ratio's

      if( h < w ){ //landscape

        height = cropLength;

        //figure out the ratio-calculated length of the adjacent side
        //increase the longer side:
        //computed length * local ratio <-- always > 1
        width = cropLength * ( w / h );
      }else{
        width = cropLength;

        height = cropLength * ( h / w );
      }

      return { height:Math.round( height ), width:Math.round( width ) };
  };

  return {
    processImage : function( id, url, blob, width, height, callback ){

      //even though these aren't the pixel dimensions, they are
      //ratio correct so they'll give us an accurate downsize dimension
      var dimensions = calcDimensions( width, height );

      var canvas = document.createElement('canvas'),
        canvasContext = canvas.getContext('2d');

      if( blob ){

        var img = document.createElement('img');

        img.onload = function() {

          canvas.width = dimensions.width,
          canvas.height = dimensions.height;

          canvasContext.clearRect( 0, 0, dimensions.width, dimensions.height);
          canvasContext.drawImage(this, 0, 0, dimensions.width, dimensions.height);

          var capId = "screencap-"+id;
          var setObj = {};

          setObj[capId] = canvas.toDataURL("image/jpeg", 1.0);
          setObj["screencap-url-"+id] = url;

          lsSet( setObj, function(){

            //should we delay this message??

            //storage is set, ready for ng app to get it
            tabEvent( id, "screencap" );
            callback();
          });

          setObj = undefined;
          canvasContext = undefined;
          canvas = undefined;
        };

        img.src = blob;
        img = null;

      }else{
        //console.log("error", "didnt get blob");
      }

      blob = undefined;
    }

  };

};

export default ggg()
