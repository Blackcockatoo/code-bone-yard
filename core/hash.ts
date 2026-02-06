/**
 * Cryptographic-quality hash functions for genome generation
 * Part of MetaPet v8 Core Engine
 */

export type Bigish = bigint | number;

/**
 * Mix64 - 64-bit avalanche hash function
 * Provides cryptographic-quality dispersion for genome seeds
 */
export function mix64(x0: Bigish): bigint {
  let x = BigInt(x0) ^ 0x9E3779B97F4A7C15n;
  x ^= x >> 30n;
  x *= 0xBF58476D1CE4E5B9n;
  x ^= x >> 27n;
  x *= 0x94D049BB133111EBn;
  x ^= x >> 31n;
  return x & ((1n << 64n) - 1n);
}

/**
 * Base10 to hex conversion using avalanche mixing
 */
export function base10ToHex(digitStr: string): string {
  const table = "0123456789abcdef".split("");
  let h = "";
  let acc = 0;
  for (let i = 0; i < digitStr.length; i++) {
    acc = (acc * 17 + (digitStr.charCodeAt(i) - 48)) >>> 0;
    h += table[(acc ^ (i * 7)) & 15];
  }
  return h;
}

/**
 * Interleave three strings character by character
 * Used for creating master genome signature from R/K/B sequences
 */
export function interleave3(a: string, b: string, c: string): string {
  const n = Math.min(a.length, b.length, c.length);
  let out = "";
  for (let i = 0; i < n; i++) {
    out += a[i] + b[i] + c[i];
  }
  return out;
}
