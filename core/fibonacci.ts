/**
 * Fast Fibonacci and Lucas number calculations
 * O(log n) complexity using matrix doubling
 * Part of MetaPet v8 Core Engine
 */

export type Bigish = bigint | number;

/**
 * Fast Fibonacci calculation using matrix doubling
 * Returns [F(n), F(n+1)] for the nth Fibonacci number
 *
 * Complexity: O(log n)
 *
 * @example
 * fibFast(10) // [55n, 89n]
 */
export function fibFast(n: Bigish): [bigint, bigint] {
  const fn = (k: bigint): [bigint, bigint] => {
    if (k === 0n) return [0n, 1n];
    const [a, b] = fn(k >> 1n);
    const c = a * ((b << 1n) - a);
    const d = a * a + b * b;
    if ((k & 1n) === 0n) return [c, d];
    return [d, c + d];
  };

  const index = typeof n === "bigint"
    ? (n < 0n ? 0n : n)
    : BigInt(Math.max(0, Math.floor(n)));

  return fn(index);
}

/**
 * Get the nth Fibonacci number
 *
 * @example
 * fib(10) // 55n
 */
export function fib(n: number): bigint {
  return fibFast(n)[0];
}

/**
 * Get the nth Lucas number
 * Lucas sequence: 2, 1, 3, 4, 7, 11, 18, 29, ...
 * Formula: L(n) = 2*F(n+1) - F(n)
 *
 * @example
 * lucas(6) // 18n
 */
export function lucas(n: number): bigint {
  if (n === 0) return 2n;
  const N = Math.max(0, n);
  const [Fn, Fnp1] = fibFast(N);
  return 2n * Fnp1 - Fn;
}
