import { describe, it, expect } from 'vitest';
import { mix64, base10ToHex, interleave3 } from '../hash';

describe('hash', () => {
  describe('mix64 - 64-bit hash mixing', () => {
    it('should produce different outputs for different inputs', () => {
      const hash1 = mix64(12345n);
      const hash2 = mix64(12346n);
      expect(hash1).not.toBe(hash2);
    });

    it('should produce consistent outputs for same input', () => {
      const hash1 = mix64(99999n);
      const hash2 = mix64(99999n);
      expect(hash1).toBe(hash2);
    });

    it('should handle zero input', () => {
      const hash = mix64(0n);
      expect(hash).toBeGreaterThan(0n);
    });

    it('should handle small positive numbers', () => {
      const hash = mix64(1n);
      expect(hash).toBeGreaterThan(0n);
    });

    it('should handle large numbers', () => {
      const hash = mix64(99999999999999999n);
      expect(hash).toBeGreaterThan(0n);
    });

    it('should produce avalanche effect (single bit change affects many bits)', () => {
      const hash1 = mix64(1000000n);
      const hash2 = mix64(1000001n); // Differ by 1

      // Convert to binary strings and count different bits
      const bin1 = hash1.toString(2).padStart(64, '0');
      const bin2 = hash2.toString(2).padStart(64, '0');

      let differentBits = 0;
      for (let i = 0; i < 64; i++) {
        if (bin1[i] !== bin2[i]) differentBits++;
      }

      // Good hash should have significant bit difference (aim for ~32/64 bits different)
      expect(differentBits).toBeGreaterThan(10);
    });

    it('should be deterministic', () => {
      const input = 777777n;
      const results = [mix64(input), mix64(input), mix64(input)];
      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);
    });
  });

  describe('base10ToHex - Avalanche mixing hash', () => {
    it('should produce deterministic hex output for same input', () => {
      const hex1 = base10ToHex('12345');
      const hex2 = base10ToHex('12345');
      expect(hex1).toBe(hex2);
    });

    it('should produce different outputs for different inputs', () => {
      const hex1 = base10ToHex('123');
      const hex2 = base10ToHex('124');
      expect(hex1).not.toBe(hex2);
    });

    it('should handle very large numbers (60-digit primes)', () => {
      // Simulate a 60-digit prime seed
      const largePrime = '999999999999999999999999999999999999999999999999999999999991';
      const hex = base10ToHex(largePrime);
      expect(hex.length).toBe(60); // Same length as input
      expect(/^[0-9a-f]+$/.test(hex)).toBe(true);
    });

    it('should handle single digit', () => {
      const hex = base10ToHex('5');
      expect(hex.length).toBe(1);
      expect(/^[0-9a-f]$/.test(hex)).toBe(true);
    });

    it('should produce lowercase hex only', () => {
      const hex = base10ToHex('999999999');
      expect(/^[0-9a-f]+$/.test(hex)).toBe(true);
      expect(hex).not.toMatch(/[A-F]/);
    });

    it('should create avalanche effect (position matters)', () => {
      const hex1 = base10ToHex('1000');
      const hex2 = base10ToHex('0001');
      expect(hex1).not.toBe(hex2);
    });
  });

  describe('interleave3 - Interleave three 60-digit hex strings', () => {
    it('should interleave three hex digits correctly', () => {
      const result = interleave3('abc', 'def', '123');
      // Should alternate: a-d-1-b-e-2-c-f-3
      expect(result).toBe('ad1be2cf3');
    });

    it('should handle single character strings', () => {
      const result = interleave3('a', 'b', 'c');
      expect(result).toBe('abc');
    });

    it('should handle longer strings', () => {
      const red = 'ff00ff';
      const blue = '00ff00';
      const black = 'f0f0f0';
      const result = interleave3(red, blue, black);

      // Should interleave all characters
      expect(result.length).toBe(18);
      // First char from red, second from blue, third from black
      expect(result[0]).toBe('f');
      expect(result[1]).toBe('0');
      expect(result[2]).toBe('f');
    });

    it('should handle equal length inputs (typical use case)', () => {
      // Simulate MossPrimeSeed hex values
      const red = '0'.repeat(60);
      const blue = '1'.repeat(60);
      const black = '2'.repeat(60);
      const result = interleave3(red, blue, black);

      expect(result.length).toBe(180);
      // Pattern should be 012012012...
      expect(result[0]).toBe('0');
      expect(result[1]).toBe('1');
      expect(result[2]).toBe('2');
      expect(result[3]).toBe('0');
      expect(result[4]).toBe('1');
      expect(result[5]).toBe('2');
    });

    it('should work with MossPrimeSeed values', () => {
      // Use actual seed-like hex values
      const red = base10ToHex('999999999999999999999999999999999999999999999999999999999991');
      const blue = base10ToHex('999999999999999999999999999999999999999999999999999999999973');
      const black = base10ToHex('999999999999999999999999999999999999999999999999999999999959');

      const interleaved = interleave3(red, blue, black);
      expect(interleaved.length).toBe(red.length + blue.length + black.length);
      expect(/^[0-9a-f]+$/.test(interleaved)).toBe(true);
    });
  });

  describe('Integration - Hash System', () => {
    it('should create unique field seeds from genome combinations', () => {
      const seeds = new Set<bigint>();

      // Test 100 different genome combinations
      for (let red = 0; red < 10; red++) {
        for (let blue = 0; blue < 10; blue++) {
          const genome = BigInt(red) * 1000n + BigInt(blue);
          const hash = mix64(genome);
          seeds.add(hash);
        }
      }

      // Should produce 100 unique hashes
      expect(seeds.size).toBe(100);
    });

    it('should work with genome trinity encoding', () => {
      // Simulate encoding a genome into a field seed
      const red60 = 15;
      const blue60 = 30;
      const black60 = 45;

      // Combine using simple encoding
      const combined = BigInt(red60) * 10000n + BigInt(blue60) * 100n + BigInt(black60);
      const hash = mix64(combined);

      expect(hash).toBeGreaterThan(0n);
    });

    it('should demonstrate avalanche effect for similar genomes', () => {
      // Two genomes differing by 1 residue value
      const genome1 = mix64(BigInt(153045));
      const genome2 = mix64(BigInt(153046));

      expect(genome1).not.toBe(genome2);

      // Should produce very different hashes
      const diff = genome1 > genome2 ? genome1 - genome2 : genome2 - genome1;
      expect(diff).toBeGreaterThan(1000n);
    });

    it('should work with MossPrimeSeed hex encoding', () => {
      // Simulate combining three 60-digit sequences
      const red = '9'.repeat(60);
      const blue = '8'.repeat(60);
      const black = '7'.repeat(60);

      const redHex = base10ToHex(red);
      const blueHex = base10ToHex(blue);
      const blackHex = base10ToHex(black);

      const interleaved = interleave3(redHex, blueHex, blackHex);
      expect(interleaved.length).toBe(180);
    });
  });
});
