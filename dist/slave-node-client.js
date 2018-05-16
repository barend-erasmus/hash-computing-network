"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid");
const wsmq_1 = require("wsmq");
const command_builder_1 = require("./command-builder");
const compute_1 = require("./commands/compute");
const compute_result_1 = require("./commands/compute-result");
const join_1 = require("./commands/join");
const ping_1 = require("./commands/ping");
const slave_node_1 = require("./slave-node");
class SlaveNodeClient {
    constructor() {
        this.commandBuilder = null;
        this.id = null;
        this.slaveNode = null;
        this.messageQueueClient = null;
        this.commandBuilder = new command_builder_1.CommandBuilder();
        this.id = uuid.v4();
        this.slaveNode = new slave_node_1.SlaveNode();
        this.messageQueueClient = new wsmq_1.MessageQueueClient('ws://wsmq.openservices.co.za', (channel, data, messageQueueClient) => this.onMessage(channel, data, messageQueueClient), [
            `hash-computing-network`,
            `hash-computing-network-slave-${this.id}`,
        ]);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.messageQueueClient.connect();
        });
    }
    onMessage(channel, data, messageQueueClient) {
        const command = this.commandBuilder.build(data);
        if (command instanceof compute_1.ComputeCommand) {
            const computeCommand = command;
            const answer = this.slaveNode.computeHashTaskRange(computeCommand.hashTaskRange);
            const computeResultCommand = new compute_result_1.ComputeResultCommand(answer, computeCommand.hashTaskRange);
            this.messageQueueClient.send(`hash-computing-network-master-${computeCommand.masterId}`, computeResultCommand);
        }
        if (command instanceof ping_1.PingCommand) {
            const pingCommand = command;
            const joinCommand = new join_1.JoinCommand(this.id);
            this.messageQueueClient.send(`hash-computing-network-master-${pingCommand.masterId}`, joinCommand);
        }
    }
}
exports.SlaveNodeClient = SlaveNodeClient;
const slaveNodeClient = new SlaveNodeClient();
slaveNodeClient.start();
//# sourceMappingURL=slave-node-client.js.map