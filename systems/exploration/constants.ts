/**
 * Game balance constants for the Auralia MetaPet exploration system
 * Phase 4: Vimana Exploration System Enhancement
 */

import type {
  BiomeType,
  Rarity,
  ScannerType,
  DebuffType,
  ExplorationConfig,
} from './types';

// ============================================================================
// Energy System Constants
// ============================================================================

export const ENERGY_CONFIG = {
  BASE_CAP: 100,
  REGEN_RATE: 1, // Per minute
  MIN_VALUE: 0,
  MAX_VALUE: 100,
} as const;

export const SCAN_ENERGY_COSTS: Record<BiomeType, number> = {
  'starting-grove': 5,
  'crystal-caverns': 8,
  'void-nexus': 12,
  'dream-spire': 10,
  'eternal-garden': 15,
};

export const ANOMALY_ENERGY_COSTS: Record<number, number> = {
  1: 10, // Easy
  2: 15, // Medium
  3: 20, // Hard
  4: 25, // Very Hard
  5: 30, // Boss
};

// ============================================================================
// Curiosity Requirements
// ============================================================================

export const BIOME_CURIOSITY_REQUIREMENTS: Record<BiomeType, number> = {
  'starting-grove': 0,
  'crystal-caverns': 50,
  'void-nexus': 100,
  'dream-spire': 150,
  'eternal-garden': 200,
};

export const ANOMALY_CURIOSITY_REQUIREMENTS: Record<number, number> = {
  1: 0, // Easy
  2: 30, // Medium
  3: 60, // Hard
  4: 100, // Very Hard
  5: 150, // Boss
};

// ============================================================================
// Health Risk System
// ============================================================================

export const LOCATION_HEALTH_RISKS: Record<
  BiomeType,
  { chance: number; damage: number }
> = {
  'starting-grove': { chance: 0.0, damage: 0 }, // Safe
  'crystal-caverns': { chance: 0.05, damage: 5 }, // Low risk
  'dream-spire': { chance: 0.1, damage: 10 }, // Medium risk
  'void-nexus': { chance: 0.2, damage: 15 }, // High risk
  'eternal-garden': { chance: 0.15, damage: 20 }, // Extreme risk
};

export const ANOMALY_FAILURE_HEALTH_DAMAGE: Record<number, number> = {
  1: 5, // Easy failure
  2: 10, // Medium failure
  3: 15, // Hard failure
  4: 20, // Very Hard failure
  5: 30, // Boss failure
};

// ============================================================================
// XP System Constants
// ============================================================================

export const SCAN_LEVEL_THRESHOLDS = [
  0, // Level 1 (starting)
  100, // Level 2 (100 XP)
  300, // Level 3 (200 more XP)
  600, // Level 4 (300 more XP)
  1000, // Level 5 (400 more XP)
];

export const XP_SOURCES = {
  SCAN: 5,
  COMMON_SAMPLE: 10,
  RARE_SAMPLE: 25,
  LEGENDARY_SAMPLE: 50,
  ANOMALY_BY_DIFFICULTY: {
    1: 15, // Easy
    2: 30, // Medium
    3: 50, // Hard
    4: 75, // Very Hard
    5: 100, // Boss
  },
} as const;

// ============================================================================
// Rarity System Constants
// ============================================================================

export const BASE_RARITY_RATES: Record<Rarity, number> = {
  common: 0.6, // 60%
  rare: 0.3, // 30%
  legendary: 0.1, // 10%
};

export const BIOME_RARITY_MULTIPLIERS: Record<BiomeType, number> = {
  'starting-grove': 1.0, // Baseline
  'crystal-caverns': 1.2, // +20% rare/legendary
  'void-nexus': 1.5, // +50% rare/legendary
  'dream-spire': 1.3, // +30% rare/legendary
  'eternal-garden': 2.0, // +100% rare/legendary
};

export const EQUIPMENT_RARITY_BONUSES: Record<ScannerType, number> = {
  basic: 0, // No bonus
  advanced: 0.1, // +10%
  quantum: 0.25, // +25%
};

// ============================================================================
// Progression System
// ============================================================================

export const LEVEL_BENEFITS = [
  {
    level: 1,
    unlocks: {
      biomes: ['starting-grove'] as BiomeType[],
      equipment: [],
    },
    bonuses: {
      energyEfficiency: 0,
      rarityBonus: 1.0,
      xpGain: 1.0,
    },
  },
  {
    level: 2,
    unlocks: {
      biomes: ['crystal-caverns'] as BiomeType[],
      equipment: ['field-kit'] as const,
    },
    bonuses: {
      energyEfficiency: 10,
      rarityBonus: 1.1,
      xpGain: 1.0,
    },
  },
  {
    level: 3,
    unlocks: {
      biomes: ['void-nexus'] as BiomeType[],
      equipment: ['advanced'] as const,
    },
    bonuses: {
      energyEfficiency: 15,
      rarityBonus: 1.2,
      xpGain: 1.1,
    },
  },
  {
    level: 4,
    unlocks: {
      biomes: ['dream-spire'] as BiomeType[],
      equipment: ['master-kit'] as const,
    },
    bonuses: {
      energyEfficiency: 20,
      rarityBonus: 1.3,
      xpGain: 1.2,
    },
  },
  {
    level: 5,
    unlocks: {
      biomes: ['eternal-garden'] as BiomeType[],
      equipment: ['quantum'] as const,
    },
    bonuses: {
      energyEfficiency: 25,
      rarityBonus: 1.5,
      xpGain: 1.5,
    },
  },
] as const;

// ============================================================================
// Equipment Costs
// ============================================================================

export const EQUIPMENT_COSTS = {
  // Scanners
  advanced: {
    curiosity: 500,
    samples: { rarity: 'rare' as const, count: 5 },
  },
  quantum: {
    curiosity: 1000,
    samples: { rarity: 'legendary' as const, count: 2 },
  },

  // Toolkits
  'field-kit': {
    curiosity: 250,
    samples: { rarity: 'common' as const, count: 10 },
  },
  'master-kit': {
    curiosity: 750,
    samples: { rarity: 'rare' as const, count: 5 },
  },
} as const;

// ============================================================================
// Cooldown Durations (Minutes)
// ============================================================================

export const COOLDOWN_DURATIONS = {
  EASY_FAILURE: 5,
  MEDIUM_FAILURE: 10,
  HARD_FAILURE: 15,
  VERY_HARD_FAILURE: 20,
  BOSS_FAILURE: 60,
} as const;

// ============================================================================
// Debuff Configurations
// ============================================================================

export const DEBUFF_CONFIGS: Record<
  DebuffType,
  {
    name: string;
    description: string;
    duration: number;
    effects: {
      energyCostMultiplier?: number;
      rarityPenalty?: number;
      xpPenalty?: number;
      cannotScan?: boolean;
      statDrain?: {
        stat: 'energy' | 'curiosity' | 'health';
        amount: number;
        interval: number;
      };
    };
  }
> = {
  disorientation: {
    name: 'Disorientation',
    description: 'Confused spatial awareness increases energy costs',
    duration: 10,
    effects: {
      energyCostMultiplier: 1.5, // +50% energy costs
    },
  },
  corruption: {
    name: 'Corruption',
    description: 'Void energy slowly drains your vitality',
    duration: 30,
    effects: {
      statDrain: {
        stat: 'health',
        amount: 1,
        interval: 60, // Every 60 seconds
      },
    },
  },
  confusion: {
    name: 'Confusion',
    description: 'Mental fog reduces learning efficiency',
    duration: 15,
    effects: {
      xpPenalty: 0.5, // -50% XP gain
    },
  },
  exhaustion: {
    name: 'Exhaustion',
    description: 'Too tired to continue exploring',
    duration: 10,
    effects: {
      cannotScan: true,
    },
  },
  'void-sickness': {
    name: 'Void Sickness',
    description: 'Exposure to void energy reduces discovery chances',
    duration: 20,
    effects: {
      rarityPenalty: 0.75, // -25% rarity chance
    },
  },
  'temporal-distortion': {
    name: 'Temporal Distortion',
    description: 'Time feels unstable, draining your focus',
    duration: 15,
    effects: {
      statDrain: {
        stat: 'curiosity',
        amount: 2,
        interval: 60,
      },
    },
  },
};

// ============================================================================
// Event System
// ============================================================================

export const EVENT_BASE_CHANCE = 0.05; // 5% chance per scan

export const EVENT_FREQUENCIES: Record<string, number> = {
  CURIOUS_CREATURE: 0.05, // 5% in appropriate biomes
  ANCIENT_CACHE: 0.03, // 3%
  VOID_STORM: 0.02, // 2%
  DREAM_ECHO: 0.04, // 4%
  GENESIS_BLOOM: 0.01, // 1% (very rare)
  MERCHANT: 0.03, // 3% (universal)
};

// ============================================================================
// Boss Encounter Requirements
// ============================================================================

export const BOSS_REQUIREMENTS = {
  FULL_ENERGY: 100,
  MIN_CURIOSITY: 150,
  PHASES: 3,
} as const;

// ============================================================================
// Content Generation Weights
// ============================================================================

export const DEFAULT_CONTENT_WEIGHTS = {
  samples: 50,
  anomalies: 30,
  artifacts: 10,
  nothing: 10,
} as const;

// ============================================================================
// Achievement Thresholds
// ============================================================================

export const ACHIEVEMENT_THRESHOLDS = {
  SAMPLE_HOARDER: 50, // Collect 50 samples
  RARE_COLLECTOR: 10, // Collect 10 rare samples
  LEGEND_HUNTER: 3, // Collect 3 legendary samples
  ANOMALY_EXPERT: 25, // Solve 25 anomalies
  PUZZLE_MASTER: 11, // Solve all 11 anomaly types
  RISK_TAKER: 10, // Complete 10 Void Nexus scans
  FLAWLESS_EXPLORER: 10, // 10 successful anomalies in a row
  INFINITY_SEEKER: 25, // Explore all 25 locations
} as const;

// ============================================================================
// Equipment Effects
// ============================================================================

export const SCANNER_EFFECTS = {
  basic: {
    scanRange: 1,
    rareSpawnBonus: 0,
  },
  advanced: {
    scanRange: 2,
    rareSpawnBonus: 10, // +10%
  },
  quantum: {
    scanRange: 3,
    rareSpawnBonus: 25, // +25%
    revealHiddenLocations: true,
  },
} as const;

export const TOOLKIT_EFFECTS = {
  none: {
    healthDamageReduction: 0,
    energyCapacityBonus: 0,
    xpBonus: 0,
    debuffImmunity: false,
  },
  'field-kit': {
    healthDamageReduction: 50, // 50%
    energyCapacityBonus: 10,
    xpBonus: 0,
    debuffImmunity: false,
  },
  'master-kit': {
    healthDamageReduction: 75, // 75%
    energyCapacityBonus: 20,
    xpBonus: 5, // +5%
    debuffImmunity: true,
  },
} as const;

// ============================================================================
// Stat Caps
// ============================================================================

export const STAT_CAPS = {
  ENERGY: 100,
  CURIOSITY: 200,
  BOND: 100,
  HEALTH: 100,
} as const;

// ============================================================================
// Exploration Configuration Export
// ============================================================================

export const EXPLORATION_CONFIG: ExplorationConfig = {
  energyBalance: {
    baseEnergyCap: ENERGY_CONFIG.BASE_CAP,
    regenRate: ENERGY_CONFIG.REGEN_RATE,
    scanCosts: SCAN_ENERGY_COSTS,
    anomalyCosts: ANOMALY_ENERGY_COSTS,
  },
  xpBalance: {
    levelThresholds: SCAN_LEVEL_THRESHOLDS,
    xpSources: {
      scan: XP_SOURCES.SCAN,
      commonSample: XP_SOURCES.COMMON_SAMPLE,
      rareSample: XP_SOURCES.RARE_SAMPLE,
      legendarySample: XP_SOURCES.LEGENDARY_SAMPLE,
      anomalyByDifficulty: XP_SOURCES.ANOMALY_BY_DIFFICULTY,
    },
  },
  rarityBalance: {
    baseRates: BASE_RARITY_RATES,
    biomeMultipliers: BIOME_RARITY_MULTIPLIERS,
    equipmentBonuses: EQUIPMENT_RARITY_BONUSES,
  },
};
