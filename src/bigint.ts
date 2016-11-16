import {Chunk} from './chunk';

function isNumber(x: any): x is number {
    return typeof x === "number";
}

function isString(x: any): x is string {
    return typeof x === "string";
}

function numDigits(x) {
    return ((Math.log(((x ^ (x >> 31)) - (x >> 31)) | 0) + 1) * Math.LOG10E);
}

export class BigInteger {
    _repr: Chunk[];
    _chunkCnt: number;

    constructor (val: string | number) {
        this._repr = [];
        this._chunkCnt = 0;

        if (isNumber(val) || isString(val)) {
            // Create a new bigint from this

            let strVal: string;
            if (isNumber(val)) {
                strVal = val.toString().split('').reverse().join('');
            } else {
                strVal = val.split('').reverse().join('');
            }

            let length = strVal.length;
            for (let i=0; i<length; i+=Chunk.size) {
                this.addChunk(
                    (strVal.substr(i, Chunk.size)).split('').reverse().join(''));
            }

        } else {
            throw new TypeError('Bad type for BigInteger constructor');
        }
    }

    /* Print the chunks nicely, with optional delimiter
     * @delimiter: string? Optional delimiter to print between chunks
     */
    toString(delimiter: string = ''): string {
        let retval = this._repr.reverse().map(x => x.toString()).join(delimiter);
        this._repr.reverse();
        return retval;
    }

    /* Adds a new chunk of value val to the bigint
     * Warning, very horryfing behavarior with 0 passed as int
     * Prefer to use string.
     * @val: number | string Value (len<10) to be added to chunk
     */
    addChunk(val: number | string) {
        if (isNumber(val)) {
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

    // Stores product of n1, n2 in itself
    multiply(n1: BigInteger,
             n2: BigInteger) {

        this._repr = [];
        this._chunkCnt = 0;

        for (let i=0; i<n2._chunkCnt; i++) {

            let plier = n2._repr[i];
            for (let j=0; j<n1._chunkCnt; j++) {
                let [res, rcar] =
                    Chunk.multiply(n1._repr[j], plier);
                this._addToChunk(j+i, res, 0);

                let addingTo = j+i+1;
                while (rcar !== 0) {
                    rcar = this._addToChunk(addingTo, 0, rcar);
                    addingTo++
                }
            }
        }
    }
}
