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

    // Mods the complete chunk over @modNum
    mod(modNum: number) {
        this._bits %= modNum;
    }

    toString(): string {
        return this._bits.toString();
    }
}
