export type PrivTuple = [number, number, number];
export type PubTuple = [number, number];

export function RandGen(): number {
    return Math.random();
}

export function GenPrivate(): PrivTuple {
    return [RandGen(), RandGen(), RandGen()];
}
