import { Machine } from "./Machine";
import { Events } from "./types";

export class Engine extends Machine {
	fall = 1000;
	lockDelay = 500;
	tickTimer = null as any;
	lockTimer = null as any;
	stalls = 0;
	maxStalls = 16;

	events: Events = {
		hold: [],
		clear: [],
		move: [],
		lock: [],
		rotate: [],
		tick: [],
		spawn: [],
		slide: [],
	};

	spawn(i?: number) {
		const ok = super.spawn(i);
		this.emit("spawn", this.shape(), this.x, this.y, this.d, ok);
		return ok;
	}

	emit<N extends keyof Events>(
		name: N,
		...args: Parameters<Events[N][number]>
	) {
		// @ts-ignore
		this.events[name].forEach((l) => l(...(args as any)));
	}

	on<N extends keyof Events>(name: N, listener: Events[N][number]) {
		this.events[name].push(listener as any);
	}

	off<N extends keyof Events>(
		name: N,
		listener: Parameters<Events[N][number]>
	) {
		this.events[name].splice(this.events[name].indexOf(listener as any), 1);
	}

	lock() {
		super.lock();
		this.clear();
		this.emit("lock");
	}

	stall(fn: () => boolean) {
		const { floating } = this;
		const ok = fn();
		if (!ok) return ok;

		if (!floating) this.stalls++;
		if (this.stalls >= this.maxStalls && !this.floating) {
			this.stalls = 0;
			this.lock();
			this.spawn();
		}
		if (this.lockTimer) {
			clearTimeout(this.lockTimer);
			this.lockTimer = null;
		}

		return ok;
	}

	move(dx: number, dy: number) {
		const ok = super.move(dx, dy);
		this.emit("move", dx, dy, ok);
		return ok;
	}

	clear() {
		const lines = super.clear();
		this.emit("clear", lines);
		return lines;
	}

	slide(dx: number) {
		return this.stall(() => {
			const ok = super.move(dx, 0);
			this.emit("slide", dx, ok);
			return ok;
		});
	}

	rotate(dd: number) {
		return this.stall(() => {
			const ok = super.rotate(dd);
			this.emit("rotate", dd, ok);
			return ok;
		});
	}

	tick(immediate = false, fall = this.fall) {
		this.tickTimer = setTimeout(() => this.tick(true, fall), fall);
		if (!immediate) return;
		if (!this.floating && !this.lockTimer) {
			this.lockTimer = setTimeout(() => {
				this.lock();
				this.spawn();
				this.lockTimer = null;
			}, this.lockDelay);
		} else {
			this.move(0, 1);
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
