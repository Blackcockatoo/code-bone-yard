import { describe, it, expect } from 'vitest';
import {
  getScanLevel,
  getXPProgress,
  checkLevelUp,
  getLevelBenefits,
  canEquipItem,
  getEquipmentEffectsSummary,
} from '../progression';
import type { ScannerType, ToolkitType } from '../types';

describe('Exploration Progression System', () => {
  describe('getScanLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(getScanLevel(0)).toBe(1);
    });

    it('should return level 2 for 100 XP', () => {
      expect(getScanLevel(100)).toBe(2);
    });

    it('should return level 3 for 300 XP', () => {
      expect(getScanLevel(300)).toBe(3);
    });

    it('should return level 4 for 600 XP', () => {
      expect(getScanLevel(600)).toBe(4);
    });

    it('should return level 5 for 1000 XP', () => {
      expect(getScanLevel(1000)).toBe(5);
    });

    it('should cap at level 5 for any XP above 1000', () => {
      expect(getScanLevel(5000)).toBe(5);
      expect(getScanLevel(999999)).toBe(5);
    });

    it('should handle values between thresholds correctly', () => {
      expect(getScanLevel(50)).toBe(1);
      expect(getScanLevel(150)).toBe(2);
      expect(getScanLevel(400)).toBe(3);
      expect(getScanLevel(700)).toBe(4);
    });
  });

  describe('getXPProgress', () => {
    it('should return correct progress for level 1', () => {
      const progress = getXPProgress(50, 1);
      expect(progress.current).toBe(50);
      expect(progress.required).toBe(100);
      expect(progress.percentage).toBe(50);
    });

    it('should return correct progress for level 2', () => {
      const progress = getXPProgress(150, 2);
      expect(progress.current).toBe(50); // 150 - 100 threshold
      expect(progress.required).toBe(200); // 300 - 100
      expect(progress.percentage).toBe(25);
    });

    it('should return max level for level 5', () => {
      const progress = getXPProgress(1500, 5);
      expect(progress.current).toBe(500); // 1500 - 1000 (level 5 threshold)
      // For max level, there's no next level, so required XP could be 0
      expect(progress.percentage).toBe(100); // Capped at 100% for max level
    });

    it('should handle exact threshold values', () => {
      const progress = getXPProgress(100, 2);
      expect(progress.current).toBe(0);
      expect(progress.percentage).toBe(0);
    });
  });

  describe('checkLevelUp', () => {
    it('should detect level up from 1 to 2', () => {
      const result = checkLevelUp(50, 100);
      expect(result).not.toBeNull();
      expect(result?.newLevel).toBe(2);
      expect(result?.unlockedBiomes).toContain('crystal-caverns');
    });

    it('should return null if no level up', () => {
      const result = checkLevelUp(50, 75);
      expect(result).toBeNull();
    });

    it('should detect level up from 2 to 3', () => {
      const result = checkLevelUp(250, 300);
      expect(result).not.toBeNull();
      expect(result?.newLevel).toBe(3);
      expect(result?.unlockedBiomes).toContain('void-nexus');
    });

    it('should include correct equipment unlocks', () => {
      const result = checkLevelUp(50, 100);
      expect(result?.unlockedEquipment).toContain('field-kit');
    });

    it('should handle multiple level jumps', () => {
      const result = checkLevelUp(0, 300);
      expect(result?.newLevel).toBe(3);
    });
  });

  describe('getLevelBenefits', () => {
    it('should return correct benefits for level 1', () => {
      const benefits = getLevelBenefits(1);
      expect(benefits.level).toBe(1);
      expect(benefits.bonuses.energyEfficiency).toBe(0);
      expect(benefits.bonuses.rarityBonus).toBe(1.0);
    });

    it('should return correct benefits for level 3', () => {
      const benefits = getLevelBenefits(3);
      expect(benefits.level).toBe(3);
      expect(benefits.bonuses.energyEfficiency).toBe(15);
      expect(benefits.bonuses.rarityBonus).toBe(1.2);
    });

    it('should return level 5 benefits for max level', () => {
      const benefits = getLevelBenefits(5);
      expect(benefits.level).toBe(5);
      expect(benefits.bonuses.rarityBonus).toBe(1.5);
    });

    it('should handle invalid levels gracefully', () => {
      const benefits = getLevelBenefits(0);
      expect(benefits.level).toBe(1);
    });
  });

  describe('canEquipItem', () => {
    it('should allow equipping basic scanner at level 1', () => {
      expect(canEquipItem('basic', 1, [])).toBe(true);
    });

    it('should not allow advanced scanner below level 3', () => {
      expect(canEquipItem('advanced', 2, [])).toBe(false);
    });

    it('should allow advanced scanner at level 3', () => {
      expect(canEquipItem('advanced', 3, [])).toBe(true);
    });

    it('should not allow quantum scanner below level 5', () => {
      expect(canEquipItem('quantum', 4, [])).toBe(false);
    });

    it('should allow quantum scanner at level 5', () => {
      expect(canEquipItem('quantum', 5, [])).toBe(true);
    });

    it('should allow field-kit at level 2', () => {
      expect(canEquipItem('field-kit', 2, [])).toBe(true);
    });

    it('should allow master-kit at level 4', () => {
      expect(canEquipItem('master-kit', 4, [])).toBe(true);
    });
  });

  describe('getEquipmentEffectsSummary', () => {
    it('should return basic scanner effects', () => {
      const effects = getEquipmentEffectsSummary('basic', 'none');
      expect(effects.scanRange).toBe(1);
      expect(effects.rareSpawnBonus).toBe(0);
    });

    it('should combine scanner and toolkit effects', () => {
      const effects = getEquipmentEffectsSummary('advanced', 'field-kit');
      expect(effects.scanRange).toBe(2);
      expect(effects.rareSpawnBonus).toBe(10);
      expect(effects.healthDamageReduction).toBe(50);
      expect(effects.energyCapacityBonus).toBe(10);
    });

    it('should return quantum scanner effects', () => {
      const effects = getEquipmentEffectsSummary('quantum', 'master-kit');
      expect(effects.scanRange).toBe(3);
      expect(effects.rareSpawnBonus).toBe(25);
      expect(effects.revealHiddenLocations).toBe(true);
      expect(effects.debuffImmunity).toBe(true);
    });

    it('should handle no equipment', () => {
      const effects = getEquipmentEffectsSummary('basic', 'none');
      expect(effects.healthDamageReduction).toBe(0);
      expect(effects.debuffImmunity).toBe(false);
    });
  });
});
