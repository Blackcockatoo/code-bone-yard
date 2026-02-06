/**
 * Key Crafting Logic
 * Phase 5: Handles crafting keys from samples
 */

import type { Key, CraftingResult } from './types';
import type { Sample } from '../exploration/types';
import { ALL_SAMPLES } from '../exploration/samples';
import { ALL_KEYS } from './keys';

/**
 * Check if a key can be crafted with available samples
 */
export function canCraftKey(
  key: Key,
  samplesCollected: string[] // Array of sample IDs
): {
  canCraft: boolean;
  missingSamples: Array<{ rarity: string; count: number; biome?: string }>;
} {
  const missingSamples: Array<{ rarity: string; count: number; biome?: string }> = [];

  for (const requirement of key.recipe.samples) {
    // Filter samples that match the requirement
    const matchingSamples = samplesCollected.filter(sampleId => {
      const sample = ALL_SAMPLES.find(s => s.id === sampleId);
      if (!sample) return false;

      // Check rarity match
      if (sample.rarity !== requirement.rarity) return false;

      // Check biome match if specified
      if (requirement.biome && sample.biome !== requirement.biome) return false;

      return true;
    });

    const collected = matchingSamples.length;
    const needed = requirement.count;

    if (collected < needed) {
      missingSamples.push({
        rarity: requirement.rarity,
        count: needed - collected,
        biome: requirement.biome,
      });
    }
  }

  return {
    canCraft: missingSamples.length === 0,
    missingSamples,
  };
}

/**
 * Craft a key by consuming required samples
 */
export function craftKey(
  key: Key,
  samplesCollected: string[] // Array of sample IDs
): CraftingResult {
  // Check if key can be crafted
  const craftCheck = canCraftKey(key, samplesCollected);
  if (!craftCheck.canCraft) {
    return {
      success: false,
      error: `Missing required samples: ${craftCheck.missingSamples
        .map(m => `${m.count} ${m.rarity}${m.biome ? ` from ${m.biome}` : ''}`)
        .join(', ')}`,
    };
  }

  // Consume samples for crafting
  const samplesUsed: string[] = [];
  const remainingSamples = [...samplesCollected];

  for (const requirement of key.recipe.samples) {
    let toConsume = requirement.count;

    // Find and remove matching samples
    for (let i = remainingSamples.length - 1; i >= 0 && toConsume > 0; i--) {
      const sampleId = remainingSamples[i];
      const sample = ALL_SAMPLES.find(s => s.id === sampleId);

      if (!sample) continue;

      // Check if this sample matches the requirement
      const matchesRarity = sample.rarity === requirement.rarity;
      const matchesBiome = !requirement.biome || sample.biome === requirement.biome;

      if (matchesRarity && matchesBiome) {
        samplesUsed.push(sampleId);
        remainingSamples.splice(i, 1);
        toConsume--;
      }
    }
  }

  return {
    success: true,
    key,
    samplesUsed,
  };
}

/**
 * Get list of keys that can currently be crafted
 */
export function getAvailableKeys(
  samplesCollected: string[],
  craftedKeys: string[]
): Key[] {
  return ALL_KEYS.filter(key => {
    // Skip already crafted keys
    if (craftedKeys.includes(key.id)) return false;

    // Check if can be crafted
    const { canCraft } = canCraftKey(key, samplesCollected);
    return canCraft;
  });
}

/**
 * Get crafting recipe requirements as human-readable text
 */
export function getRecipeText(key: Key): string {
  return key.recipe.samples
    .map(req => {
      const biomeText = req.biome ? ` from ${req.biome.replace(/-/g, ' ')}` : '';
      return `${req.count} ${req.rarity}${req.count > 1 ? ' samples' : ' sample'}${biomeText}`;
    })
    .join(', ');
}

/**
 * Get unlock benefits as human-readable text
 */
export function getUnlocksText(key: Key): string[] {
  const benefits: string[] = [];

  if (key.unlocks.locations && key.unlocks.locations.length > 0) {
    benefits.push(`Unlocks ${key.unlocks.locations.length} hidden location${key.unlocks.locations.length > 1 ? 's' : ''}`);
  }

  if (key.unlocks.equipment && key.unlocks.equipment.length > 0) {
    benefits.push(`Unlocks ${key.unlocks.equipment.length} equipment piece${key.unlocks.equipment.length > 1 ? 's' : ''}`);
  }

  if (key.unlocks.cosmetics && key.unlocks.cosmetics.length > 0) {
    benefits.push(`Unlocks ${key.unlocks.cosmetics.length} cosmetic${key.unlocks.cosmetics.length > 1 ? 's' : ''}`);
  }

  if (key.unlocks.bonuses) {
    const bonuses = key.unlocks.bonuses;

    if (bonuses.xpMultiplier) {
      benefits.push(`+${(bonuses.xpMultiplier * 100).toFixed(0)}% XP gain`);
    }

    if (bonuses.rarityBonus) {
      benefits.push(`+${(bonuses.rarityBonus * 100).toFixed(0)}% rarity chance`);
    }

    if (bonuses.energyEfficiency) {
      benefits.push(`+${bonuses.energyEfficiency}% energy efficiency`);
    }

    if (bonuses.debuffImmunity && bonuses.debuffImmunity.length > 0) {
      benefits.push(`Immunity to ${bonuses.debuffImmunity.join(', ')}`);
    }
  }

  return benefits;
}

/**
 * Calculate total bonus from all crafted keys
 */
export function calculateKeyBonuses(craftedKeys: string[]): {
  xpMultiplier: number;
  rarityBonus: number;
  energyEfficiency: number;
  debuffImmunity: string[];
} {
  const bonuses = {
    xpMultiplier: 0,
    rarityBonus: 0,
    energyEfficiency: 0,
    debuffImmunity: [] as string[],
  };

  for (const keyId of craftedKeys) {
    const key = ALL_KEYS.find((k: Key) => k.id === keyId);
    if (!key || !key.unlocks.bonuses) continue;

    const keyBonuses = key.unlocks.bonuses;

    if (keyBonuses.xpMultiplier) {
      bonuses.xpMultiplier += keyBonuses.xpMultiplier;
    }

    if (keyBonuses.rarityBonus) {
      bonuses.rarityBonus += keyBonuses.rarityBonus;
    }

    if (keyBonuses.energyEfficiency) {
      bonuses.energyEfficiency += keyBonuses.energyEfficiency;
    }

    if (keyBonuses.debuffImmunity) {
      bonuses.debuffImmunity.push(...keyBonuses.debuffImmunity);
    }
  }

  // Remove duplicate debuff immunities
  bonuses.debuffImmunity = [...new Set(bonuses.debuffImmunity)];

  return bonuses;
}
