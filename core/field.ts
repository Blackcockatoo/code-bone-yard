/**
 * MossPrimeSeed Field - The foundational quantum field for all Guardians
 * Provides genome sequences, hash functions, PRNG, and Fibonacci calculations
 * Part of MetaPet v8 Core Engine
 */

import { toDigits, RED_SEQUENCE, BLACK_SEQUENCE, BLUE_SEQUENCE } from '@/lib/genome';
import { mix64, base10ToHex, interleave3 } from './hash';
import { fib, lucas } from './fibonacci';
import { createPRNG } from './prng';

export interface MossPrimeField {
  seed: string;
  red: string;
  black: string;
  blue: string;
  ring: number[];
  pulse: number[];
  hash: (msg: string) => bigint;
  prng: () => number;
  fib: (n: number) => bigint;
  lucas: (n: number) => bigint;
}

/**
 * Initialize a MossPrimeSeed field for a Guardian
 *
 * @param seedName - Unique name/identifier for the Guardian
 * @returns Complete field with sequences, hash, PRNG, and Fibonacci functions
 *
 * @example
 * const field = initField("AURALIA");
 * field.prng(); // 0.123...
 * field.hash("test"); // 12345678901234567890n
 * field.fib(10); // 55n
 */
export function initField(seedName: string = "AURALIA"): MossPrimeField {
  const red = RED_SEQUENCE;
  const black = BLACK_SEQUENCE;
  const blue = BLUE_SEQUENCE;

  const r = toDigits(red);
  const k = toDigits(black);
  const b = toDigits(blue);

  // Pulse: XOR combination of all three sequences
  const pulse = r.map((rv, i) =>
    (rv ^ k[(i * 7) % 60] ^ b[(i * 13) % 60]) % 10
  );

  // Ring: Sum combination (mod 10)
  const ring = Array.from({ length: 60 }, (_, i) =>
    (r[i] + k[i] + b[i]) % 10
  );

  // Create master seed from interleaved sequences + name
  const seedStr = interleave3(red, black, blue);
  const seedBI = BigInt("0x" + base10ToHex(seedStr + seedName));

  // Initialize PRNG
  const prngFn = createPRNG(seedBI);

  // Hash function bound to this field's seed
  const hashFn = (msg: string): bigint => {
    let h = seedBI;
    for (let i = 0; i < msg.length; i++) {
      h = mix64(h ^ (BigInt(msg.charCodeAt(i)) + BigInt(i) * 1315423911n));
    }
    return h;
  };

  return {
    seed: seedName,
    red,
    black,
    blue,
    ring,
    pulse,
    hash: hashFn,
    prng: prngFn,
    fib,
    lucas,
  };
}
