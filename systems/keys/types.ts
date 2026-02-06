/**
 * Keys System Types
 * Phase 5: Unlock-based progression with key crafting
 */

import type { Rarity } from '../exploration/types';
import type { BiomeType } from '../exploration/types';

export type KeyType = 'exploration' | 'equipment' | 'cosmetic';

export interface KeyRecipe {
  samples: Array<{
    rarity: Rarity;
    count: number;
    biome?: BiomeType; // If specified, must be from this biome
  }>;
}

export interface KeyUnlocks {
  locations?: string[];        // Hidden location IDs to unlock
  equipment?: string[];         // Equipment IDs to unlock
  cosmetics?: string[];         // Cosmetic IDs to unlock
  bonuses?: {
    xpMultiplier?: number;      // Bonus XP multiplier (additive)
    rarityBonus?: number;       // Bonus rarity chance (additive)
    debuffImmunity?: string[];  // Debuff IDs to become immune to
    energyEfficiency?: number;  // % reduction in energy costs
  };
}

export interface Key {
  id: string;
  name: string;
  description: string;
  type: KeyType;
  recipe: KeyRecipe;
  unlocks: KeyUnlocks;
  lore?: string;                // Optional lore text
}

export interface KeyState {
  crafted: string[];            // IDs of keys that have been crafted
  available: string[];          // IDs of keys that can be crafted (have materials)
  unlockedLocations: string[];  // Hidden location IDs unlocked by keys
  unlockedEquipment: string[];  // Equipment unlocked by keys
  unlockedCosmetics: string[];  // Cosmetics unlocked by keys
}

export interface CraftingResult {
  success: boolean;
  key?: Key;
  error?: string;
  samplesUsed?: string[];       // Sample IDs consumed in crafting
}
