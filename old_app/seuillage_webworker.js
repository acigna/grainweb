
importScripts('utils.js', 'prog.js');

self.onmessage = function ( msg ) {
	var data = msg.data,
		imageData = data.imageData,
		seuil = data.seuil;

	//Faire le seuillage
    var imageData = seuillage( imageData, seuil );

	self.postMessage( imageData, [imageData.data.buffer] );
}