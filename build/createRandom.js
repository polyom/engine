"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRandom = void 0;
function createRandom([a, b, c, d]) {
    return function () {
        a >>>= 0;
        b >>>= 0;
        c >>>= 0;
        d >>>= 0;
        let t = (a + b) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        d = (d + 1) | 0;
        t = (t + d) | 0;
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    };
}
exports.createRandom = createRandom;
//# sourceMappingURL=createRandom.js.map