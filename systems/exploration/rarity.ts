/**
 * Rarity system for sample and content generation
 * Phase 4: Vimana Exploration System Enhancement
 */

import type { MossPrimeField } from '@/core/field';
import type { Rarity, RarityRoll, BiomeType, ScannerType } from './types';
import type { Debuff } from './types';
import {
  BASE_RARITY_RATES,
  BIOME_RARITY_MULTIPLIERS,
  EQUIPMENT_RARITY_BONUSES,
  LEVEL_BENEFITS,
} from './constants';

// ============================================================================
// Rarity Roll System
// ============================================================================

/**
 * Calculate the final rarity chance for a sample/content spawn
 * @param field - Guardian's deterministic PRNG field
 * @param biome - Current biome
 * @param scanLevel - Guardian's scan level (1-5)
 * @param scanner - Equipped scanner type
 * @param activeDebuffs - Any active debuffs affecting rarity
 * @returns Detailed rarity roll breakdown
 */
export function calculateRarityChance(
  field: MossPrimeField,
  biome: BiomeType,
  scanLevel: number,
  scanner: ScannerType,
  activeDebuffs: Debuff[]
): RarityRoll {
  // Base chance for legendary (10%)
  const baseChance = BASE_RARITY_RATES.legendary;

  // Biome multiplier (1.0x - 2.0x)
  const biomeMultiplier = BIOME_RARITY_MULTIPLIERS[biome];

  // Equipment bonus (0% - 25%)
  const equipmentBonus = EQUIPMENT_RARITY_BONUSES[scanner];

  // Level bonus (from scan level benefits)
  const levelBenefit = LEVEL_BENEFITS[scanLevel - 1];
  const levelBonus = levelBenefit ? levelBenefit.bonuses.rarityBonus : 1.0;

  // Debuff penalty (if any void-sickness)
  const voidSicknessDebuff = activeDebuffs.find(
    (d) => d.id === 'void-sickness'
  );
  const debuffPenalty = voidSicknessDebuff
    ? voidSicknessDebuff.effects.rarityPenalty || 1.0
    : 1.0;

  // Calculate final chance
  // Formula: base * biomeMultiplier * (1 + equipmentBonus) * levelBonus * debuffPenalty
  const finalChance =
    baseChance *
    biomeMultiplier *
    (1 + equipmentBonus) *
    levelBonus *
    debuffPenalty;

  // Roll for rarity using deterministic PRNG
  const roll = field.prng();
  let result: Rarity;

  if (roll < finalChance) {
    // Further roll to distinguish rare vs legendary
    const subRoll = field.prng();
    // Legendary is 1/4 of the rare+ bracket
    result = subRoll < 0.25 ? 'legendary' : 'rare';
  } else if (roll < finalChance + BASE_RARITY_RATES.rare) {
    result = 'rare';
  } else {
    result = 'common';
  }

  return {
    baseChance,
    biomeMultiplier,
    equipmentBonus,
    levelBonus,
    debuffPenalty,
    finalChance,
    result,
  };
}

/**
 * Roll for a specific rarity tier directly
 * @param field - Guardian's deterministic PRNG field
 * @param targetRarity - The rarity to roll for
 * @param modifiers - Optional additional modifiers
 * @returns Whether the roll succeeded
 */
export function rollForRarity(
  field: MossPrimeField,
  targetRarity: Rarity,
  modifiers: {
    biomeMultiplier?: number;
    equipmentBonus?: number;
    levelBonus?: number;
  } = {}
): boolean {
  const baseChance = BASE_RARITY_RATES[targetRarity];

  const {
    biomeMultiplier = 1.0,
    equipmentBonus = 0,
    levelBonus = 1.0,
  } = modifiers;

  const finalChance =
    baseChance * biomeMultiplier * (1 + equipmentBonus) * levelBonus;

  const roll = field.prng();
  return roll < finalChance;
}

/**
 * Weighted random selection using deterministic PRNG
 * @param field - Guardian's deterministic PRNG field
 * @param weights - Object with keys and their weights
 * @returns Selected key
 */
export function weightedRandom<T extends string>(
  field: MossPrimeField,
  weights: Record<T, number>
): T {
  const entries = Object.entries(weights) as [T, number][];
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);

  const roll = field.prng() * totalWeight;

  let cumulativeWeight = 0;
  for (const [key, weight] of entries) {
    cumulativeWeight += weight;
    if (roll < cumulativeWeight) {
      return key;
    }
  }

  // Fallback to first entry (should never reach here)
  return entries[0][0];
}

/**
 * Roll for content type based on location weights
 * @param field - Guardian's deterministic PRNG field
 * @param contentWeights - Weights for each content type
 * @returns Selected content type
 */
export function rollContentType(
  field: MossPrimeField,
  contentWeights: {
    samples: number;
    anomalies: number;
    artifacts: number;
    nothing: number;
  }
): 'sample' | 'anomaly' | 'artifact' | 'nothing' {
  const result = weightedRandom(field, contentWeights);

  // Map plural forms to singular forms for compatibility with VimanaCell type
  const contentTypeMap: Record<string, 'sample' | 'anomaly' | 'artifact' | 'nothing'> = {
    samples: 'sample',
    anomalies: 'anomaly',
    artifacts: 'artifact',
    nothing: 'nothing',
  };

  return contentTypeMap[result] || 'nothing';
}

/**
 * Roll for random event occurrence
 * @param field - Guardian's deterministic PRNG field
 * @param eventChance - Base event chance (default 5%)
 * @returns Whether an event should trigger
 */
export function rollForEvent(
  field: MossPrimeField,
  eventChance: number = 0.05
): boolean {
  return field.prng() < eventChance;
}

/**
 * Calculate adjusted rarity rates for UI display
 * @param biome - Current biome
 * @param scanLevel - Guardian's scan level
 * @param scanner - Equipped scanner
 * @param activeDebuffs - Active debuffs
 * @returns Adjusted rates for each rarity tier
 */
export function getAdjustedRarityRates(
  biome: BiomeType,
  scanLevel: number,
  scanner: ScannerType,
  activeDebuffs: Debuff[]
): Record<Rarity, number> {
  const biomeMultiplier = BIOME_RARITY_MULTIPLIERS[biome];
  const equipmentBonus = EQUIPMENT_RARITY_BONUSES[scanner];
  const levelBenefit = LEVEL_BENEFITS[scanLevel - 1];
  const levelBonus = levelBenefit ? levelBenefit.bonuses.rarityBonus : 1.0;

  const voidSicknessDebuff = activeDebuffs.find(
    (d) => d.id === 'void-sickness'
  );
  const debuffPenalty = voidSicknessDebuff
    ? voidSicknessDebuff.effects.rarityPenalty || 1.0
    : 1.0;

  const multiplier =
    biomeMultiplier * (1 + equipmentBonus) * levelBonus * debuffPenalty;

  return {
    common: BASE_RARITY_RATES.common * (2 - multiplier), // Common reduces as rare increases
    rare: BASE_RARITY_RATES.rare * multiplier,
    legendary: BASE_RARITY_RATES.legendary * multiplier,
  };
}

/**
 * Get rarity tier display information
 * @param rarity - Rarity tier
 * @returns Display information (color, label, etc.)
 */
export function getRarityDisplay(rarity: Rarity): {
  color: string;
  label: string;
  emoji: string;
} {
  switch (rarity) {
    case 'common':
      return {
        color: '#9ca3af', // gray-400
        label: 'Common',
        emoji: '○',
      };
    case 'rare':
      return {
        color: '#3b82f6', // blue-500
        label: 'Rare',
        emoji: '◆',
      };
    case 'legendary':
      return {
        color: '#f59e0b', // amber-500
        label: 'Legendary',
        emoji: '★',
      };
  }
}

/**
 * Calculate collection bonus multiplier
 * @param samplesCollected - Array of collected sample IDs
 * @param targetSampleId - Sample ID to check collection count for
 * @param bonusThreshold - Number of collections required for bonus
 * @returns Whether the bonus is active
 */
export function checkCollectionThreshold(
  samplesCollected: string[],
  targetSampleId: string,
  bonusThreshold: number
): boolean {
  const collectionCount = samplesCollected.filter(
    (id) => id === targetSampleId
  ).length;
  return collectionCount >= bonusThreshold;
}

/**
 * Normalize rarity rates to ensure they sum to 1.0
 * @param rates - Raw rarity rates
 * @returns Normalized rates
 */
export function normalizeRarityRates(
  rates: Record<Rarity, number>
): Record<Rarity, number> {
  const total = rates.common + rates.rare + rates.legendary;

  if (total === 0) {
    // Fallback to base rates if somehow all are 0
    return { ...BASE_RARITY_RATES };
  }

  return {
    common: rates.common / total,
    rare: rates.rare / total,
    legendary: rates.legendary / total,
  };
}

/**
 * Get rarity tier by percentile (for procedural generation)
 * @param field - Guardian's deterministic PRNG field
 * @param rarityRates - Normalized rarity rates
 * @returns Selected rarity tier
 */
export function getRarityByPercentile(
  field: MossPrimeField,
  rarityRates: Record<Rarity, number> = BASE_RARITY_RATES
): Rarity {
  const roll = field.prng();

  if (roll < rarityRates.legendary) {
    return 'legendary';
  } else if (roll < rarityRates.legendary + rarityRates.rare) {
    return 'rare';
  } else {
    return 'common';
  }
}

// ============================================================================
// Helper Functions for Tests
// ============================================================================

/**
 * Simple rarity roll function (for tests and simple use cases)
 * @param field - Guardian's deterministic PRNG field
 * @param biome - Current biome
 * @param scanLevel - Guardian's scan level (1-5)
 * @param scanner - Equipped scanner type
 * @param activeDebuffs - Any active debuffs affecting rarity
 * @returns Rarity tier (common, rare, legendary)
 */
export function rollRarity(
  field: MossPrimeField,
  biome: BiomeType,
  scanLevel: number,
  scanner: ScannerType,
  activeDebuffs: Debuff[]
): Rarity {
  const rarityRoll = calculateRarityChance(
    field,
    biome,
    scanLevel,
    scanner,
    activeDebuffs
  );
  return rarityRoll.result;
}

/**
 * Get biome rarity multiplier
 * @param biome - Biome type
 * @returns Rarity multiplier for the biome
 */
export function calculateBiomeRarityMultiplier(biome: BiomeType): number {
  return BIOME_RARITY_MULTIPLIERS[biome];
}
