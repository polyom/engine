import { Piece } from "../types";
import { Config } from "../types";
export declare function paramsFromJson({ size, pieces, kicks: store, spawns, }: Config): readonly [number, number, Piece[], import("../types").Vector[]];
