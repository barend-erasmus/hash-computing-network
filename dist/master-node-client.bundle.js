(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.App = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compute_1 = require("./commands/compute");
const compute_result_1 = require("./commands/compute-result");
const join_1 = require("./commands/join");
const ping_1 = require("./commands/ping");
const hash_task_range_1 = require("./hash-task-range");
class CommandBuilder {
    constructor() {
    }
    build(obj) {
        switch (obj.type) {
            case 'compute-result':
                return new compute_result_1.ComputeResultCommand(obj.hashTaskAnswer, new hash_task_range_1.HashTaskRange(obj.hashTaskRange.end, obj.hashTaskRange.hash, obj.hashTaskRange.start));
            case 'compute':
                return new compute_1.ComputeCommand(new hash_task_range_1.HashTaskRange(obj.hashTaskRange.end, obj.hashTaskRange.hash, obj.hashTaskRange.start), obj.masterId);
            case 'join':
                return new join_1.JoinCommand(obj.slaveId);
            case 'ping':
                return new ping_1.PingCommand(obj.masterId);
            default:
                throw new Error('Unsupported command type');
        }
    }
}
exports.CommandBuilder = CommandBuilder;

},{"./commands/compute":5,"./commands/compute-result":4,"./commands/join":6,"./commands/ping":7,"./hash-task-range":8}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Command {
    constructor(type) {
        this.type = type;
    }
}
exports.Command = Command;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
class ComputeResultCommand extends command_1.Command {
    constructor(hashTaskAnswer, hashTaskRange) {
        super('compute-result');
        this.hashTaskAnswer = hashTaskAnswer;
        this.hashTaskRange = hashTaskRange;
    }
}
exports.ComputeResultCommand = ComputeResultCommand;

},{"./command":3}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
class ComputeCommand extends command_1.Command {
    constructor(hashTaskRange, masterId) {
        super('compute');
        this.hashTaskRange = hashTaskRange;
        this.masterId = masterId;
    }
}
exports.ComputeCommand = ComputeCommand;

},{"./command":3}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
class JoinCommand extends command_1.Command {
    constructor(slaveId) {
        super('join');
        this.slaveId = slaveId;
    }
}
exports.JoinCommand = JoinCommand;

},{"./command":3}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
class PingCommand extends command_1.Command {
    constructor(masterId) {
        super('ping');
        this.masterId = masterId;
    }
}
exports.PingCommand = PingCommand;

},{"./command":3}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const range_1 = require("./range");
class HashTaskRange extends range_1.Range {
    constructor(end, hash, start) {
        super(end, start);
        this.hash = hash;
    }
}
exports.HashTaskRange = HashTaskRange;

},{"./range":13}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BigNumber = require("big-number");
const queued_range_1 = require("./queued-range");
const range_1 = require("./range");
class HashTask {
    constructor(hash, rangeExpiry, rangeSize) {
        this.hash = hash;
        this.rangeExpiry = rangeExpiry;
        this.rangeSize = rangeSize;
        this.answer = null;
        this.completedRanges = null;
        this.queuedRanges = null;
        this.completedRanges = [];
        this.queuedRanges = [];
    }
    addCompletedRange(completedRange) {
        this.completedRanges.push(completedRange);
        const queuedRange = this.queuedRanges.find((x) => x.end === completedRange.end && x.start === completedRange.start);
        if (queuedRange) {
            const index = this.queuedRanges.indexOf(queuedRange);
            if (index > -1) {
                this.queuedRanges.splice(index, 1);
            }
        }
    }
    getNextRange() {
        const expiredRange = this.getExpiredRange();
        if (expiredRange) {
            return new range_1.Range(expiredRange.end, expiredRange.start);
        }
        let range = null;
        if (this.queuedRanges.length === 0) {
            if (this.completedRanges.length === 0) {
                range = new queued_range_1.QueuedRange(this.rangeSize.toString(), '0', new Date());
            }
            else {
                const lastCompletedRange = this.completedRanges[this.completedRanges.length - 1];
                range = new queued_range_1.QueuedRange(BigNumber(lastCompletedRange.end).add(1).add(this.rangeSize).toString(), BigNumber(lastCompletedRange.end).add(1).toString(), new Date());
            }
        }
        else {
            const lastQueuedRange = this.queuedRanges[this.queuedRanges.length - 1];
            range = new queued_range_1.QueuedRange(BigNumber(lastQueuedRange.end).add(1).add(this.rangeSize).toString(), BigNumber(lastQueuedRange.end).add(1).toString(), new Date());
        }
        this.queuedRanges.push(range);
        return range;
    }
    setAnswer(answer) {
        this.answer = answer;
    }
    getExpiredRange() {
        for (const range of this.queuedRanges) {
            if (range.timestamp.getTime() + this.rangeExpiry < new Date().getTime()) {
                range.timestamp = new Date();
                return range;
            }
        }
        return null;
    }
}
exports.HashTask = HashTask;

},{"./queued-range":12,"./range":13,"big-number":16}],10:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid");
const wsmq_1 = require("wsmq");
const command_builder_1 = require("./command-builder");
const compute_1 = require("./commands/compute");
const compute_result_1 = require("./commands/compute-result");
const join_1 = require("./commands/join");
const ping_1 = require("./commands/ping");
const master_node_1 = require("./master-node");
class MasterNodeClient {
    constructor(onHashTaskSolved) {
        this.onHashTaskSolved = onHashTaskSolved;
        this.commandBuilder = null;
        this.id = null;
        this.masterNode = null;
        this.messageQueueClient = null;
        this.commandBuilder = new command_builder_1.CommandBuilder();
        this.id = uuid.v4();
        this.masterNode = new master_node_1.MasterNode(5000, 7000, (answer, result) => this.onHashTaskSolved(answer, result), (hashTaskRange, workerProcess) => this.sendHashRangeTask(hashTaskRange, workerProcess), 10000);
        this.messageQueueClient = new wsmq_1.MessageQueueClient('wss://wsmq.openservices.co.za', (channel, data, messageQueueClient) => this.onMessage(channel, data, messageQueueClient), [
            `hash-computing-network-master-${this.id}`,
        ]);
    }
    addHashTask(hash) {
        this.masterNode.addHashTask(hash);
    }
    getNumberOfWorkerProcesses() {
        return this.masterNode.getNumberOfWorkerProcessess();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.messageQueueClient.connect();
            setInterval(() => {
                this.messageQueueClient.send('hash-computing-network', new ping_1.PingCommand(this.id));
                this.masterNode.tick();
            }, 5000);
        });
    }
    sendHashRangeTask(hashTaskRange, workerProcess) {
        this.messageQueueClient.send(`hash-computing-network-slave-${workerProcess}`, new compute_1.ComputeCommand(hashTaskRange, this.id));
    }
    onMessage(channel, data, messageQueueClient) {
        const command = this.commandBuilder.build(data);
        if (command instanceof compute_result_1.ComputeResultCommand) {
            const computeResultCommand = command;
            this.masterNode.addCompletedHashTaskRange(computeResultCommand.hashTaskAnswer, computeResultCommand.hashTaskRange);
        }
        if (command instanceof join_1.JoinCommand) {
            const joinCommand = command;
            const addWorkerProcessResult = this.masterNode.addWorkerProcess(joinCommand.slaveId);
        }
    }
}
exports.MasterNodeClient = MasterNodeClient;

},{"./command-builder":2,"./commands/compute":5,"./commands/compute-result":4,"./commands/join":6,"./commands/ping":7,"./master-node":11,"uuid":18,"wsmq":27}],11:[function(require,module,exports){
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
                this.rateCounter.increment(this.rangeSize);
                console.log(`${this.rateCounter.get()} hashes per second`);
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

},{"./hash-task":9,"./hash-task-range":8,"./range":13,"./rate-counter":14,"./worker-process":15}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const range_1 = require("./range");
class QueuedRange extends range_1.Range {
    constructor(end, start, timestamp) {
        super(end, start);
        this.timestamp = timestamp;
    }
}
exports.QueuedRange = QueuedRange;

},{"./range":13}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Range {
    constructor(end, start) {
        this.end = end;
        this.start = start;
    }
}
exports.Range = Range;

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RateCounter {
    constructor(windowSizeInSeconds) {
        this.windowSizeInSeconds = windowSizeInSeconds;
        this.currentTimestamp = null;
        this.currentValue = null;
        this.previousTimestamp = null;
        this.previousValue = null;
        this.currentTimestamp = new Date();
        this.currentValue = 0;
    }
    get() {
        if (!this.previousTimestamp) {
            return null;
        }
        return this.previousValue / this.windowSizeInSeconds;
    }
    increment(value) {
        if (this.currentTimestamp.getTime() + (this.windowSizeInSeconds * 1000) < new Date().getTime()) {
            this.previousTimestamp = this.currentTimestamp;
            this.previousValue = this.currentValue;
            this.currentTimestamp = new Date();
            this.currentValue = 0;
        }
        this.currentValue += value;
    }
}
exports.RateCounter = RateCounter;

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WorkerProcess {
    constructor(id, joinCommandTimestamp) {
        this.id = id;
        this.joinCommandTimestamp = joinCommandTimestamp;
    }
}
exports.WorkerProcess = WorkerProcess;

},{}],16:[function(require,module,exports){
module.exports = require('./lib/big-number');

},{"./lib/big-number":17}],17:[function(require,module,exports){
/*!
 * big-number.js -> Arithmetic operations on big integers
 * Pure javascript implementation, no external libraries needed
 * Copyright(c) 2012-2016 Alex Bardas <alex.bardas@gmail.com>
 * MIT Licensed
 * It supports the following operations:
 *      addition, subtraction, multiplication, division, power, absolute value
 * It works with both positive and negative integers
 */

!(function() {
    'use strict';

    // Helper function which tests if a given character is a digit
    var testDigit = function(digit) {
        return (/^\d$/.test(digit));
    };

    // Helper function which returns the absolute value of a given number
    var abs = function(number) {
        var bigNumber;
        if (typeof number === 'undefined') {
            return;
        }
        bigNumber = BigNumber(number);
        bigNumber.sign = 1;
        return bigNumber;
    };

    // Check if argument is valid array
    var isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };

    var errors = {
        "invalid": "Invalid Number",
        "division by zero": "Invalid Number - Division By Zero"
    };

    // Constructor function which creates a new BigNumber object
    // from an integer, a string, an array or other BigNumber object
    function BigNumber(initialNumber) {
        var index;

        if (!(this instanceof BigNumber)) {
            return new BigNumber(initialNumber);
        }

        this.number = []
        this.sign = 1;
        this.rest = 0;

        if (!initialNumber) {
            this.number = [0];
            return;
        }

        // The initial number can be an array or object
        // e.g. array     : [3,2,1], ['+',3,2,1], ['-',3,2,1]
        //      number    : 312
        //      string    : '321', '+321', -321'
        //      BigNumber : BigNumber(321)
        // Every character except the first must be a digit

        if (isArray(initialNumber)) {
            if (initialNumber.length && initialNumber[0] === '-' || initialNumber[0] === '+') {
                this.sign = initialNumber[0] === '+' ? 1 : -1;
                initialNumber.shift(0);
            }
            for (index = initialNumber.length - 1; index >= 0; index--) {
                if (!this.addDigit(initialNumber[index]))
                    return;
            }
        } else {
            initialNumber = initialNumber.toString();
            if (initialNumber.charAt(0) === '-' || initialNumber.charAt(0) === '+') {
                this.sign = initialNumber.charAt(0) === '+' ? 1 : -1;
                initialNumber = initialNumber.substring(1);
            }

            for (index = initialNumber.length - 1; index >= 0; index--) {
                if (!this.addDigit(parseInt(initialNumber.charAt(index), 10))) {
                    return;
                }
            }
        }
    };

    BigNumber.prototype.addDigit = function(digit) {
        if (testDigit(digit)) {
            this.number.push(digit);
        } else {
            this.number = errors['invalid'];
            return false;
        }

        return this;
    };

    // returns:
    //      0 if this.number === number
    //      -1 if this.number < number
    //      1 if this.number > number
    BigNumber.prototype._compare = function(number) {
        // if the function is called with no arguments then return 0
        var bigNumber;
        var index;
        if (typeof number === 'undefined') {
            return 0;
        }

        bigNumber = BigNumber(number);

        // If the numbers have different signs, then the positive
        // number is greater
        if (this.sign !== bigNumber.sign) {
            return this.sign;
        }

        // Else, check the length
        if (this.number.length > bigNumber.number.length) {
            return this.sign;
        } else if (this.number.length < bigNumber.number.length) {
            return this.sign * (-1);
        }

        // If they have similar length, compare the numbers
        // digit by digit
        for (index = this.number.length - 1; index >= 0; index--) {
            if (this.number[index] > bigNumber.number[index]) {
                return this.sign;
            } else if (this.number[index] < bigNumber.number[index]) {
                return this.sign * (-1);
            }
        }

        return 0;
    };

    // Greater than
    BigNumber.prototype.gt = function(number) {
        return this._compare(number) > 0;
    };

    // Greater than or equal
    BigNumber.prototype.gte = function(number) {
        return this._compare(number) >= 0;
    };

    // this.number equals n
    BigNumber.prototype.equals = function(number) {
        return this._compare(number) === 0;
    };

    // Less than or equal
    BigNumber.prototype.lte = function(number) {
        return this._compare(number) <= 0;
    };

    // Less than
    BigNumber.prototype.lt = function(number) {
        return this._compare(number) < 0;
    };

    // Addition
    BigNumber.prototype.add = function(number) {
        var bigNumber;
        if (typeof number === 'undefined') {
            return this;
        }
        bigNumber = BigNumber(number);

        if (this.sign !== bigNumber.sign) {
            if (this.sign > 0) {
                bigNumber.sign = 1;
                return this.minus(bigNumber);
            }
            else {
                this.sign = 1;
                return bigNumber.minus(this);
            }
        }

        this.number = BigNumber._add(this, bigNumber);
        return this;
    };

    // Subtraction
    BigNumber.prototype.subtract = function(number) {
        var bigNumber;
        if (typeof number === 'undefined') {
            return this;
        }
        bigNumber = BigNumber(number);

        if (this.sign !== bigNumber.sign) {
            this.number = BigNumber._add(this, bigNumber);
            return this;
        }

        // If current number is lesser than the given bigNumber, the result will be negative
        this.sign = (this.lt(bigNumber)) ? -1 : 1;
        this.number = (abs(this).lt(abs(bigNumber)))
            ? BigNumber._subtract(bigNumber, this)
            : BigNumber._subtract(this, bigNumber);

        return this;
    };

    // adds two positive BigNumbers
    BigNumber._add = function(a, b) {
        var index;
        var remainder = 0;
        var length = Math.max(a.number.length, b.number.length);

        for (index = 0; index < length || remainder > 0; index++) {
            a.number[index] = (remainder += (a.number[index] || 0) + (b.number[index] || 0)) % 10;
            remainder = Math.floor(remainder / 10);
        }

        return a.number;
    };

    // a - b
    // a and b are 2 positive BigNumbers and a > b
    BigNumber._subtract = function(a, b) {
        var index;
        var remainder = 0;
        var length = a.number.length;

        for (index = 0; index < length; index++) {
            a.number[index] -= (b.number[index] || 0) + remainder;
            a.number[index] += (remainder = (a.number[index] < 0) ? 1 : 0) * 10;
        }
        // Count the zeroes which will be removed
        index = 0;
        length = a.number.length - 1;
        while (a.number[length - index] === 0 && length - index > 0) {
            index++;
        }
        if (index > 0) {
            a.number.splice(-index);
        }
        return a.number;
    };

    // this.number * number
    BigNumber.prototype.multiply = function(number) {
        if (typeof number === 'undefined') {
            return this;
        }
        var bigNumber = BigNumber(number);
        var index;
        var givenNumberIndex;
        var remainder = 0;
        var result = [];

        if (this.isZero() || bigNumber.isZero()) {
            return BigNumber(0);
        }

        this.sign *= bigNumber.sign;

        // multiply the numbers
        for (index = 0; index < this.number.length; index++) {
            for (remainder = 0, givenNumberIndex = 0; givenNumberIndex < bigNumber.number.length || remainder > 0; givenNumberIndex++) {
                result[index + givenNumberIndex] = (remainder += (result[index + givenNumberIndex] || 0) + this.number[index] * (bigNumber.number[givenNumberIndex] || 0)) % 10;
                remainder = Math.floor(remainder / 10);
            }
        }

        this.number = result;
        return this;
    };

    // this.number / number
    BigNumber.prototype.divide = function(number) {
        if (typeof number === 'undefined') {
            return this;
        }

        var bigNumber = BigNumber(number);
        var index;
        var length;
        var result = [];
        var rest = BigNumber();

        // test if one of the numbers is zero
        if (bigNumber.isZero()) {
            this.number = errors['division by zero'];
            return this;
        } else if (this.isZero()) {
            return BigNumber(0);
        }

        this.sign *= bigNumber.sign;
        bigNumber.sign = 1;

        // Skip division by 1
        if (bigNumber.number.length === 1 && bigNumber.number[0] === 1)
            return this;

        for (index = this.number.length - 1; index >= 0; index--) {
            rest.multiply(10);
            rest.number[0] = this.number[index];
            result[index] = 0;
            while (bigNumber.lte(rest)) {
                result[index]++;
                rest.subtract(bigNumber);
            }
        }

        index = 0;
        length = result.length - 1;
        while (result[length - index] === 0 && length - index > 0) {
            index++;
        }
        if (index > 0) {
            result.splice(-index);
        }

        this.rest = rest;
        this.number = result;
        return this;
    };

    // this.number % number
    BigNumber.prototype.mod = function(number) {
        return this.divide(number).rest;
    };

    BigNumber.prototype.power = function(number) {
        if (typeof number === 'undefined')
            return;
        var bigNumber;
        // Convert the argument to a number
        number = +number;
        if (number === 0) {
            return BigNumber(1);
        }
        if (number === 1) {
            return this;
        }

        bigNumber = BigNumber(this);

        this.number = [1];
        while (number > 0) {
            if (number % 2 === 1) {
                this.multiply(bigNumber);
                number--;
                continue;
            }
            bigNumber.multiply(bigNumber);
            number = Math.floor(number / 2);
        }

        return this;
    };

    // |this.number|
    BigNumber.prototype.abs = function() {
        this.sign = 1;
        return this;
    };

    // Check if this.number is equal to 0
    BigNumber.prototype.isZero = function() {
        var index;
        for (index = 0; index < this.number.length; index++) {
            if (this.number[index] !== 0) {
                return false;
            }
        }

        return true;
    };

    // this.number.toString()
    BigNumber.prototype.toString = function() {
        var index;
        var str = '';
        if (typeof this.number === "string") {
            return this.number;
        }

        for (index = this.number.length - 1; index >= 0; index--) {
            str += this.number[index];
        }

        return (this.sign > 0) ? str : ('-' + str);
    };

    // Use shorcuts for functions names
    BigNumber.prototype.plus = BigNumber.prototype.add;
    BigNumber.prototype.minus = BigNumber.prototype.subtract;
    BigNumber.prototype.div = BigNumber.prototype.divide;
    BigNumber.prototype.mult = BigNumber.prototype.multiply;
    BigNumber.prototype.pow = BigNumber.prototype.power;
    BigNumber.prototype.val = BigNumber.prototype.toString;

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = BigNumber;
    } else if (typeof define === 'function' && define.amd) {
        define(['BigNumber'], BigNumber);
    } else if (typeof window !== 'undefined') {
        window.BigNumber = BigNumber;
    }
})();

},{}],18:[function(require,module,exports){
var v1 = require('./v1');
var v4 = require('./v4');

var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;

module.exports = uuid;

},{"./v1":21,"./v4":22}],19:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

module.exports = bytesToUuid;

},{}],20:[function(require,module,exports){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && msCrypto.getRandomValues.bind(msCrypto));
if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

},{}],21:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;

},{"./lib/bytesToUuid":19,"./lib/rng":20}],22:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":19,"./lib/rng":20}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const publish_1 = require("../commands/publish");
const subscribe_1 = require("../commands/subscribe");
class CommandBuilder {
    constructor() {
    }
    build(obj) {
        switch (obj.type) {
            case 'publish':
                return new publish_1.PublishCommand(obj.channel, obj.data);
            case 'subscribe':
                return new subscribe_1.SubscribeCommand(obj.channel);
            default:
                throw new Error('Unsupported Command');
        }
    }
}
exports.CommandBuilder = CommandBuilder;

},{"../commands/publish":25,"../commands/subscribe":26}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Command {
    constructor(channel, type) {
        this.channel = channel;
        this.type = type;
    }
}
exports.Command = Command;

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
class PublishCommand extends command_1.Command {
    constructor(channel, data) {
        super(channel, 'publish');
        this.data = data;
    }
}
exports.PublishCommand = PublishCommand;

},{"./command":24}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
class SubscribeCommand extends command_1.Command {
    constructor(channel) {
        super(channel, 'subscribe');
    }
}
exports.SubscribeCommand = SubscribeCommand;

},{"./command":24}],27:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./builders/command-builder"));
__export(require("./commands/command"));
__export(require("./commands/publish"));
__export(require("./commands/subscribe"));
__export(require("./models/message-queue-client-connection"));
__export(require("./message-queue-client"));

},{"./builders/command-builder":23,"./commands/command":24,"./commands/publish":25,"./commands/subscribe":26,"./message-queue-client":28,"./models/message-queue-client-connection":29}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const command_builder_1 = require("./builders/command-builder");
const publish_1 = require("./commands/publish");
const subscribe_1 = require("./commands/subscribe");
class MessageQueueClient {
    constructor(host, onMessageFn, subscribedChannels) {
        this.host = host;
        this.onMessageFn = onMessageFn;
        this.subscribedChannels = subscribedChannels;
        this.socket = null;
    }
    connect() {
        return new Promise((resolve, reject) => {
            if (typeof (WebSocket) === 'function') {
                this.socket = new WebSocket(this.host);
            }
            if (typeof (WebSocket) === 'object') {
                this.socket = new window.WebSocket(this.host);
            }
            this.socket.onclose = (closeEvent) => this.onClose(closeEvent);
            this.socket.onmessage = (event) => this.onMessage(event);
            this.socket.onopen = (openEvent) => this.onOpen(openEvent, resolve);
        });
    }
    send(channel, data) {
        this.socket.send(JSON.stringify(new publish_1.PublishCommand(channel, data)));
    }
    onClose(closeEvent) {
        if (closeEvent.code === 1000) {
            return;
        }
        this.connect();
    }
    onMessage(event) {
        const commandBuilder = new command_builder_1.CommandBuilder();
        const command = commandBuilder.build(JSON.parse(event.data));
        if (command instanceof publish_1.PublishCommand) {
            const publishCommand = command;
            if (this.onMessageFn) {
                this.onMessageFn(publishCommand.channel, publishCommand.data, this);
            }
        }
    }
    onOpen(event, callback) {
        if (this.socket.readyState === 1) {
            for (const channel of this.subscribedChannels) {
                const subscribeCommand = new subscribe_1.SubscribeCommand(channel);
                this.socket.send(JSON.stringify(subscribeCommand));
            }
            callback();
        }
    }
}
exports.MessageQueueClient = MessageQueueClient;

},{"./builders/command-builder":23,"./commands/publish":25,"./commands/subscribe":26,"ws":1}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MessageQueueClientConnection {
    constructor(socket, subscribedChannels) {
        this.socket = socket;
        this.subscribedChannels = subscribedChannels;
    }
    subscribe(channel) {
        this.subscribedChannels.push(channel);
    }
}
exports.MessageQueueClientConnection = MessageQueueClientConnection;

},{}]},{},[10])(10)
});
