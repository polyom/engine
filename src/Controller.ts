import { Engine } from "./Engine";
import { Handling } from "./types";

export class Controller {
	dx = 0;
	arrTimer = null as any;
	slideLeft = false;
	slideRight = false;
	softDrop = false;
	rotateLeft = false;
	rotateRight = false;
	hold = false;
	hardDrop = false;

	constructor(public engine: Engine, public handling: Handling) {}

	startHold() {
		if (this.hold) return;
		this.hold = true;
		return this.engine.hold();
	}

	stopHold() {
		this.hold = false;
	}

	startHardDrop() {
		if (this.hardDrop) return;
		this.hardDrop = true;
		return this.engine.drop();
	}

	stopHardDrop() {
		this.hardDrop = false;
	}

	startSlide(ms = this.handling.das) {
		if (!(this.slideLeft || this.slideRight)) return;
		this.engine.shift(this.dx, 0);
		this.arrTimer = setTimeout(() => this.startSlide(this.handling.arr), ms);
	}

	stopSlide() {
		this.dx = +this.slideRight - +this.slideLeft;
		if (this.slideLeft || this.slideRight) return;
		clearTimeout(this.arrTimer);
	}
	startSlideLeft() {
		if (this.slideLeft) return;
		this.slideLeft = true;
		this.dx = -1;
		this.startSlide();
	}
	startSlideRight() {
		if (this.slideRight) return;
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
		if (this.rotateLeft) return;
		this.rotateLeft = true;
		return this.engine.rotate(-1);
	}
	startRotateRight() {
		if (this.rotateRight) return;
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
		if (this.softDrop) return;
		this.softDrop = true;
		this.engine.start(true, this.engine.fall / this.handling.sdf);
	}
	stopSoftDrop() {
		this.softDrop = false;
		this.engine.start(false);
	}
}
