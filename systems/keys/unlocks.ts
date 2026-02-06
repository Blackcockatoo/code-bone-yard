/**
 * Key Unlock Effects
 * Phase 5: Apply unlocks when keys are crafted
 */

import type { Key } from './types';

/**
 * Apply all unlock effects from a key
 */
export function applyKeyUnlocks(key: Key, currentState: {
  unlockedLocations: string[];
  unlockedEquipment: string[];
  unlockedCosmetics: string[];
}): {
  unlockedLocations: string[];
  unlockedEquipment: string[];
  unlockedCosmetics: string[];
  newUnlocks: {
    locations: string[];
    equipment: string[];
    cosmetics: string[];
  };
} {
  const newLocations = key.unlocks.locations || [];
  const newEquipment = key.unlocks.equipment || [];
  const newCosmetics = key.unlocks.cosmetics || [];

  return {
    unlockedLocations: [
      ...currentState.unlockedLocations,
      ...newLocations.filter(loc => !currentState.unlockedLocations.includes(loc)),
    ],
    unlockedEquipment: [
      ...currentState.unlockedEquipment,
      ...newEquipment.filter(eq => !currentState.unlockedEquipment.includes(eq)),
    ],
    unlockedCosmetics: [
      ...currentState.unlockedCosmetics,
      ...newCosmetics.filter(cos => !currentState.unlockedCosmetics.includes(cos)),
    ],
    newUnlocks: {
      locations: newLocations,
      equipment: newEquipment,
      cosmetics: newCosmetics,
    },
  };
}

/**
 * Check if a location is unlocked (either by progression or by key)
 */
export function isLocationUnlocked(
  locationId: string,
  unlockedByProgression: string[],
  unlockedByKeys: string[]
): boolean {
  return (
    unlockedByProgression.includes(locationId) ||
    unlockedByKeys.includes(locationId)
  );
}

/**
 * Check if equipment is unlocked (either by progression or by key)
 */
export function isEquipmentUnlocked(
  equipmentId: string,
  unlockedByProgression: string[],
  unlockedByKeys: string[]
): boolean {
  return (
    unlockedByProgression.includes(equipmentId) ||
    unlockedByKeys.includes(equipmentId)
  );
}

/**
 * Check if cosmetic is unlocked (either by achievement or by key)
 */
export function isCosmeticUnlocked(
  cosmeticId: string,
  unlockedByAchievements: string[],
  unlockedByKeys: string[]
): boolean {
  return (
    unlockedByAchievements.includes(cosmeticId) ||
    unlockedByKeys.includes(cosmeticId)
  );
}

/**
 * Get all currently unlocked hidden locations
 */
export function getUnlockedHiddenLocations(keyState: {
  unlockedLocations: string[];
}): string[] {
  return keyState.unlockedLocations;
}

/**
 * Get human-readable unlock notifications
 */
export function getUnlockNotifications(newUnlocks: {
  locations: string[];
  equipment: string[];
  cosmetics: string[];
}): string[] {
  const notifications: string[] = [];

  if (newUnlocks.locations.length > 0) {
    for (const locationId of newUnlocks.locations) {
      const locationName = locationId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      notifications.push(`🗺️ Unlocked hidden location: ${locationName}`);
    }
  }

  if (newUnlocks.equipment.length > 0) {
    for (const equipmentId of newUnlocks.equipment) {
      const equipmentName = equipmentId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      notifications.push(`⚙️ Unlocked equipment: ${equipmentName}`);
    }
  }

  if (newUnlocks.cosmetics.length > 0) {
    for (const cosmeticId of newUnlocks.cosmetics) {
      const cosmeticName = cosmeticId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      notifications.push(`✨ Unlocked cosmetic: ${cosmeticName}`);
    }
  }

  return notifications;
}
