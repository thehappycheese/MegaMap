import Feature from "ol/Feature";
import { Map } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import { build_tick_renderer } from "./build_tick_renderer";
import { load_features } from "./load_features";
import { road_network_styles } from "./styles";


export async function get_road_network_layer(map:Map){
    let features = await load_features();
    let renderer = build_tick_renderer(map, road_network_styles)

    let road_network_layer = new VectorLayer({
        source: new VectorSource({
            features: features,
        }),
        style:new Style({
            renderer
        })
    });
    return road_network_layer;
}