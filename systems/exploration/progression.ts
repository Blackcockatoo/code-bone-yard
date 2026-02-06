/**
 * Progression system for the Vimana Exploration System
 * Phase 4: Scan levels, XP, equipment, unlocks
 */

import type {
  Equipment,
  ScannerType,
  ToolkitType,
  LevelUpResult,
  BiomeType,
} from './types';
import {
  SCAN_LEVEL_THRESHOLDS,
  LEVEL_BENEFITS,
  EQUIPMENT_COSTS,
  SCANNER_EFFECTS,
  TOOLKIT_EFFECTS,
} from './constants';

// ============================================================================
// Scan Level System
// ============================================================================

/**
 * Get current scan level based on XP
 */
export function getScanLevel(xp: number): number {
  for (let i = SCAN_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= SCAN_LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1; // Default to level 1
}

/**
 * Get XP required for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= SCAN_LEVEL_THRESHOLDS.length) {
    return SCAN_LEVEL_THRESHOLDS[SCAN_LEVEL_THRESHOLDS.length - 1]; // Max level
  }
  return SCAN_LEVEL_THRESHOLDS[currentLevel]; // currentLevel is 0-indexed in array
}

/**
 * Get XP progress to next level
 */
export function getXPProgress(currentXP: number, currentLevel: number): {
  current: number;
  required: number;
  percentage: number;
} {
  const levelStart = SCAN_LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const levelEnd = getXPForNextLevel(currentLevel);

  const current = currentXP - levelStart;
  const required = levelEnd - levelStart;
  const percentage = Math.min(100, (current / required) * 100);

  return {
    current,
    required,
    percentage,
  };
}

/**
 * Check if XP gain triggers a level up
 */
export function checkLevelUp(
  oldXP: number,
  newXP: number
): LevelUpResult | null {
  const oldLevel = getScanLevel(oldXP);
  const newLevel = getScanLevel(newXP);

  if (newLevel <= oldLevel) {
    return null; // No level up
  }

  const levelBenefit = LEVEL_BENEFITS[newLevel - 1];

  return {
    newLevel,
    unlockedBiomes: [...(levelBenefit?.unlocks.biomes || [])] as BiomeType[],
    unlockedEquipment: [...(levelBenefit?.unlocks.equipment || [])] as Array<
      ScannerType | ToolkitType
    >,
    bonusesGained: levelBenefit?.bonuses || {
      energyEfficiency: 0,
      rarityBonus: 1.0,
      xpGain: 1.0,
    },
  };
}

/**
 * Get all benefits for a scan level
 */
export function getLevelBenefits(level: number) {
  return LEVEL_BENEFITS[level - 1] || LEVEL_BENEFITS[0];
}

// ============================================================================
// Equipment System
// ============================================================================

/**
 * All equipment definitions
 */
export const ALL_EQUIPMENT: Equipment[] = [
  // Scanners
  {
    id: 'basic',
    name: 'Basic Scanner',
    type: 'scanner',
    description:
      'Standard issue scanner. Gets the job done but nothing fancy.',
    requiredLevel: 1,
    cost: {
      curiosity: 0, // Free
    },
    effects: {
      scanRange: SCANNER_EFFECTS.basic.scanRange,
      rareSpawnBonus: SCANNER_EFFECTS.basic.rareSpawnBonus,
    },
  },

  {
    id: 'advanced',
    name: 'Advanced Scanner',
    type: 'scanner',
    description:
      'Enhanced scanning capabilities with increased range and rare detection.',
    requiredLevel: 3,
    cost: {
      curiosity: EQUIPMENT_COSTS.advanced.curiosity,
      samples: [
        {
          rarity: EQUIPMENT_COSTS.advanced.samples.rarity,
          count: EQUIPMENT_COSTS.advanced.samples.count,
        },
      ],
    },
    effects: {
      scanRange: SCANNER_EFFECTS.advanced.scanRange,
      rareSpawnBonus: SCANNER_EFFECTS.advanced.rareSpawnBonus,
    },
  },

  {
    id: 'quantum',
    name: 'Quantum Scanner',
    type: 'scanner',
    description:
      'State-of-the-art scanner that can detect hidden legendary locations and maximizes rare spawn rates.',
    requiredLevel: 5,
    cost: {
      curiosity: EQUIPMENT_COSTS.quantum.curiosity,
      samples: [
        {
          rarity: EQUIPMENT_COSTS.quantum.samples.rarity,
          count: EQUIPMENT_COSTS.quantum.samples.count,
        },
      ],
    },
    effects: {
      scanRange: SCANNER_EFFECTS.quantum.scanRange,
      rareSpawnBonus: SCANNER_EFFECTS.quantum.rareSpawnBonus,
      revealHiddenLocations: SCANNER_EFFECTS.quantum.revealHiddenLocations,
    },
  },

  // Toolkits
  {
    id: 'none',
    name: 'No Toolkit',
    type: 'toolkit',
    description: 'Exploring without protection. Not recommended for dangerous areas.',
    requiredLevel: 1,
    cost: {
      curiosity: 0, // Free
    },
    effects: {},
  },

  {
    id: 'field-kit',
    name: 'Field Kit',
    type: 'toolkit',
    description:
      'Basic protection kit that reduces health damage and increases energy capacity.',
    requiredLevel: 2,
    cost: {
      curiosity: EQUIPMENT_COSTS['field-kit'].curiosity,
      samples: [
        {
          rarity: EQUIPMENT_COSTS['field-kit'].samples.rarity,
          count: EQUIPMENT_COSTS['field-kit'].samples.count,
        },
      ],
    },
    effects: {
      healthDamageReduction: TOOLKIT_EFFECTS['field-kit'].healthDamageReduction,
      energyCapacityBonus: TOOLKIT_EFFECTS['field-kit'].energyCapacityBonus,
    },
  },

  {
    id: 'master-kit',
    name: 'Master Kit',
    type: 'toolkit',
    description:
      'Premium protection kit offering maximum damage reduction, debuff immunity, and XP bonuses.',
    requiredLevel: 4,
    cost: {
      curiosity: EQUIPMENT_COSTS['master-kit'].curiosity,
      samples: [
        {
          rarity: EQUIPMENT_COSTS['master-kit'].samples.rarity,
          count: EQUIPMENT_COSTS['master-kit'].samples.count,
        },
      ],
    },
    effects: {
      healthDamageReduction: TOOLKIT_EFFECTS['master-kit'].healthDamageReduction,
      energyCapacityBonus: TOOLKIT_EFFECTS['master-kit'].energyCapacityBonus,
      xpBonus: TOOLKIT_EFFECTS['master-kit'].xpBonus,
      debuffImmunity: TOOLKIT_EFFECTS['master-kit'].debuffImmunity,
    },
  },
];

/**
 * Get equipment by ID
 */
export function getEquipment(
  equipmentId: ScannerType | ToolkitType
): Equipment | undefined {
  return ALL_EQUIPMENT.find((e) => e.id === equipmentId);
}

/**
 * Get all scanners
 */
export function getAllScanners(): Equipment[] {
  return ALL_EQUIPMENT.filter((e) => e.type === 'scanner');
}

/**
 * Get all toolkits
 */
export function getAllToolkits(): Equipment[] {
  return ALL_EQUIPMENT.filter((e) => e.type === 'toolkit');
}

/**
 * Get available equipment for purchase
 */
export function getAvailableEquipment(
  scanLevel: number,
  ownedEquipment: string[]
): Equipment[] {
  return ALL_EQUIPMENT.filter(
    (equipment) =>
      scanLevel >= equipment.requiredLevel &&
      !ownedEquipment.includes(equipment.id)
  );
}

/**
 * Check if can afford equipment
 */
export function canAffordEquipment(
  equipment: Equipment,
  state: {
    curiosity: number;
    samplesCollected: string[];
  }
): {
  canAfford: boolean;
  missingCuriosity: number;
  missingSamples: Array<{ rarity: string; count: number }>;
} {
  const missingCuriosity = Math.max(0, equipment.cost.curiosity - state.curiosity);

  const missingSamples: Array<{ rarity: string; count: number }> = [];

  if (equipment.cost.samples) {
    for (const sampleReq of equipment.cost.samples) {
      const collected = state.samplesCollected.filter(
        (s) => s.includes(sampleReq.rarity) // Simplified check
      ).length;

      if (collected < sampleReq.count) {
        missingSamples.push({
          rarity: sampleReq.rarity,
          count: sampleReq.count - collected,
        });
      }
    }
  }

  return {
    canAfford: missingCuriosity === 0 && missingSamples.length === 0,
    missingCuriosity,
    missingSamples,
  };
}

/**
 * Purchase equipment
 */
export function purchaseEquipment(
  equipment: Equipment,
  state: {
    curiosity: number;
    samplesCollected: string[];
  }
): {
  success: boolean;
  newCuriosity: number;
  newSamplesCollected: string[];
  error?: string;
} {
  const affordCheck = canAffordEquipment(equipment, state);

  if (!affordCheck.canAfford) {
    return {
      success: false,
      newCuriosity: state.curiosity,
      newSamplesCollected: state.samplesCollected,
      error: 'Insufficient resources to purchase equipment',
    };
  }

  // Deduct curiosity cost
  const newCuriosity = state.curiosity - equipment.cost.curiosity;

  // Deduct samples
  let newSamplesCollected = [...state.samplesCollected];

  if (equipment.cost.samples) {
    for (const sampleReq of equipment.cost.samples) {
      let toRemove = sampleReq.count;
      newSamplesCollected = newSamplesCollected.filter((sampleId) => {
        if (toRemove > 0 && sampleId.includes(sampleReq.rarity)) {
          toRemove--;
          return false; // Remove this sample
        }
        return true; // Keep this sample
      });
    }
  }

  return {
    success: true,
    newCuriosity,
    newSamplesCollected,
  };
}

/**
 * Get equipment unlock hints
 */
export function getEquipmentUnlockHint(equipment: Equipment): string {
  const hints: string[] = [];

  if (equipment.requiredLevel > 1) {
    hints.push(`Scan Level ${equipment.requiredLevel}`);
  }

  if (equipment.cost.curiosity > 0) {
    hints.push(`${equipment.cost.curiosity} Curiosity`);
  }

  if (equipment.cost.samples && equipment.cost.samples.length > 0) {
    equipment.cost.samples.forEach((req) => {
      hints.push(`${req.count} ${req.rarity} samples`);
    });
  }

  return hints.join(', ');
}

/**
 * Calculate total energy capacity with equipment bonuses
 */
export function calculateEnergyCapacity(toolkit: ToolkitType): number {
  const baseCapacity = 100;
  const equipment = getEquipment(toolkit);

  if (!equipment || !equipment.effects.energyCapacityBonus) {
    return baseCapacity;
  }

  return baseCapacity + equipment.effects.energyCapacityBonus;
}

/**
 * Check if equipment can be equipped at current level
 */
export function canEquipItem(
  itemId: string,
  scanLevel: number,
  ownedEquipment: string[]
): boolean {
  const equipment = ALL_EQUIPMENT.find((e) => e.id === itemId);
  if (!equipment) return false;

  // Check level requirement
  if (equipment.requiredLevel && scanLevel < equipment.requiredLevel) {
    return false;
  }

  return true;
}

/**
 * Get equipment effects summary
 */
export function getEquipmentEffectsSummary(
  scanner: ScannerType,
  toolkit: ToolkitType
): {
  scanRange: number;
  rareSpawnBonus: number;
  healthDamageReduction: number;
  energyCapacity: number;
  energyCapacityBonus: number;
  xpBonus: number;
  debuffImmunity: boolean;
  revealHiddenLocations: boolean;
} {
  const scannerEquip = getEquipment(scanner);
  const toolkitEquip = getEquipment(toolkit);

  const energyCapacityBonus = toolkitEquip?.effects.energyCapacityBonus || 0;

  return {
    scanRange: scannerEquip?.effects.scanRange || 1,
    rareSpawnBonus: scannerEquip?.effects.rareSpawnBonus || 0,
    healthDamageReduction: toolkitEquip?.effects.healthDamageReduction || 0,
    energyCapacity: calculateEnergyCapacity(toolkit),
    energyCapacityBonus,
    xpBonus: toolkitEquip?.effects.xpBonus || 0,
    debuffImmunity: toolkitEquip?.effects.debuffImmunity || false,
    revealHiddenLocations: scannerEquip?.effects.revealHiddenLocations || false,
  };
}

// ============================================================================
// Achievement System Integration
// ============================================================================

/**
 * Check scan level achievements
 */
export function checkScanLevelAchievements(level: number): string[] {
  const achievements: string[] = [];

  if (level >= 2) achievements.push('scanner-novice');
  if (level >= 3) achievements.push('scanner-adept');
  if (level >= 4) achievements.push('scanner-expert');
  if (level >= 5) achievements.push('scanner-master');

  return achievements;
}

/**
 * Get progression summary for UI
 */
export function getProgressionSummary(state: {
  scanLevel: number;
  scanExperience: number;
  unlockedBiomes: string[];
  equipment: { scanner: ScannerType; toolkit: ToolkitType };
}): {
  currentLevel: number;
  nextLevel: number;
  xpProgress: {
    current: number;
    required: number;
    percentage: number;
  };
  levelBenefits: (typeof LEVEL_BENEFITS)[number];
  nextLevelBenefits: (typeof LEVEL_BENEFITS)[number] | null;
  equipmentEffects: ReturnType<typeof getEquipmentEffectsSummary>;
  availableBiomes: number;
  totalBiomes: number;
} {
  const xpProgress = getXPProgress(state.scanExperience, state.scanLevel);
  const levelBenefits = getLevelBenefits(state.scanLevel);
  const nextLevelBenefits =
    state.scanLevel < 5 ? getLevelBenefits(state.scanLevel + 1) : null;
  const equipmentEffects = getEquipmentEffectsSummary(
    state.equipment.scanner,
    state.equipment.toolkit
  );

  return {
    currentLevel: state.scanLevel,
    nextLevel: Math.min(5, state.scanLevel + 1),
    xpProgress,
    levelBenefits,
    nextLevelBenefits,
    equipmentEffects,
    availableBiomes: state.unlockedBiomes.length,
    totalBiomes: 5,
  };
}

/**
 * Format XP value for display
 */
export function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

/**
 * Get level color for UI
 */
export function getLevelColor(level: number): string {
  const colors = {
    1: '#9ca3af', // gray-400
    2: '#3b82f6', // blue-500
    3: '#8b5cf6', // violet-500
    4: '#f59e0b', // amber-500
    5: '#ef4444', // red-500
  };
  return colors[level as keyof typeof colors] || colors[1];
}
