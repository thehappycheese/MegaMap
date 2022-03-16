

import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import ParquetReader from 'parquetjs/lib/reader';

const map = new Map({
  target: 'maphost',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    projection: 'EPSG:4326',
    center: [0, 0],
    zoom: 2,
  }),
});

async function getdf(){

  //let blb = await (await fetch("road_network_data_test.parquet")).blob()
  let f = ParquetReader.ParquetReader.openFile("road_network_data_test.parquet")
  debugger
}