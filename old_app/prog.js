
Error.stackTraceLimit = undefined;
Set.prototype.union = function(setB) {
    var union = new Set(this);
    for (var elem of setB) {
        union.add(elem);
    }
    return union;
}


function croissanceRegion( imageData, offset, nbr_process, pixel_offset ) {
    var regions = {},
        regionId = -nbr_process + offset + 1,
        voisins = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1,-1], [-1, 1], [1,1], [1, -1]],
        voisinLength = voisins.length,
        width = imageData.width,
        height = imageData.height,
        regionIds = {width: imageData.width, height: imageData.height, data: new Uint32Array( imageData.width * imageData.height )};

    for( var i = 0; i < imageData.width; i++ ) {
        for( var j = 0; j < imageData.height; j++ ) {
            if( !getImagePixel(imageData, i, j)[0] && !getArrayData(regionIds, i, j) ) {
                var pixelsToVisit = [[i,j]],
                    region = [[i + pixel_offset[0], j + pixel_offset[1]]];
                regionId += nbr_process;

                setArrayData(regionIds, i,j, regionId);
                while(pixelsToVisit.length) {
                    var currentPixel = pixelsToVisit.shift();
                    for(var voisinIndex = 0; voisinIndex < voisinLength; voisinIndex++) 
                    {
                        var voisin = voisins[voisinIndex],
                            voisinPix = [currentPixel[0] + voisin[0], currentPixel[1] + voisin[1]],
                            verif = voisinPix[0] >= 0  &&  voisinPix[0] < width  && voisinPix[1] < height && 
                                voisinPix[1] >= 0;

                        if(verif && !getImagePixel(imageData, voisinPix[0], voisinPix[1])[0] && 
                                !getArrayData(regionIds, voisinPix[0], voisinPix[1])) {
                            pixelsToVisit.push([voisinPix[0], voisinPix[1]]);
                            region.push([voisinPix[0] + pixel_offset[0], voisinPix[1] + pixel_offset[1]]);
                            setArrayData(regionIds, voisinPix[0], voisinPix[1], regionId);
                        }
                    }
                }
                regions[regionId] = region;
            }
        }
    }
    return [regions, regionIds];
}

function mergeParaRegions( threads_regions, nbrProcess ) {
    var voisins = [[-1, 0], [1, 0], [0, -1], (0, 1),(-1,-1), (-1, 1), (1,1), (1, -1)],
        voisinLength = voisins.length,
        width = threads_regions[0][1].width,
        height = threads_regions[0][1].height;

        //Merged Regions
    var merged_regions = {},
        //Merged Region id sets
        merged_regions_id_sets = [];

    //Copy Merged Regions
    for( var i =  0; i < nbrProcess; i++) {
        Object.assign(merged_regions, threads_regions[i][0]);
    }

    //Merge matrice and Regions List
    for(var i = 1; i < nbrProcess; i++) {
        var precedentRegionIds = threads_regions[i - 1][1],
            precedentRegionsShape = [precedentRegionIds.width, precedentRegionIds.height],
            currentRegionIds = threads_regions[i][1];

        //Schedule regions merges
        for(var x = 0; x < width; x++) {
            //Get the current pixel id
            currentPixelId = getArrayData(currentRegionIds, x, 0);

            //Skip if no region Id at this pixel
            if( !currentPixelId ){
                continue;
            }

            //Get adjacents pixels
            var pixel_prece = getArrayData(precedentRegionIds, x, precedentRegionsShape[1] - 1),
                pixel_prece_top = x > 0 && getArrayData(precedentRegionIds, x-1, precedentRegionsShape[1] - 1),
                pixel_prece_bottom = x < width-1 && getArrayData(precedentRegionIds, x+1, precedentRegionsShape[1] - 1);


            //Get the disjoint set of similar pixels
            similar_pixels = new Set();
            if( pixel_prece ) {
                similar_pixels.add( pixel_prece );
            }
            if( pixel_prece_top ) {
                similar_pixels.add( pixel_prece_top );
            } 
            if( pixel_prece_bottom ) {
                similar_pixels.add( pixel_prece_bottom );
            }
        
            //Update Merged Regions with the similar pixels
            similar_pixels.forEach(function ( similar_pixel ) {
                var newSet  = new Set([similar_pixel, currentPixelId]),
                    new_merged_regions_id_sets = [];
                for(var merged_region_index = 0; merged_region_index <  merged_regions_id_sets.length; merged_region_index++){
                        var merged_region = merged_regions_id_sets[merged_region_index];
                    if(merged_region.has(similar_pixel) || merged_region.has(currentPixelId)) {
                        newSet = newSet.union(merged_region);
                    } else {
                        new_merged_regions_id_sets.push(merged_region);
                    }
                }
                new_merged_regions_id_sets.push(newSet);
                merged_regions_id_sets = new_merged_regions_id_sets;
            });
        }    
    }

    for( mergedRegionSetIndex in merged_regions_id_sets) {
        var mergedRegionSet = merged_regions_id_sets[mergedRegionSetIndex],
            firstRegionId = mergedRegionSet.values().next().value,
            firstMergedRegion = merged_regions[firstRegionId];
            mergedRegionSet.delete(firstRegionId);
        mergedRegionSet.forEach(function ( mergedRegionId ) {
            var tomerge_region = merged_regions[mergedRegionId];
            for( var regionIdIndex = 0; regionIdIndex < tomerge_region.length;  regionIdIndex++ ) {
                firstMergedRegion.push(tomerge_region[regionIdIndex]);
            }
            delete merged_regions[mergedRegionId];
        });
    }

    return merged_regions;
}


function seuillage( imageData, seuil ) {
	var width=imageData.width;
    var height=imageData.height;
    var data;
    
    for(var x=0; x< width; x++) {
        
        for(var y=0; y < height; y++) {

            data = getImagePixel(imageData, x, y );

         	
            if(data[0] > seuil) {// white
                setImagePixel( imageData, x, y, [255, 255, 255, 255] );
            } else { //black
                
                setImagePixel( imageData, x, y, [0, 0, 0, 255] );
            }           
        }
    }

    return imageData;
}

function encadrer_grain(region) {
    //Initialisze le cadre
    var premierGrain = region[0],
        x = premierGrain[0],
        y =  premierGrain[1],
        cadre = [x, x, y, y],
        nombrePixel = region.length;

    for( var i = 1; i < nombrePixel; i++) {
        var pixelCoord = region[i],
            x = pixelCoord[0],
            y = pixelCoord[1];
        //Cadre extrémité gauche
        cadre[0] = Math.min(x, cadre[0]);        
        //Cadre extrémité droite
        cadre[1] = Math.max(x, cadre[1]);  
        //Cadre extrémité haute
        cadre[2] = Math.min(y, cadre[2]);
        //Cadre extrémité basse
        cadre[3] = Math.max(y, cadre[3]);
    }

    return cadre;
}

function interp_ligne(point1, point2) {
    var x1 = point1[0],
        y1 = point1[1],
        x2 = point2[0],
        y2 = point2[1],
        a = (y1 - y2) / (x1 - x2),
        b = y1 - a * x1;
    return [a, b];
}

function project_point_ligne(point, ligne) {
    var x1 = point[0],
        y1 = point[1],
        a1 = ligne[0],
        b1 = ligne[1],
        a2 = -1 / a1,
        b2 = y1 - a2 * x1,
        x2 = (b1 - b2) / (a2 - a1), //si b1=0 donc b2-b1    (a2-a1) <0
        y2 = a2 * x2 + b2;
    return [x2, y2];
}

function taille_project_ligne(grain, ligne) {
    var point1 = project_point_ligne(grain[0], ligne),
        extremites = [point1, point1],
        grainLength = grain.length;
    for(var i = 1; i < grainLength; i++) {
        var point = grain[i],
            point2 = project_point_ligne(point, ligne);
        if(point2[0] < extremites[0][0]) {
            extremites[0] = point2
        }
        if(point2[0] > extremites[1][0]) {
            extremites[1] = point2
        }    
    }
    var p1 = extremites[0], 
        p2 = extremites[1];
    return Math.pow(Math.pow(p1[0]-p2[0], 2) + Math.pow(p1[1] - p2[1], 2), 0.5);
}
        
function calculer_taille_grain(grain) {
    var cadre = encadrer_grain(grain),
        verticale = cadre[1] - cadre[0],
        horizontale = cadre[3] - cadre[2],
        //Interpolation de la première diagonale (Extraction de a1 et b1)
        ligne1 = interp_ligne([cadre[0], cadre[2]], [cadre[1], cadre[3]]),
        //Interpolation de la deuxième diagonale (Extraction de a2 et b2)
        ligne2 = interp_ligne([cadre[0], cadre[3]], [cadre[1], cadre[2]]),
        diagonale1 = taille_project_ligne(grain, ligne1),
        diagonale2 = taille_project_ligne(grain, ligne2);

    return Math.max(verticale, horizontale, diagonale1, diagonale2);
}


