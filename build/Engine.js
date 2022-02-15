"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
const _1 = require(".");
class Engine extends _1.Listener {
    state;
    fall;
    lockDelay;
    tickTimer = null;
    lockTimer = null;
    constructor(state, fall = 1000, lockDelay = 500) {
        super(state);
        this.state = state;
        this.fall = fall;
        this.lockDelay = lockDelay;
        let floating = true;
        let wasFloating = true;
        this.on("hold", () => {
            this.clearLockTimer();
        });
        this.on("lock", () => {
            this.clearLockTimer();
            this.state.clear();
        });
        this.on("set", () => {
            wasFloating = floating;
            floating = this.state.isFloating();
        });
        this.on("drop", () => {
            this.start();
        });
        const handler = (_, ok) => {
            if (ok && !wasFloating) {
                if (this.lockTimer)
                    this.clearLockTimer();
                this.state.stall();
            }
        };
        this.on("slide", handler);
        this.on("rotate", handler);
    }
    clearLockTimer() {
        clearTimeout(this.lockTimer);
        this.lockTimer = null;
    }
    tick(immediate = false, fall = this.fall) {
        this.tickTimer = setTimeout(() => this.tick(true, fall), fall);
        if (!immediate)
            return;
        if (!this.state.isFloating() && !this.lockTimer) {
            this.lockTimer = setTimeout(() => {
                this.state.lock();
                this.state.spawn();
            }, this.lockDelay);
        }
        else {
            this.state.shift(0, 1);
        }
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