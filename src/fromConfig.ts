import { Piece } from ".";
import { Config, Number4, Shape, Shape4 } from "./types";

export function fromConfig(
	{ board: size, pieces, kicks: store = {}, spawns }: Config,
	seed: Number4
) {
	const parsed = pieces.map<Piece>(
		({ shape, kicks}) => ({
			kicks: typeof kicks === "string" ? store[kicks] : kicks,
			shapes: [0, 0, 0, 0].map(() => {
				const v: Shape = [];
				shape.forEach((r, y) =>
					r.forEach((c, x) => c && v.push([x, y]))
				);
				shape = shape[0].map((_, i) => shape.map((r) => r[i]).reverse());
				return v;
			}) as Shape4,
			size: [shape[0].length, shape.length],
		})
	);
	return [size[0], size[1], parsed, spawns, seed] as const;
}
