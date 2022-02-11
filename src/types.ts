export type Point = [x: number, y: number];
export type Shape = Point[];
export type Kick = { left: Point[]; right: Point[] };
export type Kick4 = [Kick, Kick, Kick, Kick];
export type Shape4 = [Shape, Shape, Shape, Shape];
export type Number4 = [number, number, number, number];

export interface Piece {
	shapes: Shape4;
	kicks: Kick4;
}

export type Number2d = number[][];

export type ConfigPiece = {
	offset?: Point;
	shape: (0 | 1)[][];
	kicks: Kick4 | string;
};

export type Config = {
	board: Point;
	spawns: Point[];
	kicks?: Record<string, Kick4>;
	pieces: ConfigPiece[];
};

export type Handling = {
	das: number; // delayed auto shift
	arr: number; // auto repeat rate
	sdf: number; // soft drop fall multiplier
	dcd: number; // DAS cut delay
	crt: boolean; // cancel DAS on direction Change
};

export type Events = {
	move: ((dx: number, dy: number, ok: boolean) => void)[];
	rotate: ((dd: number, ok: boolean) => void)[];
	set: ((x: number, y: number, d: number, ok: boolean) => void)[];
	slide: ((dx: number, ok: boolean) => void)[];
	spawn: ((i: number, ok: boolean) => void)[];
	hold: ((ok: boolean) => void)[];
	tick: (() => void)[];
	lock: (() => void)[];
	clear: ((lines: number[]) => void)[];
};
