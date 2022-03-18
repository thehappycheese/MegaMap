import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Style, { RenderFunction } from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';

export const road_network_styles:Record<string, Style> = {
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