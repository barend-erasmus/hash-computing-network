"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BigNumber = require("big-number");
class BigNumberHelper {
    static toString(baseCharacters, value) {
        let result = '';
        const targetBase = baseCharacters.length;
        do {
            const index = parseInt(BigNumber(value.toString()).mod(targetBase).toString(), undefined);
            result = baseCharacters[index] + result;
            value = BigNumber(value.toString()).divide(targetBase);
        } while (value.gt(0));
        return result;
    }
}
exports.BigNumberHelper = BigNumberHelper;
//# sourceMappingURL=big-number-helper.js.map