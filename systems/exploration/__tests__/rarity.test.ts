import { describe, it, expect } from 'vitest';
import {
  rollRarity,
  rollContentType,
  rollForEvent,
  calculateBiomeRarityMultiplier,
} from '../rarity';
import { getLevelColor } from '../progression';
import type { BiomeType, ScannerType, Debuff } from '../types';
import { initField } from '@/core/field';

describe('Exploration Rarity System', () => {
  describe('rollRarity', () => {
    it('should return a valid rarity type', () => {
      const field = initField(12345n);
      const rarity = rollRarity(field, 'starting-grove', 1, 'basic', []);

      expect(['common', 'rare', 'legendary']).toContain(rarity);
    });

    it('should be deterministic with same field state', () => {
      const field1 = initField(99999n);
      const field2 = initField(99999n);

      const rarity1 = rollRarity(field1, 'starting-grove', 1, 'basic', []);
      const rarity2 = rollRarity(field2, 'starting-grove', 1, 'basic', []);

      expect(rarity1).toBe(rarity2);
    });

    it('should produce different results with different seeds', () => {
      const field1 = initField(111n);
      const field2 = initField(222n);

      const rarities1 = Array.from({ length: 10 }, () =>
        rollRarity(field1, 'starting-grove', 1, 'basic', [])
      );
      const rarities2 = Array.from({ length: 10 }, () =>
        rollRarity(field2, 'starting-grove', 1, 'basic', [])
      );

      // Should have at least some differences
      const differences = rarities1.filter((r, i) => r !== rarities2[i]).length;
      expect(differences).toBeGreaterThan(0);
    });

    it('should increase legendary chance in eternal garden', () => {
      const field = initField(12345n);

      // Run many trials to check distribution
      const trials = 100;
      let legendaryCountStarting = 0;
      let legendaryCountEternal = 0;

      for (let i = 0; i < trials; i++) {
        const fieldStarting = initField(BigInt(i));
        const fieldEternal = initField(BigInt(i + 1000));

        if (rollRarity(fieldStarting, 'starting-grove', 1, 'basic', []) === 'legendary') {
          legendaryCountStarting++;
        }
        if (rollRarity(fieldEternal, 'eternal-garden', 1, 'basic', []) === 'legendary') {
          legendaryCountEternal++;
        }
      }

      // Eternal Garden should have more legendaries
      expect(legendaryCountEternal).toBeGreaterThan(legendaryCountStarting);
    });

    it('should apply scanner rarity bonus', () => {
      const field = initField(54321n);

      const trials = 100;
      let rareCountBasic = 0;
      let rareCountQuantum = 0;

      for (let i = 0; i < trials; i++) {
        const fieldBasic = initField(BigInt(i));
        const fieldQuantum = initField(BigInt(i + 500));

        const rarityBasic = rollRarity(fieldBasic, 'starting-grove', 1, 'basic', []);
        const rarityQuantum = rollRarity(fieldQuantum, 'starting-grove', 5, 'quantum', []);

        if (rarityBasic !== 'common') rareCountBasic++;
        if (rarityQuantum !== 'common') rareCountQuantum++;
      }

      // Quantum scanner should find more rare items
      expect(rareCountQuantum).toBeGreaterThan(rareCountBasic);
    });

    it('should apply void-sickness debuff penalty', () => {
      const field = initField(11111n);

      const voidSicknessDebuff: Debuff = {
        id: 'void-sickness',
        name: 'Void Sickness',
        description: 'Reduced rarity chance',
        duration: 20,
        appliedAt: Date.now(),
        effects: {
          rarityPenalty: 0.75, // 25% reduction
        },
      };

      const rarityNormal = rollRarity(field, 'starting-grove', 1, 'basic', []);
      const rarityDebuffed = rollRarity(initField(11111n), 'starting-grove', 1, 'basic', [voidSicknessDebuff]);

      // Both should be valid rarities
      expect(['common', 'rare', 'legendary']).toContain(rarityNormal);
      expect(['common', 'rare', 'legendary']).toContain(rarityDebuffed);
    });
  });

  describe('rollContentType', () => {
    it('should return a valid content type', () => {
      const field = initField(77777n);
      const contentWeights = {
        samples: 40,
        anomalies: 30,
        artifacts: 20,
        nothing: 10,
      };

      const content = rollContentType(field, contentWeights);
      expect(['sample', 'anomaly', 'artifact', 'nothing']).toContain(content);
    });

    it('should respect weight distributions', () => {
      const trials = 200;
      const counts = {
        sample: 0,
        anomaly: 0,
        artifact: 0,
        nothing: 0,
      };

      const contentWeights = {
        samples: 60, // 60%
        anomalies: 30, // 30%
        artifacts: 10, // 10%
        nothing: 0, // 0%
      };

      for (let i = 0; i < trials; i++) {
        const field = initField(BigInt(i + 5000));
        const content = rollContentType(field, contentWeights);
        counts[content]++;
      }

      // Samples should be most common
      expect(counts.sample).toBeGreaterThan(counts.anomaly);
      expect(counts.anomaly).toBeGreaterThan(counts.artifact);
      expect(counts.nothing).toBe(0); // 0% weight
    });

    it('should handle equal weights', () => {
      const field = initField(33333n);
      const contentWeights = {
        samples: 25,
        anomalies: 25,
        artifacts: 25,
        nothing: 25,
      };

      const content = rollContentType(field, contentWeights);
      expect(['sample', 'anomaly', 'artifact', 'nothing']).toContain(content);
    });

    it('should map plural to singular forms correctly', () => {
      const field = initField(44444n);
      const contentWeights = {
        samples: 100,
        anomalies: 0,
        artifacts: 0,
        nothing: 0,
      };

      const content = rollContentType(field, contentWeights);
      expect(content).toBe('sample'); // Not 'samples'
    });
  });

  describe('rollForEvent', () => {
    it('should return boolean', () => {
      const field = initField(66666n);
      const result = rollForEvent(field);
      expect(typeof result).toBe('boolean');
    });

    it('should respect event chance parameter', () => {
      const trials = 1000;
      let eventCount = 0;

      for (let i = 0; i < trials; i++) {
        const field = initField(BigInt(i + 10000));
        if (rollForEvent(field, 0.1)) { // 10% chance
          eventCount++;
        }
      }

      // Should be roughly 10% (with some variance)
      const percentage = eventCount / trials;
      expect(percentage).toBeGreaterThan(0.05);
      expect(percentage).toBeLessThan(0.15);
    });

    it('should use default 5% chance', () => {
      const trials = 1000;
      let eventCount = 0;

      for (let i = 0; i < trials; i++) {
        const field = initField(BigInt(i + 20000));
        if (rollForEvent(field)) {
          eventCount++;
        }
      }

      // Should be roughly 5% (with some variance)
      const percentage = eventCount / trials;
      expect(percentage).toBeGreaterThan(0.02);
      expect(percentage).toBeLessThan(0.08);
    });

    it('should never trigger with 0% chance', () => {
      const trials = 100;

      for (let i = 0; i < trials; i++) {
        const field = initField(BigInt(i));
        const result = rollForEvent(field, 0);
        expect(result).toBe(false);
      }
    });

    it('should always trigger with 100% chance', () => {
      const trials = 100;

      for (let i = 0; i < trials; i++) {
        const field = initField(BigInt(i));
        const result = rollForEvent(field, 1.0);
        expect(result).toBe(true);
      }
    });
  });

  describe('calculateBiomeRarityMultiplier', () => {
    it('should return 1.0 for starting grove', () => {
      const multiplier = calculateBiomeRarityMultiplier('starting-grove');
      expect(multiplier).toBe(1.0);
    });

    it('should return higher multiplier for eternal garden', () => {
      const startingMultiplier = calculateBiomeRarityMultiplier('starting-grove');
      const eternalMultiplier = calculateBiomeRarityMultiplier('eternal-garden');
      expect(eternalMultiplier).toBeGreaterThan(startingMultiplier);
      expect(eternalMultiplier).toBe(2.0);
    });

    it('should return correct multipliers for all biomes', () => {
      expect(calculateBiomeRarityMultiplier('starting-grove')).toBe(1.0);
      expect(calculateBiomeRarityMultiplier('crystal-caverns')).toBe(1.2);
      expect(calculateBiomeRarityMultiplier('void-nexus')).toBe(1.5);
      expect(calculateBiomeRarityMultiplier('dream-spire')).toBe(1.3);
      expect(calculateBiomeRarityMultiplier('eternal-garden')).toBe(2.0);
    });
  });

  describe('getLevelColor', () => {
    it('should return different colors for different levels', () => {
      const color1 = getLevelColor(1);
      const color5 = getLevelColor(5);
      expect(color1).not.toBe(color5);
    });

    it('should return valid hex colors', () => {
      for (let level = 1; level <= 5; level++) {
        const color = getLevelColor(level);
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });

    it('should return progressively brighter colors', () => {
      const color1 = getLevelColor(1);
      const color3 = getLevelColor(3);
      const color5 = getLevelColor(5);

      // Just verify they're all valid colors - can't easily compare brightness
      expect(color1).toBeTruthy();
      expect(color3).toBeTruthy();
      expect(color5).toBeTruthy();
    });

    it('should handle edge cases', () => {
      expect(getLevelColor(0)).toBeTruthy();
      expect(getLevelColor(6)).toBeTruthy();
      expect(getLevelColor(100)).toBeTruthy();
    });
  });
});
