"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
const isValid_1 = require("./internals/isValid");
const modulo_1 = require("./internals/modulo");
class State {
    width;
    height;
    pieces;
    spawns;
    random;
    minQueue;
    maxStalls;
    x = 0;
    y = 0;
    angle = 0;
    current = -1;
    held = -1;
    board;
    queue = [];
    canHold = true;
    stalls = 0;
    constructor(width, height, pieces, spawns, random, minQueue = 3, maxStalls = 16) {
        this.width = width;
        this.height = height;
        this.pieces = pieces;
        this.spawns = spawns;
        this.random = random;
        this.minQueue = minQueue;
        this.maxStalls = maxStalls;
        this.board = Array(height)
            .fill(null)
            .map(() => Array(width).fill(-1));
    }
    isFloating(y = this.y + 1) {
        return (0, isValid_1.isValid)(this.x, y, this.getShape(), this.board);
    }
    getGhostY() {
        let y = this.y;
        while (this.isFloating(y))
            y++;
        return y - 1;
    }
    getPiece(id = this.current) {
        return this.pieces[id];
    }
    getShape(id = this.current, angle = this.angle) {
        return this.getPiece(id).shapes[(0, modulo_1.modulo)(angle, 4)];
    }
    getKicks(direction, id = this.current, angle = this.angle) {
        return this.getPiece(id).kicks[(0, modulo_1.modulo)(angle, 4)][direction];
    }
    stall() {
        this.stalls++;
        if (this.stalls >= this.maxStalls && !this.isFloating()) {
            this.stalls = 0;
            this.lock();
            this.spawn();
        }
    }
    rotate(direction) {
        return !!this.getKicks(direction).find(([x, y]) => this.move(this.x + x, this.y - y, this.angle + (direction === "left" ? -1 : 1)));
    }
    shift(dx, dy) {
        return this.move(this.x + dx, this.y + dy, this.angle);
    }
    slide(dx) {
        return this.shift(dx, 0);
    }
    print(x, y, id) {
        if (y < 0)
            return false;
        this.board[y][x] = id;
        return true;
    }
    lock() {
        this.canHold = true;
        for (const [x, y] of this.getShape()) {
            this.print(this.x + x, this.y + y, this.current);
        }
        return this.clear();
    }
    drop() {
        while (this.shift(0, 1))
            ;
        return this.lock() && this.spawn();
    }
    swap() {
        const old = this.held;
        this.held = this.current;
        return old;
    }
    hold() {
        if (!this.canHold)
            return false;
        const old = this.swap();
        this.canHold = false;
        return old < 0 ? this.spawn() : this.summon(old);
    }
    push(id) {
        this.queue.push(id);
    }
    spawn() {
        while (this.queue.length <= this.minQueue) {
            this.random.shuffle(this.pieces.keys()).forEach((id) => this.push(id));
        }
        return this.summon(this.queue.shift());
    }
    summon(id) {
        const [ox, oy] = this.getPiece(id).offset;
        return !!this.spawns.find(([x, y]) => this.set(x + ox, y + oy, 0, id));
    }
    move(x, y, angle) {
        return this.set(x, y, angle, this.current);
    }
    set(x, y, angle, id) {
        if (!(0, isValid_1.isValid)(x, y, this.getShape(id, angle), this.board))
            return false;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.current = id;
        return true;
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
exports.State = State;
//# sourceMappingURL=State.js.map