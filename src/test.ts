import {BigInteger} from './bigint';

let bigint = new BigInteger('345678901234567');

console.log(bigint.toString('-'));

let b1 = new BigInteger('123457878788');
console.log('b1: ' + b1.toString('-'));
let b2 = new BigInteger('10178542');
console.log('b2: ' + b2.toString('-'));
let b3 = new BigInteger('0');
console.log('b3: ' + b3.toString('-'));

b3.multiply(b1, b2);
console.log('multed b2');
console.log(b3.toString(''));

console.log(BigInteger.compare(new BigInteger('123456789'),
                               new BigInteger('123456769')));
