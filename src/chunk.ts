import {sign, padZeroes} from './utils';

export class Chunk {
    static size: number = 7;
    static max: number = Math.pow(10, Chunk.size);

    _bits: number;

    constructor (val: string) {
        if (val.length > Chunk.size) {
            console.error(val);
            throw new Error('Too long a number for a chunk');
        } else {
            this._bits = Number(val);
        }
    }

    set(val: number) {
        this._bits = val;
    }

    add(value: number, carry: number) {
        this._bits += (value + carry);
        let returnCarry = Math.floor(this._bits / Chunk.max);
        this._bits %= Chunk.max;
        return returnCarry;
    }

    subtract(value: number, carry: number): number {
        this._bits -= (value + carry);
        let rcar = 0;
        if (this._bits < 0) {
            rcar = 1;
            this._bits += Chunk.max;
        }
        return rcar;
    }

    multiply(c2: Chunk): number {
        this._bits *= c2._bits;

        let returnCarry = Math.floor(this._bits / Chunk.max);
        this._bits %= Chunk.max;

        return returnCarry;
    }

    static multiply(c1: Chunk, c2: Chunk): [number, number] {
        let result = c1._bits * c2._bits;
        let returnCarry = Math.floor(result / Chunk.max);
        result %= Chunk.max;
        return [result, returnCarry];
    }

    static halve(ch: Chunk, car: number): [number, number] {
        let val = ch._bits + Chunk.max * car;
        let res = Math.floor(val / 2);
        let rcar = Math.round(val % 2);
        return [res, rcar];
    }

    static compare(c1: Chunk, c2: Chunk): number {
        return sign(c1._bits-c2._bits);
    }

    // Mods the complete chunk over @modNum
    mod(modNum: number) {
        this._bits %= modNum;
    }

    toString(): string {
        return padZeroes(this._bits, Chunk.size);
    }
}
