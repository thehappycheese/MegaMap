

import { vadd, vdivs, vleft, vlen, vmuls, vsub } from './avec';


export function linestring_measure(line_string:[number, number][]):[[number, number,number][], number] {
	let result:[number, number, number][] = [];
	let total_length = 0;
	let b = line_string[0];
	for (let i = 0; i < line_string.length - 1; i++) {
		let a = line_string[i];
		b = line_string[i + 1];
		let ab = vsub(b, a);
		let ab_len = vlen(ab);
		result.push([a[0], a[1], ab_len]);
		total_length += ab_len;
	}
	result.push([b[0], b[1], 0]);
	return [result, total_length];
}

export function linestring_ticks(
        measured_line_string:[[number, number,number][], number],
        slk_from:number,
        slk_to:number,
        minor_interval_km:number,
        major_interval_count:number,
        x_px:number,
        y_px:number,
        decimal_figures:number
    ) {

    // SLK:                                                                  2                         3                         4                         5
    // Ticks (Major/Minor)                          km ---------!------------|------------!------------|------------!------------|------------!------------|------------!--------
    // LineString / Vertices                       deg o------------------------------------o---------------------------------o-----------------------------------o-------------o
    // length_km                                    km |<⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—⁠—>|
    // distance_from_start_to_next_tick             km |<⁠—⁠—————>|
    // distance_from_start_to_next_major_tick       km |<⁠——————————————⁠—————>|
    // number_of_ticks_to_first_major_interval    unit          |<———— 1 ———>|
    // minor_interval_px                            px          |<——— px ———>|
    // initial_offset_px                            px |<⁠— px —>|


	let result:[[[number,number],[number, number]], string | undefined, number][] = [];
	let [points, length_px] = measured_line_string;

	let length_km = slk_to - slk_from;

	let distance_from_start_to_next_tick = minor_interval_km - (slk_from % minor_interval_km);

	let distance_from_start_to_next_major_tick = minor_interval_km * major_interval_count - (slk_from % (minor_interval_km * major_interval_count));
	let number_of_ticks_to_first_major_interval = Math.round((distance_from_start_to_next_major_tick - distance_from_start_to_next_tick) / minor_interval_km);


	let minor_interval_px = minor_interval_km / length_km * length_px;

	let initial_offset_px = distance_from_start_to_next_tick / length_km * length_px
	let offset_multiplier = 0;
	let len_so_far_px = 0;

	let current_offset_px = initial_offset_px;
	let ticks_to_major_interval = number_of_ticks_to_first_major_interval
	for (let i = 0; i < points.length - 1; i++) {
		let a = points[i];
		let ab_len = points[i + 1][2] - points[i][2];
		let b = points[i + 1];
		let ab = vsub(b, a);
		let ab_unit = vdivs(ab, ab_len);
		let len_after_segment = len_so_far_px + ab_len;
		while (current_offset_px < len_after_segment) {
			let is_major_tick = (offset_multiplier % major_interval_count) == number_of_ticks_to_first_major_interval
			let tick_length_px = is_major_tick ? 6 : 2;
			let segment_offet = current_offset_px - len_so_far_px
			let base = vmuls(vadd(a, ab_unit), segment_offet);
			if (!(base[0] < 0 || base[0] > x_px || base[1] < 0 || base[1] > y_px)) {
				result.push([
					[
						vmuls(vleft(vadd(base, ab_unit)), -tick_length_px),
						vmuls(vleft(vadd(base, ab_unit)), tick_length_px)
					],
					is_major_tick ? (offset_multiplier * minor_interval_km + distance_from_start_to_next_tick + slk_from).toFixed(decimal_figures) : undefined,
					Math.atan2(ab_unit[1], ab_unit[0])
				]);
			}
			offset_multiplier++;
			if (ticks_to_major_interval == 0) {
				ticks_to_major_interval = major_interval_count;
			}
			ticks_to_major_interval--;
			current_offset_px = offset_multiplier * minor_interval_px + initial_offset_px;
		}
		len_so_far_px = len_after_segment;
	}

	return result;
}