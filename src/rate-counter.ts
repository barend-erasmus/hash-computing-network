export class RateCounter {

    protected currentTimestamp: Date = null;

    protected currentValue: number = null;

    protected previousTimestamp: Date = null;

    protected previousValue: number = null;

    constructor(protected windowSizeInSeconds) {
        this.currentTimestamp = new Date();

        this.currentValue = 0;
    }

    public get(): number {
        if (!this.previousTimestamp) {
            return null;
        }

        return this.previousValue / this.windowSizeInSeconds;
    }

    public increment(value: number): void {
        if (this.currentTimestamp.getTime() + (this.windowSizeInSeconds * 1000) < new Date().getTime()) {
            this.previousTimestamp = this.currentTimestamp;
            this.previousValue = this.currentValue;

            this.currentTimestamp = new Date();
            this.currentValue = 0;
        }

        this.currentValue += value;
    }

}
