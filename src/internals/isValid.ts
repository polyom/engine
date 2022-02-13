import { Matrix, Shape } from "../types";

export function isValid(cx: number, cy: number, shape: Shape, board: Matrix) {
	return shape.every(([x, y]) => {
		const bx = x + cx,
			by = y + cy;
		if (bx < 0 || bx >= board[0].length) return false;
		if (by < 0) return true;
		return by < board.length && board[by][bx] < 0;
	});
}
