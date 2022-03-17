import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Style, { RenderFunction } from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import { linestring_measure, linestring_ticks } from '../../util/linestring';
import { Coordinate } from 'ol/coordinate';
import { State, toContext } from 'ol/render';
import { Map } from 'ol';
   
var road_network_styles = {
	'Main Roads Controlled Path': new Style({
		stroke: new Stroke({
			color: 'rgba(255, 0, 255)',
			width: 1.5,
		}),
	}),
	'State Road': new Style({
		stroke: new Stroke({
			color: 'rgb(0, 255, 255)',
			width: 2,
		}),
	}),
	'Proposed Road': new Style({
		stroke: new Stroke({
			color: 'rgba(50, 255, 255, 255)',
			width: 1.8,
			lineDash: [10, 10]
		}),
		//renderer: custom_renderer_with_SLK_ticks
	}),
	'Local Road': new Style({
		stroke: new Stroke({
			color: 'rgba(50, 50, 110, 255)',
			width: 1,
		}),
	}),
	'DEFAULT': new Style({
		stroke: new Stroke({
			color: 'rgba(40, 40, 80, 255)',
			width: 1,
		}),
	})
};

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

function BuildTickRenderer(map:Map):RenderFunction {
	return (pixelCoordinates:Coordinate|Coordinate[]|Coordinate[][], state:State) => {
		// There are a lot of bugs when the pixle ratio is not 1
		let pixle_ratio = window.devicePixelRatio ?? 1;
		var context = state.context;

		let canvas_size_x = context.canvas.width / pixle_ratio;
		let canvas_size_y = context.canvas.height / pixle_ratio;

		
		let coords = state.geometry.getCoordinates();
		if(coords === null){
			return
		}
		coords = coords.map((item:any) => map.getPixelFromCoordinateInternal(item));
		var network_type = state.feature.get("NETWORK_TYPE");


		var slk_from = state.feature.get('START_SLK');
		var slk_to = state.feature.get('END_SLK');
		let mls = linestring_measure(coords);
		let ticks;
		let decimal_figures;

		if (state.resolution < 0.1) {
			decimal_figures = 2
			//ticks = linestring_ticks(mls, slk_from, slk_to, 0.001, 10, canvas_size_x/pixle_ratio, canvas_size_y/pixle_ratio);
			ticks = linestring_ticks(mls, slk_from, slk_to, 0.001, 10, canvas_size_x, canvas_size_y, decimal_figures);
		} else if (state.resolution < 1) {
			decimal_figures = 1
			//ticks = linestring_ticks(mls, slk_from, slk_to, 0.01, 10, canvas_size_x/pixle_ratio, canvas_size_y/pixle_ratio);
			ticks = linestring_ticks(mls, slk_from, slk_to, 0.01, 10, canvas_size_x, canvas_size_y, decimal_figures);
		} else if (state.resolution < 2){
			decimal_figures = 0
			//ticks = linestring_ticks(mls, slk_from, slk_to, 0.1, 10, canvas_size_x/pixle_ratio, canvas_size_y/pixle_ratio);
			ticks = linestring_ticks(mls, slk_from, slk_to, 0.1, 10, canvas_size_x, canvas_size_y, decimal_figures);
		} else {
			decimal_figures = 0
			//ticks = linestring_ticks(mls, slk_from, slk_to, 0.1, 10, canvas_size_x/pixle_ratio, canvas_size_y/pixle_ratio);
			ticks = linestring_ticks(mls, slk_from, slk_to, 1, 1, canvas_size_x, canvas_size_y, decimal_figures);
		}
		let tickmarks = ticks.map(item => [
			[
				[item[0][0][0], item[0][0][1]],
				[item[0][1][0], item[0][1][1]]
			],
			item[1],
			item[2]
		]);
		context.save();
		var renderContext = toContext(context);
		(renderContext as any).extent_ = [0, 0, canvas_size_x, canvas_size_y];  // manual override of extent calculation to fix problems when devicePixleRatio is not == 1
		renderContext.setFillStrokeStyle(
			road_network_styles[network_type].getFill(),
			road_network_styles[network_type].getStroke()
		);
		var geometry = state.geometry.clone();
		for (let [item, label, label_rotation] of tickmarks) {
			label_rotation += Math.PI / 2;
			geometry.setCoordinates(item)
			renderContext.drawGeometry(geometry);
			if (label && state.feature.get("CWY") != "Right") {
				let text_style = custom_render_tick_text.clone()
				text_style.setText(label)
				if (Math.abs(label_rotation) > Math.PI / 2) {
					label_rotation += Math.PI;
					text_style.setTextAlign("right");
				}
				text_style.setRotation(label_rotation)
				renderContext.setTextStyle(text_style)
				renderContext.drawText_(item[1], 0, 2, 2);
				renderContext.setTextStyle()
			}
		}
		context.restore();
	}
}

var state_road_vector_layer_ticks = new ol.layer.Vector({
	source: state_road_only_vector_source,
	style: new Style({
		renderer: custom_renderer_with_SLK_ticks
	}),
	minZoom: 12
});