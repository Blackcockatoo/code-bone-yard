import { describe, it, expect } from 'vitest';
import { initPRNG, prng, createPRNG, type PRNGState } from '../prng';

describe('prng', () => {
  describe('initPRNG - Initialize PRNG state', () => {
    it('should create valid state from seed', () => {
      const state = initPRNG(12345n);
      expect(state.s0).toBeGreaterThan(0n);
      expect(state.s1).toBeGreaterThan(0n);
    });

    it('should create different states for different seeds', () => {
      const state1 = initPRNG(111n);
      const state2 = initPRNG(222n);
      expect(state1.s0).not.toBe(state2.s0);
      expect(state1.s1).not.toBe(state2.s1);
    });

    it('should be deterministic for same seed', () => {
      const state1 = initPRNG(999n);
      const state2 = initPRNG(999n);
      expect(state1.s0).toBe(state2.s0);
      expect(state1.s1).toBe(state2.s1);
    });

    it('should handle zero seed', () => {
      const state = initPRNG(0n);
      expect(state.s0).toBeGreaterThan(0n);
      expect(state.s1).toBeGreaterThan(0n);
    });
  });

  describe('prng - Generate random number', () => {
    it('should return number between 0 and 1', () => {
      const state = initPRNG(555n);
      const value = prng(state);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });

    it('should mutate state after each call', () => {
      const state = initPRNG(777n);
      const originalS0 = state.s0;
      const originalS1 = state.s1;

      prng(state);

      expect(state.s0).not.toBe(originalS0);
      expect(state.s1).not.toBe(originalS1);
    });

    it('should generate different values on successive calls', () => {
      const state = initPRNG(888n);
      const values = [prng(state), prng(state), prng(state), prng(state), prng(state)];

      // All values should be different (statistically extremely likely)
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(5);
    });

    it('should generate reproducible sequence from same initial state', () => {
      const state1 = initPRNG(123456n);
      const state2 = initPRNG(123456n);

      const seq1 = [prng(state1), prng(state1), prng(state1)];
      const seq2 = [prng(state2), prng(state2), prng(state2)];

      expect(seq1).toEqual(seq2);
    });
  });

  describe('createPRNG - Create stateful random function', () => {
    it('should create a function that returns numbers 0-1', () => {
      const random = createPRNG(111n);
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });

    it('should maintain state across calls', () => {
      const random = createPRNG(222n);
      const values = [random(), random(), random()];

      // All different
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(3);
    });

    it('should be deterministic from same seed', () => {
      const random1 = createPRNG(333n);
      const random2 = createPRNG(333n);

      const seq1 = [random1(), random1(), random1()];
      const seq2 = [random2(), random2(), random2()];

      expect(seq1).toEqual(seq2);
    });

    it('should produce different sequences from different seeds', () => {
      const random1 = createPRNG(100n);
      const random2 = createPRNG(200n);

      const seq1 = [random1(), random1(), random1()];
      const seq2 = [random2(), random2(), random2()];

      expect(seq1).not.toEqual(seq2);
    });
  });

  describe('Statistical Properties', () => {
    it('should have good distribution (chi-square test)', () => {
      const random = createPRNG(999999n);
      const buckets = new Array(10).fill(0);
      const sampleSize = 10000;

      for (let i = 0; i < sampleSize; i++) {
        const value = random();
        const bucket = Math.floor(value * 10);
        buckets[bucket]++;
      }

      // Each bucket should have ~1000 samples (±20%)
      const expected = sampleSize / 10;
      for (const count of buckets) {
        expect(count).toBeGreaterThan(expected * 0.8);
        expect(count).toBeLessThan(expected * 1.2);
      }
    });

    it('should pass basic randomness test', () => {
      const random = createPRNG(777777n);
      let above = 0;
      let below = 0;

      for (let i = 0; i < 1000; i++) {
        if (random() > 0.5) above++;
        else below++;
      }

      // Should be roughly equal (within 30%)
      expect(Math.abs(above - below)).toBeLessThan(300);
    });

    it('should not have obvious patterns', () => {
      const random = createPRNG(555555n);
      const values = Array.from({ length: 100 }, () => random());

      // Check no value repeats in first 100
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(100);

      // Check no obvious ascending/descending pattern
      let ascending = 0;
      let descending = 0;
      for (let i = 1; i < values.length; i++) {
        if (values[i] > values[i - 1]) ascending++;
        else descending++;
      }
      // Should be roughly balanced
      expect(Math.abs(ascending - descending)).toBeLessThan(30);
    });
  });

  describe('Integration - Genome-based Randomness', () => {
    it('should create consistent random sequences from genome', () => {
      // Simulate genome seed: red60=15, blue60=30, black60=45
      const genomeSeed = 15_30_45n;
      const random1 = createPRNG(genomeSeed);
      const random2 = createPRNG(genomeSeed);

      const seq1 = Array.from({ length: 10 }, () => random1());
      const seq2 = Array.from({ length: 10 }, () => random2());

      expect(seq1).toEqual(seq2);
    });

    it('should create different sequences for different genomes', () => {
      const genome1 = 15_30_45n; // red=15, blue=30, black=45
      const genome2 = 15_30_46n; // red=15, blue=30, black=46

      const random1 = createPRNG(genome1);
      const random2 = createPRNG(genome2);

      const seq1 = Array.from({ length: 10 }, () => random1());
      const seq2 = Array.from({ length: 10 }, () => random2());

      expect(seq1).not.toEqual(seq2);
    });

    it('should enable reproducible breeding outcomes', () => {
      // Parent genomes
      const parent1 = 10_20_30n;
      const parent2 = 40_50_59n;

      // Breeding seed combines parents
      const breedSeed = parent1 * 1000000n + parent2;

      const random1 = createPRNG(breedSeed);
      const random2 = createPRNG(breedSeed);

      // Simulate breeding decisions
      const offspring1 = {
        red: Math.floor(random1() * 60),
        blue: Math.floor(random1() * 60),
        black: Math.floor(random1() * 60),
      };

      const offspring2 = {
        red: Math.floor(random2() * 60),
        blue: Math.floor(random2() * 60),
        black: Math.floor(random2() * 60),
      };

      expect(offspring1).toEqual(offspring2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle maximum BigInt seed', () => {
      const maxSeed = (1n << 64n) - 1n;
      const state = initPRNG(maxSeed);
      expect(() => prng(state)).not.toThrow();
    });

    it('should handle rapid successive calls', () => {
      const random = createPRNG(12345n);
      expect(() => {
        for (let i = 0; i < 10000; i++) {
          random();
        }
      }).not.toThrow();
    });

    it('should maintain precision over long sequences', () => {
      const random = createPRNG(99999n);

      // Generate 1000 values
      for (let i = 0; i < 1000; i++) {
        const value = random();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
        expect(Number.isFinite(value)).toBe(true);
      }
    });
  });
});
