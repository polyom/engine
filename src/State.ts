import { Direction, Kicks, Matrix, Piece, Shape, Vector } from "./types";
import { Random } from "./Random";
import { isValid } from "./internals/isValid";
import { modulo } from "./internals/modulo";

export class State {
	x = 0;
	y = 0;
	angle = 0;
	current = -1;
	held = -1;
	board: Matrix;
	queue: number[] = [];
	canHold = true;
	stalls = 0;

	constructor(
		public width: number,
		public height: number,
		public pieces: Piece[],
		public spawns: Vector[],
		public random: Random,
		public minQueue = 3,
		public maxStalls = 16
	) {
		this.board = Array(height)
			.fill(null)
			.map(() => Array(width).fill(-1));
	}

	isFloating(y = this.y + 1) {
		return isValid(this.x, y, this.getShape(), this.board);
	}

	getGhostY() {
		let y = this.y;
		while (this.isFloating(y)) y++;
		return y - 1;
	}

	getPiece(id = this.current) {
		return this.pieces[id];
	}

	getShape(id = this.current, angle = this.angle): Shape {
		return this.getPiece(id).shapes[modulo(angle, 4)];
	}

	getKicks(direction: Direction, id = this.current, angle = this.angle): Kicks {
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

	rotate(direction: Direction): boolean {
		return !!this.getKicks(direction).find(([x, y]) => {
			return this.set(
				this.x + x,
				this.y + y,
				this.angle + (direction === "left" ? -1 : 1)
			);
		});
	}

	shift(dx: number, dy: number): boolean {
		return this.set(this.x + dx, this.y + dy);
	}

	slide(dx: number) {
		return this.shift(dx, 0);
	}

	lock() {
		let ok = true;
		this.canHold = true;
		for (const [x, y] of this.getShape()) {
			if (this.y + y > this.board.length) ok = false;
			else this.board[this.y + y][this.x + x] = this.current;
		}
		return ok;
	}

	hardDrop() {
		while (this.shift(0, 1));
		return this.lock() && this.spawn();
	}

	hold(): boolean {
		if (!this.canHold) return false;
		const old = this.held;
		this.held = this.current;
		this.canHold = false;
		return old < 0 ? this.spawn() : this.summon(old);
	}

	append(id: number) {
		this.queue.push(id);
	}

	spawn(): boolean {
		while (this.queue.length <= this.minQueue) {
			this.random.shuffle(this.pieces.keys()).forEach((id) => this.append(id));
		}
		return this.summon(this.queue.shift()!);
	}

	summon(id: number): boolean {
		const [ox, oy] = this.getPiece(id).offset;
		return !!this.spawns.find(([x, y]) => this.set(x + ox, y + oy, 0, id));
	}

	set(x: number, y: number, angle = this.angle, id = this.current): boolean {
		if (!isValid(x, y, this.getShape(id, angle), this.board)) return false;
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.current = id;
		return true;
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
