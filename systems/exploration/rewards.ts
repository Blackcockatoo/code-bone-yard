/**
 * Rewards and stats integration for the Vimana Exploration System
 * Phase 4: Resource costs, stat effects, health risks, rewards calculation
 */

import type {
  Sample,
  Anomaly,
  Location,
  ScanResult,
  AnomalyAttemptResult,
  Debuff,
  ScannerType,
  ToolkitType,
  BiomeType,
} from './types';
import type { MossPrimeField } from '@/core/field';
import {
  STAT_CAPS,
  SCAN_ENERGY_COSTS,
  ANOMALY_ENERGY_COSTS,
  LOCATION_HEALTH_RISKS,
  ANOMALY_FAILURE_HEALTH_DAMAGE,
  TOOLKIT_EFFECTS,
  LEVEL_BENEFITS,
  XP_SOURCES,
  COOLDOWN_DURATIONS,
} from './constants';
import { calculateRarityChance, rollContentType, rollForEvent } from './rarity';

// ============================================================================
// Resource Cost System
// ============================================================================

/**
 * Calculate energy cost for scanning a location
 */
export function calculateScanEnergyCost(
  location: Location,
  scanLevel: number,
  toolkit: ToolkitType
): number {
  const baseCost = location.energyCost;

  // Apply level efficiency bonus
  const levelBenefit = LEVEL_BENEFITS[scanLevel - 1];
  const efficiencyMultiplier = levelBenefit
    ? 1 - levelBenefit.bonuses.energyEfficiency / 100
    : 1.0;

  // Apply toolkit bonus if equipped
  const toolkitEffect = TOOLKIT_EFFECTS[toolkit];
  const toolkitBonus = toolkitEffect?.energyCapacityBonus || 0;
  // Toolkit doesn't reduce scan cost, but increases max capacity

  const finalCost = Math.floor(baseCost * efficiencyMultiplier);

  return Math.max(1, finalCost); // Minimum 1 energy
}

/**
 * Calculate energy cost for attempting an anomaly
 */
export function calculateAnomalyEnergyCost(
  anomaly: Anomaly,
  scanLevel: number,
  activeDebuffs: Debuff[]
): number {
  const baseCost = anomaly.energyCost;

  // Apply level efficiency bonus
  const levelBenefit = LEVEL_BENEFITS[scanLevel - 1];
  const efficiencyMultiplier = levelBenefit
    ? 1 - levelBenefit.bonuses.energyEfficiency / 100
    : 1.0;

  // Check for disorientation debuff (increases energy costs)
  const disorientationDebuff = activeDebuffs.find(
    (d) => d.id === 'disorientation'
  );
  const debuffMultiplier = disorientationDebuff
    ? disorientationDebuff.effects.energyCostMultiplier || 1.0
    : 1.0;

  const finalCost = Math.ceil(baseCost * efficiencyMultiplier * debuffMultiplier);

  return Math.max(1, finalCost);
}

/**
 * Check if guardian has enough energy for action
 */
export function hasEnoughEnergy(currentEnergy: number, requiredEnergy: number): boolean {
  return currentEnergy >= requiredEnergy;
}

// ============================================================================
// Stat Effects System
// ============================================================================

/**
 * Apply stat caps
 */
function applyStatCap(value: number, cap: number): number {
  return Math.max(0, Math.min(cap, value));
}

/**
 * Apply sample effects to guardian stats
 */
export function applySampleEffects(
  sample: Sample,
  guardianStats: {
    energy: number;
    curiosity: number;
    bond: number;
    health: number;
  }
): {
  energy: number;
  curiosity: number;
  bond: number;
  health: number;
} {
  const effects = sample.effects;

  return {
    energy: applyStatCap(
      guardianStats.energy + (effects.energy || 0),
      STAT_CAPS.ENERGY
    ),
    curiosity: applyStatCap(
      guardianStats.curiosity + (effects.curiosity || 0),
      STAT_CAPS.CURIOSITY
    ),
    bond: applyStatCap(guardianStats.bond + (effects.bond || 0), STAT_CAPS.BOND),
    health: applyStatCap(
      guardianStats.health + (effects.health || 0),
      STAT_CAPS.HEALTH
    ),
  };
}

/**
 * Apply anomaly success rewards
 */
export function applyAnomalySuccessRewards(
  anomaly: Anomaly,
  guardianStats: {
    energy: number;
    curiosity: number;
    bond: number;
    health: number;
  }
): {
  energy: number;
  curiosity: number;
  bond: number;
  health: number;
} {
  const rewards = anomaly.rewards.success;

  return {
    energy: applyStatCap(
      guardianStats.energy + (rewards.energy || 0),
      STAT_CAPS.ENERGY
    ),
    curiosity: applyStatCap(
      guardianStats.curiosity + (rewards.curiosity || 0),
      STAT_CAPS.CURIOSITY
    ),
    bond: applyStatCap(guardianStats.bond + (rewards.bond || 0), STAT_CAPS.BOND),
    health: applyStatCap(
      guardianStats.health + (rewards.health || 0),
      STAT_CAPS.HEALTH
    ),
  };
}

/**
 * Apply anomaly failure penalties
 */
export function applyAnomalyFailurePenalties(
  anomaly: Anomaly,
  guardianStats: {
    energy: number;
    curiosity: number;
    health: number;
  }
): {
  energy: number;
  curiosity: number;
  health: number;
} {
  const penalties = anomaly.rewards.failure;

  return {
    energy: applyStatCap(
      guardianStats.energy + (penalties.energy || 0),
      STAT_CAPS.ENERGY
    ),
    curiosity: applyStatCap(
      guardianStats.curiosity + (penalties.curiosity || 0),
      STAT_CAPS.CURIOSITY
    ),
    health: applyStatCap(
      guardianStats.health + (penalties.health || 0),
      STAT_CAPS.HEALTH
    ),
  };
}

// ============================================================================
// Health Risk System
// ============================================================================

/**
 * Calculate health damage from location risk
 */
export function calculateLocationHealthRisk(
  location: Location,
  field: MossPrimeField,
  toolkit: ToolkitType
): number {
  if (!location.healthRisk) {
    return 0; // No risk
  }

  // Roll for health risk
  const roll = field.prng();
  if (roll >= location.healthRisk.chance) {
    return 0; // No damage this time
  }

  let damage = location.healthRisk.damage;

  // Apply toolkit protection
  const toolkitEffect = TOOLKIT_EFFECTS[toolkit];
  if (toolkitEffect?.healthDamageReduction) {
    const reductionPercent = toolkitEffect.healthDamageReduction / 100;
    damage = Math.ceil(damage * (1 - reductionPercent));
  }

  return damage;
}

/**
 * Calculate health damage from failed anomaly
 */
export function calculateAnomalyFailureHealthDamage(
  anomaly: Anomaly,
  toolkit: ToolkitType
): number {
  const baseDamage = anomaly.rewards.failure.health || 0;

  if (baseDamage >= 0) {
    return 0; // No damage or heal
  }

  let damage = Math.abs(baseDamage);

  // Apply toolkit protection
  const toolkitEffect = TOOLKIT_EFFECTS[toolkit];
  if (toolkitEffect?.healthDamageReduction) {
    const reductionPercent = toolkitEffect.healthDamageReduction / 100;
    damage = Math.ceil(damage * (1 - reductionPercent));
  }

  return -damage; // Return as negative for stat reduction
}

/**
 * Check if high curiosity provides damage reduction
 */
export function calculateCuriosityDamageReduction(curiosity: number): number {
  if (curiosity < 150) {
    return 0;
  }

  return 0.25; // 25% damage reduction for high curiosity
}

// ============================================================================
// XP and Progression
// ============================================================================

/**
 * Calculate XP gained from scan
 */
export function calculateScanXP(
  scanLevel: number,
  foundContent: boolean,
  activeDebuffs: Debuff[]
): number {
  let xp: number = XP_SOURCES.SCAN;

  // Apply confusion debuff if active
  const confusionDebuff = activeDebuffs.find((d) => d.id === 'confusion');
  if (confusionDebuff && confusionDebuff.effects.xpPenalty) {
    xp = Math.floor(xp * confusionDebuff.effects.xpPenalty);
  }

  // Apply level XP multiplier
  const levelBenefit = LEVEL_BENEFITS[scanLevel - 1];
  if (levelBenefit) {
    xp = Math.floor(xp * levelBenefit.bonuses.xpGain);
  }

  return xp;
}

/**
 * Calculate XP gained from sample collection
 */
export function calculateSampleXP(
  sample: Sample,
  scanLevel: number,
  toolkit: ToolkitType,
  activeDebuffs: Debuff[]
): number {
  let xp: number;

  switch (sample.rarity) {
    case 'common':
      xp = XP_SOURCES.COMMON_SAMPLE;
      break;
    case 'rare':
      xp = XP_SOURCES.RARE_SAMPLE;
      break;
    case 'legendary':
      xp = XP_SOURCES.LEGENDARY_SAMPLE;
      break;
  }

  // Apply toolkit XP bonus
  const toolkitEffect = TOOLKIT_EFFECTS[toolkit];
  if (toolkitEffect?.xpBonus) {
    xp = Math.floor(xp * (1 + toolkitEffect.xpBonus / 100));
  }

  // Apply confusion debuff
  const confusionDebuff = activeDebuffs.find((d) => d.id === 'confusion');
  if (confusionDebuff && confusionDebuff.effects.xpPenalty) {
    xp = Math.floor(xp * confusionDebuff.effects.xpPenalty);
  }

  // Apply level XP multiplier
  const levelBenefit = LEVEL_BENEFITS[scanLevel - 1];
  if (levelBenefit) {
    xp = Math.floor(xp * levelBenefit.bonuses.xpGain);
  }

  return xp;
}

/**
 * Calculate XP gained from anomaly success
 */
export function calculateAnomalyXP(
  anomaly: Anomaly,
  scanLevel: number,
  toolkit: ToolkitType,
  activeDebuffs: Debuff[]
): number {
  let xp = anomaly.rewards.success.experience;

  // Apply toolkit XP bonus
  const toolkitEffect = TOOLKIT_EFFECTS[toolkit];
  if (toolkitEffect?.xpBonus) {
    xp = Math.floor(xp * (1 + toolkitEffect.xpBonus / 100));
  }

  // Apply confusion debuff
  const confusionDebuff = activeDebuffs.find((d) => d.id === 'confusion');
  if (confusionDebuff && confusionDebuff.effects.xpPenalty) {
    xp = Math.floor(xp * confusionDebuff.effects.xpPenalty);
  }

  // Apply level XP multiplier
  const levelBenefit = LEVEL_BENEFITS[scanLevel - 1];
  if (levelBenefit) {
    xp = Math.floor(xp * levelBenefit.bonuses.xpGain);
  }

  return xp;
}

// ============================================================================
// Cooldown System
// ============================================================================

/**
 * Calculate cooldown end timestamp
 */
export function calculateCooldownEnd(anomaly: Anomaly): number {
  const cooldownMinutes = anomaly.rewards.failure.cooldown || 0;
  return Date.now() + cooldownMinutes * 60 * 1000;
}

/**
 * Check if anomaly is on cooldown
 */
export function isOnCooldown(
  anomalyId: string,
  cooldowns: Record<string, number>
): {
  isOnCooldown: boolean;
  remainingMinutes: number;
} {
  const cooldownEnd = cooldowns[anomalyId];

  if (!cooldownEnd) {
    return { isOnCooldown: false, remainingMinutes: 0 };
  }

  const now = Date.now();

  if (now >= cooldownEnd) {
    return { isOnCooldown: false, remainingMinutes: 0 };
  }

  const remainingMs = cooldownEnd - now;
  const remainingMinutes = Math.ceil(remainingMs / 1000 / 60);

  return { isOnCooldown: true, remainingMinutes };
}

// ============================================================================
// Debuff Management
// ============================================================================

/**
 * Check if toolkit provides debuff immunity
 */
export function hasDebuffImmunity(toolkit: ToolkitType): boolean {
  const toolkitEffect = TOOLKIT_EFFECTS[toolkit];
  return toolkitEffect?.debuffImmunity === true;
}

/**
 * Apply debuff if not immune
 */
export function applyDebuff(
  anomaly: Anomaly,
  toolkit: ToolkitType
): Debuff | null {
  if (hasDebuffImmunity(toolkit)) {
    return null; // Immune to debuffs
  }

  const debuffConfig = anomaly.rewards.failure.debuff;

  if (!debuffConfig) {
    return null; // No debuff to apply
  }

  return {
    id: debuffConfig.type,
    name: debuffConfig.type,
    description: debuffConfig.effect,
    duration: debuffConfig.duration,
    appliedAt: Date.now(),
    effects: {}, // Effects defined in DEBUFF_CONFIGS
  };
}

/**
 * Remove expired debuffs
 */
export function removeExpiredDebuffs(activeDebuffs: Debuff[]): Debuff[] {
  const now = Date.now();
  return activeDebuffs.filter((debuff) => {
    const expiresAt = debuff.appliedAt + debuff.duration * 60 * 1000;
    return now < expiresAt;
  });
}

// ============================================================================
// Scan Result Generation
// ============================================================================

/**
 * Generate scan result for a location
 */
export function generateScanResult(
  location: Location,
  field: MossPrimeField,
  state: {
    scanLevel: number;
    scanner: ScannerType;
    toolkit: ToolkitType;
    activeDebuffs: Debuff[];
  }
): ScanResult {
  // Calculate energy cost
  const energyCost = calculateScanEnergyCost(
    location,
    state.scanLevel,
    state.toolkit
  );

  // Calculate health risk
  const healthLost = calculateLocationHealthRisk(
    location,
    field,
    state.toolkit
  );

  // Roll for content type
  const contentType = rollContentType(field, location.contentWeights);

  // Calculate XP
  const xpGained = calculateScanXP(
    state.scanLevel,
    contentType !== 'nothing',
    state.activeDebuffs
  );

  return {
    success: true,
    contentType,
    energyCost,
    healthLost,
    xpGained,
    message:
      contentType === 'nothing'
        ? 'Scan complete. Nothing of interest found.'
        : `Scan complete. ${contentType} detected!`,
  };
}

// ============================================================================
// Anomaly Attempt Result Generation
// ============================================================================

/**
 * Generate anomaly attempt result
 */
export function generateAnomalyAttemptResult(
  anomaly: Anomaly,
  success: boolean,
  state: {
    scanLevel: number;
    toolkit: ToolkitType;
    activeDebuffs: Debuff[];
  }
): AnomalyAttemptResult {
  if (success) {
    // Success rewards
    const xpGained = calculateAnomalyXP(
      anomaly,
      state.scanLevel,
      state.toolkit,
      state.activeDebuffs
    );

    return {
      success: true,
      rewards: {
        energy: anomaly.rewards.success.energy || 0,
        curiosity: anomaly.rewards.success.curiosity || 0,
        bond: anomaly.rewards.success.bond || 0,
        health: anomaly.rewards.success.health || 0,
        xpGained,
        samplesAwarded: [], // Populated by caller based on rarity rolls
        unlocksAwarded: anomaly.rewards.success.unlocks || [],
      },
      message: `${anomaly.name} resolved successfully!`,
    };
  } else {
    // Failure penalties
    const healthDamage = calculateAnomalyFailureHealthDamage(anomaly, state.toolkit);
    const debuff = applyDebuff(anomaly, state.toolkit);
    const cooldownEnd = anomaly.rewards.failure.cooldown
      ? calculateCooldownEnd(anomaly)
      : undefined;

    return {
      success: false,
      penalties: {
        energy: anomaly.rewards.failure.energy || 0,
        health: healthDamage,
        curiosity: anomaly.rewards.failure.curiosity || 0,
        cooldown: cooldownEnd
          ? {
              duration: anomaly.rewards.failure.cooldown || 0,
              expiresAt: cooldownEnd,
            }
          : undefined,
        debuff: debuff || undefined,
      },
      message: `Failed to resolve ${anomaly.name}. Suffering consequences...`,
    };
  }
}

// ============================================================================
// Collection Bonus System
// ============================================================================

/**
 * Check and apply collection bonus
 */
export function checkAndApplyCollectionBonus(
  sample: Sample,
  samplesCollected: string[]
): {
  hasBonusreward: boolean;
  bonusStat?: 'energy' | 'curiosity' | 'bond' | 'health';
  bonusAmount?: number;
} {
  if (!sample.collectionBonus) {
    return { hasBonusreward: false };
  }

  const collected = samplesCollected.filter((id) => id === sample.id).length;

  if (collected === sample.collectionBonus.threshold) {
    // Just hit the threshold
    return {
      hasBonusreward: true,
      bonusStat: sample.collectionBonus.stat,
      bonusAmount: sample.collectionBonus.amount,
    };
  }

  return { hasBonusreward: false };
}
