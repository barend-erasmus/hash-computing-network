"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
class JoinCommand extends command_1.Command {
    constructor(slaveId) {
        super('join');
        this.slaveId = slaveId;
    }
}
exports.JoinCommand = JoinCommand;
//# sourceMappingURL=join.js.map