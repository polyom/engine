"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
class Controller {
    engine;
    handling;
    dx = 0;
    arrTimer = null;
    slideLeft = false;
    slideRight = false;
    softDrop = false;
    rotateLeft = false;
    rotateRight = false;
    hold = false;
    hardDrop = false;
    constructor(engine, handling) {
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
        }
        else {
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
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map