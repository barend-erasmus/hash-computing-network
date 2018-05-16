"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BigNumber = require("big-number");
const majuro_1 = require("majuro");
const big_number_helper_1 = require("./big-number-helper");
class SlaveNode {
    constructor() {
    }
    computeHashTaskRange(hashTaskRange) {
        const hashAlgorithm = new majuro_1.MD5();
        let value = BigNumber(hashTaskRange.start);
        const endValue = BigNumber(hashTaskRange.end);
        while (value.lte(endValue)) {
            const str = big_number_helper_1.BigNumberHelper.toString('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split(''), value);
            if (hashAlgorithm.calculate(str).toLowerCase() === hashTaskRange.hash.toLowerCase()) {
                return str;
            }
            value = value.add(1);
        }
        return null;
    }
}
exports.SlaveNode = SlaveNode;
//# sourceMappingURL=slave-node.js.map