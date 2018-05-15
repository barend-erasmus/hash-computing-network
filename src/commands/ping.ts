import { Command } from './command';

export class PingCommand extends Command {

    constructor(
        public masterId: string,
    ) {
        super('ping');
    }

}
