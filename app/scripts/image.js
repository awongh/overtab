var calcDimensions = function( h, w ){
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

    return { height:height, width:width };
};

var processImage = function( id, url, blob ){

  var canvas = document.createElement('canvas'),
    canvasContext = canvas.getContext('2d'),
    img = document.createElement('img');

    canvas.width = THUMBSIZE,
    canvas.height = THUMBSIZE;

  img.onload = function() {

    var dimensions = calcDimensions( this.height, this.width ),
      that_image = this,
      my_worker = new Worker("scripts/image-worker.js");

    //clear the canvas
    canvasContext.clearRect( 0, 0, THUMBSIZE, THUMBSIZE);

    //draw an image at this height
    canvasContext.drawImage(this, 0, 0, dimensions.width, dimensions.height);

    //the data we are putting into the web worker:
    var cc = canvasContext.getImageData(0, 0, dimensions.width, dimensions.height);

    my_worker.onmessage = function(event){

      //we've returned with the processed data
      var returnedData = event.data.returnedData;

      //we put the canvascontext in here and the measurements
      //write everything out to the canvas
      canvasContext.clearRect(0, 0, THUMBSIZE, THUMBSIZE);
      canvasContext.putImageData(returnedData, 0, 0);

      var capId = "screencap-"+id;
      var setObj = {};

      setObj[capId] = canvas.toDataURL("jpeg",0.9);
      setObj["screencap-url-"+id] = url;

      lsSet( setObj, function(){
        //storage is set, ready for ng app to get it
        tabEvent( id, "screencap" );
      });

      setObj = null;
      canvasContext = undefined;
      canvas = undefined;
    };

    my_worker.postMessage({
      data:cc,
      w2:dimensions.width,
      h2:dimensions.height,
      w:THUMBSIZE,
      h:THUMBSIZE
    });
  };

  if( blob ){
    img.src = blob; // Set the image to the dataUrl and invoke the onload function
  }else{
    console.log("error", "didnt get blob");
  }
  blob = undefined;
  img = undefined;
};
