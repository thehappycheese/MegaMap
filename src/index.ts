

import { tableFromIPC } from 'apache-arrow';
import Feature from 'ol/Feature';
import { LineString } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import 'ol/ol.css';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import View from 'ol/View';

import { vlen, vsub } from './util/avec'


const vsauce_state_roads = new VectorSource({});
const vsauce_psps = new VectorSource({});
const vsauce_local_roads = new VectorSource({});

const map = new Map({
    target: 'maphost',
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
        new VectorLayer({
            source: vsauce_state_roads,
            style:new Style({
                stroke: new Stroke({
                    color: '#ff0000',
                    width: 2
                })
            })
        }),
        new VectorLayer({
            minZoom: 10,
            source: vsauce_psps,
            style:new Style({
                stroke: new Stroke({
                    color: 'green',
                    width: 2
                })
            })
        }),
        new VectorLayer({
            minZoom: 13,
            source: vsauce_local_roads
        }),
    ],
    view: new View({
        projection: 'EPSG:4326',
        center: [0, 0],
        zoom: 2,
    }),
});

async function getdf() {
    let table = await tableFromIPC(fetch("road_network.feather"));

    let id = -1;
    
    let features:any ={
        "State Road": [],
        "Main Roads Controlled Path": [],
        "Local Road": [],
        "Other": []
    }
    
    for (let row of table) {
        id++;
        
        if (row===null || row === undefined) {
            continue;
        }
        const NETWORK_TYPE = row["NETWORK_TYPE"];

        
        
        let coords = row["geometry"].toArray().map((item:any)=>item.toJSON()) ?? [[0, 0], [90, 90]]
        let geometry:LineString;
        // I thought this would help with drawing the ticks... but i think it will no since we have to deal with pixel coordinates
        // if (NETWORK_TYPE=="Local Road"){
        //     geometry = new LineString(coords);
        //     geometry.simplify(3);
        // }else{
        //     // modify coords to be measured LineString, uses a more ram, but hopefully makes our hatchings faster to compute
        //     coords[0][2] = 0;
        //     for(let i = 1; i < coords.length; i++) {
        //         let len = vlen(vsub(coords[i-1], coords[i]));
        //         coords[i][2] = coords[i-1][2] + len;
        //     }
        //     geometry = new LineString(coords, 'XYM')
        // }
        geometry = new LineString(coords)
        if (NETWORK_TYPE=="Local Road"){
            geometry = geometry.simplify(0.0001) as LineString
        }
        let feature = new Feature({id, geometry});
        if (NETWORK_TYPE in features) {
            features[NETWORK_TYPE].push(feature);
        }
    }
    vsauce_local_roads.addFeatures(features["Local Road"]);
    vsauce_psps.addFeatures(features["Main Roads Controlled Path"]);
    vsauce_state_roads.addFeatures(features["State Road"]);
    map.getView().fit(vsauce_state_roads.getExtent())
};




// declare module globalThis {
//     var getdf: any;
// }
// globalThis.getdf = getdf2;

getdf()