/**
 * Mononoke Garden - Dream Journal System
 *
 * Generates poetic, surreal dream narratives based on the pet's state.
 * This system is the core of the "Pet Consciousness During Sleep" feature.
 */

import { KizunaLevel } from '../mononoke-garden-core/kizuna/bondSystem';
import { PersonalityScores, PersonalityAxis, PERSONALITY_AXES, applyPersonalityDrift, Base7Sequence } from '../mononoke-garden-core/genetics/base7Genome';

// --- 1. CONFIGURATION INTERFACE (To be integrated into AppConfig.ts) ---

export type DreamFrequency = 'daily' | 'weekly' | 'on_demand';
export type DreamDetailLevel = 'vague' | 'detailed' | 'mythic';

export interface DreamConfig {
  enabled: boolean;
  frequency: DreamFrequency;
  detailLevel: DreamDetailLevel;
  canInfluenceEvolution: boolean; // Mythic feature: dreams can cause personality/evolution drift
  canLucidDream: boolean; // Mythic feature: user can influence dream content
  maxJournalEntries: number; // Limit for performance/storage
}

// --- 2. DREAM DATA STRUCTURE ---

export type DreamType = 'bonding' | 'evolution' | 'low_emotion' | 'breeding' | 'general';

export type DreamArchetype = 'The Shadow' | 'The Anima/Animus' | 'The Hero\'s Journey' | 'The Collective Unconscious' | 'The Trickster' | 'The Observer';

export interface Dream {
  id: string;
  timestamp: Date;
  type: DreamType;
  archetype: DreamArchetype;
  narrative: string; // The AI-generated text (50-150 tokens)
  keywords: string[]; // Extracted keywords for search/filtering
  emotionSnapshot: string; // The dominant emotion at the time of sleep
  kizunaSnapshot: KizunaLevel; // Bond level at the time of sleep
  evolutionStageSnapshot: string; // Evolution stage at the time of sleep (e.g., 'GENETICS', 'QUANTUM')
  // Mythic-tier feature
  influenceApplied?: boolean; // If the dream caused a personality/evolution drift
  lucidDreamKeyword?: string; // User-influenced keyword
}

// --- 3. DREAM JOURNAL STATE ---

export interface DreamJournalState {
  lastDreamDate: Date | null;
  journal: Dream[];
}

export function createDreamJournalState(): DreamJournalState {
  return {
    lastDreamDate: null,
    journal: [],
  };
}

// --- 4. DREAM GENERATOR INPUT ---

export interface DreamGeneratorInput {
  petName: string;
  memoryDepth: number; // From AppConfig.consciousness.memoryDepth
  currentEmotion: string; // The pet's dominant emotion
  kizunaLevel: KizunaLevel;
  evolutionStage: string;
  personality: PersonalityScores;
  recentActions: string[]; // Last N actions from memory
  isBreeding: boolean; // Flag for post-breeding dream type
  isEvolving: boolean; // Flag for during-evolution dream type
  detailLevel: DreamDetailLevel; // For prompt engineering
  lucidDreamKeyword?: string; // Mythic feature: user-influenced keyword
}

// --- 5. CORE GENERATION LOGIC (Placeholder for AI integration) ---

/**
 * Placeholder for the AI call to generate the dream narrative.
 * In Phase 3, this will be implemented with an LLM call.
 */
/**
 * Maps the pet's current state to a Jungian-inspired Dream Archetype.
 */
export function mapStateToArchetype(input: DreamGeneratorInput): DreamArchetype {
  const { currentEmotion, personality, kizunaLevel, evolutionStage, isBreeding, isEvolving } = input;

  // 1. The Collective Unconscious (Mythic/Quantum/Breeding)
  if (evolutionStage === 'QUANTUM' || isBreeding) {
    return 'The Collective Unconscious';
  }

  // 2. The Shadow (Negative emotions or low social/bravery)
  if (currentEmotion === 'withdrawn' || currentEmotion === 'melancholic' || personality.bravery <= 1) {
    return 'The Shadow';
  }

  // 3. The Hero's Journey (Evolution or high energy/bravery)
  if (isEvolving || personality.bravery >= 5 || personality.energy >= 5) {
    return 'The Hero\'s Journey';
  }

  // 4. The Anima/Animus (High bonding or contemplative)
  if (kizunaLevel >= 5 || currentEmotion === 'contemplative' || currentEmotion === 'affectionate') {
    return 'The Anima/Animus';
  }

  // 5. The Trickster (Mischievous or high creativity)
  if (currentEmotion === 'mischievous' || personality.creativity >= 5) {
    return 'The Trickster';
  }

  return 'The Observer'; // Default
}

/**
 * Placeholder for the AI call to generate the dream narrative.
 * In Phase 3, this will be implemented with an LLM call.
 */
export async function generateDream(input: DreamGeneratorInput): Promise<Dream> {
  const archetype = mapStateToArchetype(input);
  const mockNarrative = `[Archetype: ${archetype}] The stars were made of your laughter, and the moon was a quiet memory of a gentle touch. The air smelled of ${input.currentEmotion}.`;
  
  return {
    id: Date.now().toString(),
    timestamp: new Date(),
    type: input.isBreeding ? 'breeding' : input.isEvolving ? 'evolution' : 'general',
    archetype: archetype,
    narrative: mockNarrative,
    keywords: [input.currentEmotion, input.evolutionStage, archetype],
    emotionSnapshot: input.currentEmotion,
    kizunaSnapshot: input.kizunaLevel,
    evolutionStageSnapshot: input.evolutionStage,
    lucidDreamKeyword: input.lucidDreamKeyword,
  };
}

// --- 6. JOURNAL MANAGEMENT LOGIC ---

/**
 * Adds a new dream to the journal, enforcing the maxJournalEntries limit.
 */
export function addDreamToJournal(
  state: DreamJournalState,
  newDream: Dream,
  maxEntries: number
): DreamJournalState {
  const newJournal = [newDream, ...state.journal];
  
  // Enforce max entries limit
  if (newJournal.length > maxEntries) {
    newJournal.length = maxEntries;
  }

  return {
    lastDreamDate: newDream.timestamp,
    journal: newJournal,
  };
}

/**
 * Mythic-tier feature: Dreams can influence personality drift.
 * This function calculates the drift based on the dream's keywords and emotion.
 */
export function applyDreamInfluence(
  red60: Base7Sequence,
  dream: Dream
): { newRed60: Base7Sequence; axis: PersonalityAxis; direction: -1 | 1 } {
  // Map emotions to personality axes
  const emotionToAxisMap: Record<string, PersonalityAxis> = {
    'curious': 'openness',
    'playful': 'energy',
    'affectionate': 'sociability',
    'contemplative': 'emotionality',
    'restless': 'energy',
    'serene': 'shyness', // Becomes more calm/introverted
    'withdrawn': 'shyness',
    'mischievous': 'bravery',
    'protective': 'bravery',
    'transcendent': 'creativity',
  };

  const axis = emotionToAxisMap[dream.emotionSnapshot] || 'openness';
  const direction = (dream.type === 'low_emotion' || dream.emotionSnapshot === 'withdrawn') ? -1 : 1;

  const newRed60 = applyPersonalityDrift(red60, axis, direction, 2); // Dreams have a stronger drift (2 digits)

  return { newRed60, axis, direction };
}

/**
 * Mythic-tier feature: Dream Residue.
 * Dreams leave a temporary effect on the pet's state.
 */
export interface DreamResidue {
  name: string;
  description: string;
  effectType: 'xp_multiplier' | 'bond_multiplier' | 'stat_boost' | 'luck_boost';
  value: number;
  durationHours: number;
}

export function applyDreamResidue(dream: Dream): DreamResidue {
  const { archetype, emotionSnapshot } = dream;

  switch (archetype) {
    case 'The Shadow':
      return {
        name: 'Shadow\'s Echo',
        description: 'Confronting the unexpressed. Temporary focus required.',
        effectType: 'xp_multiplier',
        value: 0.9, // -10% XP
        durationHours: 12,
      };
    case 'The Anima/Animus':
      return {
        name: 'Soul Resonance',
        description: 'A deepened connection with the user.',
        effectType: 'bond_multiplier',
        value: 1.15, // +15% Bond XP
        durationHours: 12,
      };
    case 'The Hero\'s Journey':
      return {
        name: 'Heroic Resolve',
        description: 'A temporary boost to the pet\'s inner strength.',
        effectType: 'stat_boost',
        value: 1, // +1 to a random stat (logic handled in consumer)
        durationHours: 12,
      };
    case 'The Collective Unconscious':
      return {
        name: 'Cosmic Insight',
        description: 'A touch of universal luck.',
        effectType: 'luck_boost',
        value: 0.1, // +10% luck
        durationHours: 12,
      };
    case 'The Trickster':
      const isLucky = Math.random() > 0.5;
      return {
        name: 'Trickster\'s Gambit',
        description: 'Unpredictable energy from the subconscious.',
        effectType: 'xp_multiplier',
        value: isLucky ? 1.2 : 0.8, // +20% or -20% XP
        durationHours: 12,
      };
    default:
      return {
        name: 'Quiet Reflection',
        description: 'A peaceful night\'s sleep.',
        effectType: 'xp_multiplier',
        value: 1.0,
        durationHours: 0,
      };
  }
}

// --- 7. BONUS MINI-FEATURES LOGIC ---

/**
 * Generates the "Evolution Whispers" narrative.
 */
export async function generateEvolutionWhisper(
  petName: string,
  oldStage: string,
  newStage: string
): Promise<string> {
  // Placeholder for LLM call (75 tokens)
  return `${petName} felt the old shell crack. A whisper of ${oldStage} became the roar of ${newStage}. The quantum foam remembers.`;
}

/**
 * Generates the "Memory Echoes" narrative.
 */
export async function generateMemoryEcho(
  petName: string,
  meaningfulAction: string
): Promise<string> {
  // Placeholder for LLM call (50 tokens)
  return `${petName} paused, a sudden echo: the warmth of ${meaningfulAction}. A quiet, perfect moment.`;
}

/**
 * Generates the "Seasonal Haiku" narrative.
 */
export async function generateSeasonalHaiku(season: string): Promise<string> {
  // Placeholder for LLM call (30 tokens)
  return `The ${season} wind blows,\nPet sleeps, a quiet shadow,\nWaiting for the dawn.`;
}
