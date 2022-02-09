"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromConfig = void 0;
function fromConfig({ board: size, pieces, kickStore = {}, spawns }, seed) {
    const parsedPieces = pieces.map(({ shape, kicks, offset: [ox, oy] = [0, 0] }) => ({
        kicks: typeof kicks === "string" ? kickStore[kicks] : kicks,
        shapes: [0, 0, 0, 0].map(() => {
            const v = [];
            shape.forEach((r, y) => r.forEach((c, x) => c && v.push([x + ox, y + oy])));
            shape = shape[0].map((_, i) => shape.map((r) => r[i]).reverse());
            return v;
        }),
    }));
    return [size[0], size[1], parsedPieces, spawns, seed];
}
exports.fromConfig = fromConfig;
//# sourceMappingURL=fromConfig.js.map