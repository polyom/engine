"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
const Machine_1 = require("./Machine");
class Engine extends Machine_1.Machine {
    fall = 1000;
    tickTimer = null;
    lockTimer = null;
    stalls = 0;
    maxStalls = 3;
    events = {
        hold: [],
        clear: [],
        shift: [],
        lock: [],
        rotate: [],
        tick: [],
    };
    emit(name, ...args) {
        // @ts-ignore
        this.events[name].forEach((l) => l(...args));
    }
    on(name, listener) {
        this.events[name].push(listener);
    }
    off(name, listener) {
        this.events[name].splice(this.events[name].indexOf(listener), 1);
    }
    lock() {
        super.lock();
        this.clear();
        this.emit("lock");
    }
    stall() {
        if (this.lockTimer) {
            clearTimeout(this.lockTimer);
            this.lockTimer = null;
            this.stalls++;
            if (this.stalls > this.maxStalls && !this.floating) {
                this.stalls = 0;
                this.lock();
                this.spawn();
            }
        }
    }
    shift(dx, dy) {
        const ok = super.shift(dx, dy);
        this.emit("shift", dx, dy, ok);
        if (ok)
            this.stall();
        return ok;
    }
    clear() {
        const lines = super.clear();
        this.emit("clear", lines);
        return lines;
    }
    rotate(dd) {
        const ok = super.rotate(dd);
        this.emit("rotate", dd, ok);
        if (ok)
            this.stall();
        return ok;
    }
    tick(immediate = false, fall = this.fall) {
        this.tickTimer = setTimeout(() => this.tick(true, fall), fall);
        if (!immediate)
            return;
        if (!this.floating && !this.lockTimer) {
            this.lockTimer = setTimeout(() => {
                this.lock();
                this.spawn();
                this.lockTimer = null;
            }, this.fall);
        }
        else {
            this.shift(0, 1);
        }
        this.emit("tick");
    }
    start(immediate = false, fall = this.fall) {
        this.stop();
        this.tick(immediate, fall);
    }
    stop() {
        clearTimeout(this.tickTimer);
    }
}
exports.Engine = Engine;
//# sourceMappingURL=Engine.js.map