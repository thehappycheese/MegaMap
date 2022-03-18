


import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import 'ol/ol.css';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import View from 'ol/View';
import { get_road_network_layer } from './layers/road_network/layer';

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


async function main() {
    let road_network_layer = await get_road_network_layer(map);
    map.addLayer(road_network_layer);
    // vsauce_local_roads.addFeatures(features["Local Road"]);
    // vsauce_psps.addFeatures(features["Main Roads Controlled Path"]);
    // vsauce_state_roads.addFeatures(features["State Road"]);
    // map.getView().fit(vsauce_state_roads.getExtent())
}
main()