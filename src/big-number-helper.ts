import * as BigNumber from 'big-number';

export class BigNumberHelper {

    public static toString(baseCharacters: string[], value: BigNumber): string {
        let result: string = '';
        const targetBase: number = baseCharacters.length;

        do {
            const index: number = parseInt(BigNumber(value.toString()).mod(targetBase).toString(), undefined);

            result = baseCharacters[index] + result;

            value = BigNumber(value.toString()).divide(targetBase);
        } while (value.gt(0));

        return result;
    }
}
