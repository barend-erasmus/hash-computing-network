"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash_task_1 = require("./hash-task");
const hash_task_range_1 = require("./hash-task-range");
const range_1 = require("./range");
const rate_counter_1 = require("./rate-counter");
const worker_process_1 = require("./worker-process");
class MasterNode {
    constructor(rangeExpiry, rangeSize, onHashTaskSolved, sendHashTaskRange, workerProcessExpiry) {
        this.rangeExpiry = rangeExpiry;
        this.rangeSize = rangeSize;
        this.onHashTaskSolved = onHashTaskSolved;
        this.sendHashTaskRange = sendHashTaskRange;
        this.workerProcessExpiry = workerProcessExpiry;
        this.hashTasks = null;
        this.rateCounter = null;
        this.workerProcesses = null;
        this.hashTasks = [];
        this.rateCounter = new rate_counter_1.RateCounter(10);
        this.workerProcesses = [];
    }
    addCompletedHashTaskRange(answer, hashTaskRange) {
        for (const hashTask of this.hashTasks) {
            if (hashTask.hash.toLowerCase() === hashTaskRange.hash.toLowerCase()) {
                hashTask.addCompletedRange(new range_1.Range(hashTaskRange.end, hashTaskRange.start));
                const previousRate = this.rateCounter.get();
                this.rateCounter.increment(this.rangeSize);
                const currentRate = this.rateCounter.get();
                if (currentRate !== previousRate) {
                    console.log(`${this.rateCounter.get()} hashes per second`);
                }
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
    addHashTask(hash) {
        this.hashTasks.push(new hash_task_1.HashTask(hash, this.rangeExpiry, this.rangeSize));
    }
    addWorkerProcess(workerProcessId) {
        const existingWorkerProcess = this.workerProcesses.find((workerProcess) => workerProcess.id === workerProcessId);
        if (existingWorkerProcess) {
            existingWorkerProcess.joinCommandTimestamp = new Date();
            return false;
        }
        this.workerProcesses.push(new worker_process_1.WorkerProcess(workerProcessId, new Date()));
        return true;
    }
    getNumberOfWorkerProcessess() {
        return this.workerProcesses.length;
    }
    tick() {
        this.workerProcesses = this.workerProcesses.filter((workerProcess) => workerProcess.joinCommandTimestamp.getTime() > new Date().getTime() - this.workerProcessExpiry);
        for (const workerProcess of this.workerProcesses) {
            const hashTaskRange = this.getNextHashTaskRange();
            if (hashTaskRange && this.sendHashTaskRange) {
                if (this.sendHashTaskRange) {
                    this.sendHashTaskRange(hashTaskRange, workerProcess.id);
                }
            }
        }
    }
    getNextHashTaskRange() {
        for (const hashTask of this.hashTasks) {
            if (!hashTask.answer) {
                const range = hashTask.getNextRange();
                return new hash_task_range_1.HashTaskRange(range.end, hashTask.hash, range.start);
            }
        }
        return null;
    }
}
exports.MasterNode = MasterNode;
//# sourceMappingURL=master-node.js.map