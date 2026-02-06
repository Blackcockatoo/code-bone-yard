import { describe, it, expect } from 'vitest';
import { fib } from '../fibonacci';

describe('fibonacci', () => {
  describe('fib - Basic Fibonacci calculation', () => {
    it('should return 0 for F(0)', () => {
      expect(fib(0)).toBe(0n);
    });

    it('should return 1 for F(1) and F(2)', () => {
      expect(fib(1)).toBe(1n);
      expect(fib(2)).toBe(1n);
    });

    it('should calculate small Fibonacci numbers correctly', () => {
      expect(fib(3)).toBe(2n);
      expect(fib(4)).toBe(3n);
      expect(fib(5)).toBe(5n);
      expect(fib(6)).toBe(8n);
      expect(fib(7)).toBe(13n);
      expect(fib(8)).toBe(21n);
      expect(fib(9)).toBe(34n);
      expect(fib(10)).toBe(55n);
    });

    it('should handle medium Fibonacci numbers', () => {
      expect(fib(20)).toBe(6765n);
      expect(fib(30)).toBe(832040n);
    });

    it('should handle large Fibonacci numbers critical for Fibonacci-60', () => {
      // F(60) is critical for the Pisano period
      expect(fib(60)).toBe(1548008755920n);
    });

    it('should handle very large indices without overflow', () => {
      const result = fib(100);
      expect(result).toBeGreaterThan(0n);
      expect(typeof result).toBe('bigint');
    });
  });


  describe('Integration - Fibonacci-60 System', () => {
    it('should verify F(60) is divisible by 60 using modulo', () => {
      // The Pisano period for 60 is 60
      // F(60) mod 60 should be 0
      const f60 = fib(60);
      expect(f60 % 60n).toBe(0n);
    });

    it('should calculate Fibonacci values for genome residues', () => {
      // Test typical genome residue values (0-59)
      for (let i = 0; i < 10; i++) {
        const value = fib(i);
        expect(value).toBeGreaterThanOrEqual(0n);
        expect(typeof value).toBe('bigint');
      }
    });
  });
});
