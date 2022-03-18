
import { tableFromIPC } from 'apache-arrow';
import Feature from 'ol/Feature';
import { LineString } from 'ol/geom';

self.onmessage = async message =>  {
    let table = await tableFromIPC(fetch(message.data.get));

    let id = -1;
    
    let features:any = [];
    
    for (let row of table) {
        id++;
        
        if (row===null || row === undefined) {
            continue;
        }

        
        
        let geometry = row["geometry"].toArray().map((item:any)=>item.toJSON()) ?? [[0, 0], [90, 90]]

        if (row["NETWORK_TYPE"]=="Local Road"){
            geometry = (new LineString(geometry).simplify(0.0001) as LineString).getCoordinates();
        }
        
        let feature = {
            id,
            geometry,
            START_SLK:         row["START_SLK"],
            END_SLK:           row["END_SLK"],
            CWY:               row["CWY"],
            NETWORK_TYPE:      row["NETWORK_TYPE"],
            ROAD_NAME:         row["ROAD_NAME"],
            ROAD:              row["ROAD"],
            COMMON_USAGE_NAME: row["COMMON_USAGE_NAME"],
            RA_NO:             row["RA_NO"],
        };
        features.push(feature);
    }
    self.postMessage(features);
};