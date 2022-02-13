type Handler<T, This> = T extends (...args: any[]) => any
	? (this: This, args: Parameters<T>, result: ReturnType<T>) => void
	: never;

export class Listener<T> {
	handlers: any = {};

	constructor(public instance: T) {}

	on<K extends keyof T>(key: K, handler: Handler<T[K], T>) {
		const list = this.handlers[key] ?? (this.handlers[key] = []);
		if (!list.length) {
			// @ts-ignore
			const old = this.instance[key].bind(this.instance);
			this.instance[key] = ((...args: unknown[]) => {
				const result = old(...args);
				for (const h of list) h(args, result);
				return result;
			}) as any;
		}
		list.push(handler.bind(this.instance));
	}

	off<K extends keyof T>(key: K, handler: Handler<T[K], T>) {
		const list = this.handlers[key] ?? [];
		list.splice(list.indexOf(handler), 1);
	}
}
