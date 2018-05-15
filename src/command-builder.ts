import { Command } from './commands/command';
import { ComputeCommand } from './commands/compute';
import { ComputeResultCommand } from './commands/compute-result';
import { JoinCommand } from './commands/join';
import { PingCommand } from './commands/ping';
import { HashTaskRange } from './hash-task-range';

export class CommandBuilder {

    constructor() {

    }

    public build(obj: any): Command {
        switch (obj.type) {
            case 'compute-result':
                return new ComputeResultCommand(obj.hashTaskAnswer, new HashTaskRange(obj.hashTaskRange.end, obj.hashTaskRange.hash, obj.hashTaskRange.start));
            case 'compute':
                return new ComputeCommand(new HashTaskRange(obj.hashTaskRange.end, obj.hashTaskRange.hash, obj.hashTaskRange.start), obj.masterId);
            case 'join':
                return new JoinCommand(obj.slaveId);
            case 'ping':
                return new PingCommand(obj.masterId);
            default:
                throw new Error('Unsupported command type');
        }
    }

}
