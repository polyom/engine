import { createRandom } from "./createRandom";
import { Number2d, Number4, Piece, Point } from "./types";

const mod = (a: number, b: number) => ((a % b) + b) % b;

export class Machine {
	x = 0;
	y = 0;
	i = -1;
	d = 0;
	board: Number2d;
	bags: Number2d = [];
	canHold = true;
	held = -1;
	random: () => number;

	constructor(
		public width: number,
		public height: number,
		public pieces: Piece[],
		public spawns: Point[],
		public seed: Number4
	) {
		this.random = createRandom(seed);
		this.board = new Array(height)
			.fill(null)
			.map(() => new Array(width).fill(-1));
	}

	get queue() {
		return this.bags.flat();
	}

	shape(i = this.i, d = this.d) {
		return this.pieces[i].shapes[mod(d, 4)];
	}

	get ghostY() {
		let y = 0;
		this.try(() => {
			while (this.valid()) this.y++;
			y = this.y - 1;
		}, true);
		return y;
	}

	try(
		fn: (x: number, y: number, d: number, i: number) => void,
		test = false
	): boolean {
		const { x, y, d, i } = this;
		fn(x, y, d, i);
		const valid = this.valid();
		if (!valid || test) this.hardSet(x, y, d, i);
		return valid;
	}

	get floating() {
		return this.try(() => this.y++, true);
	}

	move(dx: number, dy: number) {
		return this.set(this.x + dx, this.y + dy);
	}

	hardSet(x: number = this.x, y: number = this.y, d = this.d, i: number = this.i) {
		(this.x = x), (this.y = y), (this.d = d), (this.i = i);
	}

	set(x = this.x, y = this.y, d = this.d, i = this.i) {
		return this.try(() => this.hardSet(x, y, d, i));
	}

	rotate(dd: number) {
		const kick = this.pieces[this.i].kicks[mod(this.d, 4)];
		return !!(dd < 0 ? kick.left : kick.right).find(([px, py]) => {
			return this.set(this.x + px, this.y - py, this.d + dd);
		});
	}

	valid() {
		return this.shape().every(([x, y]) => {
			const bx = x + this.x,
				by = y + this.y;
			return (
				bx >= 0 &&
				by >= 0 &&
				bx < this.width &&
				by < this.height &&
				this.board[by][bx] < 0
			);
		});
	}

	lock() {
		for (const [x, y] of this.shape())
			this.board[this.y + y][this.x + x] = this.i;
	}

	drop() {
		while (this.move(0, 1));
		this.lock();
		this.spawn();
	}

	spawn(i: number = this.next()) {
		return !!this.spawns.find(([x, y]) => this.set(x, y, 0, i));
	}

	next() {
		this.canHold = true;
		while (this.bags.length < 4)
			this.bags.push([...this.pieces.keys()].sort(() => this.random() - 0.5));
		if (this.bags[0].length === 0) this.bags.shift();
		return this.bags[0].shift()!;
	}

	hold() {
		if (!this.canHold) return false;
		const held = this.held;
		this.held = this.i;
		const i = held < 0 ? this.next() : held;
		this.canHold = false;
		return this.spawn(i);
	}

	clear(): number[] {
		const lines: number[] = [];
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
