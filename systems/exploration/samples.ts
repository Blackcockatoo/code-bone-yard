/**
 * Sample definitions for the Vimana Exploration System
 * Phase 4: 15 sample types (5 common, 5 rare, 5 legendary)
 */

import type { Sample, BiomeType, Rarity } from './types';

// ============================================================================
// Common Samples (5 types)
// ============================================================================

const COMMON_SAMPLES: Sample[] = [
  {
    id: 'moss-spore',
    name: 'Moss Spore',
    rarity: 'common',
    description:
      'Soft, luminescent spores from ancient moss. Provides a gentle energy boost.',
    biome: 'starting-grove',
    iconType: '🌿',
    effects: {
      energy: 5,
      curiosity: 10,
    },
  },

  {
    id: 'crystal-shard',
    name: 'Crystal Shard',
    rarity: 'common',
    description:
      'A fragment of resonant crystal. Enhances focus and clarity of thought.',
    biome: 'crystal-caverns',
    iconType: '💎',
    effects: {
      energy: 5,
      curiosity: 15,
    },
    collectionBonus: {
      stat: 'curiosity',
      amount: 10,
      threshold: 10, // Collect 10 for +10 permanent curiosity
    },
  },

  {
    id: 'shadow-essence',
    name: 'Shadow Essence',
    rarity: 'common',
    description:
      'Condensed darkness from the Void Nexus. Strangely energizing despite its appearance.',
    biome: 'void-nexus',
    iconType: '🌑',
    effects: {
      energy: 10,
      health: -5, // Small health cost
      curiosity: 20,
    },
  },

  {
    id: 'cloud-vapor',
    name: 'Cloud Vapor',
    rarity: 'common',
    description:
      'Bottled essence of dreams and sky. Lightens the mood and restores health.',
    biome: 'dream-spire',
    iconType: '☁️',
    effects: {
      health: 10,
      bond: 5,
      curiosity: 10,
    },
  },

  {
    id: 'petal-fragment',
    name: 'Petal Fragment',
    rarity: 'common',
    description:
      'A single petal from the Eternal Garden. Contains traces of infinite potential.',
    biome: 'eternal-garden',
    iconType: '🌸',
    effects: {
      energy: 8,
      curiosity: 15,
      bond: 5,
    },
  },
];

// ============================================================================
// Rare Samples (5 types)
// ============================================================================

const RARE_SAMPLES: Sample[] = [
  {
    id: 'prismatic-geode',
    name: 'Prismatic Geode',
    rarity: 'rare',
    description:
      'A crystalline structure that refracts insight into multiple dimensions. Significantly boosts curiosity.',
    biome: 'crystal-caverns',
    iconType: '💠',
    effects: {
      curiosity: 50,
      energy: 10,
    },
    collectionBonus: {
      stat: 'curiosity',
      amount: 25,
      threshold: 5, // Collect 5 for +25 permanent curiosity
    },
  },

  {
    id: 'void-crystal',
    name: 'Void Crystal',
    rarity: 'rare',
    description:
      'Crystallized void energy that pulses with dark power. Enhances energy regeneration.',
    biome: 'void-nexus',
    iconType: '🔮',
    effects: {
      energy: 30,
      curiosity: 30,
    },
    unlocks: {
      cosmetic: 'void-aura',
    },
  },

  {
    id: 'starlight-nectar',
    name: 'Starlight Nectar',
    rarity: 'rare',
    description:
      'Distilled starlight in liquid form. Strengthens the bond between guardian and explorer.',
    biome: 'dream-spire',
    iconType: '⭐',
    effects: {
      bond: 20,
      curiosity: 30,
      health: 10,
    },
    unlocks: {
      cosmetic: 'starlight-trail',
    },
  },

  {
    id: 'fibonacci-seed',
    name: 'Fibonacci Seed',
    rarity: 'rare',
    description:
      'A seed encoded with perfect mathematical sequences. Enhances breeding success rates.',
    biome: 'eternal-garden',
    iconType: '🌱',
    effects: {
      curiosity: 40,
      bond: 15,
    },
    // Note: Breeding enhancement would be handled by breeding system
  },

  {
    id: 'echo-stone',
    name: 'Echo Stone',
    rarity: 'rare',
    description:
      'A stone that remembers everything it hears. Unlocks special echo anomaly variants.',
    biome: 'crystal-caverns',
    iconType: '🗿',
    effects: {
      curiosity: 35,
      energy: 15,
    },
    unlocks: {
      location: 'resonance-chamber', // Could unlock a hidden location
    },
  },
];

// ============================================================================
// Legendary Samples (5 types)
// ============================================================================

const LEGENDARY_SAMPLES: Sample[] = [
  {
    id: 'genesis-fragment',
    name: 'Genesis Fragment',
    rarity: 'legendary',
    description:
      'A piece of the primordial creation force. Can unlock entirely new genome traits for breeding.',
    biome: 'eternal-garden',
    iconType: '✨',
    effects: {
      energy: 50,
      curiosity: 100,
      bond: 25,
      health: 20,
    },
    unlocks: {
      achievement: 'genesis-discoverer',
    },
    collectionBonus: {
      stat: 'energy',
      amount: 20,
      threshold: 3, // Collect 3 for +20 permanent energy cap
    },
  },

  {
    id: 'infinity-shard',
    name: 'Infinity Shard',
    rarity: 'legendary',
    description:
      'A fragment of eternity itself. Grants permanent stat boosts to all attributes.',
    biome: 'eternal-garden',
    iconType: '♾️',
    effects: {
      energy: 40,
      curiosity: 80,
      bond: 20,
      health: 30,
    },
  },

  {
    id: 'transcendent-core',
    name: 'Transcendent Core',
    rarity: 'legendary',
    description:
      'The heart of transcendence. Unlocks the deepest layers of the Eternal Garden.',
    biome: 'eternal-garden',
    iconType: '🔆',
    effects: {
      energy: 45,
      curiosity: 90,
      bond: 25,
      health: 25,
    },
    unlocks: {
      location: 'transcendence-depths',
      achievement: 'transcendence-achieved',
    },
  },

  {
    id: 'primordial-essence',
    name: 'Primordial Essence',
    rarity: 'legendary',
    description:
      'Pure essence of the first beings. Enables legendary trait breeding combinations.',
    biome: 'void-nexus',
    iconType: '🌟',
    effects: {
      energy: 40,
      curiosity: 85,
      bond: 30,
    },
    unlocks: {
      achievement: 'primordial-keeper',
      cosmetic: 'primordial-glow',
    },
  },

  {
    id: 'cosmic-seed',
    name: 'Cosmic Seed',
    rarity: 'legendary',
    description:
      'A seed containing the pattern of the universe. The ultimate achievement unlock.',
    biome: 'dream-spire',
    iconType: '🌌',
    effects: {
      energy: 50,
      curiosity: 100,
      bond: 25,
      health: 25,
    },
    unlocks: {
      achievement: 'cosmic-gardener',
      cosmetic: 'cosmic-wings',
    },
  },
];

// ============================================================================
// All Samples Combined
// ============================================================================

export const ALL_SAMPLES: Sample[] = [
  ...COMMON_SAMPLES,
  ...RARE_SAMPLES,
  ...LEGENDARY_SAMPLES,
];

// Export alias for tests
export const SAMPLES = ALL_SAMPLES;

export const SAMPLES_BY_RARITY: Record<Rarity, Sample[]> = {
  common: COMMON_SAMPLES,
  rare: RARE_SAMPLES,
  legendary: LEGENDARY_SAMPLES,
};

export const SAMPLES_BY_BIOME: Record<BiomeType, Sample[]> = {
  'starting-grove': ALL_SAMPLES.filter((s) => s.biome === 'starting-grove'),
  'crystal-caverns': ALL_SAMPLES.filter((s) => s.biome === 'crystal-caverns'),
  'void-nexus': ALL_SAMPLES.filter((s) => s.biome === 'void-nexus'),
  'dream-spire': ALL_SAMPLES.filter((s) => s.biome === 'dream-spire'),
  'eternal-garden': ALL_SAMPLES.filter((s) => s.biome === 'eternal-garden'),
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get sample by ID
 */
export function getSample(sampleId: string): Sample | undefined {
  return ALL_SAMPLES.find((sample) => sample.id === sampleId);
}

/**
 * Get samples by rarity
 */
export function getSamplesByRarity(rarity: Rarity): Sample[] {
  return SAMPLES_BY_RARITY[rarity] || [];
}

/**
 * Get samples by biome
 */
export function getSamplesByBiome(biome: BiomeType): Sample[] {
  return SAMPLES_BY_BIOME[biome] || [];
}

/**
 * Get random sample from biome with rarity filter
 */
export function getRandomSampleFromBiome(
  biome: BiomeType,
  rarity: Rarity
): Sample | undefined {
  const biomeSamples = getSamplesByBiome(biome);
  const raritySamples = biomeSamples.filter((s) => s.rarity === rarity);

  if (raritySamples.length === 0) {
    // Fallback to any sample from biome if no match
    return biomeSamples[Math.floor(Math.random() * biomeSamples.length)];
  }

  return raritySamples[Math.floor(Math.random() * raritySamples.length)];
}

/**
 * Calculate total stat benefits from sample
 */
export function calculateSampleBenefits(sample: Sample): {
  totalBenefit: number;
  breakdown: Record<string, number>;
} {
  const effects = sample.effects;
  const breakdown: Record<string, number> = {};

  let totalBenefit = 0;

  if (effects.energy) {
    breakdown.energy = effects.energy;
    totalBenefit += Math.abs(effects.energy);
  }

  if (effects.curiosity) {
    breakdown.curiosity = effects.curiosity;
    totalBenefit += Math.abs(effects.curiosity);
  }

  if (effects.bond) {
    breakdown.bond = effects.bond;
    totalBenefit += Math.abs(effects.bond);
  }

  if (effects.health) {
    breakdown.health = effects.health;
    totalBenefit += Math.abs(effects.health);
  }

  return { totalBenefit, breakdown };
}

/**
 * Check if sample collection bonus is earned
 */
export function checkCollectionBonus(
  sample: Sample,
  collectedSamples: string[]
): {
  hasBonus: boolean;
  current: number;
  required: number;
} {
  if (!sample.collectionBonus) {
    return { hasBonus: false, current: 0, required: 0 };
  }

  const collected = collectedSamples.filter((id) => id === sample.id).length;
  const hasBonus = collected >= sample.collectionBonus.threshold;

  return {
    hasBonus,
    current: collected,
    required: sample.collectionBonus.threshold,
  };
}

/**
 * Get all samples that grant achievements
 */
export function getSamplesWithAchievements(): Sample[] {
  return ALL_SAMPLES.filter((sample) => sample.unlocks?.achievement);
}

/**
 * Get all samples that grant cosmetics
 */
export function getSamplesWithCosmetics(): Sample[] {
  return ALL_SAMPLES.filter((sample) => sample.unlocks?.cosmetic);
}

/**
 * Calculate sample value score (for sorting/display)
 */
export function calculateSampleValue(sample: Sample): number {
  const rarityValues = { common: 1, rare: 3, legendary: 10 };
  const rarityValue = rarityValues[sample.rarity];

  const { totalBenefit } = calculateSampleBenefits(sample);

  const unlockBonus = sample.unlocks ? 5 : 0;
  const collectionBonus = sample.collectionBonus ? 3 : 0;

  return rarityValue * 10 + totalBenefit + unlockBonus + collectionBonus;
}

/**
 * Get samples sorted by value
 */
export function getSamplesSortedByValue(): Sample[] {
  return [...ALL_SAMPLES].sort(
    (a, b) => calculateSampleValue(b) - calculateSampleValue(a)
  );
}

/**
 * Get sample icon with rarity indicator
 */
export function getSampleDisplayIcon(sample: Sample): string {
  const rarityIndicators = {
    common: '○',
    rare: '◆',
    legendary: '★',
  };

  return `${rarityIndicators[sample.rarity]} ${sample.iconType}`;
}
