import { Controller, Engine } from "../src";
import { tetromino } from "./tetromino";

const engine = new Engine(...tetromino);
const { width, height } = engine;

const size = 25;

const [holdCanvas, boardCanvas, queueCanvas] =
	document.querySelectorAll("canvas");
boardCanvas.width = width * size;
boardCanvas.height = height * size;
holdCanvas.width = holdCanvas.height = 4 * size;
queueCanvas.width = 4 * size;
queueCanvas.height = 3 * 4 * size;

const hold = holdCanvas.getContext("2d");
const board = boardCanvas.getContext("2d");
const queue = queueCanvas.getContext("2d");

engine.fall = 1000;

// @ts-ignore
window.engine = engine;
engine.spawn();
engine.start();

const controller = new Controller(engine, {
	das: 150,
	arr: 50,
	dcd: 6,
	crt: true,
	sdf: 10,
});

window.onkeydown = ({ key }) => {
	switch (key) {
		case "ArrowLeft":
			return controller.startSlideLeft();
		case "ArrowRight":
			return controller.startSlideRight();
		case "c":
			return controller.startHold();
		case " ":
			return controller.startHardDrop();
		case "ArrowUp":
		case "z":
			return controller.startRotateRight();
		case "x":
			return controller.startRotateLeft();
		case "ArrowDown":
			return controller.startSoftDrop();
		default:
			console.log(key);
	}
};

window.onkeyup = ({ key }) => {
	switch (key) {
		case "ArrowLeft":
			return controller.stopSlideLeft();
		case "ArrowRight":
			return controller.stopSlideRight();
		case "ArrowDown":
			return controller.stopSoftDrop();
		case "ArrowUp":
		case "z":
			return controller.stopRotateRight();
		case "x":
			return controller.stopRotateLeft();
		case "c":
			return controller.stopHold();
		case " ":
			return controller.stopHardDrop();
	}
};

function color(id: number) {
	return `hsl(${(id / engine.pieces.length) * 360}, 100%, 85%)`;
}

function drawShape(
	ctx: CanvasRenderingContext2D,
	ox: number,
	oy: number,
	id: number,
	d: number,
	ghost = false
) {
	const shape = engine.shape(id, d);
	if (ghost) {
		ctx.strokeStyle = color(id);
		for (let [x, y] of shape) {
			ctx.strokeRect((x + ox) * size, (y + oy) * size, size, size);
		}
	} else {
		ctx.fillStyle = color(id);
		for (let [x, y] of shape) {
			ctx.fillRect((x + ox) * size, (y + oy) * size, size, size);
		}
	}
}

function render() {
	hold.fillStyle = "#000";
	board.fillStyle = "#000";
	queue.fillStyle = "#000";
	hold.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
	board.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
	queue.fillRect(0, 0, queueCanvas.width, queueCanvas.height);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const id = engine.board[y][x];
			if (id >= 0) {
				board.fillStyle = color(id);
				board.fillRect(x * size, y * size, size, size);
			}
		}
	}
	drawShape(board, engine.x, engine.ghostY, engine.i, engine.d, true);
	drawShape(board, engine.x, engine.y, engine.i, engine.d);
	engine.queue.slice(0, 3).forEach((id, i) => {
		drawShape(queue, 0, i * 4, id, 0);
	});
	if (engine.held >= 0) {
		drawShape(hold, 0, 0, engine.held, 0);
	}
	requestAnimationFrame(render);
}

render();
