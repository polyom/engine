import { Machine } from "./Machine";
import { Events } from "./types";

export class Engine extends Machine {
	fall = 1000;
	tickTimer = null as any;
	lockTimer = null as any;
	stalls = 0;
	maxStalls = 3;

	events: Events = {
		hold: [],
		clear: [],
		shift: [],
		lock: [],
		rotate: [],
		tick: [],
	};

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

	shift(dx: number, dy: number) {
		const ok = super.shift(dx, dy);
		this.emit("shift", dx, dy, ok);
		if (ok) this.stall();
		return ok;
	}

	clear() {
		const lines = super.clear();
		this.emit("clear", lines);
		return lines;
	}

	rotate(dd: -1 | 1) {
		const ok = super.rotate(dd);
		this.emit("rotate", dd, ok);
		if (ok) this.stall();
		return ok;
	}

	tick(immediate = false, fall = this.fall) {
		this.tickTimer = setTimeout(() => this.tick(true, fall), fall);
		if (!immediate) return;
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
