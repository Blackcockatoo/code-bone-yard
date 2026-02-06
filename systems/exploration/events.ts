/**
 * Random event system for the Vimana Exploration System
 * Phase 4: Rare events, random encounters, special mechanics
 */

import type { ExplorationEvent, BiomeType, Rarity } from './types';
import type { MossPrimeField } from '@/core/field';
import { EVENT_BASE_CHANCE, EVENT_FREQUENCIES } from './constants';
import { rollForEvent } from './rarity';

// ============================================================================
// Event Definitions
// ============================================================================

export const ALL_EVENTS: ExplorationEvent[] = [
  {
    id: 'curious-creature',
    name: 'Curious Creature Encounter',
    description:
      'A friendly creature approaches, drawn by your presence. It shares some of its energy with you.',
    biome: undefined, // Universal in Starting Grove and Dream Spire
    frequency: EVENT_FREQUENCIES.CURIOUS_CREATURE,
    effects: {
      bond: 25,
      curiosity: 15,
    },
  },

  {
    id: 'ancient-cache',
    name: 'Ancient Cache Discovery',
    description:
      'You stumble upon a hidden cache of rare samples left by previous explorers.',
    biome: 'crystal-caverns',
    frequency: EVENT_FREQUENCIES.ANCIENT_CACHE,
    effects: {
      guaranteedSample: {
        rarity: 'rare',
      },
      curiosity: 20,
    },
  },

  {
    id: 'void-storm-warning',
    name: 'Void Storm Warning',
    description:
      'Dark energy swirls around you, increasing the chance of legendary discoveries nearby.',
    biome: 'void-nexus',
    frequency: EVENT_FREQUENCIES.VOID_STORM,
    effects: {
      multipliers: {
        rarityMultiplier: 2.0, // 2x legendary chance on next scan
      },
      curiosity: 30,
    },
    isSpecial: true,
  },

  {
    id: 'dream-echo',
    name: 'Dream Echo',
    description:
      'A memory from your dream journal replays vividly, strengthening your bond.',
    biome: 'dream-spire',
    frequency: EVENT_FREQUENCIES.DREAM_ECHO,
    effects: {
      bond: 30,
      curiosity: 20,
    },
  },

  {
    id: 'genesis-bloom',
    name: 'Genesis Bloom',
    description:
      'A rare phenomenon where all stats are restored and a legendary sample appears.',
    biome: 'eternal-garden',
    frequency: EVENT_FREQUENCIES.GENESIS_BLOOM,
    effects: {
      energy: 10,
      curiosity: 10,
      bond: 10,
      health: 10,
      guaranteedSample: {
        rarity: 'legendary',
      },
    },
    isSpecial: true,
  },

  {
    id: 'merchant-encounter',
    name: 'Wandering Merchant',
    description:
      'A mysterious merchant offers to trade samples for equipment upgrades.',
    biome: undefined, // Universal
    frequency: EVENT_FREQUENCIES.MERCHANT,
    effects: {
      // Special: Opens merchant UI (handled by event system)
      curiosity: 10,
    },
    isSpecial: true,
  },

  {
    id: 'aurora-blessing',
    name: 'Aurora Blessing',
    description:
      'Beautiful auroras dance overhead, filling you with wonder and energy.',
    biome: 'dream-spire',
    frequency: 0.03,
    effects: {
      energy: 20,
      curiosity: 25,
      bond: 15,
    },
  },

  {
    id: 'crystalline-resonance',
    name: 'Crystalline Resonance',
    description:
      'The crystals around you hum in perfect harmony, revealing hidden insights.',
    biome: 'crystal-caverns',
    frequency: 0.04,
    effects: {
      curiosity: 40,
      multipliers: {
        xpMultiplier: 1.5, // +50% XP for next action
      },
    },
  },

  {
    id: 'void-whisper',
    name: 'Void Whisper',
    description:
      'The void speaks forbidden knowledge to you. Powerful but slightly draining.',
    biome: 'void-nexus',
    frequency: 0.03,
    effects: {
      curiosity: 50,
      health: -10,
    },
  },

  {
    id: 'fibonacci-spiral',
    name: 'Fibonacci Spiral Sighting',
    description:
      'Perfect mathematical patterns appear in nature, enhancing your understanding.',
    biome: 'eternal-garden',
    frequency: 0.04,
    effects: {
      curiosity: 45,
      bond: 20,
    },
  },

  {
    id: 'meditation-spot',
    name: 'Perfect Meditation Spot',
    description:
      'You find a peaceful location perfect for rest and reflection.',
    biome: 'starting-grove',
    frequency: 0.05,
    effects: {
      energy: 15,
      health: 15,
      bond: 10,
    },
  },

  {
    id: 'time-dilation',
    name: 'Time Dilation',
    description:
      'Time seems to slow down, giving you more opportunity to explore thoroughly.',
    biome: 'dream-spire',
    frequency: 0.02,
    effects: {
      multipliers: {
        xpMultiplier: 2.0, // 2x XP for next action
      },
      curiosity: 30,
    },
    isSpecial: true,
  },
];

// ============================================================================
// Event System
// ============================================================================

/**
 * Get events for a specific biome
 */
export function getEventsForBiome(biome: BiomeType): ExplorationEvent[] {
  return ALL_EVENTS.filter(
    (event) => event.biome === biome || event.biome === undefined
  );
}

/**
 * Roll for random event
 */
export function rollForRandomEvent(
  field: MossPrimeField,
  biome: BiomeType,
  baseChance: number = EVENT_BASE_CHANCE
): ExplorationEvent | null {
  // First roll: does any event trigger?
  if (!rollForEvent(field, baseChance)) {
    return null;
  }

  // Second roll: which event?
  const availableEvents = getEventsForBiome(biome);

  if (availableEvents.length === 0) {
    return null;
  }

  // Weight events by their frequency
  const totalWeight = availableEvents.reduce(
    (sum, event) => sum + event.frequency,
    0
  );

  const roll = field.prng() * totalWeight;

  let cumulativeWeight = 0;
  for (const event of availableEvents) {
    cumulativeWeight += event.frequency;
    if (roll < cumulativeWeight) {
      return event;
    }
  }

  // Fallback to first event
  return availableEvents[0];
}

/**
 * Get event by ID
 */
export function getEvent(eventId: string): ExplorationEvent | undefined {
  return ALL_EVENTS.find((event) => event.id === eventId);
}

/**
 * Apply event effects to guardian stats
 */
export function applyEventEffects(
  event: ExplorationEvent,
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
  guaranteedSample?: { rarity: Rarity };
  multipliers?: {
    rarityMultiplier?: number;
    xpMultiplier?: number;
  };
} {
  const effects = event.effects;

  return {
    energy: Math.min(100, Math.max(0, guardianStats.energy + (effects.energy || 0))),
    curiosity: Math.min(
      200,
      Math.max(0, guardianStats.curiosity + (effects.curiosity || 0))
    ),
    bond: Math.min(100, Math.max(0, guardianStats.bond + (effects.bond || 0))),
    health: Math.min(100, Math.max(0, guardianStats.health + (effects.health || 0))),
    guaranteedSample: effects.guaranteedSample,
    multipliers: effects.multipliers,
  };
}

/**
 * Check if event is special (requires special handling)
 */
export function isSpecialEvent(event: ExplorationEvent): boolean {
  return event.isSpecial === true;
}

/**
 * Get event rarity indicator
 */
export function getEventRarityIndicator(event: ExplorationEvent): {
  label: string;
  color: string;
  icon: string;
} {
  if (event.frequency <= 0.01) {
    return {
      label: 'Extremely Rare',
      color: '#dc2626', // red-600
      icon: '⭐⭐⭐',
    };
  } else if (event.frequency <= 0.02) {
    return {
      label: 'Very Rare',
      color: '#f59e0b', // amber-500
      icon: '⭐⭐',
    };
  } else if (event.frequency <= 0.03) {
    return {
      label: 'Rare',
      color: '#3b82f6', // blue-500
      icon: '⭐',
    };
  } else {
    return {
      label: 'Uncommon',
      color: '#10b981', // green-500
      icon: '✦',
    };
  }
}

/**
 * Format event effects for display
 */
export function formatEventEffects(event: ExplorationEvent): string[] {
  const effects = event.effects;
  const lines: string[] = [];

  if (effects.energy) {
    lines.push(
      `${effects.energy > 0 ? '+' : ''}${effects.energy} Energy`
    );
  }

  if (effects.curiosity) {
    lines.push(
      `${effects.curiosity > 0 ? '+' : ''}${effects.curiosity} Curiosity`
    );
  }

  if (effects.bond) {
    lines.push(`${effects.bond > 0 ? '+' : ''}${effects.bond} Bond`);
  }

  if (effects.health) {
    lines.push(`${effects.health > 0 ? '+' : ''}${effects.health} Health`);
  }

  if (effects.guaranteedSample) {
    lines.push(
      `Guaranteed ${effects.guaranteedSample.rarity} sample`
    );
  }

  if (effects.multipliers?.rarityMultiplier) {
    lines.push(
      `${effects.multipliers.rarityMultiplier}x rarity chance (next scan)`
    );
  }

  if (effects.multipliers?.xpMultiplier) {
    lines.push(`${effects.multipliers.xpMultiplier}x XP gain (next action)`);
  }

  return lines;
}

/**
 * Get events that grant specific rewards
 */
export function getEventsWithGuaranteedSamples(): ExplorationEvent[] {
  return ALL_EVENTS.filter((event) => event.effects.guaranteedSample);
}

/**
 * Get events with multiplier effects
 */
export function getEventsWithMultipliers(): ExplorationEvent[] {
  return ALL_EVENTS.filter((event) => event.effects.multipliers);
}

/**
 * Calculate event discovery chance with modifiers
 */
export function calculateEventChance(
  baseChance: number,
  scanLevel: number,
  curiosity: number
): number {
  let chance = baseChance;

  // Slight bonus from scan level (max +2% at level 5)
  chance += (scanLevel - 1) * 0.005;

  // Slight bonus from high curiosity (max +1% at 200 curiosity)
  chance += Math.min(curiosity / 200, 1.0) * 0.01;

  return Math.min(0.15, chance); // Cap at 15%
}

// ============================================================================
// Event History Tracking
// ============================================================================

/**
 * Track event occurrence for achievements
 */
export interface EventOccurrence {
  eventId: string;
  triggeredAt: number;
  biome: BiomeType;
}

/**
 * Check rare event encounter achievements
 */
export function checkEventAchievements(
  eventHistory: EventOccurrence[]
): {
  eventExplorer: boolean; // Trigger 10 events
  raritySeeker: boolean; // Trigger 5 special events
  luckyFinder: boolean; // Trigger Genesis Bloom
} {
  const totalEvents = eventHistory.length;
  const specialEvents = eventHistory.filter((occurrence) => {
    const event = getEvent(occurrence.eventId);
    return event && isSpecialEvent(event);
  }).length;

  const hasGenesisBloom = eventHistory.some(
    (occurrence) => occurrence.eventId === 'genesis-bloom'
  );

  return {
    eventExplorer: totalEvents >= 10,
    raritySeeker: specialEvents >= 5,
    luckyFinder: hasGenesisBloom,
  };
}

/**
 * Get most recent events
 */
export function getRecentEvents(
  eventHistory: EventOccurrence[],
  count: number = 5
): EventOccurrence[] {
  return eventHistory
    .sort((a, b) => b.triggeredAt - a.triggeredAt)
    .slice(0, count);
}

/**
 * Get event occurrence count
 */
export function getEventOccurrenceCount(
  eventHistory: EventOccurrence[],
  eventId: string
): number {
  return eventHistory.filter((occurrence) => occurrence.eventId === eventId).length;
}

/**
 * Get rarest event encountered
 */
export function getRarestEventEncountered(
  eventHistory: EventOccurrence[]
): ExplorationEvent | null {
  if (eventHistory.length === 0) {
    return null;
  }

  const uniqueEventIds = [...new Set(eventHistory.map((o) => o.eventId))];
  const events = uniqueEventIds
    .map((id) => getEvent(id))
    .filter((e): e is ExplorationEvent => e !== undefined);

  if (events.length === 0) {
    return null;
  }

  // Sort by frequency (ascending) to find rarest
  events.sort((a, b) => a.frequency - b.frequency);

  return events[0];
}

// ============================================================================
// Active Multipliers Management
// ============================================================================

export interface ActiveMultiplier {
  type: 'rarity' | 'xp';
  multiplier: number;
  appliedAt: number;
  usedOn?: string; // Track what it was used on
}

/**
 * Check if multiplier is still active (one-time use)
 */
export function isMultiplierActive(multiplier: ActiveMultiplier): boolean {
  return !multiplier.usedOn;
}

/**
 * Apply and consume multiplier
 */
export function consumeMultiplier(
  multiplier: ActiveMultiplier,
  usedOn: string
): ActiveMultiplier {
  return {
    ...multiplier,
    usedOn,
  };
}

/**
 * Get active multipliers
 */
export function getActiveMultipliers(
  multipliers: ActiveMultiplier[]
): {
  rarityMultiplier: number;
  xpMultiplier: number;
} {
  const activeRarity = multipliers.find(
    (m) => m.type === 'rarity' && isMultiplierActive(m)
  );
  const activeXP = multipliers.find(
    (m) => m.type === 'xp' && isMultiplierActive(m)
  );

  return {
    rarityMultiplier: activeRarity?.multiplier || 1.0,
    xpMultiplier: activeXP?.multiplier || 1.0,
  };
}
