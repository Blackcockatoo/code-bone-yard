/**
 * Location definitions for the Vimana Exploration System
 * Phase 4: 25 unique locations across 5 biomes
 */

import type { Location, BiomeType } from './types';
import { DEFAULT_CONTENT_WEIGHTS } from './constants';

// ============================================================================
// Starting Grove Locations (5 locations)
// ============================================================================

const STARTING_GROVE_LOCATIONS: Location[] = [
  {
    id: 'moss-covered-clearing',
    name: 'Moss-Covered Clearing',
    biome: 'starting-grove',
    description:
      'A gentle clearing where soft moss cushions every step. The perfect place to learn how scanning works.',
    coordinates: { x: 3, y: 3 }, // Center - starting location
    requiredScanLevel: 1,
    energyCost: 5,
    difficultyRating: 1,
    contentWeights: {
      samples: 60,
      anomalies: 20,
      artifacts: 10,
      nothing: 10,
    },
    rarityModifier: 1.0,
  },

  {
    id: 'ancient-oak-circle',
    name: 'Ancient Oak Circle',
    biome: 'starting-grove',
    description:
      'Seven ancient oaks form a perfect heptagon. Their roots pulse with Fibonacci rhythm.',
    coordinates: { x: 2, y: 2 },
    requiredScanLevel: 1,
    energyCost: 5,
    difficultyRating: 1,
    contentWeights: {
      samples: 50,
      anomalies: 30,
      artifacts: 15,
      nothing: 5,
    },
    rarityModifier: 1.1,
  },

  {
    id: 'whispering-brook',
    name: 'Whispering Brook',
    biome: 'starting-grove',
    description:
      'Crystal-clear water flows over smooth stones, carrying whispers from deep underground.',
    coordinates: { x: 4, y: 2 },
    requiredScanLevel: 1,
    energyCost: 5,
    difficultyRating: 1,
    contentWeights: {
      samples: 55,
      anomalies: 25,
      artifacts: 10,
      nothing: 10,
    },
    rarityModifier: 1.0,
  },

  {
    id: 'twilight-meadow',
    name: 'Twilight Meadow',
    biome: 'starting-grove',
    description:
      'Wildflowers glow softly at dusk, revealing patterns only visible in twilight hours.',
    coordinates: { x: 2, y: 4 },
    requiredScanLevel: 1,
    energyCost: 5,
    difficultyRating: 1,
    contentWeights: {
      samples: 50,
      anomalies: 30,
      artifacts: 15,
      nothing: 5,
    },
    rarityModifier: 1.0,
    specialConditions: {
      timeOfDay: 'evening',
    },
  },

  {
    id: 'forgotten-shrine',
    name: 'Forgotten Shrine',
    biome: 'starting-grove',
    description:
      'An ancient shrine overgrown with vines. The first place where anomalies typically appear.',
    coordinates: { x: 4, y: 4 },
    requiredScanLevel: 1,
    energyCost: 5,
    difficultyRating: 2,
    contentWeights: {
      samples: 30,
      anomalies: 50,
      artifacts: 15,
      nothing: 5,
    },
    rarityModifier: 1.2,
  },
];

// ============================================================================
// Crystal Caverns Locations (5 locations)
// ============================================================================

const CRYSTAL_CAVERNS_LOCATIONS: Location[] = [
  {
    id: 'glittering-tunnel',
    name: 'Glittering Tunnel',
    biome: 'crystal-caverns',
    description:
      'Walls encrusted with quartz and amethyst create a dazzling light show when your scanner passes through.',
    coordinates: { x: 1, y: 1 },
    requiredScanLevel: 2,
    energyCost: 8,
    difficultyRating: 2,
    contentWeights: {
      samples: 55,
      anomalies: 25,
      artifacts: 15,
      nothing: 5,
    },
    rarityModifier: 1.2,
    healthRisk: { chance: 0.05, damage: 5 },
  },

  {
    id: 'echo-chamber',
    name: 'Echo Chamber',
    biome: 'crystal-caverns',
    description:
      'A vast chamber where sounds loop and harmonize. Echo anomalies are particularly common here.',
    coordinates: { x: 5, y: 1 },
    requiredScanLevel: 2,
    energyCost: 8,
    difficultyRating: 2,
    contentWeights: {
      samples: 20,
      anomalies: 60,
      artifacts: 15,
      nothing: 5,
    },
    rarityModifier: 1.1,
    healthRisk: { chance: 0.05, damage: 5 },
  },

  {
    id: 'prismatic-lake',
    name: 'Prismatic Lake',
    biome: 'crystal-caverns',
    description:
      'An underground lake that refracts light into impossible colors. Rich mineral deposits line the shore.',
    coordinates: { x: 3, y: 0 },
    requiredScanLevel: 2,
    energyCost: 8,
    difficultyRating: 2,
    contentWeights: {
      samples: 60,
      anomalies: 20,
      artifacts: 15,
      nothing: 5,
    },
    rarityModifier: 1.3,
    healthRisk: { chance: 0.05, damage: 5 },
  },

  {
    id: 'stalactite-cathedral',
    name: 'Stalactite Cathedral',
    biome: 'crystal-caverns',
    description:
      'Towering formations create a natural cathedral. High-value artifacts are sometimes found here.',
    coordinates: { x: 1, y: 5 },
    requiredScanLevel: 2,
    energyCost: 8,
    difficultyRating: 3,
    contentWeights: {
      samples: 30,
      anomalies: 30,
      artifacts: 35,
      nothing: 5,
    },
    rarityModifier: 1.4,
    healthRisk: { chance: 0.05, damage: 5 },
  },

  {
    id: 'geode-grotto',
    name: 'Geode Grotto',
    biome: 'crystal-caverns',
    description:
      'Massive geodes line the walls, some still sealed. Legendary sample spawn chance increased here.',
    coordinates: { x: 5, y: 5 },
    requiredScanLevel: 2,
    energyCost: 8,
    difficultyRating: 3,
    contentWeights: {
      samples: 65,
      anomalies: 15,
      artifacts: 15,
      nothing: 5,
    },
    rarityModifier: 1.5,
    healthRisk: { chance: 0.05, damage: 5 },
    specialConditions: {
      requiredCuriosity: 50,
    },
  },
];

// ============================================================================
// Void Nexus Locations (5 locations)
// ============================================================================

const VOID_NEXUS_LOCATIONS: Location[] = [
  {
    id: 'rift-gateway',
    name: 'Rift Gateway',
    biome: 'void-nexus',
    description:
      'Reality tears open here, revealing glimpses of impossible geometries beyond. Portal anomalies frequently appear.',
    coordinates: { x: 0, y: 3 },
    requiredScanLevel: 3,
    energyCost: 12,
    difficultyRating: 4,
    contentWeights: {
      samples: 30,
      anomalies: 55,
      artifacts: 10,
      nothing: 5,
    },
    rarityModifier: 1.5,
    healthRisk: { chance: 0.2, damage: 15 },
    specialConditions: {
      requiredCuriosity: 100,
    },
  },

  {
    id: 'gravity-well',
    name: 'Gravity Well',
    biome: 'void-nexus',
    description:
      'Physics breaks down in this region. Objects float, fall, and spiral in defiance of natural law.',
    coordinates: { x: 6, y: 3 },
    requiredScanLevel: 3,
    energyCost: 12,
    difficultyRating: 4,
    contentWeights: {
      samples: 50,
      anomalies: 35,
      artifacts: 10,
      nothing: 5,
    },
    rarityModifier: 1.6,
    healthRisk: { chance: 0.2, damage: 15 },
  },

  {
    id: 'shadow-pools',
    name: 'Shadow Pools',
    biome: 'void-nexus',
    description:
      'Pools of living darkness that can corrupt the unwary. High corruption debuff risk.',
    coordinates: { x: 1, y: 3 },
    requiredScanLevel: 3,
    energyCost: 12,
    difficultyRating: 4,
    contentWeights: {
      samples: 40,
      anomalies: 45,
      artifacts: 10,
      nothing: 5,
    },
    rarityModifier: 1.5,
    healthRisk: { chance: 0.25, damage: 20 },
  },

  {
    id: 'null-point',
    name: 'Null Point',
    biome: 'void-nexus',
    description:
      'The center of the Void Nexus where reality is thinnest. Extreme risk, extreme reward.',
    coordinates: { x: 3, y: 3 },
    requiredScanLevel: 3,
    energyCost: 12,
    difficultyRating: 5,
    contentWeights: {
      samples: 60,
      anomalies: 30,
      artifacts: 10,
      nothing: 0, // Always finds something
    },
    rarityModifier: 2.0,
    healthRisk: { chance: 0.2, damage: 15 },
    specialConditions: {
      requiredCuriosity: 120,
    },
  },

  {
    id: 'event-horizon',
    name: 'Event Horizon',
    biome: 'void-nexus',
    description:
      'A swirling vortex where the Corruption Entity awaits. Boss encounter location requiring full preparation.',
    coordinates: { x: 5, y: 3 },
    requiredScanLevel: 3,
    energyCost: 12,
    difficultyRating: 5,
    contentWeights: {
      samples: 20,
      anomalies: 70, // Boss anomaly
      artifacts: 10,
      nothing: 0,
    },
    rarityModifier: 2.0,
    healthRisk: { chance: 0.2, damage: 15 },
    specialConditions: {
      requiredCuriosity: 150,
      isBossLocation: true,
    },
  },
];

// ============================================================================
// Dream Spire Locations (5 locations)
// ============================================================================

const DREAM_SPIRE_LOCATIONS: Location[] = [
  {
    id: 'cloud-observatory',
    name: 'Cloud Observatory',
    biome: 'dream-spire',
    description:
      'Floating platforms allow observation of weather patterns that shift based on your mood.',
    coordinates: { x: 3, y: 1 },
    requiredScanLevel: 4,
    energyCost: 10,
    difficultyRating: 3,
    contentWeights: {
      samples: 55,
      anomalies: 30,
      artifacts: 10,
      nothing: 5,
    },
    rarityModifier: 1.3,
    healthRisk: { chance: 0.1, damage: 10 },
  },

  {
    id: 'starlight-terrace',
    name: 'Starlight Terrace',
    biome: 'dream-spire',
    description:
      'An open platform where starlight concentrates into tangible forms. Cosmic anomalies manifest here.',
    coordinates: { x: 2, y: 1 },
    requiredScanLevel: 4,
    energyCost: 10,
    difficultyRating: 3,
    contentWeights: {
      samples: 35,
      anomalies: 50,
      artifacts: 10,
      nothing: 5,
    },
    rarityModifier: 1.4,
    healthRisk: { chance: 0.1, damage: 10 },
  },

  {
    id: 'memory-chamber',
    name: 'Memory Chamber',
    biome: 'dream-spire',
    description:
      'Your dream journal entries manifest as tangible experiences. Memory anomalies reward those who journal regularly.',
    coordinates: { x: 4, y: 1 },
    requiredScanLevel: 4,
    energyCost: 10,
    difficultyRating: 3,
    contentWeights: {
      samples: 30,
      anomalies: 55,
      artifacts: 10,
      nothing: 5,
    },
    rarityModifier: 1.3,
    healthRisk: { chance: 0.1, damage: 10 },
    specialConditions: {
      requiredCuriosity: 150,
    },
  },

  {
    id: 'aurora-platform',
    name: 'Aurora Platform',
    biome: 'dream-spire',
    description:
      'Shimmering auroras dance across the sky, creating breathtaking visual phenomena.',
    coordinates: { x: 3, y: 2 },
    requiredScanLevel: 4,
    energyCost: 10,
    difficultyRating: 3,
    contentWeights: {
      samples: 50,
      anomalies: 35,
      artifacts: 10,
      nothing: 5,
    },
    rarityModifier: 1.35,
    healthRisk: { chance: 0.1, damage: 10 },
  },

  {
    id: 'zenith-summit',
    name: 'Zenith Summit',
    biome: 'dream-spire',
    description:
      'The highest point of the Dream Spire. The Dream Guardian boss awaits those who reach this pinnacle.',
    coordinates: { x: 3, y: 0 },
    requiredScanLevel: 4,
    energyCost: 10,
    difficultyRating: 5,
    contentWeights: {
      samples: 20,
      anomalies: 70, // Boss anomaly
      artifacts: 10,
      nothing: 0,
    },
    rarityModifier: 1.8,
    healthRisk: { chance: 0.1, damage: 10 },
    specialConditions: {
      requiredCuriosity: 150,
      isBossLocation: true,
    },
  },
];

// ============================================================================
// Eternal Garden Locations (5+ locations)
// ============================================================================

const ETERNAL_GARDEN_LOCATIONS: Location[] = [
  {
    id: 'genesis-pool',
    name: 'Genesis Pool',
    biome: 'eternal-garden',
    description:
      'The pool where new life emerges. Samples found here enhance breeding success rates.',
    coordinates: { x: 3, y: 5 },
    requiredScanLevel: 5,
    energyCost: 15,
    difficultyRating: 4,
    contentWeights: {
      samples: 70,
      anomalies: 20,
      artifacts: 10,
      nothing: 0,
    },
    rarityModifier: 2.0,
    healthRisk: { chance: 0.15, damage: 20 },
  },

  {
    id: 'fibonacci-grove',
    name: 'Fibonacci Grove',
    biome: 'eternal-garden',
    description:
      'Trees arranged in perfect Fibonacci spirals. Math-based puzzles test your understanding of the sequences.',
    coordinates: { x: 2, y: 5 },
    requiredScanLevel: 5,
    energyCost: 15,
    difficultyRating: 5,
    contentWeights: {
      samples: 30,
      anomalies: 60,
      artifacts: 10,
      nothing: 0,
    },
    rarityModifier: 1.8,
    healthRisk: { chance: 0.15, damage: 20 },
    specialConditions: {
      requiredCuriosity: 200,
    },
  },

  {
    id: 'fractal-labyrinth',
    name: 'Fractal Labyrinth',
    biome: 'eternal-garden',
    description:
      'An ever-shifting maze of recursive patterns. Navigation requires careful attention to self-similar structures.',
    coordinates: { x: 4, y: 5 },
    requiredScanLevel: 5,
    energyCost: 15,
    difficultyRating: 5,
    contentWeights: {
      samples: 40,
      anomalies: 50,
      artifacts: 10,
      nothing: 0,
    },
    rarityModifier: 2.0,
    healthRisk: { chance: 0.15, damage: 20 },
  },

  {
    id: 'infinity-garden',
    name: 'Infinity Garden',
    biome: 'eternal-garden',
    description:
      'A garden that extends forever through procedural generation. Endless exploration awaits.',
    coordinates: { x: 3, y: 6 },
    requiredScanLevel: 5,
    energyCost: 15,
    difficultyRating: 4,
    contentWeights: {
      samples: 60,
      anomalies: 30,
      artifacts: 10,
      nothing: 0,
    },
    rarityModifier: 2.0,
    healthRisk: { chance: 0.15, damage: 20 },
  },

  {
    id: 'transcendence-point',
    name: 'Transcendence Point',
    biome: 'eternal-garden',
    description:
      'The final pinnacle where the Genesis Manifestation awaits. Only the most dedicated explorers reach this point.',
    coordinates: { x: 3, y: 4 },
    requiredScanLevel: 5,
    energyCost: 15,
    difficultyRating: 5,
    contentWeights: {
      samples: 20,
      anomalies: 70, // Boss anomaly
      artifacts: 10,
      nothing: 0,
    },
    rarityModifier: 2.0,
    healthRisk: { chance: 0.15, damage: 20 },
    specialConditions: {
      requiredCuriosity: 200,
      isBossLocation: true,
    },
  },
];

// ============================================================================
// All Locations Combined
// ============================================================================

export const ALL_LOCATIONS: Location[] = [
  ...STARTING_GROVE_LOCATIONS,
  ...CRYSTAL_CAVERNS_LOCATIONS,
  ...VOID_NEXUS_LOCATIONS,
  ...DREAM_SPIRE_LOCATIONS,
  ...ETERNAL_GARDEN_LOCATIONS,
];

// Export alias for tests
export const LOCATIONS = ALL_LOCATIONS;

export const LOCATIONS_BY_BIOME: Record<BiomeType, Location[]> = {
  'starting-grove': STARTING_GROVE_LOCATIONS,
  'crystal-caverns': CRYSTAL_CAVERNS_LOCATIONS,
  'void-nexus': VOID_NEXUS_LOCATIONS,
  'dream-spire': DREAM_SPIRE_LOCATIONS,
  'eternal-garden': ETERNAL_GARDEN_LOCATIONS,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get location by ID
 */
export function getLocation(locationId: string): Location | undefined {
  return ALL_LOCATIONS.find((loc) => loc.id === locationId);
}

/**
 * Get locations for a specific biome
 */
export function getLocationsByBiome(biome: BiomeType): Location[] {
  return LOCATIONS_BY_BIOME[biome] || [];
}

/**
 * Get all boss locations
 */
export function getBossLocations(): Location[] {
  return ALL_LOCATIONS.filter(
    (loc) => loc.specialConditions?.isBossLocation === true
  );
}

/**
 * Check if location meets requirements
 */
export function canAccessLocation(
  location: Location,
  state: {
    scanLevel: number;
    curiosity: number;
    equipment: { scanner: string; toolkit: string };
  }
): {
  canAccess: boolean;
  reason?: string;
} {
  if (state.scanLevel < location.requiredScanLevel) {
    return {
      canAccess: false,
      reason: `Requires Scan Level ${location.requiredScanLevel}`,
    };
  }

  if (location.specialConditions?.requiredCuriosity) {
    if (state.curiosity < location.specialConditions.requiredCuriosity) {
      return {
        canAccess: false,
        reason: `Requires ${location.specialConditions.requiredCuriosity} Curiosity`,
      };
    }
  }

  if (location.specialConditions?.requiredEquipment) {
    const hasEquipment =
      state.equipment.scanner === location.specialConditions.requiredEquipment ||
      state.equipment.toolkit === location.specialConditions.requiredEquipment;

    if (!hasEquipment) {
      return {
        canAccess: false,
        reason: `Requires ${location.specialConditions.requiredEquipment}`,
      };
    }
  }

  return { canAccess: true };
}

/**
 * Get locations accessible with current state
 */
export function getAccessibleLocations(
  biome: BiomeType,
  state: {
    scanLevel: number;
    curiosity: number;
    equipment: { scanner: string; toolkit: string };
  }
): Location[] {
  return getLocationsByBiome(biome).filter(
    (loc) => canAccessLocation(loc, state).canAccess
  );
}

/**
 * Get difficulty color for UI display
 */
export function getDifficultyColor(difficulty: 1 | 2 | 3 | 4 | 5): string {
  const colors = {
    1: '#10b981', // green-500 (Easy)
    2: '#3b82f6', // blue-500 (Medium)
    3: '#f59e0b', // amber-500 (Hard)
    4: '#ef4444', // red-500 (Very Hard)
    5: '#dc2626', // red-600 (Extreme/Boss)
  };
  return colors[difficulty];
}
