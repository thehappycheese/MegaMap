

import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { LineString } from 'ol/geom';
import View from 'ol/View';

import {tableFromIPC } from 'apache-arrow';

const vsauce = new VectorSource({});

const map = new Map({
	target: 'maphost',
	layers: [
		new TileLayer({
			source: new OSM(),
		}),
		new VectorLayer({
			source:vsauce
		})
	],
	view: new View({
		projection: 'EPSG:4326',
		center: [0, 0],
		zoom: 2,
	}),
});

async function getdf(){

	
	let table = await tableFromIPC(fetch("road_network.feather"));
	let features:any = table.toArray().map((row, id) => {
		if (row){
			let feature = new Feature({
				id,
				geometry: new LineString(
					row["geometry.paths"].get(0).toJSON().map((item:any)=>item.toJSON()) ?? [[0,0],[90,90]]
				)
			});
            return feature
		}
    }).filter(item=>item);
    debugger
    vsauce.addFeatures(features);
};


declare module globalThis{
    var getdf:any;
}
globalThis.getdf = getdf;