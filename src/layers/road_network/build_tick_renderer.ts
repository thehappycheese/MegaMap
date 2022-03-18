
import { Map } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { LineString } from 'ol/geom';
import { State, toContext } from 'ol/render';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style, { RenderFunction } from 'ol/style/Style';
import Text from 'ol/style/Text';
import { linestring_measure, linestring_ticks } from '../../util/linestring';
   


let road_name_text_style = new Text({
	font: "bold 13px sans-serif",
	placement: 'line',
	textBaseline: 'bottom',
	fill: new Fill({
		color: "#000"
	}),
	stroke: new Stroke({
		color: '#fff',
		width: 1,
	}),
});

var custom_render_tick_text = new Text({
	text: "hey",
	font: "bold 16px sans-serif",
	textAlign: "left",
	fill: new Fill({
		color: "#000"
	}),
	stroke: new Stroke({
		color: '#fff',
		width: 1,
	}),
})

const tickmark_configurations:{
	max_resolution: number;
	decimal_figures: number;
	minor_interval_km: number;
	major_interval_count: number;
}[] = [
	{
		max_resolution:       0.1,
		decimal_figures:      2,
		minor_interval_km:    0.001,
		major_interval_count: 10
	},
	{
		max_resolution:       1,
		decimal_figures:      2,
		minor_interval_km:    0.01,
		major_interval_count: 10
	},
	{
		max_resolution:       2,
		decimal_figures:      0,
		minor_interval_km:    0.1,
		major_interval_count: 10
	},
	{
		max_resolution:       Infinity,
		decimal_figures:      0,
		minor_interval_km:    1,
		major_interval_count: 5
	}
]

export function build_tick_renderer(map:Map, road_network_styles:Record<string, Style>):RenderFunction {
	return (pixelCoordinates:Coordinate|Coordinate[]|Coordinate[][], state:State) => {
		// There are a lot of bugs when the pixle ratio is not 1
		let pixle_ratio = window.devicePixelRatio ?? 1;
		var context = state.context;

		let canvas_size_x = context.canvas.width / pixle_ratio;
		let canvas_size_y = context.canvas.height / pixle_ratio;

		
		let line_string_coords = state.geometry.getCoordinates();
		if(line_string_coords === null){
			return
		}
		line_string_coords = line_string_coords.map((item:any) => map.getPixelFromCoordinateInternal(item));
		var network_type = state.feature.get("NETWORK_TYPE");


		var slk_from = state.feature.get('START_SLK');
		var slk_to = state.feature.get('END_SLK');
		
		
		let decimal_figures;

		

		let tickmark_configuration = tickmark_configurations.find(item => state.resolution<item.max_resolution)

		if(tickmark_configuration === undefined){
			// TODO: this should probably be an error
			return
		}
		let measured_line_string = linestring_measure(line_string_coords);
		let ticks = linestring_ticks(
			measured_line_string,
			slk_from,
			slk_to,
			tickmark_configuration.minor_interval_km,
			tickmark_configuration.major_interval_count,
			canvas_size_x,
			canvas_size_y,
			tickmark_configuration.decimal_figures
		);

		context.save();
		var renderContext = toContext(context);
		(renderContext as any).extent_ = [0, 0, canvas_size_x, canvas_size_y];  // manual override of extent calculation to fix problems when devicePixleRatio is not == 1
		renderContext.setFillStrokeStyle(
			road_network_styles[network_type].getFill(),
			road_network_styles[network_type].getStroke()
		);
		var geometry = state.geometry.clone() as LineString;
		for (let [item, label, label_rotation] of ticks) {
			label_rotation += Math.PI / 2;
			geometry.setCoordinates(item)
			renderContext.drawGeometry(geometry);
			if (label && state.feature.get("CWY") != "Right") {
				let text_style = custom_render_tick_text.clone();
				text_style.setText(label);
				if (Math.abs(label_rotation) > Math.PI / 2) {
					label_rotation += Math.PI;
					text_style.setTextAlign("right");
				}
				text_style.setRotation(label_rotation);
				renderContext.setTextStyle(text_style);
				
				// TODO: check if it is actually needed...
				// access to private method; as long as it is working, it is allowed :)
				(renderContext as any).drawText_(item[1], 0, 2, 2);
				// force typescript to allow us to call this method with undefined.
				// This appears to be required to "clear" the test style??
				// TODO: check if it is actually needed...
				(renderContext as any).setTextStyle(undefined)
			}
		}
		context.restore();
	}
}