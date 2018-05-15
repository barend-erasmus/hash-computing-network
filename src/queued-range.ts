import { Range } from './range';

export class QueuedRange extends Range {

    constructor(end: string, start: string, public timestamp: Date) {
        super(end, start);
    }

}
