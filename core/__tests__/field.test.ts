import { describe, it, expect, beforeEach } from 'vitest';
import { initField, type MossPrimeField } from '../field';

describe('field - MossPrimeSeed Field', () => {
  describe('initField - Field initialization', () => {
    it('should create a field with default seed', () => {
      const field = initField();
      expect(field.seed).toBe('AURALIA');
    });

    it('should create a field with custom seed name', () => {
      const field = initField('CUSTOM');
      expect(field.seed).toBe('CUSTOM');
    });

    it('should have all required properties', () => {
      const field = initField('TEST');
      expect(field).toHaveProperty('seed');
      expect(field).toHaveProperty('red');
      expect(field).toHaveProperty('black');
      expect(field).toHaveProperty('blue');
      expect(field).toHaveProperty('ring');
      expect(field).toHaveProperty('pulse');
      expect(field).toHaveProperty('hash');
      expect(field).toHaveProperty('prng');
      expect(field).toHaveProperty('fib');
      expect(field).toHaveProperty('lucas');
    });

    it('should have 60-digit prime sequences', () => {
      const field = initField();
      expect(field.red.length).toBe(60);
      expect(field.black.length).toBe(60);
      expect(field.blue.length).toBe(60);
    });

    it('should have ring array of length 60', () => {
      const field = initField();
      expect(field.ring).toBeInstanceOf(Array);
      expect(field.ring.length).toBe(60);
    });

    it('should have pulse array of length 60', () => {
      const field = initField();
      expect(field.pulse).toBeInstanceOf(Array);
      expect(field.pulse.length).toBe(60);
    });

    it('should have ring values in range 0-9', () => {
      const field = initField();
      for (const value of field.ring) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(9);
      }
    });

    it('should have pulse values in range 0-9', () => {
      const field = initField();
      for (const value of field.pulse) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(9);
      }
    });
  });

  describe('Field Determinism', () => {
    it('should create identical fields from same seed', () => {
      const field1 = initField('TWIN1');
      const field2 = initField('TWIN1');

      expect(field1.seed).toBe(field2.seed);
      expect(field1.red).toBe(field2.red);
      expect(field1.black).toBe(field2.black);
      expect(field1.blue).toBe(field2.blue);
      expect(field1.ring).toEqual(field2.ring);
      expect(field1.pulse).toEqual(field2.pulse);
    });

    it('should create different fields from different seeds', () => {
      const field1 = initField('UNIQUE1');
      const field2 = initField('UNIQUE2');

      expect(field1.seed).not.toBe(field2.seed);
      // Sequences are the same (from MossPrimeSeed trinity)
      expect(field1.red).toBe(field2.red);
      // But derived values should differ based on seed name
    });

    it('should produce deterministic PRNG sequences', () => {
      const field1 = initField('DETERM');
      const field2 = initField('DETERM');

      const seq1 = [field1.prng(), field1.prng(), field1.prng()];
      const seq2 = [field2.prng(), field2.prng(), field2.prng()];

      expect(seq1).toEqual(seq2);
    });

    it('should produce deterministic hashes', () => {
      const field1 = initField('HASH_TEST');
      const field2 = initField('HASH_TEST');

      const hash1 = field1.hash('test message');
      const hash2 = field2.hash('test message');

      expect(hash1).toBe(hash2);
    });
  });

  describe('Field Functions', () => {
    let field: MossPrimeField;

    beforeEach(() => {
      field = initField('FUNCTION_TEST');
    });

    it('should provide working Fibonacci function', () => {
      expect(field.fib(0)).toBe(0n);
      expect(field.fib(1)).toBe(1n);
      expect(field.fib(10)).toBe(55n);
    });

    it('should provide working Lucas function', () => {
      expect(field.lucas(0)).toBe(2n);
      expect(field.lucas(1)).toBe(1n);
      // L(2) = L(1) + L(0) = 1 + 2 = 3
      expect(field.lucas(2)).toBe(3n);
    });

    it('should provide working PRNG', () => {
      const value = field.prng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });

    it('should provide working hash function', () => {
      const hash = field.hash('test');
      expect(hash).toBeGreaterThan(0n);
    });

    it('should produce different hashes for different messages', () => {
      const hash1 = field.hash('message1');
      const hash2 = field.hash('message2');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce same hash for same message', () => {
      const hash1 = field.hash('repeat');
      const hash2 = field.hash('repeat');
      expect(hash1).toBe(hash2);
    });
  });

  describe('Ring and Pulse Generation', () => {
    it('should create non-zero ring values', () => {
      const field = initField();
      const hasNonZero = field.ring.some((v) => v !== 0);
      expect(hasNonZero).toBe(true);
    });

    it('should create non-zero pulse values', () => {
      const field = initField();
      const hasNonZero = field.pulse.some((v) => v !== 0);
      expect(hasNonZero).toBe(true);
    });

    it('should create varied ring values', () => {
      const field = initField();
      const uniqueValues = new Set(field.ring);
      // Should have at least 3 different digit values
      expect(uniqueValues.size).toBeGreaterThanOrEqual(3);
    });

    it('should create varied pulse values', () => {
      const field = initField();
      const uniqueValues = new Set(field.pulse);
      // Should have at least 3 different digit values
      expect(uniqueValues.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Integration - Guardian Use Cases', () => {
    it('should support unique fields for different Guardians', () => {
      const guardian1 = initField('AURORA');
      const guardian2 = initField('NEBULA');

      // Same source sequences
      expect(guardian1.red).toBe(guardian2.red);
      expect(guardian1.black).toBe(guardian2.black);
      expect(guardian1.blue).toBe(guardian2.blue);

      // Different PRNGs
      const r1 = guardian1.prng();
      const r2 = guardian2.prng();
      expect(r1).not.toBe(r2);

      // Different hashes for same message
      const h1 = guardian1.hash('test');
      const h2 = guardian2.hash('test');
      expect(h1).not.toBe(h2);
    });

    it('should support reproducible behavior', () => {
      const seed = 'REPRODUCIBLE';

      // Create field twice
      const field1 = initField(seed);
      const field2 = initField(seed);

      // Generate 10 random decisions
      const decisions1 = Array.from({ length: 10 }, () => field1.prng() > 0.5);
      const decisions2 = Array.from({ length: 10 }, () => field2.prng() > 0.5);

      expect(decisions1).toEqual(decisions2);
    });

    it('should support genome-based randomness', () => {
      const field = initField('GENOME_TEST');

      // Simulate genome values (0-59 for Fibonacci-60 residues)
      const red60 = Math.floor(field.prng() * 60);
      const blue60 = Math.floor(field.prng() * 60);
      const black60 = Math.floor(field.prng() * 60);

      expect(red60).toBeGreaterThanOrEqual(0);
      expect(red60).toBeLessThan(60);
      expect(blue60).toBeGreaterThanOrEqual(0);
      expect(blue60).toBeLessThan(60);
      expect(black60).toBeGreaterThanOrEqual(0);
      expect(black60).toBeLessThan(60);
    });

    it('should support event hashing for achievements', () => {
      const field = initField('ACHIEVEMENT');

      const events = [
        'first_feed',
        'first_play',
        'first_evolution',
        'first_battle_win',
      ];

      const hashes = events.map((e) => field.hash(e));

      // All hashes should be unique
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(events.length);

      // Hashes should be consistent
      expect(field.hash('first_feed')).toBe(hashes[0]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty seed name', () => {
      const field = initField('');
      expect(field.seed).toBe('');
      expect(() => field.prng()).not.toThrow();
      expect(() => field.hash('test')).not.toThrow();
    });

    it('should handle very long seed names', () => {
      const longSeed = 'A'.repeat(1000);
      const field = initField(longSeed);
      expect(field.seed).toBe(longSeed);
      expect(() => field.prng()).not.toThrow();
    });

    it('should handle special characters in seed', () => {
      const field = initField('TEST_123!@#');
      expect(() => field.prng()).not.toThrow();
      expect(() => field.hash('test')).not.toThrow();
    });

    it('should handle Unicode seed names', () => {
      const field = initField('オーラリア'); // Auralia in Japanese
      expect(field.seed).toBe('オーラリア');
      expect(() => field.prng()).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should initialize fields quickly', () => {
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        initField(`PERF_TEST_${i}`);
      }
      const duration = performance.now() - start;

      // Should create 100 fields in < 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should generate random numbers quickly', () => {
      const field = initField('SPEED_TEST');
      const start = performance.now();

      for (let i = 0; i < 10000; i++) {
        field.prng();
      }

      const duration = performance.now() - start;
      // Should generate 10k random numbers fast enough for UI use; allow headroom for slow CI/VMs
      expect(duration).toBeLessThan(900);
    });
  });
});
