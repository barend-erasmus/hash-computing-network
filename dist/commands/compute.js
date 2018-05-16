"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
class ComputeCommand extends command_1.Command {
    constructor(hashTaskRange, masterId) {
        super('compute');
        this.hashTaskRange = hashTaskRange;
        this.masterId = masterId;
    }
}
exports.ComputeCommand = ComputeCommand;
//# sourceMappingURL=compute.js.map