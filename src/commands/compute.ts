import { HashTaskRange } from '../hash-task-range';
import { Command } from './command';

export class ComputeCommand extends Command {

    constructor(
        public hashTaskRange: HashTaskRange,
        public masterId: string,
    ) {
        super('compute');
    }

}
