/**
 * Deterministic PRNG (Xorshift128+)
 * Provides reproducible random numbers from a seed
 * Part of MetaPet v8 Core Engine
 */

import { mix64 } from './hash';

export interface PRNGState {
  s0: bigint;
  s1: bigint;
}

/**
 * Initialize PRNG state from a seed
 */
export function initPRNG(seed: bigint): PRNGState {
  return {
    s0: mix64(seed),
    s1: mix64(seed ^ 0xA5A5A5A5A5A5A5A5n),
  };
}

/**
 * Generate next random number (0-1)
 * Mutates the state object
 */
export function prng(state: PRNGState): number {
  let x = state.s0;
  const y = state.s1;
  state.s0 = y;
  x ^= x << 23n;
  x ^= x >> 17n;
  x ^= y ^ (y >> 26n);
  state.s1 = x;
  const sum = (state.s0 + state.s1) & ((1n << 64n) - 1n);
  return Number(sum) / 18446744073709551616;
}

/**
 * Create a stateful PRNG function from a seed
 * Returns a function that generates random numbers 0-1
 *
 * @example
 * const random = createPRNG(12345n);
 * random(); // 0.234...
 * random(); // 0.891...
 */
export function createPRNG(seed: bigint): () => number {
  const state = initPRNG(seed);
  return () => prng(state);
}
