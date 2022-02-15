import { Listener } from ".";
import { State } from "./State";
export declare class Engine extends Listener<State> {
    state: State;
    fall: number;
    lockDelay: number;
    tickTimer: any;
    lockTimer: any;
    constructor(state: State, fall?: number, lockDelay?: number);
    clearLockTimer(): void;
    tick(immediate?: boolean, fall?: number): void;
    start(immediate?: boolean, fall?: number): void;
    stop(): void;
}
