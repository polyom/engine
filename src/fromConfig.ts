import { Config, Number4, Shape, Shape4 } from "./types";

export function fromConfig(
	{ board: size, pieces, kickStore = {}, spawns }: Config,
	seed: Number4
) {
	const parsedPieces = pieces.map(
		({ shape, kicks, offset: [ox, oy] = [0, 0] }) => ({
			kicks: typeof kicks === "string" ? kickStore[kicks] : kicks,
			shapes: [0, 0, 0, 0].map(() => {
				const v: Shape = [];
				shape.forEach((r, y) =>
					r.forEach((c, x) => c && v.push([x + ox, y + oy]))
				);
				shape = shape[0].map((_, i) => shape.map((r) => r[i]).reverse());
				return v;
			}) as Shape4,
		})
	);
	return [size[0], size[1], parsedPieces, spawns, seed] as const;
}
