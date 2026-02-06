/**
 * Anomaly definitions for the Vimana Exploration System
 * Phase 4: 11 anomaly puzzle types
 */

import type { Anomaly, AnomalyType, BiomeType } from './types';

// ============================================================================
// Existing Anomalies (Enhanced) - 3 types
// ============================================================================

const EXISTING_ANOMALIES: Anomaly[] = [
  {
    id: 'echo-anomaly',
    type: 'echo',
    name: 'Echo Anomaly',
    description:
      'A sequence memory puzzle where you must recall and repeat patterns of sound.',
    difficulty: 2,
    biome: 'crystal-caverns', // Preferred biome, can appear elsewhere
    requiredCuriosity: 30,
    energyCost: 15,
    puzzleConfig: {
      complexity: 5, // Number of patterns to remember
    },
    rewards: {
      success: {
        energy: 15,
        curiosity: 35,
        experience: 30,
      },
      failure: {
        energy: -10,
        cooldown: 5,
      },
    },
  },

  {
    id: 'rift-anomaly',
    type: 'rift',
    name: 'Rift Anomaly',
    description:
      'A pattern matching puzzle where reality tears need to be aligned correctly.',
    difficulty: 2,
    biome: 'void-nexus',
    requiredCuriosity: 30,
    energyCost: 15,
    puzzleConfig: {
      complexity: 4, // Grid complexity
    },
    rewards: {
      success: {
        energy: 10,
        curiosity: 40,
        experience: 30,
      },
      failure: {
        energy: -10,
        health: -5,
        cooldown: 5,
      },
    },
  },

  {
    id: 'glyph-anomaly',
    type: 'glyph',
    name: 'Glyph Anomaly',
    description:
      'A symbol decoding puzzle requiring understanding of ancient runic patterns.',
    difficulty: 2,
    biome: 'starting-grove',
    requiredCuriosity: 20,
    energyCost: 15,
    puzzleConfig: {
      complexity: 4, // Number of glyphs
    },
    rewards: {
      success: {
        energy: 10,
        curiosity: 30,
        bond: 10,
        experience: 30,
      },
      failure: {
        energy: -5,
        curiosity: -10,
        cooldown: 5,
      },
    },
  },
];

// ============================================================================
// New Anomaly Types - 8 types
// ============================================================================

const NEW_ANOMALIES: Anomaly[] = [
  {
    id: 'resonance-anomaly',
    type: 'resonance',
    name: 'Resonance Anomaly',
    description:
      'Match frequency patterns using slider controls. Fine-tune resonance to stabilize the anomaly.',
    difficulty: 2,
    biome: 'crystal-caverns',
    requiredCuriosity: 30,
    energyCost: 15,
    puzzleConfig: {
      complexity: 3, // Number of frequencies to match
      timeLimit: 60, // 60 seconds
    },
    rewards: {
      success: {
        energy: 20,
        curiosity: 30,
        experience: 30,
      },
      failure: {
        energy: -10,
        cooldown: 5,
      },
    },
  },

  {
    id: 'fractal-anomaly',
    type: 'fractal',
    name: 'Fractal Anomaly',
    description:
      'Navigate through recursive pattern mazes. Each wrong turn duplicates the maze depth.',
    difficulty: 3,
    biome: 'eternal-garden',
    requiredCuriosity: 60,
    energyCost: 20,
    puzzleConfig: {
      complexity: 4, // Recursion depth
    },
    rewards: {
      success: {
        curiosity: 50,
        samples: [{ type: 'rare', guaranteed: true }],
        experience: 50,
      },
      failure: {
        health: -10,
        cooldown: 10,
        debuff: {
          type: 'confusion',
          duration: 10,
          effect: 'XP gain reduced by 50%',
        },
      },
    },
  },

  {
    id: 'temporal-anomaly',
    type: 'temporal',
    name: 'Temporal Anomaly',
    description:
      'Solve puzzles before time runs out. Speed and accuracy both matter.',
    difficulty: 2,
    biome: 'dream-spire',
    requiredCuriosity: 30,
    energyCost: 15,
    puzzleConfig: {
      complexity: 5,
      timeLimit: 45, // 45 seconds
    },
    rewards: {
      success: {
        bond: 15,
        curiosity: 25,
        unlocks: ['time-keeper-cosmetic'],
        experience: 30,
      },
      failure: {
        energy: -15,
        cooldown: 10,
        debuff: {
          type: 'temporal-distortion',
          duration: 15,
          effect: 'Curiosity drains slowly',
        },
      },
    },
  },

  {
    id: 'quantum-anomaly',
    type: 'quantum',
    name: 'Quantum Anomaly',
    description:
      'Superposition state selection with probabilistic outcomes. High risk, high reward.',
    difficulty: 3,
    biome: 'void-nexus',
    requiredCuriosity: 60,
    energyCost: 20,
    puzzleConfig: {
      complexity: 3, // Number of quantum states
    },
    rewards: {
      success: {
        curiosity: 45,
        samples: [{ type: 'legendary', guaranteed: false }], // 25% chance
        experience: 50,
      },
      failure: {
        health: -20,
        energy: -10,
        cooldown: 10,
      },
    },
  },

  {
    id: 'harmonic-anomaly',
    type: 'harmonic',
    name: 'Harmonic Anomaly',
    description:
      'Musical pattern recognition puzzle. Match melodies and harmonies to resolve.',
    difficulty: 1,
    biome: 'crystal-caverns',
    requiredCuriosity: 0,
    energyCost: 10,
    puzzleConfig: {
      complexity: 3, // Number of notes/chords
    },
    rewards: {
      success: {
        energy: 10,
        curiosity: 15,
        unlocks: ['harmony-aura-cosmetic'],
        experience: 15,
      },
      failure: {
        energy: -5,
      },
    },
  },

  {
    id: 'gravitational-anomaly',
    type: 'gravitational',
    name: 'Gravitational Anomaly',
    description:
      'Physics-based trajectory puzzle. Calculate paths through gravity wells.',
    difficulty: 2,
    biome: 'void-nexus',
    requiredCuriosity: 30,
    energyCost: 15,
    puzzleConfig: {
      complexity: 4, // Number of gravity wells
    },
    rewards: {
      success: {
        curiosity: 40,
        unlocks: ['advanced-scanner'],
        experience: 30,
      },
      failure: {
        health: -15,
        debuff: {
          type: 'disorientation',
          duration: 10,
          effect: 'Energy costs increased by 50%',
        },
      },
    },
  },

  {
    id: 'memory-anomaly',
    type: 'memory',
    name: 'Memory Anomaly',
    description:
      'Recall dream journal entries and reconstruct memories. Difficulty scales with journal size.',
    difficulty: 2, // Variable based on journal entries
    biome: 'dream-spire',
    requiredCuriosity: 30,
    energyCost: 15,
    puzzleConfig: {
      complexity: 1, // Scales with dream journal size
    },
    rewards: {
      success: {
        bond: 25,
        curiosity: 30,
        unlocks: ['dream-weaver-cosmetic'],
        experience: 30,
      },
      failure: {
        curiosity: -20,
        cooldown: 5,
      },
    },
  },

  {
    id: 'corruption-anomaly',
    type: 'corruption',
    name: 'Corruption Anomaly',
    description:
      'Cleanse corruption without letting it spread. Exclusive to Void Nexus. Extremely dangerous.',
    difficulty: 4,
    biome: 'void-nexus',
    requiredCuriosity: 100,
    energyCost: 25,
    puzzleConfig: {
      complexity: 5, // Spread rate and area
    },
    rewards: {
      success: {
        curiosity: 60,
        samples: [{ type: 'legendary', guaranteed: true }],
        unlocks: ['corruption-resist-cosmetic'],
        experience: 75,
      },
      failure: {
        health: -30,
        cooldown: 30,
        debuff: {
          type: 'corruption',
          duration: 30,
          effect: 'Health drains 1 per minute',
        },
      },
    },
  },
];

// ============================================================================
// Boss Anomalies - 3 types
// ============================================================================

const BOSS_ANOMALIES: Anomaly[] = [
  {
    id: 'corruption-entity-boss',
    type: 'corruption',
    name: 'Corruption Entity',
    description:
      'A massive corruption anomaly that has gained sentience. Multi-stage boss encounter at the Event Horizon.',
    difficulty: 5,
    biome: 'void-nexus',
    requiredCuriosity: 150,
    energyCost: 30,
    puzzleConfig: {
      complexity: 8,
      phases: 3, // Multi-stage boss
    },
    rewards: {
      success: {
        curiosity: 80,
        bond: 30,
        samples: [{ type: 'legendary', guaranteed: true }],
        unlocks: ['void-master-cosmetic', 'corruption-entity-defeated'],
        experience: 100,
      },
      failure: {
        health: -30,
        energy: -50,
        cooldown: 60, // 1 hour
        debuff: {
          type: 'corruption',
          duration: 60,
          effect: 'Severe corruption poisoning',
        },
      },
    },
  },

  {
    id: 'dream-guardian-boss',
    type: 'memory',
    name: 'Dream Guardian',
    description:
      'A manifestation of all collected memories. Challenges you with your own dream journal at the Zenith Summit.',
    difficulty: 5,
    biome: 'dream-spire',
    requiredCuriosity: 150,
    energyCost: 30,
    puzzleConfig: {
      complexity: 10, // Uses actual dream journal data
      phases: 3,
    },
    rewards: {
      success: {
        bond: 40,
        curiosity: 70,
        samples: [{ type: 'legendary', guaranteed: true }],
        unlocks: ['dream-master-cosmetic', 'dream-guardian-defeated'],
        experience: 100,
      },
      failure: {
        health: -30,
        energy: -50,
        curiosity: -30,
        cooldown: 60,
      },
    },
  },

  {
    id: 'genesis-manifestation-boss',
    type: 'fractal',
    name: 'Genesis Manifestation',
    description:
      'The living embodiment of infinite creation. Ultimate challenge combining all anomaly types at Transcendence Point.',
    difficulty: 5,
    biome: 'eternal-garden',
    requiredCuriosity: 200,
    energyCost: 30,
    puzzleConfig: {
      complexity: 10,
      phases: 3,
    },
    rewards: {
      success: {
        energy: 50,
        curiosity: 100,
        bond: 35,
        health: 30,
        samples: [
          { type: 'legendary', guaranteed: true },
          { type: 'legendary', guaranteed: true }, // 2 guaranteed legendaries
        ],
        unlocks: [
          'transcendence-master-cosmetic',
          'genesis-manifestation-defeated',
          'perfect-explorer',
        ],
        experience: 150,
      },
      failure: {
        health: -30,
        energy: -50,
        cooldown: 60,
        debuff: {
          type: 'exhaustion',
          duration: 30,
          effect: 'Cannot scan for 30 minutes',
        },
      },
    },
  },
];

// ============================================================================
// All Anomalies Combined
// ============================================================================

export const ALL_ANOMALIES: Anomaly[] = [
  ...EXISTING_ANOMALIES,
  ...NEW_ANOMALIES,
  ...BOSS_ANOMALIES,
];

export const ANOMALIES_BY_TYPE: Record<AnomalyType, Anomaly[]> = {
  echo: ALL_ANOMALIES.filter((a) => a.type === 'echo'),
  rift: ALL_ANOMALIES.filter((a) => a.type === 'rift'),
  glyph: ALL_ANOMALIES.filter((a) => a.type === 'glyph'),
  resonance: ALL_ANOMALIES.filter((a) => a.type === 'resonance'),
  fractal: ALL_ANOMALIES.filter((a) => a.type === 'fractal'),
  temporal: ALL_ANOMALIES.filter((a) => a.type === 'temporal'),
  quantum: ALL_ANOMALIES.filter((a) => a.type === 'quantum'),
  harmonic: ALL_ANOMALIES.filter((a) => a.type === 'harmonic'),
  gravitational: ALL_ANOMALIES.filter((a) => a.type === 'gravitational'),
  memory: ALL_ANOMALIES.filter((a) => a.type === 'memory'),
  corruption: ALL_ANOMALIES.filter((a) => a.type === 'corruption'),
};

export const ANOMALIES_BY_BIOME: Record<BiomeType, Anomaly[]> = {
  'starting-grove': ALL_ANOMALIES.filter((a) => a.biome === 'starting-grove'),
  'crystal-caverns': ALL_ANOMALIES.filter((a) => a.biome === 'crystal-caverns'),
  'void-nexus': ALL_ANOMALIES.filter((a) => a.biome === 'void-nexus'),
  'dream-spire': ALL_ANOMALIES.filter((a) => a.biome === 'dream-spire'),
  'eternal-garden': ALL_ANOMALIES.filter((a) => a.biome === 'eternal-garden'),
};

export const ANOMALIES_BY_DIFFICULTY: Record<number, Anomaly[]> = {
  1: ALL_ANOMALIES.filter((a) => a.difficulty === 1),
  2: ALL_ANOMALIES.filter((a) => a.difficulty === 2),
  3: ALL_ANOMALIES.filter((a) => a.difficulty === 3),
  4: ALL_ANOMALIES.filter((a) => a.difficulty === 4),
  5: ALL_ANOMALIES.filter((a) => a.difficulty === 5),
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get anomaly by ID
 */
export function getAnomaly(anomalyId: string): Anomaly | undefined {
  return ALL_ANOMALIES.find((anomaly) => anomaly.id === anomalyId);
}

/**
 * Get anomalies by type
 */
export function getAnomaliesByType(type: AnomalyType): Anomaly[] {
  return ANOMALIES_BY_TYPE[type] || [];
}

/**
 * Get anomalies by biome
 */
export function getAnomaliesByBiome(biome: BiomeType): Anomaly[] {
  return ANOMALIES_BY_BIOME[biome] || [];
}

/**
 * Get anomalies by difficulty
 */
export function getAnomaliesByDifficulty(difficulty: number): Anomaly[] {
  return ANOMALIES_BY_DIFFICULTY[difficulty] || [];
}

/**
 * Get all boss anomalies
 */
export function getBossAnomalies(): Anomaly[] {
  return BOSS_ANOMALIES;
}

/**
 * Check if guardian can attempt anomaly
 */
export function canAttemptAnomaly(
  anomaly: Anomaly,
  state: {
    curiosity: number;
    energy: number;
    cooldowns: Record<string, number>;
  }
): {
  canAttempt: boolean;
  reason?: string;
} {
  // Check curiosity requirement
  if (state.curiosity < anomaly.requiredCuriosity) {
    return {
      canAttempt: false,
      reason: `Requires ${anomaly.requiredCuriosity} Curiosity`,
    };
  }

  // Check energy cost
  if (state.energy < anomaly.energyCost) {
    return {
      canAttempt: false,
      reason: `Requires ${anomaly.energyCost} Energy`,
    };
  }

  // Check cooldown
  const cooldownEnd = state.cooldowns[anomaly.id];
  if (cooldownEnd && Date.now() < cooldownEnd) {
    const remainingMinutes = Math.ceil((cooldownEnd - Date.now()) / 1000 / 60);
    return {
      canAttempt: false,
      reason: `Cooldown: ${remainingMinutes}m remaining`,
    };
  }

  return { canAttempt: true };
}

/**
 * Get difficulty display information
 */
export function getDifficultyDisplay(difficulty: 1 | 2 | 3 | 4 | 5): {
  label: string;
  color: string;
  icon: string;
} {
  const displays = {
    1: { label: 'Easy', color: '#10b981', icon: '○' }, // green-500
    2: { label: 'Medium', color: '#3b82f6', icon: '◐' }, // blue-500
    3: { label: 'Hard', color: '#f59e0b', icon: '◑' }, // amber-500
    4: { label: 'Very Hard', color: '#ef4444', icon: '◕' }, // red-500
    5: { label: 'Boss', color: '#dc2626', icon: '●' }, // red-600
  };

  return displays[difficulty];
}

/**
 * Get unique anomaly types completed
 */
export function getUniqueTypesCompleted(completedAnomalyIds: string[]): Set<AnomalyType> {
  const types = new Set<AnomalyType>();

  completedAnomalyIds.forEach((id) => {
    const anomaly = getAnomaly(id);
    if (anomaly) {
      types.add(anomaly.type);
    }
  });

  return types;
}

/**
 * Check puzzle master achievement progress
 */
export function checkPuzzleMasterProgress(
  completedAnomalyIds: string[]
): {
  completed: number;
  total: number;
  remaining: AnomalyType[];
} {
  const uniqueTypes = getUniqueTypesCompleted(completedAnomalyIds);
  const allTypes: AnomalyType[] = [
    'echo',
    'rift',
    'glyph',
    'resonance',
    'fractal',
    'temporal',
    'quantum',
    'harmonic',
    'gravitational',
    'memory',
    'corruption',
  ];

  const remaining = allTypes.filter((type) => !uniqueTypes.has(type));

  return {
    completed: uniqueTypes.size,
    total: allTypes.length,
    remaining,
  };
}

/**
 * Get recommended anomaly for guardian level
 */
export function getRecommendedAnomaly(
  biome: BiomeType,
  scanLevel: number,
  curiosity: number
): Anomaly | undefined {
  const biomeAnomalies = getAnomaliesByBiome(biome);

  // Filter by scan level difficulty mapping
  const difficultyForLevel = Math.min(scanLevel + 1, 5);
  const suitableAnomalies = biomeAnomalies.filter(
    (a) =>
      a.difficulty <= difficultyForLevel &&
      a.requiredCuriosity <= curiosity &&
      a.difficulty !== 5 // Exclude bosses from recommendations
  );

  // Sort by difficulty descending (challenge but not impossible)
  suitableAnomalies.sort((a, b) => b.difficulty - a.difficulty);

  return suitableAnomalies[0];
}
