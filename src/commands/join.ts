import { Command } from './command';

export class JoinCommand extends Command {

    constructor(
        public slaveId: string,
    ) {
        super('join');
    }

}
