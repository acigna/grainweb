importScripts('utils.js', 'prog.js');

self.onmessage = function ( msg ) {
	var data = msg.data,
		nbr_process = data.nbr_process,
		offset = data.offset,
		pixel_offset = data.pixel_offset
		imageData = data.imageData;

	//Faire la croissance de region
    var regions = croissanceRegion( imageData, offset, nbr_process, pixel_offset );

    //Retourn les régions
	self.postMessage( regions, [regions[1].data.buffer] );
}