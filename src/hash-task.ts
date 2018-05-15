import * as BigNumber from 'big-number';
import { CompletedRange } from './complete-range';
import { QueuedRange } from './queued-range';
import { Range } from './range';

export class HashTask {

    public answer: string = null;

    protected completedRanges: CompletedRange[] = null;

    protected queuedRanges: QueuedRange[] = null;

    constructor(
        public hash: string,
        protected rangeExpiry: number,
        protected rangeSize: number,
    ) {
        this.completedRanges = [];

        this.queuedRanges = [];
    }

    public addCompletedRange(completedRange: CompletedRange): void {
        this.completedRanges.push(completedRange);

        const queuedRange: QueuedRange = this.queuedRanges.find((x: QueuedRange) => x.end === completedRange.end && x.start === completedRange.start);

        if (queuedRange) {
            const index: number = this.queuedRanges.indexOf(queuedRange);

            if (index > -1) {
                this.queuedRanges.splice(index, 1);
            }
        }
    }

    public getNextRange(): Range {
        const expiredRange: QueuedRange = this.getExpiredRange();

        if (expiredRange) {
            return new Range(expiredRange.end, expiredRange.start);
        }

        let range: QueuedRange = null;

        if (this.queuedRanges.length === 0) {
            if (this.completedRanges.length === 0) {
                range = new QueuedRange(this.rangeSize.toString(), '0', new Date());
            } else {
                const lastCompletedRange: Range = this.completedRanges[this.completedRanges.length - 1];

                range = new QueuedRange(BigNumber(lastCompletedRange.end).add(1).add(this.rangeSize).toString(), BigNumber(lastCompletedRange.end).add(1).toString(), new Date());
            }
        } else {
            const lastQueuedRange: Range = this.queuedRanges[this.queuedRanges.length - 1];

            range = new QueuedRange(BigNumber(lastQueuedRange.end).add(1).add(this.rangeSize).toString(), BigNumber(lastQueuedRange.end).add(1).toString(), new Date());
        }

        this.queuedRanges.push(range);

        return range;
    }

    public setAnswer(answer: string): void {
        this.answer = answer;
    }

    protected getExpiredRange(): QueuedRange {
        for (const range of this.queuedRanges) {
            if (range.timestamp.getTime() + this.rangeExpiry < new Date().getTime()) {
                range.timestamp = new Date();

                return range;
            }
        }

        return null;
    }

}
