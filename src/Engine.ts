import { Listener } from ".";
import { State } from "./State";

export class Engine extends Listener<State> {
	tickTimer = null as any;
	lockTimer = null as any;

	constructor(
		public state: State,
		public fall = 1000,
		public lockDelay = 500,
	) {
		super(state);
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

		this.on("hardDrop", () => {
			this.start();
		});

		const handler = (_: any, ok: boolean) => {
			if (ok && !wasFloating) {
				if (this.lockTimer) this.clearLockTimer();
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
