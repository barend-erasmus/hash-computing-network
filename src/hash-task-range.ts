import { Range } from './range';

export class HashTaskRange extends Range {

    constructor(
        end: string,
        public hash: string,
        start: string,
    ) {
        super(end, start);
    }

}
