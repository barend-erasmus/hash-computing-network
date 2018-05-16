"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const range_1 = require("./range");
class QueuedRange extends range_1.Range {
    constructor(end, start, timestamp) {
        super(end, start);
        this.timestamp = timestamp;
    }
}
exports.QueuedRange = QueuedRange;
//# sourceMappingURL=queued-range.js.map