declare type Handler<T, This> = T extends (...args: any[]) => any ? (this: This, args: Parameters<T>, result: ReturnType<T>) => void : never;
export declare class Listener<T> {
    instance: T;
    handlers: any;
    constructor(instance: T);
    on<K extends keyof T>(key: K, handler: Handler<T[K], T>): void;
    off<K extends keyof T>(key: K, handler: Handler<T[K], T>): void;
}
export {};
