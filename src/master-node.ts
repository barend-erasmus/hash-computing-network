import { HashTask } from './hash-task';
import { HashTaskRange } from './hash-task-range';
import { Range } from './range';
import { WorkerProcess } from './worker-process';

export class MasterNode {

    protected workerProcesses: WorkerProcess[] = null;

    protected hashTasks: HashTask[] = null;

    constructor(
        protected rangeExpiry: number,
        protected rangeSize: number,
        protected onHashTaskSolved: (answer: string, result: string) => void,
        protected sendHashTaskRange: (hashTaskRange: HashTaskRange, workerProcessId: string) => void,
        protected workerProcessExpiry: number,
    ) {
        this.workerProcesses = [];

        this.hashTasks = [];
    }

    public addCompletedHashTaskRange(answer: string, hashTaskRange: HashTaskRange): void {
        for (const hashTask of this.hashTasks) {
            if (hashTask.hash.toLowerCase() === hashTaskRange.hash.toLowerCase()) {
                hashTask.addCompletedRange(new Range(hashTaskRange.end, hashTaskRange.start));

                if (!hashTask.answer) {
                    hashTask.answer = answer;

                    if (hashTask.answer && this.onHashTaskSolved) {
                        if (this.sendHashTaskRange) {
                            this.onHashTaskSolved(hashTask.answer, hashTask.hash);
                        }
                    }
                }
            }
        }
    }

    public addHashTask(hash: string): void {
        this.hashTasks.push(new HashTask(hash, this.rangeExpiry, this.rangeSize));
    }

    public addWorkerProcess(workerProcessId: string): boolean {
        const existingWorkerProcess: WorkerProcess = this.workerProcesses.find((workerProcess: WorkerProcess) => workerProcess.id === workerProcessId);

        if (existingWorkerProcess) {
            existingWorkerProcess.joinCommandTimestamp = new Date();

            return false;
        }

        this.workerProcesses.push(new WorkerProcess(workerProcessId, new Date()));

        return true;

    }

    public getNumberOfWorkerProcessess(): number {
        return this.workerProcesses.length;
    }

    public tick(): void {
        this.workerProcesses = this.workerProcesses.filter((workerProcess: WorkerProcess) => workerProcess.joinCommandTimestamp.getTime() > new Date().getTime() - this.workerProcessExpiry);

        for (const workerProcess of this.workerProcesses) {
            const hashTaskRange: HashTaskRange = this.getNextHashTaskRange();

            if (hashTaskRange && this.sendHashTaskRange) {
                if (this.sendHashTaskRange) {
                    this.sendHashTaskRange(hashTaskRange, workerProcess.id);
                }
            }
        }
    }

    protected getNextHashTaskRange(): HashTaskRange {
        for (const hashTask of this.hashTasks) {
            if (!hashTask.answer) {
                const range: Range = hashTask.getNextRange();

                return new HashTaskRange(range.end, hashTask.hash, range.start);
            }
        }

        return null;
    }

}
