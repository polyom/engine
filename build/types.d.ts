export declare type Vector = [x: number, y: number];
export declare type Shape = Vector[];
export declare type Kicks = Vector[];
export declare type Cardinal<T> = [north: T, east: T, south: T, west: T];
export declare type Matrix = number[][];
export declare type Direction = "left" | "right";
export declare type CardinalKicks = Cardinal<Record<Direction, Kicks>>;
export interface Piece {
    size: Vector;
    offset: Vector;
    shapes: Cardinal<Shape>;
    kicks: CardinalKicks;
}
export declare type Handling = {
    das: number;
    arr: number;
    sdf: number;
    dcd: number;
    crt: boolean;
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
