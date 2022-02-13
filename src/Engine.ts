import { Listener } from ".";
import { State } from "./State";

export class Engine {
	stalls = 0;
	tickTimer = null as any;
	lockTimer = null as any;

	constructor(
		public state: State,
		public fall = 1000,
		public lockDelay = 500,
		public maxStalls = 16
	) {
		const listener = new Listener(state);
		let floating = true;
		let wasFloating = true;

		listener.on("hold", () => {
			this.clearLockTimer();
		});

		listener.on("lock", () => {
			this.clearLockTimer();
			this.state.clear();
		});

		listener.on("set", () => {
			wasFloating = floating;
			floating = this.state.isFloating();
		});

		listener.on("hardDrop", () => {
			this.start();
		});

		const handler = (_: any, ok: boolean) => {
			if (ok && !wasFloating) {
				this.stalls++;
				if (this.lockTimer) this.clearLockTimer();
				if (this.stalls >= this.maxStalls && !this.state.isFloating()) {
					this.stalls = 0;
					this.state.lock();
					this.state.spawn();
				}
			}
		};

		listener.on("slide", handler);
		listener.on("rotate", handler);
	}

	clearLockTimer() {
		clearTimeout(this.lockTimer);
		this.lockTimer = null;
	}

	tick(immediate = false, fall = this.fall) {
		this.tickTimer = setTimeout(() => this.tick(true, fall), fall);
		if (!immediate) return;
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
