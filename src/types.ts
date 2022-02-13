export type Vector = [x: number, y: number];
export type Shape = Vector[];
export type Kicks = Vector[];
export type Cardinal<T> = [north: T, east: T, south: T, west: T];
export type Matrix = number[][];
export type Direction = "left" | "right";
export type CardinalKicks = Cardinal<Record<Direction, Kicks>>;

export interface Piece {
	size: Vector;
	offset: Vector;
	shapes: Cardinal<Shape>;
	kicks: CardinalKicks;
}

export type Handling = {
	das: number; // delayed auto shift
	arr: number; // auto repeat rate
	sdf: number; // soft drop fall multiplier
	dcd: number; // DAS cut delay
	crt: boolean; // cancel DAS on direction Change
};

export interface ConfigPiece {
	shape: (0 | 1)[][];
	kicks: CardinalKicks | string;
	offset?: Vector;
}

export interface Config {
	size: Vector;
	spawns: Vector[];
	kicks?: Record<string, CardinalKicks>;
	pieces: ConfigPiece[];
}
