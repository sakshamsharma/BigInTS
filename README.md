BigInTS
=======

As the name says, this library is meant to serve as a clean (and easy-to-use ?) BigInteger implementation written completely in TypeScript. This gives you the benefits of compiling your code to ES3, ES5, whichever one you choose, among other things.

The code is well typed, and small (4KB without minification). There is some major scope for performance improvements (see the performance section).

### Currently implemented functionality:

* `BigInt.add(num1, num2)`
* `BigInt.subtract(num1, num2)`[1]
* `BigInt.slowmultiply(num1, num2)`
* `BigInt.karatsuba(num1, num2)`[2]
* `BigInt.exponent(num1, num2)`
* `BigInt.compare(num1, num2)`
* `BigInt.mod2(num)`

### Notes:
* [1]: Subtraction does not work for negative results yet
* [2]: Karatsuba is a much faster implementation of multiplication, and automatically falls back to normal multiplication for small values. It is the recommended way for multiplication. Refer to [WikiPedia](https://en.wikipedia.org/wiki/Karatsuba_algorithm) for the description.

### Performance:
The performance is *bearable* (well, not). Python, of course, works much faster. But regardless, the test used is:

```
BigInt.exponent(new BigInt('19956534'), new BigInt('10101'));
```

Time taken:
* Python: Less than a microsecond
* BigInTS: Approx 1000ms

Expect comparisions with other JS libraries in the near future.

### TODO
* modulo
* powerMod
* Negative number handling
* Benchmarks
* NPM test script
* `js` minification
