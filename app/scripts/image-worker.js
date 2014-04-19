onmessage = function (oEvent) {

  var w2 = oEvent.data.w2,
    h2 = oEvent.data.h2,
    w = oEvent.data.w,
    h = oEvent.data.h,
    imageData = oEvent.data.imageData;

  var image_data_array = resample_hermite( imageData.data, w, h, w2, h2 );

  imageData.data = image_data_array;

  postMessage({returnedData:imageData});

  self.close();
};

function resample_hermite(data, W, H, W2, H2){

    var data2 = [],
      ratio_w = W / W2,
      ratio_h = H / H2,
      ratio_w_half = Math.ceil(ratio_w/2),
      ratio_h_half = Math.ceil(ratio_h/2);

    for(var j = 0; j < H2; j++){
        for(var i = 0; i < W2; i++){
            var x2 = (i + j*W2) * 4;
            var weight = 0;
            var weights = 0;
            var gx_r = gx_g = gx_b = gx_a = 0;
            var center_y = (j + 0.5) * ratio_h;

            for(var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++){

                var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                var center_x = (i + 0.5) * ratio_w;
                var w0 = dy*dy //pre-calc part of w

                for(var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++){

                    var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                    var w = Math.sqrt(w0 + dx*dx);
                    if(w >= -1 && w <= 1){
                        //hermite filter
                        weight = 2 * w*w*w - 3*w*w + 1;
                        if(weight > 0){
                            dx = 4*(xx + yy*W);
                            gx_r += weight * data[dx];
                            gx_g += weight * data[dx + 1];
                            gx_b += weight * data[dx + 2];
                            gx_a += weight * data[dx + 3];
                            weights += weight;
                        }
                    }
                }
            }
        data2[x2]     = gx_r / weights;
        data2[x2 + 1] = gx_g / weights;
        data2[x2 + 2] = gx_b / weights;
        data2[x2 + 3] = gx_a / weights;
        }
    }

    return data2;
};
