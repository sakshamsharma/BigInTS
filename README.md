BigInTS
=======

As the name says, this library is meant to serve as a clean (and easy-to-use ?) BigInteger implementation written completely in TypeScript. This gives you the benefits of compiling your code to ES3, ES5, whichever one you choose, among other things.

The code is well typed, and small (4KB without minification). There is some major scope for performance improvements (see the performance section).

### Currently implemented functionality:

* `BigInteger.add(num1, num2)`
* `BigInteger.subtract(num1, num2)`[1]
* `BigInteger.slowmultiply(num1, num2)`
* `BigInteger.karatsuba(num1, num2)`[2]
* `BigInteger.exponent(num1, num2)`
* `BigInteger.compare(num1, num2)`
* `BigInteger.mod2(num)`

### Notes:
* [1]: Subtraction does not work for negative results yet
* [2]: Karatsuba is a much faster implementation of multiplication, and automatically falls back to normal multiplication for small values. It is the recommended way for multiplication. Refer to [WikiPedia](https://en.wikipedia.org/wiki/Karatsuba_algorithm) for the description.

### Performance:
The performance is *bearable* (well, not). Python, of course, works much faster. But regardless, the test used is:

```
BigInteger.exponent(new BigInteger('19956534'), new BigInteger('10101'));
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
