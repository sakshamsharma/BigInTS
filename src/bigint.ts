import * as Utils from './utils';
import {Chunk} from './chunk';

/* Provides common big integer functions for use in JS
 * @val: string | number | BigInteger | [number, Chunk[]]
 * Requires a number, string, BigInteger, or a list of chunks
 * to initialize the integer
 */
export class BigInteger {
    _repr: Chunk[];
    _chunkCnt: number;

    constructor (val: string | number | BigInteger | [number, Chunk[]]) {
        this._repr = [];
        this._chunkCnt = 0;

        if ((Utils.isNumber(val) || Utils.isString(val))) {
            // Create a new bigint from this

            let strVal: string;
            if (Utils.isNumber(val)) {
                strVal = Utils.reverseStr(val.toString());
            } else {
                strVal = Utils.reverseStr(val);
            }

            let length = strVal.length;
            for (let i=0; i<length; i+=Chunk.size) {
                this.addChunk(
                    (strVal.substr(i, Chunk.size)).split('').reverse().join(''));
            }

        } else if (val instanceof BigInteger) {
            // BUG: Does not copy even now
            this._repr = val._repr.slice(); // Copy it, not refer
            this._chunkCnt = val._chunkCnt;
        } else if (val instanceof Array) {
            this._repr = val[1].slice();
            this._chunkCnt = val[0];
        } else {
            throw new TypeError('Bad type for BigInteger constructor');
        }
    }

    /* Print the chunks nicely, with optional delimiter
     * @delimiter: string? Optional delimiter to print between chunks
     */
    toString(delimiter: string = ''): string {
        let retval = this._repr.reverse().
            map(x => x.toString()).join(delimiter).replace(/^0+/, '');;
        if (retval == '') {
            retval = '0';
        }
        this._repr.reverse();
        return retval;
    }

    /* Adds a new chunk of value val to the bigint
     * Warning, very horryfing behavarior with 0 passed as int
     * Prefer to use string.
     * @val: number | string Value (len<10) to be added to chunk
     */
    addChunk(val: number | string) {
        if (Utils.isNumber(val)) {
            this._repr.push(new Chunk((Math.floor(val)).toString()));
        } else {
            this._repr.push(new Chunk(val));
        }
        this._chunkCnt += 1;
    }

    private _addToChunk(index: number, value: number, carry: number) {
        while (index >= this._chunkCnt) {
            this.addChunk('0');
        }

        return this._repr[index].add(value, carry)
    }

    splitChunks(countInOne: number): [BigInteger, BigInteger] {
        if (countInOne >= this._chunkCnt) {
            return [new BigInteger([this._chunkCnt, this._repr]),
                    new BigInteger('0')];
        }

        let h = new BigInteger([this._chunkCnt - countInOne,
                                this._repr.slice(countInOne)]);
        let l = new BigInteger([countInOne,
                                this._repr.slice(0, countInOne)]);

        return [h, l];
    }

    shiftChunks(count: number) {
        let result = new BigInteger(this);
        result._repr = BigInteger.powTen(count).concat(this._repr);
        result._chunkCnt += count;
        return result;
    }

    /* Adds a big integer to this integer
     * @b2: BigInteger The number to be added to this
     */
    add(b2: BigInteger) {
        let lastCarry = 0;
        for (let i=0; i<b2._chunkCnt; i++) {
            lastCarry = this._addToChunk(i, b2._repr[i]._bits, lastCarry);
        }

        let addingTo = b2._chunkCnt;
        while (lastCarry !== 0) {
            lastCarry = this._addToChunk(addingTo, 0, lastCarry);
            addingTo++;
        }
    }

    subtract(b2: BigInteger) {
        if (BigInteger.compare(this, b2) == -1) {
            throw new Error('Subtract big from small not implemented');
        }

        let lastCarry = 0;
        let i = 0;
        for (i=0; i<b2._chunkCnt; i++) {
            lastCarry = this._repr[i].subtract(b2._repr[i]._bits, lastCarry);
        }

        while (lastCarry != 0) {
            lastCarry = this._repr[i].subtract(0, lastCarry);
            i++;
        }

        while (this._repr[this._chunkCnt-1]._bits == 0) {
            this._repr.pop();
            this._chunkCnt--;

            if (this._chunkCnt == 0) {
                break;
            }
        }
    }

    static add(b1: BigInteger, b2: BigInteger): BigInteger {
        let result = new BigInteger('0');
        result.add(b1);
        result.add(b2);
        return result;
    }

    static subtract(b1: BigInteger, b2: BigInteger): BigInteger {
        let result = new BigInteger(b1);
        result.subtract(b2);
        return result;
    }

    /* Stores product of n1, n2 in itself
     * @n1: BigInteger The first number in the product
     * @n2: BigInteger Second number in the product
     */
    multiply(n1: BigInteger,
             n2: BigInteger) {

        this._repr = [];
        this._chunkCnt = 0;

        for (let i=0; i<n2._chunkCnt; i++) {

            let plier = n2._repr[i];
            for (let j=0; j<n1._chunkCnt; j++) {
                let [res, rcar] =
                    Chunk.multiply(n1._repr[j], plier);

                rcar += this._addToChunk(j+i, res, 0);

                let addingTo = j+i+1;
                while (rcar !== 0) {
                    rcar = this._addToChunk(addingTo, 0, rcar);
                    addingTo++
                }
            }
        }
    }

    static multiply(b1: BigInteger, b2: BigInteger): BigInteger {
        let result = new BigInteger([0, []]);
        result.multiply(b1, b2);
        return result;
    }

    static karatsuba(num1: BigInteger, num2: BigInteger): BigInteger {
        // From: https://en.wikipedia.org/wiki/Karatsuba_algorithm

        if (num1._chunkCnt <= 30 || num2._chunkCnt <= 30) {
            return (BigInteger.multiply(num1, num2));
        }

        let m = Math.round(Math.max(num1._chunkCnt, num2._chunkCnt)/2);

        let [h1, l1] = num1.splitChunks(m);
        let [h2, l2] = num2.splitChunks(m);

        let z0 = BigInteger.karatsuba(l1, l2);
        let z1 = BigInteger.karatsuba(BigInteger.add(l1, h1), BigInteger.add(l2, h2));
        let z2 = BigInteger.karatsuba(h1, h2);

        // (z2*10^(2*m2))+((z1-z2-z0)*10^(m2))+(z0)
        return BigInteger.add(
            z0,
            BigInteger.add(
                z2.shiftChunks(2*m),
                BigInteger.subtract(z1, BigInteger.add(z2, z0)).shiftChunks(m)
            )
        );
    }

    static powTen(count: number): Chunk[] {
        return Array.apply(null, Array(count)).map(function(){return new Chunk('0')});
    }

    static exponent(n: BigInteger, power: BigInteger): BigInteger {
        if (power.toString() === '0') {
            return new BigInteger('1');
        } else if (power.toString() === '1') {
            return new BigInteger(n);
        } else if (power.toString() === '2') {
            return BigInteger.karatsuba(n, n);
        }

        let b1 = BigInteger.exponent(n, BigInteger.halve(power));
        let b2 = BigInteger.karatsuba(b1, b1);

        if (BigInteger.mod2(power) == 1) {
            return BigInteger.multiply(b2, n);
        } else {
            return b2;
        }
    }

    static halve(n: BigInteger) {
        let result = new BigInteger([0, []]);
        let lastCarry = 0;
        let lastRes;
        for (let i=n._chunkCnt-1; i>=0; i--) {
            [lastRes, lastCarry] = Chunk.halve(n._repr[i], lastCarry);
            if (lastRes == 0 && i == n._chunkCnt-1) {
                continue;
            }
            result._addToChunk(i, lastRes, 0);
        }
        return result;
    }

    /* Takes two BigInts, and compares them.
     * Returns 1 if n1>n2, -1 if n2>n1, 0 if n1==n2
     * @n1: BigInteger First number
     * @n2: BigInteger Second number
     */
    static compare(n1: BigInteger, n2: BigInteger): number {
        if (n1._chunkCnt > n2._chunkCnt) return 1;
        else if (n1._chunkCnt < n2._chunkCnt) return -1;

        for (let i=n1._chunkCnt-1; i>=0; i--) {
            let res = Chunk.compare(n1._repr[i], n2._repr[i]);
            if (res != 0) {
                return res;
            }
        }
        return 0;
    }

    static mod2(n: BigInteger): number {
        if (n._chunkCnt == 0) {
            throw new Error('Modulo of empty BigInteger');
        }
        return Math.floor(n._repr[0]._bits % 2);
    }
}
