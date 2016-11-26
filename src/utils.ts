export function numDigits(x) {
    return ((Math.log(((x ^ (x >> 31)) - (x >> 31)) | 0) + 1) * Math.LOG10E);
}

export function reverseStr(str: string) {
    return str.split('').reverse().join('');
}

export function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

export function padZeroes(num, digits) {
    let str = String(num);
    let len = str.length;
    let arr = Array(Math.max(digits - len + 1, 0)).join('0');
    return arr + str;
}
