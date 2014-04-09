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

    return { height:height, width:width };
};

var processImage = function( id, url, blob, width, height ){

  var canvas = document.createElement('canvas'),
    canvasContext = canvas.getContext('2d'),
    img = document.createElement('img');

  canvas.width = THUMBSIZE,
  canvas.height = THUMBSIZE;

  var my_worker = new Worker("scripts/image-worker.js");

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

    canvas = undefined;
    canvasContext = undefined;
  };

  if( blob ){
    var dimensions = calcDimensions( width, height );

    var imageData = canvasContext.createImageData( dimensions.width, dimensions.height );

    my_worker.postMessage({
      url:blob,
      imageData:imageData,
      w2:dimensions.width,
      h2:dimensions.height,
      w:width,
      h:height
    });

  }else{
    //console.log("error", "didnt get blob");
  }

  my_worker = undefined;
  blob = undefined;
  img = undefined;
};
