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
const master_node_1 = require("./master-node");
class MasterNodeClient {
    constructor(onHashTaskSolved) {
        this.onHashTaskSolved = onHashTaskSolved;
        this.commandBuilder = null;
        this.id = null;
        this.masterNode = null;
        this.messageQueueClient = null;
        this.commandBuilder = new command_builder_1.CommandBuilder();
        this.id = uuid.v4();
        this.masterNode = new master_node_1.MasterNode(5000, 10000, (answer, result) => this.onHashTaskSolved(answer, result), (hashTaskRange, workerProcess) => this.sendHashRangeTask(hashTaskRange, workerProcess), 20000);
        this.messageQueueClient = new wsmq_1.MessageQueueClient('ws://wsmq.openservices.co.za', (channel, data, messageQueueClient) => this.onMessage(channel, data, messageQueueClient), [
            `hash-computing-network-master-${this.id}`,
        ]);
    }
    addHashTask(hash) {
        this.masterNode.addHashTask(hash);
    }
    getNumberOfWorkerProcesses() {
        return this.masterNode.getNumberOfWorkerProcessess();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.messageQueueClient.connect();
            setInterval(() => {
                this.messageQueueClient.send('hash-computing-network', new ping_1.PingCommand(this.id));
                this.masterNode.tick();
            }, 7000);
        });
    }
    sendHashRangeTask(hashTaskRange, workerProcess) {
        this.messageQueueClient.send(`hash-computing-network-slave-${workerProcess}`, new compute_1.ComputeCommand(hashTaskRange, this.id));
    }
    onMessage(channel, data, messageQueueClient) {
        const command = this.commandBuilder.build(data);
        if (command instanceof compute_result_1.ComputeResultCommand) {
            const computeResultCommand = command;
            this.masterNode.addCompletedHashTaskRange(computeResultCommand.hashTaskAnswer, computeResultCommand.hashTaskRange);
        }
        if (command instanceof join_1.JoinCommand) {
            const joinCommand = command;
            const addWorkerProcessResult = this.masterNode.addWorkerProcess(joinCommand.slaveId);
        }
    }
}
exports.MasterNodeClient = MasterNodeClient;
//# sourceMappingURL=master-node-client.js.map