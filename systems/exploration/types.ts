/**
 * TypeScript interfaces for the Auralia MetaPet exploration system
 * Phase 4: Vimana Exploration System Enhancement
 */

// ============================================================================
// Core Types
// ============================================================================

export type BiomeType =
  | 'starting-grove'
  | 'crystal-caverns'
  | 'void-nexus'
  | 'dream-spire'
  | 'eternal-garden';

export type Rarity = 'common' | 'rare' | 'legendary';

export type ScannerType = 'basic' | 'advanced' | 'quantum';

export type ToolkitType = 'none' | 'field-kit' | 'master-kit';

export type AnomalyType =
  | 'echo'
  | 'rift'
  | 'glyph'
  | 'resonance'
  | 'fractal'
  | 'temporal'
  | 'quantum'
  | 'harmonic'
  | 'gravitational'
  | 'memory'
  | 'corruption';

export type DebuffType =
  | 'disorientation'
  | 'corruption'
  | 'confusion'
  | 'exhaustion'
  | 'void-sickness'
  | 'temporal-distortion';

// ============================================================================
// Location System
// ============================================================================

export interface Location {
  id: string;
  name: string;
  biome: BiomeType;
  description: string;
  coordinates: {
    x: number;
    y: number;
  };
  requiredScanLevel: number;
  energyCost: number; // 5-15 energy per scan
  difficultyRating: 1 | 2 | 3 | 4 | 5;
  contentWeights: {
    samples: number;
    anomalies: number;
    artifacts: number;
    nothing: number;
  };
  rarityModifier: number; // 0.5x - 2.0x rarity multiplier
  healthRisk?: {
    chance: number; // 0.0 - 1.0 probability
    damage: number; // Health points to lose
  };
  specialConditions?: {
    timeOfDay?: 'morning' | 'evening' | 'night';
    requiredCuriosity?: number;
    requiredEquipment?: ScannerType | ToolkitType;
    isBossLocation?: boolean;
  };
}

// ============================================================================
// Sample System
// ============================================================================

export interface Sample {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  biome: BiomeType;
  iconType: string;
  effects: {
    energy?: number; // +5 to +50
    curiosity?: number; // +10 to +100
    bond?: number; // +5 to +25
    health?: number; // +10 to +50
  };
  unlocks?: {
    achievement?: string;
    cosmetic?: string;
    location?: string;
    equipment?: string;
  };
  collectionBonus?: {
    stat: 'energy' | 'curiosity' | 'bond' | 'health';
    amount: number;
    threshold: number; // Collect X samples for bonus
  };
}

// ============================================================================
// Anomaly System
// ============================================================================

export interface Anomaly {
  id: string;
  type: AnomalyType;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  biome?: BiomeType; // Optional biome restriction
  requiredCuriosity: number; // Minimum curiosity to attempt
  energyCost: number; // Cost to attempt (10-30)
  puzzleConfig: {
    timeLimit?: number; // Seconds
    complexity: number; // Puzzle complexity parameter (1-10)
    requiresEquipment?: ScannerType | ToolkitType;
    phases?: number; // For boss encounters (multi-stage)
  };
  rewards: {
    success: {
      energy?: number;
      curiosity?: number;
      bond?: number;
      health?: number;
      samples?: Array<{
        type: string;
        guaranteed?: boolean;
      }>;
      unlocks?: string[];
      experience: number; // Scan level XP
    };
    failure: {
      energy?: number;
      health?: number;
      curiosity?: number;
      cooldown?: number; // Minutes
      debuff?: {
        type: DebuffType;
        duration: number; // Minutes
        effect: string;
      };
    };
  };
}

// ============================================================================
// Biome System
// ============================================================================

export interface Biome {
  id: BiomeType;
  name: string;
  description: string;
  unlockRequirements: {
    scanLevel?: number;
    achievement?: string;
    curiosity?: number;
    dreamJournalEntries?: number;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    ambientEffect: string;
    icon: string;
  };
  locationIds: string[]; // References to Location IDs
  rarityMultiplier: number; // 1.0x - 2.0x
  specialMechanics?: string;
}

// ============================================================================
// Progression System
// ============================================================================

export interface ScanLevelBenefits {
  level: number;
  unlocks: {
    biomes?: BiomeType[];
    equipment?: Array<ScannerType | ToolkitType>;
    locations?: string[];
  };
  bonuses: {
    energyEfficiency: number; // % reduction in energy costs
    rarityBonus: number; // Multiplier to rarity rolls
    xpGain: number; // XP multiplier
  };
}

export interface Equipment {
  id: ScannerType | ToolkitType;
  name: string;
  type: 'scanner' | 'toolkit';
  description: string;
  requiredLevel: number;
  cost: {
    curiosity: number;
    samples?: Array<{
      rarity: Rarity;
      count: number;
    }>;
  };
  effects: {
    scanRange?: number; // Tiles
    rareSpawnBonus?: number; // Percentage
    healthDamageReduction?: number; // Percentage
    energyCapacityBonus?: number; // Absolute value
    xpBonus?: number; // Percentage
    debuffImmunity?: boolean;
    revealHiddenLocations?: boolean;
  };
}

// ============================================================================
// Debuff System
// ============================================================================

export interface Debuff {
  id: DebuffType;
  name: string;
  description: string;
  duration: number; // Minutes
  appliedAt: number; // Timestamp
  effects: {
    energyCostMultiplier?: number;
    rarityPenalty?: number;
    xpPenalty?: number;
    cannotScan?: boolean;
    statDrain?: {
      stat: 'energy' | 'curiosity' | 'health';
      amount: number;
      interval: number; // Drain every X seconds
    };
  };
}

// ============================================================================
// Event System
// ============================================================================

export interface ExplorationEvent {
  id: string;
  name: string;
  description: string;
  biome?: BiomeType; // Optional biome restriction
  frequency: number; // Probability (0.0 - 1.0)
  effects: {
    energy?: number;
    curiosity?: number;
    bond?: number;
    health?: number;
    guaranteedSample?: {
      rarity: Rarity;
    };
    multipliers?: {
      rarityMultiplier?: number;
      xpMultiplier?: number;
    };
    unlocks?: string[];
  };
  isSpecial?: boolean; // For rare/unique events
}

// ============================================================================
// State Management
// ============================================================================

export interface VimanaExplorationState {
  // Current state
  currentZone: BiomeType;
  unlockedZones: BiomeType[];

  // Progression
  scanLevel: number; // 1-5
  scanExperience: number; // XP towards next level

  // Equipment
  equipment: {
    scanner: ScannerType;
    toolkit: ToolkitType;
  };

  // Collections
  samplesCollected: string[]; // Sample IDs
  anomaliesCompleted: string[]; // Anomaly IDs
  locationsVisited: string[]; // Location IDs

  // Active effects
  cooldowns: Record<string, number>; // anomalyId -> cooldown end timestamp
  activeDebuffs: Debuff[];

  // Statistics
  statistics: {
    totalScans: number;
    successfulScans: number;
    failedAnomalies: number;
    successfulAnomalies: number;
    rareSamplesFound: number;
    legendaryItemsFound: number;
    energySpent: number;
    healthLost: number;
    biomeCompletions: Record<BiomeType, number>;
  };

  // Achievements tracking
  achievementProgress: {
    consecutiveSuccesses: number; // For flawless explorer
    voidNexusScans: number; // For risk taker
    uniqueAnomaliesCompleted: Set<AnomalyType>; // For puzzle master
  };
}

// ============================================================================
// Scan Results
// ============================================================================

export interface ScanResult {
  success: boolean;
  contentType: 'sample' | 'anomaly' | 'artifact' | 'nothing' | 'event';
  content?: Sample | Anomaly | ExplorationEvent;
  energyCost: number;
  healthLost: number;
  xpGained: number;
  message: string;
}

export interface AnomalyAttemptResult {
  success: boolean;
  rewards?: {
    energy: number;
    curiosity: number;
    bond: number;
    health: number;
    xpGained: number;
    samplesAwarded: Sample[];
    unlocksAwarded: string[];
  };
  penalties?: {
    energy: number;
    health: number;
    curiosity: number;
    cooldown?: {
      duration: number; // Minutes
      expiresAt: number; // Timestamp
    };
    debuff?: Debuff;
  };
  message: string;
}

// ============================================================================
// Helper Types
// ============================================================================

export interface RarityRoll {
  baseChance: number;
  biomeMultiplier: number;
  equipmentBonus: number;
  levelBonus: number;
  debuffPenalty: number;
  finalChance: number;
  result: Rarity;
}

export interface LevelUpResult {
  newLevel: number;
  unlockedBiomes: BiomeType[];
  unlockedEquipment: Array<ScannerType | ToolkitType>;
  bonusesGained: ScanLevelBenefits['bonuses'];
}

export interface BiomeUnlockCheck {
  biome: BiomeType;
  isUnlocked: boolean;
  requirements: {
    scanLevel?: { required: number; current: number; met: boolean };
    curiosity?: { required: number; current: number; met: boolean };
    achievement?: { required: string; met: boolean };
    dreamJournalEntries?: { required: number; current: number; met: boolean };
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ExplorationConfig {
  energyBalance: {
    baseEnergyCap: number;
    regenRate: number; // Per minute
    scanCosts: Record<BiomeType, number>;
    anomalyCosts: Record<number, number>; // difficulty -> cost
  };
  xpBalance: {
    levelThresholds: number[];
    xpSources: {
      scan: number;
      commonSample: number;
      rareSample: number;
      legendarySample: number;
      anomalyByDifficulty: Record<number, number>;
    };
  };
  rarityBalance: {
    baseRates: Record<Rarity, number>;
    biomeMultipliers: Record<BiomeType, number>;
    equipmentBonuses: Record<ScannerType, number>;
  };
}
