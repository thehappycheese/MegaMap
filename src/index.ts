

import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { LineString } from 'ol/geom';
import View from 'ol/View';

import { tableFromIPC } from 'apache-arrow';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';

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
            minZoom: 15,
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
    let table = await tableFromIPC(fetch("road_network.feather", {cache:"force-cache"}));

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

        let feature = new Feature({
            id,
            geometry: new LineString(
                row["geometry"].toArray().map((item:any)=>item.toJSON()) ?? [[0, 0], [90, 90]]
            )
        });
        
        const NETWORK_TYPE = row["NETWORK_TYPE"];
        if (NETWORK_TYPE in features) {
            if (NETWORK_TYPE=="Local Road"){
                feature.getGeometry()?.simplify(2)
            }
            features[NETWORK_TYPE].push(feature);
        }else{
            features["Other"].push(feature);
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