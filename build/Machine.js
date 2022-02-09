"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Machine = void 0;
const createRandom_1 = require("./createRandom");
class Machine {
    width;
    height;
    pieces;
    spawns;
    seed;
    x = 0;
    y = 0;
    i = -1;
    d = 0;
    board;
    bags = [];
    canHold = true;
    held = -1;
    random;
    constructor(width, height, pieces, spawns, seed) {
        this.width = width;
        this.height = height;
        this.pieces = pieces;
        this.spawns = spawns;
        this.seed = seed;
        this.random = (0, createRandom_1.createRandom)(seed);
        this.board = new Array(height)
            .fill(null)
            .map(() => new Array(width).fill(-1));
    }
    get queue() {
        return this.bags.flat();
    }
    get shape() {
        return this.pieces[this.i].shapes[this.d];
    }
    get ghostY() {
        let y = 0;
        this.try(() => {
            while (this.shift(0, 1))
                ;
            y = this.y;
        }, true);
        return y;
    }
    try(fn, test = false) {
        const { x, y, d, i } = this;
        fn(x, y, d, i);
        const valid = this.valid();
        if (!valid || test)
            this.set(x, y, d, i);
        return valid;
    }
    get floating() {
        return this.try(() => this.y++, true);
    }
    shift(dx, dy) {
        return this.trySet(this.x + dx, this.y + dy);
    }
    set(x = this.x, y = this.y, d = this.d, i = this.i) {
        (this.x = x), (this.y = y), (this.d = d), (this.i = i);
    }
    trySet(x = this.x, y = this.y, d = this.d, i = this.i) {
        return this.try(() => this.set(x, y, d, i));
    }
    rotate(dd) {
        const kick = this.pieces[this.i].kicks[this.d];
        return !!(dd < 0 ? kick.left : kick.right).find(([px, py]) => {
            return this.trySet(this.x + px, this.y - py, ((this.d + dd + 4) % 4));
        });
    }
    valid() {
        return this.shape.every(([x, y]) => {
            const bx = x + this.x, by = y + this.y;
            return (bx >= 0 &&
                by >= 0 &&
                bx < this.width &&
                by < this.height &&
                this.board[by][bx] < 0);
        });
    }
    lock() {
        for (const [x, y] of this.shape)
            this.board[this.y + y][this.x + x] = this.i;
    }
    drop() {
        while (this.shift(0, 1))
            ;
        this.lock();
        this.spawn();
    }
    spawn(i = this.next()) {
        return this.spawns.find(([x, y]) => this.trySet(x, y, 0, i));
    }
    next() {
        this.canHold = true;
        while (this.bags.length < 4)
            this.bags.push([...this.pieces.keys()].sort(() => this.random() - 0.5));
        if (this.bags[0].length === 0)
            this.bags.shift();
        return this.bags[0].shift();
    }
    hold() {
        if (!this.canHold)
            return false;
        const held = this.held;
        this.held = this.i;
        const i = held < 0 ? this.next() : held;
        this.canHold = false;
        return this.spawn(i);
    }
    clear() {
        const lines = [];
        for (let y = 0; y < this.height; y++) {
            if (this.board[y].every((c) => c >= 0)) {
                lines.push(y);
                this.board.splice(y, 1);
                this.board.unshift(new Array(this.width).fill(-1));
            }
        }
        return lines;
    }
}
exports.Machine = Machine;
//# sourceMappingURL=Machine.js.map