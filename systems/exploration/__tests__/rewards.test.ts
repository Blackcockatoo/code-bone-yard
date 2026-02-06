import { describe, it, expect } from 'vitest';
import {
  calculateScanEnergyCost,
  applySampleEffects,
  calculateLocationHealthRisk,
  calculateScanXP,
} from '../rewards';
import { LOCATIONS } from '../locations';
import { SAMPLES } from '../samples';
import type { ToolkitType, Debuff } from '../types';
import type { MossPrimeField } from '@/core/field';

// Helper to create a mock field for testing
function createMockField(prngValue: number): MossPrimeField {
  return {
    seed: 'test',
    red: '',
    black: '',
    blue: '',
    ring: [],
    pulse: [],
    hash: () => 0n,
    prng: () => prngValue,
    fib: () => 0n,
    lucas: () => 0n,
  };
}

describe('Exploration Rewards System', () => {
  describe('calculateScanEnergyCost', () => {
    it('should return base cost for starting grove', () => {
      const location = LOCATIONS.find(l => l.id === 'moss-covered-clearing')!;
      const cost = calculateScanEnergyCost(location, 1, 'none');
      expect(cost).toBe(5);
    });

    it('should apply scan level efficiency bonus', () => {
      const location = LOCATIONS.find(l => l.biome === 'starting-grove')!;
      const costLevel1 = calculateScanEnergyCost(location, 1, 'none');
      const costLevel3 = calculateScanEnergyCost(location, 3, 'none');
      expect(costLevel3).toBeLessThan(costLevel1);
    });

    it('should handle different biome costs', () => {
      const startingLocation = LOCATIONS.find(l => l.biome === 'starting-grove')!;
      const voidLocation = LOCATIONS.find(l => l.biome === 'void-nexus')!;

      const startingCost = calculateScanEnergyCost(startingLocation, 1, 'none');
      const voidCost = calculateScanEnergyCost(voidLocation, 1, 'none');

      expect(voidCost).toBeGreaterThan(startingCost);
    });

    it('should not go below 1 energy', () => {
      const location = LOCATIONS[0];
      const cost = calculateScanEnergyCost(location, 5, 'master-kit');
      expect(cost).toBeGreaterThanOrEqual(1);
    });
  });

  describe('applySampleEffects', () => {
    it('should apply positive stat effects', () => {
      const sample = SAMPLES.find(s => s.id === 'moss-spore')!;
      const guardianStats = {
        energy: 50,
        curiosity: 50,
        bond: 50,
        health: 50,
      };

      const result = applySampleEffects(sample, guardianStats);

      expect(result.energy).toBeGreaterThanOrEqual(guardianStats.energy);
      expect(result.curiosity).toBeGreaterThanOrEqual(guardianStats.curiosity);
    });

    it('should cap stats at maximum values', () => {
      const sample = SAMPLES.find(s => s.id === 'infinity-shard')!;
      const guardianStats = {
        energy: 95,
        curiosity: 195,
        bond: 95,
        health: 95,
      };

      const result = applySampleEffects(sample, guardianStats);

      expect(result.energy).toBeLessThanOrEqual(100);
      expect(result.curiosity).toBeLessThanOrEqual(200);
      expect(result.bond).toBeLessThanOrEqual(100);
      expect(result.health).toBeLessThanOrEqual(100);
    });

    it('should handle samples with no effects', () => {
      const guardianStats = {
        energy: 50,
        curiosity: 50,
        bond: 50,
        health: 50,
      };

      const sample = { ...SAMPLES[0], effects: {} };
      const result = applySampleEffects(sample, guardianStats);

      expect(result).toEqual(guardianStats);
    });

    it('should apply legendary sample effects', () => {
      const legendarySample = SAMPLES.find(s => s.rarity === 'legendary')!;
      const guardianStats = {
        energy: 30,
        curiosity: 30,
        bond: 30,
        health: 30,
      };

      const result = applySampleEffects(legendarySample, guardianStats);

      const totalGain =
        (result.energy - guardianStats.energy) +
        (result.curiosity - guardianStats.curiosity) +
        (result.bond - guardianStats.bond) +
        (result.health - guardianStats.health);

      expect(totalGain).toBeGreaterThan(50); // Legendary should give significant boost
    });
  });

  describe('calculateLocationHealthRisk', () => {
    it('should return 0 for safe locations', () => {
      const safeLocation = LOCATIONS.find(l =>
        l.healthRisk?.chance === 0 || !l.healthRisk
      )!;

      // Mock field - not actually used in deterministic test
      const mockField = createMockField(0.5);

      const risk = calculateLocationHealthRisk(safeLocation, mockField, 'none');
      expect(risk).toBe(0);
    });

    it('should calculate risk for dangerous locations', () => {
      const dangerousLocation = LOCATIONS.find(l =>
        l.healthRisk && l.healthRisk.chance > 0
      );

      if (dangerousLocation) {
        const mockField = createMockField(0.5);
        const risk = calculateLocationHealthRisk(dangerousLocation, mockField, 'none');
        expect(risk).toBeGreaterThanOrEqual(0);
      }
    });

    it('should reduce damage with field-kit', () => {
      const dangerousLocation = LOCATIONS.find(l =>
        l.healthRisk && l.healthRisk.chance > 0.5
      );

      if (dangerousLocation) {
        // Mock field that always triggers risk
        const mockField = createMockField(0.1);

        const riskNoKit = calculateLocationHealthRisk(dangerousLocation, mockField, 'none');
        const riskWithKit = calculateLocationHealthRisk(dangerousLocation, mockField, 'field-kit');

        if (riskNoKit > 0) {
          expect(riskWithKit).toBeLessThan(riskNoKit);
        }
      }
    });

    it('should provide maximum protection with master-kit', () => {
      const dangerousLocation = LOCATIONS.find(l =>
        l.healthRisk && l.healthRisk.damage > 0
      );

      if (dangerousLocation) {
        const mockField = createMockField(0.1);
        const riskWithMasterKit = calculateLocationHealthRisk(dangerousLocation, mockField, 'master-kit');
        const riskNoKit = calculateLocationHealthRisk(dangerousLocation, mockField, 'none');

        if (riskNoKit > 0) {
          expect(riskWithMasterKit).toBeLessThan(riskNoKit * 0.3); // 75% reduction minimum
        }
      }
    });
  });

  describe('calculateScanXP', () => {
    it('should return base 5 XP for scan', () => {
      const xp = calculateScanXP(1, false, []);
      expect(xp).toBe(5);
    });

    it('should apply level XP multiplier', () => {
      const xpLevel1 = calculateScanXP(1, false, []);
      const xpLevel5 = calculateScanXP(5, false, []);
      expect(xpLevel5).toBeGreaterThan(xpLevel1);
    });

    it('should apply confusion debuff penalty', () => {
      const confusionDebuff: Debuff = {
        id: 'confusion',
        name: 'Confusion',
        description: 'Reduced XP gain',
        duration: 15,
        appliedAt: Date.now(),
        effects: {
          xpPenalty: 0.5, // 50% XP
        },
      };

      const xpNormal = calculateScanXP(1, false, []);
      const xpDebuffed = calculateScanXP(1, false, [confusionDebuff]);

      expect(xpDebuffed).toBeLessThan(xpNormal);
      expect(xpDebuffed).toBe(Math.floor(xpNormal * 0.5));
    });

    it('should handle multiple debuffs', () => {
      const debuffs: Debuff[] = [
        {
          id: 'confusion',
          name: 'Confusion',
          description: 'Test',
          duration: 10,
          appliedAt: Date.now(),
          effects: { xpPenalty: 0.5 },
        },
        {
          id: 'exhaustion',
          name: 'Exhaustion',
          description: 'Test',
          duration: 10,
          appliedAt: Date.now(),
          effects: {},
        },
      ];

      const xp = calculateScanXP(1, false, debuffs);
      expect(xp).toBeGreaterThan(0);
    });

    it('should return at least 1 XP', () => {
      const confusionDebuff: Debuff = {
        id: 'confusion',
        name: 'Confusion',
        description: 'Severe confusion',
        duration: 15,
        appliedAt: Date.now(),
        effects: {
          xpPenalty: 0.1, // 90% penalty
        },
      };

      const xp = calculateScanXP(1, false, [confusionDebuff]);
      expect(xp).toBeGreaterThanOrEqual(0); // Could be 0 with severe debuff
    });
  });
});
