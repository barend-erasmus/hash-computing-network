import * as uuid from 'uuid';
import { MessageQueueClient } from 'wsmq';
import { CommandBuilder } from './command-builder';
import { Command } from './commands/command';
import { ComputeCommand } from './commands/compute';
import { ComputeResultCommand } from './commands/compute-result';
import { JoinCommand } from './commands/join';
import { PingCommand } from './commands/ping';
import { SlaveNode } from './slave-node';

export class SlaveNodeClient {

    protected commandBuilder: CommandBuilder = null;

    protected id: string = null;

    protected slaveNode: SlaveNode = null;

    protected messageQueueClient: MessageQueueClient = null;

    constructor() {
        this.commandBuilder = new CommandBuilder();

        this.id = uuid.v4();

        this.slaveNode = new SlaveNode();

        this.messageQueueClient = new MessageQueueClient(
            'ws://wsmq.openservices.co.za',
            (channel: string, data: any, messageQueueClient: MessageQueueClient) => this.onMessage(channel, data, messageQueueClient),
            [
                `hash-computing-network`,
                `hash-computing-network-slave-${this.id}`,
            ]);
    }

    public async start(): Promise<void> {
        await this.messageQueueClient.connect();
    }

    protected onMessage(channel: string, data: any, messageQueueClient: MessageQueueClient): void {
        const command: Command = this.commandBuilder.build(data);

        if (command instanceof ComputeCommand) {
            const computeCommand: ComputeCommand = command as ComputeCommand;

            const answer: string = this.slaveNode.computeHashTaskRange(computeCommand.hashTaskRange);

            const computeResultCommand: ComputeResultCommand = new ComputeResultCommand(answer, computeCommand.hashTaskRange);

            this.messageQueueClient.send(`hash-computing-network-master-${computeCommand.masterId}`, computeResultCommand);
        }

        if (command instanceof PingCommand) {
            const pingCommand: PingCommand = command as PingCommand;

            const joinCommand: JoinCommand = new JoinCommand(this.id);

            this.messageQueueClient.send(`hash-computing-network-master-${pingCommand.masterId}`, joinCommand);
        }
    }
}

const slaveNodeClient: SlaveNodeClient = new SlaveNodeClient();

slaveNodeClient.start();
