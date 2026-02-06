/**
 * Key Definitions
 * Phase 5: All 7 craftable keys
 */

import type { Key } from './types';

// ============================================================================
// Exploration Keys (3 types)
// ============================================================================

export const MOSS_KEY: Key = {
  id: 'moss-key',
  name: 'Moss Key',
  description: 'A key woven from ancient moss spores, pulsing with natural energy.',
  type: 'exploration',
  recipe: {
    samples: [
      {
        rarity: 'common',
        count: 3,
        biome: 'starting-grove',
      },
    ],
  },
  unlocks: {
    locations: ['secret-glade'],
    bonuses: {
      xpMultiplier: 0.05, // +5% XP in Starting Grove
    },
  },
  lore: 'The first explorers discovered that moss spores from the Starting Grove could unlock hidden pathways.',
};

export const CRYSTAL_KEY: Key = {
  id: 'crystal-key',
  name: 'Crystal Key',
  description: 'A shimmering key forged from prismatic crystals, refracting light into rainbows.',
  type: 'exploration',
  recipe: {
    samples: [
      {
        rarity: 'common',
        count: 5,
        biome: 'crystal-caverns',
      },
      {
        rarity: 'rare',
        count: 2,
        biome: 'crystal-caverns',
      },
    ],
  },
  unlocks: {
    locations: ['diamond-chamber'],
    bonuses: {
      rarityBonus: 0.10, // +10% rare spawn in Crystal Caverns
    },
  },
  lore: 'Deep within the caverns lies a chamber of pure diamond, accessible only to those who understand crystal resonance.',
};

export const VOID_KEY: Key = {
  id: 'void-key',
  name: 'Void Key',
  description: 'A key of crystallized void energy, cold to the touch and humming with dark power.',
  type: 'exploration',
  recipe: {
    samples: [
      {
        rarity: 'rare',
        count: 3,
        biome: 'void-nexus',
      },
      {
        rarity: 'legendary',
        count: 1,
        biome: 'void-nexus',
      },
    ],
  },
  unlocks: {
    locations: ['nexus-core'],
    bonuses: {
      debuffImmunity: ['corruption', 'void-sickness'],
    },
  },
  lore: 'Only those who master the void can reach its core without succumbing to corruption.',
};

// ============================================================================
// Equipment Keys (2 types)
// ============================================================================

export const UPGRADE_KEY: Key = {
  id: 'upgrade-key',
  name: 'Upgrade Key',
  description: 'A master key that unlocks the potential within your equipment.',
  type: 'equipment',
  recipe: {
    samples: [
      {
        rarity: 'rare',
        count: 10,
        // No biome restriction - can be from any biome
      },
    ],
  },
  unlocks: {
    equipment: ['equipment-upgrade-system'],
    bonuses: {
      energyEfficiency: 5, // +5% energy efficiency
    },
  },
  lore: 'Equipment can be enhanced beyond its original design, but only by those who have proven their dedication.',
};

export const MASTER_KEY: Key = {
  id: 'master-key',
  name: 'Master Key',
  description: 'The ultimate key, crafted from legendary essence, unlocking equipment of myth.',
  type: 'equipment',
  recipe: {
    samples: [
      {
        rarity: 'legendary',
        count: 5,
        // No biome restriction
      },
    ],
  },
  unlocks: {
    equipment: ['prismatic-scanner', 'infinite-toolkit'],
  },
  lore: 'Legends speak of equipment that transcends mortal understanding. This key opens that door.',
};

// ============================================================================
// Cosmetic Keys (2 types)
// ============================================================================

export const AESTHETIC_KEY: Key = {
  id: 'aesthetic-key',
  name: 'Aesthetic Key',
  description: 'A beautiful key that unlocks the hidden beauty within your guardian.',
  type: 'cosmetic',
  recipe: {
    samples: [
      {
        rarity: 'common',
        count: 20,
        // No biome restriction - but all must be same rarity
      },
    ],
  },
  unlocks: {
    cosmetics: [
      'aurora-form',
      'shadow-form',
      'prismatic-form',
      'celestial-aura',
      'void-crown',
    ],
  },
  lore: 'True beauty is found in dedication - collecting twenty samples of the same rarity reveals hidden forms.',
};

export const TRANSCENDENCE_KEY: Key = {
  id: 'transcendence-key',
  name: 'Transcendence Key',
  description: 'A key of pure essence, forged from the legendary heart of each biome.',
  type: 'cosmetic',
  recipe: {
    samples: [
      {
        rarity: 'legendary',
        count: 1,
        biome: 'starting-grove',
      },
      {
        rarity: 'legendary',
        count: 1,
        biome: 'crystal-caverns',
      },
      {
        rarity: 'legendary',
        count: 1,
        biome: 'void-nexus',
      },
      {
        rarity: 'legendary',
        count: 1,
        biome: 'dream-spire',
      },
      {
        rarity: 'legendary',
        count: 1,
        biome: 'eternal-garden',
      },
    ],
  },
  unlocks: {
    cosmetics: [
      'infinite-form',
      'transcendent-aura',
      'genesis-bloom-ultimate',
    ],
  },
  lore: 'To transcend is to unite all essences. Only those who have explored every realm can achieve this form.',
};

// ============================================================================
// All Keys Collection
// ============================================================================

export const ALL_KEYS: Key[] = [
  MOSS_KEY,
  CRYSTAL_KEY,
  VOID_KEY,
  UPGRADE_KEY,
  MASTER_KEY,
  AESTHETIC_KEY,
  TRANSCENDENCE_KEY,
];

export const KEYS_BY_TYPE = {
  exploration: [MOSS_KEY, CRYSTAL_KEY, VOID_KEY],
  equipment: [UPGRADE_KEY, MASTER_KEY],
  cosmetic: [AESTHETIC_KEY, TRANSCENDENCE_KEY],
};

/**
 * Get key by ID
 */
export function getKey(keyId: string): Key | undefined {
  return ALL_KEYS.find(key => key.id === keyId);
}

/**
 * Get all keys of a specific type
 */
export function getKeysByType(type: 'exploration' | 'equipment' | 'cosmetic'): Key[] {
  return KEYS_BY_TYPE[type];
}

/**
 * Get keys that are not yet crafted
 */
export function getUncraftedKeys(craftedKeyIds: string[]): Key[] {
  return ALL_KEYS.filter(key => !craftedKeyIds.includes(key.id));
}
