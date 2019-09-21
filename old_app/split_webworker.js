var creerCoupe = function ( source, width, height, coupeDebut, coupeFin ) {
	var pixel_debut = ( coupeDebut * width ) * 4,
		pixel_fin = ( ( coupeFin + 1 ) * width ) * 4 - 1,
		taille = pixel_fin - pixel_debut + 1,
		tableauSplit = new Uint8Array( taille ),
		sousTableau = new Uint8Array( source.buffer, pixel_debut, taille );
	tableauSplit.set( sousTableau );
	return tableauSplit;
}

self.onmessage = function ( msg ) {
	var msgData = msg.data,
		imageData = msgData.imageData,
		width = imageData.width,
		height = imageData.height,
		data = imageData.data,
		nombre_coupe = msgData.nombre_coupe,
		ligne_par_coupe = Math.floor( height / nombre_coupe ),
		coupes = [],
		coupesBuffer = [];

	for( var i = 0; i < nombre_coupe; i++ ) {
		var coupeDebut = i * ligne_par_coupe,
			coupeFin = ( i === nombre_coupe - 1 ) ? ( height - 1 ) : 
				coupeDebut + ligne_par_coupe - 1;
		var coupe = creerCoupe( data, width, height, coupeDebut, coupeFin );
		coupes.push({data: coupe, width: width, height: coupeFin - coupeDebut + 1});
		coupesBuffer.push( coupe.buffer );
	}
	self.postMessage( coupes, coupesBuffer );
}
