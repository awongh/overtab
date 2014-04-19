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

var processImage = function( id, url, blob, width, height ){

  //even though these aren't the pixel dimensions, they are
  //ratio correct so they'll give us an accurate downsize dimension
  var dimensions = calcDimensions( width, height );

  var canvas = document.createElement('canvas'),
    canvasContext = canvas.getContext('2d');

  var my_worker = new Worker("scripts/image-worker.js");

  my_worker.onmessage = function(event){

    //we've returned with the processed data
    var returnedImageData = event.data.rImageData;

    //we put the canvascontext in here and the measurements
    //write everything out to the canvas
    canvas.width = dimensions.width,
    canvas.height = dimensions.height;
    canvasContext.clearRect( 0, 0, dimensions.width, dimensions.height);
    canvasContext.putImageData(returnedImageData, 0, 0);

    var capId = "screencap-"+id;
    var setObj = {};

    setObj[capId] = canvas.toDataURL("jpeg",0.0);
    setObj["screencap-url-"+id] = url;

    lsSet( setObj, function(){
      //storage is set, ready for ng app to get it
      tabEvent( id, "screencap" );
    });

    canvasContext = undefined;
    canvas = undefined;
    event = undefined;
  };

  if( blob ){

    var img = document.createElement('img');

    img.onload = function() {
      canvas.width = this.width,
      canvas.height = this.height;

      canvasContext.drawImage(this, 0, 0, this.width, this.height);

      var imageData = canvasContext.getImageData(0, 0, this.width, this.height);
      var rImageData = canvasContext.createImageData(dimensions.width, dimensions.height);

      my_worker.postMessage({
        rImageData:rImageData,
        imageData:imageData,
        w:this.width,
        h:this.height,
        w2:dimensions.width,
        h2:dimensions.height
      });

      my_worker = undefined;
      imageData = undefined;
      rImageData = undefined;
    };

    img.src = blob;
    img = null;

  }else{
    //console.log("error", "didnt get blob");
  }

  blob = undefined;
};
