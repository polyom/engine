export declare class Random {
    a: number;
    b: number;
    c: number;
    d: number;
    constructor(a: number, b: number, c: number, d: number);
    number(): number;
    shuffle<T>(array: IterableIterator<T>): T[];
}
