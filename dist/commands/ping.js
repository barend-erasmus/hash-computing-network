"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
class PingCommand extends command_1.Command {
    constructor(masterId) {
        super('ping');
        this.masterId = masterId;
    }
}
exports.PingCommand = PingCommand;
//# sourceMappingURL=ping.js.map