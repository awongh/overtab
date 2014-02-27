function resample_hermite(canvas, W, H, W2, H2, callback){
	var time1 = Date.now();
	var img = canvas.getContext("2d").getImageData(0, 0, W, H);
	var img2 = canvas.getContext("2d").getImageData(0, 0, W2, H2);
	var data2 = img2.data;
	var cores = 8;
	var cpu_in_use = 0;
	canvas.getContext("2d").clearRect(0, 0, W, H);

	for(var c = 0; c < cores; c++){
		cpu_in_use++;
		var my_worker = new Worker("bower_components/Hermite-resize/worker-hermite.js");
		my_worker.onmessage = function(event){
			cpu_in_use--;
			var offset = event.data.offset;

			for(var i = 0; i < event.data.data.length; i += 4){
				var x = offset + i;
				data2[x]     = event.data.data[i];
				data2[x + 1] = event.data.data[i+1];
				data2[x + 2] = event.data.data[i+2];
				data2[x + 3] = event.data.data[i+3];
				}

			//finish
			if(cpu_in_use <= 0){
				console.log("notify","hermite "+cores+" cores = "+(Math.round(Date.now() - time1)/1000)+" s");
				canvas.getContext("2d").clearRect(0, 0, W, H);
				canvas.getContext("2d").putImageData(img2, 0, 0);
        var url = canvas.toDataURL();

        console.log("warn", url, "DONE");

        callback( url );

				}
			};
		my_worker.postMessage([img, W, H, W2, H2, c, cores]);
		}
	};
