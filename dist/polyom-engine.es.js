var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class Listener {
  constructor(instance) {
    __publicField(this, "handlers", {});
    this.instance = instance;
  }
  on(key, handler) {
    var _a;
    const list = (_a = this.handlers[key]) != null ? _a : this.handlers[key] = [];
    if (!list.length) {
      const old = this.instance[key].bind(this.instance);
      this.instance[key] = (...args) => {
        const result = old(...args);
        for (const h of list)
          h(args, result);
        return result;
      };
    }
    list.push(handler.bind(this.instance));
  }
  off(key, handler) {
    var _a;
    const list = (_a = this.handlers[key]) != null ? _a : [];
    list.splice(list.indexOf(handler), 1);
  }
}
class Random {
  constructor(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }
  number() {
    this.a >>>= 0;
    this.b >>>= 0;
    this.c >>>= 0;
    this.d >>>= 0;
    let t = this.a + this.b | 0;
    this.a = this.b ^ this.b >>> 9;
    this.b = this.c + (this.c << 3) | 0;
    this.c = this.c << 21 | this.c >>> 11;
    this.d = this.d + 1 | 0;
    t = t + this.d | 0;
    this.c = this.c + t | 0;
    return (t >>> 0) / 4294967296;
  }
  shuffle(array) {
    return [...array].sort(() => this.number() - 0.5);
  }
}
function isValid(cx, cy, shape, board) {
  return shape.every(([x, y]) => {
    const bx = x + cx, by = y + cy;
    if (bx < 0 || bx >= board[0].length)
      return false;
    if (by < 0)
      return true;
    return by < board.length && board[by][bx] < 0;
  });
}
function modulo(a, b) {
  return (a % b + b) % b;
}
class State {
  constructor(width, height, pieces, spawns, random, minQueue = 3, maxStalls = 16) {
    __publicField(this, "x", 0);
    __publicField(this, "y", 0);
    __publicField(this, "angle", 0);
    __publicField(this, "current", -1);
    __publicField(this, "held", -1);
    __publicField(this, "board");
    __publicField(this, "queue", []);
    __publicField(this, "canHold", true);
    __publicField(this, "stalls", 0);
    this.width = width;
    this.height = height;
    this.pieces = pieces;
    this.spawns = spawns;
    this.random = random;
    this.minQueue = minQueue;
    this.maxStalls = maxStalls;
    this.board = Array(height).fill(null).map(() => Array(width).fill(-1));
  }
  isFloating(y = this.y + 1) {
    return isValid(this.x, y, this.getShape(), this.board);
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
    return this.getPiece(id).shapes[modulo(angle, 4)];
  }
  getKicks(direction, id = this.current, angle = this.angle) {
    return this.getPiece(id).kicks[modulo(angle, 4)][direction];
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
    if (!isValid(x, y, this.getShape(id, angle), this.board))
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
function paramsFromJson({
  size,
  pieces,
  kicks: store = {},
  spawns
}) {
  const parsed = pieces.map(({ shape, kicks, offset = [0, 0] }) => ({
    offset,
    kicks: typeof kicks === "string" ? store[kicks] : kicks,
    shapes: [0, 0, 0, 0].map(() => {
      const v = [];
      shape.forEach((r, y) => r.forEach((c, x) => c && v.push([x, y])));
      shape = shape[0].map((_, i) => shape.map((r) => r[i]).reverse());
      return v;
    }),
    size: [shape[0].length, shape.length]
  }));
  return [size[0], size[1], parsed, spawns];
}
class Controller {
  constructor(engine, handling) {
    __publicField(this, "dx", 0);
    __publicField(this, "arrTimer", null);
    __publicField(this, "slideLeft", false);
    __publicField(this, "slideRight", false);
    __publicField(this, "softDrop", false);
    __publicField(this, "rotateLeft", false);
    __publicField(this, "rotateRight", false);
    __publicField(this, "hold", false);
    __publicField(this, "hardDrop", false);
    this.engine = engine;
    this.handling = handling;
  }
  startHold() {
    if (this.hold)
      return;
    this.hold = true;
    this.engine.state.hold();
  }
  stopHold() {
    this.hold = false;
  }
  startHardDrop() {
    if (this.hardDrop)
      return;
    this.hardDrop = true;
    this.engine.state.drop();
  }
  stopHardDrop() {
    this.hardDrop = false;
  }
  startSlide(ms = this.handling.das, dx = this.dx) {
    if (!(this.slideLeft || this.slideRight))
      return;
    if (this.handling.crt && dx !== this.dx) {
      clearTimeout(this.arrTimer);
      this.arrTimer = null;
      ms = this.handling.das;
      dx = this.dx;
    } else {
      this.engine.state.slide(this.dx);
    }
    if (!this.arrTimer) {
      this.arrTimer = setTimeout(() => {
        this.arrTimer = null;
        this.startSlide(this.handling.arr, dx);
      }, ms);
    }
  }
  stopSlide() {
    this.dx = +this.slideRight - +this.slideLeft;
    if (this.slideLeft || this.slideRight)
      return;
    clearTimeout(this.arrTimer);
    this.arrTimer = null;
  }
  startSlideLeft() {
    if (this.slideLeft)
      return;
    this.slideLeft = true;
    this.dx = -1;
    this.startSlide();
  }
  startSlideRight() {
    if (this.slideRight)
      return;
    this.slideRight = true;
    this.dx = 1;
    this.startSlide();
  }
  stopSlideLeft() {
    this.slideLeft = false;
    this.stopSlide();
  }
  stopSlideRight() {
    this.slideRight = false;
    this.stopSlide();
  }
  startRotateLeft() {
    if (this.rotateLeft)
      return;
    this.rotateLeft = true;
    this.engine.state.rotate("left");
  }
  startRotateRight() {
    if (this.rotateRight)
      return;
    this.rotateRight = true;
    this.engine.state.rotate("right");
  }
  stopRotateLeft() {
    this.rotateLeft = false;
  }
  stopRotateRight() {
    this.rotateRight = false;
  }
  startSoftDrop() {
    if (this.softDrop)
      return;
    this.softDrop = true;
    this.engine.start(true, this.engine.fall / this.handling.sdf);
  }
  stopSoftDrop() {
    this.softDrop = false;
    this.engine.start(false);
  }
}
class Engine extends Listener {
  constructor(state, fall = 1e3, lockDelay = 500) {
    super(state);
    __publicField(this, "tickTimer", null);
    __publicField(this, "lockTimer", null);
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
    } else {
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
export { Controller, Engine, Listener, Random, State, paramsFromJson };
