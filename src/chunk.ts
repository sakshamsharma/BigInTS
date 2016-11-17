import {sign, padZeroes} from './utils';

export class Chunk {
    static size: number = 7;
    static max: number = Math.pow(10, Chunk.size);

    static add(p: number, value: number, carry: number) {
        p += (value + carry);
        let returnCarry = Math.floor(p / Chunk.max);
        p %= Chunk.max;
        return [p, returnCarry];
    }

    static subtract(p: number, value: number, carry: number) {
        p -= (value + carry);
        let rcar = 0;
        if (p < 0) {
            rcar = 1;
            p += Chunk.max;
        }
        return [p, rcar];
    }

    static multiply(c1: number, c2: number): [number, number] {
        let result = c1 * c2;
        let returnCarry = Math.floor(result / Chunk.max);
        result %= Chunk.max;
        return [result, returnCarry];
    }

    static halve(ch: number, car: number): [number, number] {
        let val = ch + Chunk.max * car;
        let res = Math.floor(val / 2);
        let rcar = Math.round(val % 2);
        return [res, rcar];
    }

    static compare(c1: number, c2: number): number {
        return sign(c1-c2);
    }

    static toString(x): string {
        return padZeroes(x, Chunk.size);
    }
}
