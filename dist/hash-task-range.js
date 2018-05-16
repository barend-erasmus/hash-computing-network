"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const range_1 = require("./range");
class HashTaskRange extends range_1.Range {
    constructor(end, hash, start) {
        super(end, start);
        this.hash = hash;
    }
}
exports.HashTaskRange = HashTaskRange;
//# sourceMappingURL=hash-task-range.js.map