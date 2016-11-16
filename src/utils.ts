export function isNumber(x: any): x is number {
    return typeof x === "number";
}

export function isString(x: any): x is string {
    return typeof x === "string";
}

export function numDigits(x) {
    return ((Math.log(((x ^ (x >> 31)) - (x >> 31)) | 0) + 1) * Math.LOG10E);
}

export function reverseStr(str: string) {
    return str.split('').reverse().join('');
}
