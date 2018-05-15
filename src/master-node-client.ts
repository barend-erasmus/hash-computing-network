import * as uuid from 'uuid';
import { MessageQueueClient } from 'wsmq';
import { CommandBuilder } from './command-builder';
import { Command } from './commands/command';
import { ComputeCommand } from './commands/compute';
import { ComputeResultCommand } from './commands/compute-result';
import { JoinCommand } from './commands/join';
import { PingCommand } from './commands/ping';
import { HashTaskRange } from './hash-task-range';
import { MasterNode } from './master-node';

export class MasterNodeClient {

    protected commandBuilder: CommandBuilder = null;

    protected id: string = null;

    protected masterNode: MasterNode = null;

    protected messageQueueClient: MessageQueueClient = null;

    constructor() {
        this.commandBuilder = new CommandBuilder();

        this.id = uuid.v4();

        this.masterNode = new MasterNode(
            5000,
            10000,
            (answer: string, result: string) => this.onHashTaskSolved(answer, result),
            (hashTaskRange: HashTaskRange, workerProcess: string) => this.sendHashRangeTask(hashTaskRange, workerProcess),
            20000,
        );

        this.messageQueueClient = new MessageQueueClient(
            'ws://wsmq.openservices.co.za',
            (channel: string, data: any, messageQueueClient: MessageQueueClient) => this.onMessage(channel, data, messageQueueClient),
            [
                `hash-computing-network-master-${this.id}`,
            ]);
    }

    public async start(): Promise<void> {
        await this.messageQueueClient.connect();

        setInterval(() => {
            this.messageQueueClient.send('hash-computing-network', new PingCommand(this.id));
            this.masterNode.tick();
        }, 7000);
    }

    protected sendHashRangeTask(hashTaskRange: HashTaskRange, workerProcess: string): void {
        this.messageQueueClient.send(`hash-computing-network-slave-${workerProcess}`, new ComputeCommand(hashTaskRange, this.id));
    }

    protected onHashTaskSolved(answer: string, result: string): void {
        console.log(`Solved '${result}': '${answer}'`);
    }

    protected onMessage(channel: string, data: any, messageQueueClient: MessageQueueClient): void {
        const command: Command = this.commandBuilder.build(data);

        if (command instanceof ComputeResultCommand) {
            const computeResultCommand: ComputeResultCommand = command as ComputeResultCommand;

            this.masterNode.addCompletedHashTaskRange(computeResultCommand.hashTaskAnswer, computeResultCommand.hashTaskRange);
        }

        if (command instanceof JoinCommand) {
            const joinCommand: JoinCommand = command as JoinCommand;

            const addWorkerProcessResult: boolean = this.masterNode.addWorkerProcess(joinCommand.slaveId);
        }
    }

}

const masterNodeClient: MasterNodeClient = new MasterNodeClient();

masterNodeClient.start();
