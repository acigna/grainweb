function loadImage( src, onload ) {

    var img = new Image();
	img.src = src; // Set source path
	img.onload = function() {
		onload( img );
	};
}

function lancerThread( nomScript, inputData, transferrables ) {
	var deferred = Q.defer();
	var worker = new Worker( nomScript );
	worker.postMessage(inputData, transferrables);

	worker.onmessage = function ( msg ) {
		deferred.resolve( msg.data );
	}

	worker.onerror = function ( error ) {
		deferred.reject( error );
	}

	return deferred.promise;
}

function getImageData( canvas, imageObj ) {
	if(!canvas)
    {
        alert("Impossible de récupérer le canvas");
        return;
    }
 	
 	var context = canvas.getContext("2d");
    if(!context)
    {
        alert("Impossible de récupérer le context");
        return;
    }

	canvas.width = imageObj.width;
	canvas.height = imageObj.height;
	context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
	
	return context.getImageData(0, 0, canvas.width, canvas.height);
}

function putImageData( canvas, imageData ) {
	var context = canvas.getContext("2d");
	context.putImageData(imageData, 0, 0);
}

function getImagePixel( imageData, x, y ) {
	var offset = (y * imageData.width + x) * 4;
	return imageData.data.subarray(offset, offset + 4);
}

function setImagePixel( imageData, x, y, data ) {
	var offset = (y * imageData.width + x) * 4;
	imageData.data.subarray( offset, offset + 4 ).set( data );
}

function getArrayData( array, x, y ) {
	var offset = (y * array.width + x),
		arrayElement = array.data.subarray(offset, offset + 1);
	return arrayElement[0];	
}

function setArrayData( array, x, y, data ) {
	var offset = y * array.width + x;
	array.data.subarray( offset, offset + 1 ).set( [data] );	
}