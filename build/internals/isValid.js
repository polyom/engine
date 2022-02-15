"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValid = void 0;
function isValid(cx, cy, shape, board) {
    return shape.every(([x, y]) => {
        const bx = x + cx, by = y + cy;
        if (bx < 0 || bx >= board[0].length)
            return false;
        if (by < 0)
            return true;
        return by < board.length && board[by][bx] < 0;
    });
}
exports.isValid = isValid;
//# sourceMappingURL=isValid.js.map