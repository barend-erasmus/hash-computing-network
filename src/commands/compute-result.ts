import { HashTaskRange } from '../hash-task-range';
import { Command } from './command';

export class ComputeResultCommand extends Command {

    constructor(
        public hashTaskAnswer: string,
        public hashTaskRange: HashTaskRange,
    ) {
        super('compute-result');
    }

}
