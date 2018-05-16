"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BigNumber = require("big-number");
const queued_range_1 = require("./queued-range");
const range_1 = require("./range");
class HashTask {
    constructor(hash, rangeExpiry, rangeSize) {
        this.hash = hash;
        this.rangeExpiry = rangeExpiry;
        this.rangeSize = rangeSize;
        this.answer = null;
        this.completedRanges = null;
        this.queuedRanges = null;
        this.completedRanges = [];
        this.queuedRanges = [];
    }
    addCompletedRange(completedRange) {
        this.completedRanges.push(completedRange);
        const queuedRange = this.queuedRanges.find((x) => x.end === completedRange.end && x.start === completedRange.start);
        if (queuedRange) {
            const index = this.queuedRanges.indexOf(queuedRange);
            if (index > -1) {
                this.queuedRanges.splice(index, 1);
            }
        }
    }
    getNextRange() {
        const expiredRange = this.getExpiredRange();
        if (expiredRange) {
            return new range_1.Range(expiredRange.end, expiredRange.start);
        }
        let range = null;
        if (this.queuedRanges.length === 0) {
            if (this.completedRanges.length === 0) {
                range = new queued_range_1.QueuedRange(this.rangeSize.toString(), '0', new Date());
            }
            else {
                const lastCompletedRange = this.completedRanges[this.completedRanges.length - 1];
                range = new queued_range_1.QueuedRange(BigNumber(lastCompletedRange.end).add(1).add(this.rangeSize).toString(), BigNumber(lastCompletedRange.end).add(1).toString(), new Date());
            }
        }
        else {
            const lastQueuedRange = this.queuedRanges[this.queuedRanges.length - 1];
            range = new queued_range_1.QueuedRange(BigNumber(lastQueuedRange.end).add(1).add(this.rangeSize).toString(), BigNumber(lastQueuedRange.end).add(1).toString(), new Date());
        }
        this.queuedRanges.push(range);
        return range;
    }
    setAnswer(answer) {
        this.answer = answer;
    }
    getExpiredRange() {
        for (const range of this.queuedRanges) {
            if (range.timestamp.getTime() + this.rangeExpiry < new Date().getTime()) {
                range.timestamp = new Date();
                return range;
            }
        }
        return null;
    }
}
exports.HashTask = HashTask;
//# sourceMappingURL=hash-task.js.map