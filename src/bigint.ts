import * as Utils from './utils';
import {Chunk} from './chunk';

/* Provides common big integer functions for use in JS
 * @val: string | number | BigInt | [number, Chunk[]]
 * Requires a number, string, BigInt, or a list of chunks
 * to initialize the integer
 */
export class BigInt {
    _chunks: number[];
    _cntChunk: number;

    constructor (val: string | number | BigInt | [number, number[]]) {
        this._chunks = [];
        this._cntChunk = 0;

        if (Utils.isString(val)) {
            // Create a new bigint from this

            let strVal = Utils.reverseStr(val);

            let length = strVal.length;
            for (let i=0; i<length; i+=Chunk.size) {
                this._chunks.push(parseInt(
                    (strVal.substr(i, Chunk.size)).split('').reverse().join('')));
                this._cntChunk += 1;
            }
        } else if (Utils.isNumber(val)) {
            if (val < Chunk.max) {
                this._cntChunk = 1;
                this._chunks = [val];
            } else {
                throw new Error(val.toString() + ': Too large an initializer');
            }
        } else if (val instanceof BigInt) {
            this._chunks = val._chunks.slice(); // Copy it, not refer
            this._cntChunk = val._cntChunk;
        } else if (val instanceof Array) {
            this._chunks = val[1].slice();
            this._cntChunk = val[0];
        } else {
            throw new TypeError('Bad type for BigInt constructor');
        }
    }

    /* Print the chunks nicely, with optional delimiter
     * @delimiter: string? Optional delimiter to print between chunks
     */
    toString(delimiter: string = ''): string {
        let retval = this._chunks.reverse().
            map(x => Chunk.toString(x)).join(delimiter).replace(/^0+/, '');;
        if (retval == '') {
            retval = '0';
        }
        this._chunks.reverse();
        return retval;
    }

    private _addToChunk(index: number, value: number, carry: number) {
        while (index >= this._cntChunk) {
            this._chunks.push(0);
            this._cntChunk += 1;
        }

        let rcar: number;
        [this._chunks[index], rcar] =
            Chunk.add(this._chunks[index], value, carry);
        return rcar;
    }

    /* Adds a big integer to this integer
     * @b2: BigInt The number to be added to this
     */
    add(b2: BigInt) {
        let lastCarry = 0;
        for (let i=0; i<b2._cntChunk; i++) {
            lastCarry = this._addToChunk(i, b2._chunks[i], lastCarry);
        }

        let addingTo = b2._cntChunk;
        while (lastCarry !== 0) {
            lastCarry = this._addToChunk(addingTo, 0, lastCarry);
            addingTo++;
        }
    }

    /* Subtracts a big integer from this integer
     * NOTE: Does not handle cases where result is negative
     * @b2: BigInt The number to be subtracted
     */
    subtract(b2: BigInt) {
        if (BigInt.compare(this, b2) == -1) {
            throw new Error('Subtract big from small not implemented');
        }

        let lastCarry = 0;
        let i = 0;
        for (i=0; i<b2._cntChunk; i++) {
            [this._chunks[i], lastCarry] =
                Chunk.subtract(this._chunks[i], b2._chunks[i], lastCarry);
        }

        while (lastCarry != 0) {
            [this._chunks[i], lastCarry] =
                Chunk.subtract(this._chunks[i], 0, lastCarry);
            i++;
        }

        while (this._chunks[this._cntChunk-1] == 0) {
            this._chunks.pop();
            this._cntChunk--;

            if (this._cntChunk == 0) {
                break;
            }
        }
    }

    /* Stores product of n1, n2 in itself
     * @n1: BigInt The first number in the product
     * @n2: BigInt Second number in the product
     */
    multiply(n1: BigInt,
             n2: BigInt) {

        this._chunks = [];
        this._cntChunk = 0;

        for (let i=0; i<n2._cntChunk; i++) {

            let plier = n2._chunks[i];
            for (let j=0; j<n1._cntChunk; j++) {
                let [res, rcar] =
                    Chunk.multiply(n1._chunks[j], plier);

                rcar += this._addToChunk(j+i, res, 0);

                let addingTo = j+i+1;
                while (rcar !== 0) {
                    rcar = this._addToChunk(addingTo, 0, rcar);
                    addingTo++
                }
            }
        }
    }

    static add(b1: BigInt, b2: BigInt): BigInt {
        let result = new BigInt(b1);
        result.add(b2);
        return result;
    }

    static subtract(b1: BigInt, b2: BigInt): BigInt {
        let result = new BigInt(b1);
        result.subtract(b2);
        return result;
    }

    static slowmultiply(b1: BigInt, b2: BigInt): BigInt {
        let result = new BigInt([0, []]);
        result.multiply(b1, b2);
        return result;
    }

    static karatsuba(num1: BigInt, num2: BigInt): BigInt {
        // From: https://en.wikipedia.org/wiki/Karatsuba_algorithm
        if (num1._cntChunk <= 30 || num2._cntChunk <= 30) {
            return (BigInt.slowmultiply(num1, num2));
        }

        let m = Math.round(Math.max(num1._cntChunk, num2._cntChunk)/2);

        let [h1, l1] = BigInt.splitChunks(num1, m);
        let [h2, l2] = BigInt.splitChunks(num2, m);

        let z0 = BigInt.karatsuba(l1, l2);
        let z1 = BigInt.karatsuba(
            BigInt.add(l1, h1), BigInt.add(l2, h2));
        let z2 = BigInt.karatsuba(h1, h2);

        // (z2*10^(2*m2))+((z1-z2-z0)*10^(m2))+(z0)
        return BigInt.add(
            BigInt.shiftChunks(
                BigInt.add(
                    BigInt.shiftChunks(z2, m),
                    BigInt.subtract(z1, BigInt.add(z2, z0))
                ), m
            ), z0
        );
    }

    static exponent(n: BigInt, power: BigInt): BigInt {
        let powerStr = power.toString(); // Readability :)
        if (powerStr === '0') {
            return new BigInt(1);
        } else if (powerStr === '1') {
            return new BigInt(n);
        } else if (powerStr === '2') {
            return BigInt.karatsuba(n, n);
        }

        let b1 = BigInt.exponent(n, BigInt.halve(power));
        let b2 = BigInt.karatsuba(b1, b1);

        if (BigInt.mod2(power) == 1) {
            return BigInt.karatsuba(b2, n);
        } else {
            return b2;
        }
    }

    static halve(n: BigInt) {
        let result = new BigInt([0, []]);
        let lastCarry = 0;
        let lastRes;
        for (let i=n._cntChunk-1; i>=0; i--) {
            [lastRes, lastCarry] = Chunk.halve(n._chunks[i], lastCarry);
            if (lastRes == 0 && i == n._cntChunk-1) {
                continue;
            }
            result._addToChunk(i, lastRes, 0);
        }
        return result;
    }

    /* Takes two BigInts, and compares them.
     * Returns 1 if n1>n2, -1 if n2>n1, 0 if n1==n2
     * @n1: BigInt First number
     * @n2: BigInt Second number
     */
    static compare(n1: BigInt, n2: BigInt): number {
        if (n1._cntChunk > n2._cntChunk) return 1;
        else if (n1._cntChunk < n2._cntChunk) return -1;

        for (let i=n1._cntChunk-1; i>=0; i--) {
            let res = Chunk.compare(n1._chunks[i], n2._chunks[i]);
            if (res != 0) {
                return res;
            }
        }
        return 0;
    }

    static mod2(n: BigInt): number {
        if (n._cntChunk == 0) {
            throw new Error('Modulo of empty BigInt');
        }
        return Math.floor(n._chunks[0] % 2);
    }

    static splitChunks(item: BigInt,
                       countInOne: number): [BigInt, BigInt] {
        if (countInOne >= item._cntChunk) {
            return [new BigInt([item._cntChunk, item._chunks]),
                    new BigInt('0')];
        }

        let h = new BigInt([item._cntChunk - countInOne,
                                item._chunks.slice(countInOne)]);
        let l = new BigInt([countInOne,
                                item._chunks.slice(0, countInOne)]);

        return [h, l];
    }

    static powTen(count: number): number[] {
        return Array.apply(null, Array(count)).map(x => 0);
    }

    static shiftChunks(item: BigInt, count: number) {
        let result = new BigInt(item);
        result._chunks = BigInt.powTen(count).concat(item._chunks);
        result._cntChunk += count;
        return result;
    }
}
