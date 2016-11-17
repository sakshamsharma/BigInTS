import {BigInteger} from './bigint';

// let bigint = new BigInteger('345678901234567');

// console.log(bigint.toString('-'));

// let b1 = new BigInteger('123457878788');
// console.log('b1: ' + b1.toString('-'));
// let b2 = new BigInteger('312178542');
// console.log('b2: ' + b2.toString('-'));
// let b3 = new BigInteger('0');
// console.log('b3: ' + b3.toString('-'));

// console.log(BigInteger.add(b1, b2).toString());

// console.log('multed b2');
// console.log(BigInteger.multiply(b1, b2).toString());

// console.log(BigInteger.compare(new BigInteger('123456789'),
//                                new BigInteger('123456769')));

// console.log(BigInteger.halve(b2).toString());
console.log(BigInteger.exponent(
    new BigInteger('19956534'), new BigInteger('10101')).toString());

// console.log(BigInteger.subtract(
//     new BigInteger('9343254543423'), new BigInteger('546439573289')
// ).toString())

// console.log(BigInteger.karatsuba(
//     new BigInteger('2343247359837425074357293475'), new BigInteger('2385974302758947325743')
// ).toString())
