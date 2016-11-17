import {BigInt} from './bigint';

// let bigint = new BigInt('345678901234567');

// console.log(bigint.toString('-'));

// let b1 = new BigInt('123457878788');
// console.log('b1: ' + b1.toString('-'));
// let b2 = new BigInt('312178542');
// console.log('b2: ' + b2.toString('-'));
// let b3 = new BigInt('0');
// console.log('b3: ' + b3.toString('-'));

// console.log(BigInt.add(b1, b2).toString());

// console.log('multed b2');
// console.log(BigInt.multiply(b1, b2).toString());

// console.log(BigInt.compare(new BigInt('123456789'),
//                                new BigInt('123456769')));

// console.log(BigInt.halve(b2).toString());
console.log(BigInt.exponent(
    new BigInt('19956534'), new BigInt('10101')).toString());

// console.log(BigInt.subtract(
//     new BigInt('9343254543423'), new BigInt('546439573289')
// ).toString())

// console.log(BigInt.karatsuba(
//     new BigInt('2343247359837425074357293475'), new BigInt('2385974302758947325743')
// ).toString())
