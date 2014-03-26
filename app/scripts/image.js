var processImage = function( id, url, blob ){

  var canvas = document.createElement('canvas'),
    canvasContext = canvas.getContext('2d');

  canvas.width = THUMBSIZE;
  canvas.height = THUMBSIZE;

  var img = document.createElement('img');

  img.onload = function() {

    var cropLength = THUMBSIZE / SCREEN_CROP_RATIO,
      height, width;

    //figure out the size to draw the image.

    //height is ratio corrected, so that we are fitting the
    //screencrop's amount into the thumb height.
    //the viewport of thumbsize is the visible portion of the screen_crop ratio's

    if( this.height < this.width ){ //landscape

      height = cropLength;

      //figure out the ratio-calculated length of the adjacent side
      //increase the longer side:
      //computed length * local ratio <-- always > 1
      width = cropLength * ( this.width / this.height );
    }else{
      width = cropLength;

      height = cropLength * ( this.height / this.width );
    }

    //clear the canvas
    canvasContext.clearRect( 0, 0, THUMBSIZE, THUMBSIZE);

    //draw an image at this height
    canvasContext.drawImage(this, 0, 0, width, height);

    //the data we are putting into the web worker:
    var cc = canvasContext.getImageData(0, 0, width, height);

    var my_worker = new Worker("scripts/image-worker.js");

    var that_image = this;

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
      w2:width,
      h2:height,
      w:THUMBSIZE,
      h:THUMBSIZE
    });
  };

  img.src = blob; // Set the image to the dataUrl and invoke the onload function
  blob = undefined;
  img = undefined;
};
