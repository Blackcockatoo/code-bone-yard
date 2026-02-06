/**
 * Keys System
 * Phase 5: Unlock-based progression with key crafting
 */

// Types
export type { Key, KeyType, KeyRecipe, KeyUnlocks, KeyState, CraftingResult } from './types';

// Key definitions
export { ALL_KEYS, KEYS_BY_TYPE, getKey, getKeysByType, getUncraftedKeys } from './keys';
export {
  MOSS_KEY,
  CRYSTAL_KEY,
  VOID_KEY,
  UPGRADE_KEY,
  MASTER_KEY,
  AESTHETIC_KEY,
  TRANSCENDENCE_KEY,
} from './keys';

// Crafting functions
export {
  canCraftKey,
  craftKey,
  getAvailableKeys,
  getRecipeText,
  getUnlocksText,
  calculateKeyBonuses,
} from './crafting';

// Unlock functions
export {
  applyKeyUnlocks,
  isLocationUnlocked,
  isEquipmentUnlocked,
  isCosmeticUnlocked,
  getUnlockedHiddenLocations,
  getUnlockNotifications,
} from './unlocks';
