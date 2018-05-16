"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compute_1 = require("./commands/compute");
const compute_result_1 = require("./commands/compute-result");
const join_1 = require("./commands/join");
const ping_1 = require("./commands/ping");
const hash_task_range_1 = require("./hash-task-range");
class CommandBuilder {
    constructor() {
    }
    build(obj) {
        switch (obj.type) {
            case 'compute-result':
                return new compute_result_1.ComputeResultCommand(obj.hashTaskAnswer, new hash_task_range_1.HashTaskRange(obj.hashTaskRange.end, obj.hashTaskRange.hash, obj.hashTaskRange.start));
            case 'compute':
                return new compute_1.ComputeCommand(new hash_task_range_1.HashTaskRange(obj.hashTaskRange.end, obj.hashTaskRange.hash, obj.hashTaskRange.start), obj.masterId);
            case 'join':
                return new join_1.JoinCommand(obj.slaveId);
            case 'ping':
                return new ping_1.PingCommand(obj.masterId);
            default:
                throw new Error('Unsupported command type');
        }
    }
}
exports.CommandBuilder = CommandBuilder;
//# sourceMappingURL=command-builder.js.map