"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listener = void 0;
class Listener {
    instance;
    handlers = {};
    constructor(instance) {
        this.instance = instance;
    }
    on(key, handler) {
        const list = this.handlers[key] ?? (this.handlers[key] = []);
        if (!list.length) {
            // @ts-ignore
            const old = this.instance[key].bind(this.instance);
            this.instance[key] = ((...args) => {
                const result = old(...args);
                for (const h of list)
                    h(args, result);
                return result;
            });
        }
        list.push(handler.bind(this.instance));
    }
    off(key, handler) {
        const list = this.handlers[key] ?? [];
        list.splice(list.indexOf(handler), 1);
    }
}
exports.Listener = Listener;
//# sourceMappingURL=Listener.js.map