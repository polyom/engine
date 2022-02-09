var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
function createRandom([a, b, c, d]) {
  return function() {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    let t = a + b | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = c << 21 | c >>> 11;
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}
class Machine {
  constructor(width, height, pieces, spawns, seed) {
    __publicField(this, "x", 0);
    __publicField(this, "y", 0);
    __publicField(this, "i", -1);
    __publicField(this, "d", 0);
    __publicField(this, "board");
    __publicField(this, "bags", []);
    __publicField(this, "canHold", true);
    __publicField(this, "held", -1);
    __publicField(this, "random");
    this.width = width;
    this.height = height;
    this.pieces = pieces;
    this.spawns = spawns;
    this.seed = seed;
    this.random = createRandom(seed);
    this.board = new Array(height).fill(null).map(() => new Array(width).fill(-1));
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
    this.x = x, this.y = y, this.d = d, this.i = i;
  }
  trySet(x = this.x, y = this.y, d = this.d, i = this.i) {
    return this.try(() => this.set(x, y, d, i));
  }
  rotate(dd) {
    const kick = this.pieces[this.i].kicks[this.d];
    return !!(dd < 0 ? kick.left : kick.right).find(([px, py]) => {
      return this.trySet(this.x + px, this.y - py, (this.d + dd + 4) % 4);
    });
  }
  valid() {
    return this.shape.every(([x, y]) => {
      const bx = x + this.x, by = y + this.y;
      return bx >= 0 && by >= 0 && bx < this.width && by < this.height && this.board[by][bx] < 0;
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
    return this.engine.hold();
  }
  stopHold() {
    this.hold = false;
  }
  startHardDrop() {
    if (this.hardDrop)
      return;
    this.hardDrop = true;
    return this.engine.drop();
  }
  stopHardDrop() {
    this.hardDrop = false;
  }
  startSlide(ms = this.handling.das) {
    if (!(this.slideLeft || this.slideRight))
      return;
    this.engine.shift(this.dx, 0);
    this.arrTimer = setTimeout(() => this.startSlide(this.handling.arr), ms);
  }
  stopSlide() {
    this.dx = +this.slideRight - +this.slideLeft;
    if (this.slideLeft || this.slideRight)
      return;
    clearTimeout(this.arrTimer);
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
    return this.engine.rotate(-1);
  }
  startRotateRight() {
    if (this.rotateRight)
      return;
    this.rotateRight = true;
    return this.engine.rotate(1);
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
class Engine extends Machine {
  constructor() {
    super(...arguments);
    __publicField(this, "fall", 1e3);
    __publicField(this, "tickTimer", null);
    __publicField(this, "lockTimer", null);
    __publicField(this, "stalls", 0);
    __publicField(this, "maxStalls", 3);
    __publicField(this, "events", {
      hold: [],
      clear: [],
      shift: [],
      lock: [],
      rotate: [],
      tick: []
    });
  }
  emit(name, ...args) {
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
    } else {
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
function fromConfig({ board: size, pieces, kickStore = {}, spawns }, seed) {
  const parsedPieces = pieces.map(({ shape, kicks, offset: [ox, oy] = [0, 0] }) => ({
    kicks: typeof kicks === "string" ? kickStore[kicks] : kicks,
    shapes: [0, 0, 0, 0].map(() => {
      const v = [];
      shape.forEach((r, y) => r.forEach((c, x) => c && v.push([x + ox, y + oy])));
      shape = shape[0].map((_, i) => shape.map((r) => r[i]).reverse());
      return v;
    })
  }));
  return [size[0], size[1], parsedPieces, spawns, seed];
}
export { Controller, Engine, Machine, fromConfig };
