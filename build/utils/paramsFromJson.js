"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paramsFromJson = void 0;
function paramsFromJson({ size, pieces, kicks: store = {}, spawns, }) {
    const parsed = pieces.map(({ shape, kicks, offset = [0, 0] }) => ({
        offset,
        kicks: typeof kicks === "string" ? store[kicks] : kicks,
        shapes: [0, 0, 0, 0].map(() => {
            const v = [];
            shape.forEach((r, y) => r.forEach((c, x) => c && v.push([x, y])));
            shape = shape[0].map((_, i) => shape.map((r) => r[i]).reverse());
            return v;
        }),
        size: [shape[0].length, shape.length],
    }));
    return [size[0], size[1], parsed, spawns];
}
exports.paramsFromJson = paramsFromJson;
//# sourceMappingURL=paramsFromJson.js.map