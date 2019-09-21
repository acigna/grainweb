importScripts('utils.js', 'prog.js');

self.onmessage = function ( msg ) {
	var msgData = msg.data,
		thread_regions = msgData.thread_regions,
		nbr_process = msgData.nbr_process,
		now = performance.now();
	var join_regions = mergeParaRegions( thread_regions, nbr_process );

	console.log('Temps de Merge :' + (performance.now() - now));
	self.postMessage(join_regions);
}