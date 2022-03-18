import { Feature } from "ol";
import { LineString } from "ol/geom";

export async function load_features():Promise<Feature[]> {
    
    let worker = new Worker(new URL('./load_features.worker.ts', import.meta.url));

    let result = new Promise(resolve=>{
        worker.onmessage = (message) => {
            let result:any = [];

            for(let [key, value] of Object.entries(message.data)){
                (message.data as any[]).map(
                    item => new Feature({...item, geometry:new LineString(item.geometry)})
                )
            }
            resolve(result);
        }
    });

    worker.postMessage({
        get:"road_network.feather"
    })
    
    return result as Promise<Feature[]>;
};