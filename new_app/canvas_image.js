var CanvasImage = function ( canvasElement ) {
	this.canvasElement = canvasElement;
	this.context = canvasElement.getContext("2d");
	this.downloadImageData();
}

CanvasImage.prototype = {
	downloadImageData: function() {
		this.imageData = this.context.getImageData( 0, 0, this.canvasElement.width, this.canvasElement.height );
	},

	readPixel: function ( x, y ) {
		var imageData = this.imageData,
			offset = (y * imageData.width + x) * 4;
        return imageData.data.subarray(offset, offset + 4);
	},

	writePixel: function ( x, y, data ) {
		var imageData = this.imageData,
			offset = (y * imageData.width + x) * 4;
        imageData.data.subarray( offset, offset + 4 ).set( data );
	},

	uploadImageData: function () {
		this.context.putImageData( this.imageData, 0, 0 );
	},

	drawImage: function ( imageEl, x, y ) {
		this.context.drawImage( imageEl, x,y );
	},

	setWidth: function ( width ) {
		this.canvasElement.width = width;
	},

	setHeight: function ( height ) {
		this.canvasElement.height = height;	
	}
}