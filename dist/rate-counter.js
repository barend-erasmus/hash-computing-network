"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RateCounter {
    constructor(windowSizeInSeconds) {
        this.windowSizeInSeconds = windowSizeInSeconds;
        this.currentTimestamp = null;
        this.currentValue = null;
        this.previousTimestamp = null;
        this.previousValue = null;
        this.currentTimestamp = new Date();
        this.currentValue = 0;
    }
    get() {
        if (!this.previousTimestamp) {
            return null;
        }
        return this.previousValue / this.windowSizeInSeconds;
    }
    increment(value) {
        if (this.currentTimestamp.getTime() + (this.windowSizeInSeconds * 1000) < new Date().getTime()) {
            this.previousTimestamp = this.currentTimestamp;
            this.previousValue = this.currentValue;
            this.currentTimestamp = new Date();
            this.currentValue = 0;
        }
        this.currentValue += value;
    }
}
exports.RateCounter = RateCounter;
//# sourceMappingURL=rate-counter.js.map