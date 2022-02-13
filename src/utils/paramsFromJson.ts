import { Piece } from "../types";
import { Config, Shape, Cardinal } from "../types";

export function paramsFromJson({
	size,
	pieces,
	kicks: store = {},
	spawns,
}: Config) {
	const parsed = pieces.map<Piece>(({ shape, kicks, offset = [0, 0] }) => ({
		offset,
		kicks: typeof kicks === "string" ? store[kicks] : kicks,
		shapes: [0, 0, 0, 0].map(() => {
			const v: Shape = [];
			shape.forEach((r, y) => r.forEach((c, x) => c && v.push([x, y])));
			shape = shape[0].map((_, i) => shape.map((r) => r[i]).reverse());
			return v;
		}) as Cardinal<Shape>,
		size: [shape[0].length, shape.length],
	}));
	return [size[0], size[1], parsed, spawns] as const;
}
