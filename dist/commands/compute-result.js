"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
class ComputeResultCommand extends command_1.Command {
    constructor(hashTaskAnswer, hashTaskRange) {
        super('compute-result');
        this.hashTaskAnswer = hashTaskAnswer;
        this.hashTaskRange = hashTaskRange;
    }
}
exports.ComputeResultCommand = ComputeResultCommand;
//# sourceMappingURL=compute-result.js.map