/**
 * Biome definitions for the Vimana Exploration System
 * Phase 4: 5 distinct biomes with unique themes and mechanics
 */

import type { Biome, BiomeType } from './types';

// ============================================================================
// Biome Definitions
// ============================================================================

export const BIOMES: Record<BiomeType, Biome> = {
  'starting-grove': {
    id: 'starting-grove',
    name: 'Starting Grove',
    description:
      'A serene forest of moss-covered clearings and ancient trees. Perfect for learning the basics of exploration. No health risks, gentle introduction to scanning mechanics.',
    unlockRequirements: {
      // Always unlocked - tutorial zone
    },
    theme: {
      primaryColor: '#4ade80', // green-400
      secondaryColor: '#fbbf24', // amber-400
      ambientEffect: 'gentle-breeze',
      icon: '🌳',
    },
    locationIds: [
      'moss-covered-clearing',
      'ancient-oak-circle',
      'whispering-brook',
      'twilight-meadow',
      'forgotten-shrine',
    ],
    rarityMultiplier: 1.0, // Baseline
    specialMechanics: 'Tutorial guidance enabled. No failure penalties. Safe exploration zone.',
  },

  'crystal-caverns': {
    id: 'crystal-caverns',
    name: 'Crystal Caverns',
    description:
      'Underground crystalline chambers where light refracts through prismatic formations. Echo-based puzzles and rare mineral deposits await discovery.',
    unlockRequirements: {
      scanLevel: 2,
      // Alternative: 25 curiosity (OR condition, implemented in logic)
    },
    theme: {
      primaryColor: '#a855f7', // purple-500
      secondaryColor: '#06b6d4', // cyan-500
      ambientEffect: 'crystal-resonance',
      icon: '💎',
    },
    locationIds: [
      'glittering-tunnel',
      'echo-chamber',
      'prismatic-lake',
      'stalactite-cathedral',
      'geode-grotto',
    ],
    rarityMultiplier: 1.2, // +20% increased rare spawns
    specialMechanics: 'Echo mechanics active. Sound-based anomaly puzzles. Low health risk (5% chance).',
  },

  'void-nexus': {
    id: 'void-nexus',
    name: 'Void Nexus',
    description:
      'A dangerous realm where reality bends and corruption spreads. High risk, but legendary rewards for brave explorers. Boss encounters await at the Event Horizon.',
    unlockRequirements: {
      scanLevel: 3,
      curiosity: 100,
    },
    theme: {
      primaryColor: '#1e1b4b', // indigo-950
      secondaryColor: '#dc2626', // red-600
      ambientEffect: 'void-distortion',
      icon: '🌀',
    },
    locationIds: [
      'rift-gateway',
      'gravity-well',
      'shadow-pools',
      'null-point',
      'event-horizon',
    ],
    rarityMultiplier: 1.5, // +50% high legendary spawn rate
    specialMechanics:
      'Corruption debuffs active. High health risk (20% chance). Boss encounter location. Maximum rewards.',
  },

  'dream-spire': {
    id: 'dream-spire',
    name: 'Dream Spire',
    description:
      'A towering structure among the clouds where dreams and memories converge. Integrates with your dream journal for unique bonuses and atmospheric discoveries.',
    unlockRequirements: {
      scanLevel: 4,
      dreamJournalEntries: 10,
    },
    theme: {
      primaryColor: '#38bdf8', // sky-400
      secondaryColor: '#f472b6', // pink-400
      ambientEffect: 'dream-shimmer',
      icon: '☁️',
    },
    locationIds: [
      'cloud-observatory',
      'starlight-terrace',
      'memory-chamber',
      'aurora-platform',
      'zenith-summit',
    ],
    rarityMultiplier: 1.3, // +30% increased rare spawns
    specialMechanics:
      'Dream journal integration. Time-based event triggers. Memory-based puzzles. Medium health risk (10% chance).',
  },

  'eternal-garden': {
    id: 'eternal-garden',
    name: 'Eternal Garden',
    description:
      'The ultimate endgame zone where infinity meets transcendence. Fibonacci-aligned locations, breeding bonuses, and guaranteed legendary finds. Procedural content ensures endless exploration.',
    unlockRequirements: {
      scanLevel: 5,
      achievement: 'master-explorer',
    },
    theme: {
      primaryColor: '#fcd34d', // amber-300
      secondaryColor: '#f8fafc', // slate-50
      ambientEffect: 'transcendent-glow',
      icon: '🌸',
    },
    locationIds: [
      'genesis-pool',
      'fibonacci-grove',
      'fractal-labyrinth',
      'infinity-garden',
      'transcendence-point',
    ],
    rarityMultiplier: 2.0, // +100% doubled legendary spawn rate
    specialMechanics:
      'Breeding enhancement samples. Math-based puzzles. Guaranteed legendary per session. Extreme health risk (15% chance). Infinite procedural content.',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get biome by ID
 */
export function getBiome(biomeId: BiomeType): Biome {
  return BIOMES[biomeId];
}

/**
 * Get all biomes as array
 */
export function getAllBiomes(): Biome[] {
  return Object.values(BIOMES);
}

/**
 * Check if a biome is unlocked based on requirements
 */
export function isBiomeUnlocked(
  biomeId: BiomeType,
  state: {
    scanLevel: number;
    curiosity: number;
    dreamJournalEntries: number;
    achievements: string[];
  }
): boolean {
  const biome = BIOMES[biomeId];

  // Starting grove is always unlocked
  if (biomeId === 'starting-grove') {
    return true;
  }

  const requirements = biome.unlockRequirements;

  // Check scan level requirement
  if (requirements.scanLevel && state.scanLevel < requirements.scanLevel) {
    return false;
  }

  // Check curiosity requirement
  if (requirements.curiosity && state.curiosity < requirements.curiosity) {
    return false;
  }

  // Check dream journal requirement
  if (
    requirements.dreamJournalEntries &&
    state.dreamJournalEntries < requirements.dreamJournalEntries
  ) {
    return false;
  }

  // Check achievement requirement
  if (
    requirements.achievement &&
    !state.achievements.includes(requirements.achievement)
  ) {
    return false;
  }

  // Special case: Crystal Caverns can be unlocked with EITHER scan level 2 OR 25 curiosity
  if (biomeId === 'crystal-caverns') {
    return state.scanLevel >= 2 || state.curiosity >= 25;
  }

  return true;
}

/**
 * Get unlock hint for locked biome
 */
export function getBiomeUnlockHint(biomeId: BiomeType): string {
  const biome = BIOMES[biomeId];
  const requirements = biome.unlockRequirements;

  const hints: string[] = [];

  if (requirements.scanLevel) {
    hints.push(`Scan Level ${requirements.scanLevel}`);
  }

  if (requirements.curiosity) {
    hints.push(`${requirements.curiosity} Curiosity`);
  }

  if (requirements.dreamJournalEntries) {
    hints.push(`${requirements.dreamJournalEntries} Dream Journal Entries`);
  }

  if (requirements.achievement) {
    hints.push(`Achievement: ${requirements.achievement}`);
  }

  // Special case for Crystal Caverns
  if (biomeId === 'crystal-caverns') {
    return 'Unlock: Scan Level 2 OR 25 Curiosity';
  }

  return hints.length > 0 ? `Unlock: ${hints.join(' + ')}` : 'Unlocked';
}

/**
 * Get biomes that should unlock at a given scan level
 */
export function getBiomesUnlockedAtLevel(level: number): BiomeType[] {
  return Object.entries(BIOMES)
    .filter(([, biome]) => biome.unlockRequirements.scanLevel === level)
    .map(([id]) => id as BiomeType);
}

/**
 * Get next biome to unlock
 */
export function getNextBiomeToUnlock(
  unlockedBiomes: BiomeType[]
): BiomeType | null {
  const allBiomes: BiomeType[] = [
    'starting-grove',
    'crystal-caverns',
    'void-nexus',
    'dream-spire',
    'eternal-garden',
  ];

  return allBiomes.find((biome) => !unlockedBiomes.includes(biome)) || null;
}

/**
 * Calculate total biome completion percentage
 */
export function getBiomeCompletionPercentage(
  biomeId: BiomeType,
  state: {
    locationsVisited: string[];
    anomaliesCompleted: string[];
    samplesCollected: string[];
  }
): number {
  const biome = BIOMES[biomeId];

  // Count visited locations from this biome
  const visitedCount = biome.locationIds.filter((locId) =>
    state.locationsVisited.includes(locId)
  ).length;

  const totalLocations = biome.locationIds.length;

  return totalLocations > 0 ? (visitedCount / totalLocations) * 100 : 0;
}
