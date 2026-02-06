import type {
  ComfortState,
  ExpandedEmotionalState,
  GuardianDrive,
  GuardianField,
  GuardianPosition,
  GuardianStats,
  TimeOfDay,
} from '@/guardian/types';

export type Temperament = 'Calm' | 'Energetic' | 'Curious' | 'Mischievous' | 'Gentle' | 'Protective' | 'Adventurous';

export type PersonalityTraits = {
  energy: number;
  curiosity: number;
  affection: number;
  independence: number;
  discipline: number;
  playfulness: number;
  temperament: Temperament;
};

export type DerivedTraits = PersonalityTraits;

export type ActionMemory = {
  action: string;
  emotion: ExpandedEmotionalState;
  timestamp: number;
  impact: number;
};

export type ConsciousnessState = {
  identity: {
    traits: PersonalityTraits;
    essence: Temperament;
  };
  expression: {
    emotional: ExpandedEmotionalState;
    drives: GuardianDrive;
    comfort: ComfortState;
    vitals: GuardianStats;
  };
  memory: {
    actionHistory: ActionMemory[];
    emotionalPatterns: Record<ExpandedEmotionalState, number>;
    personalityDrift: Partial<PersonalityTraits>;
  };
  context: {
    position: GuardianPosition;
    fieldResonance: number;
    timeOfDay: TimeOfDay;
  };
};

export type ParticleParams = {
  particleCount?: number;
  particleSpeed?: number;
  particleSize?: number;
  flowPattern?: 'calm' | 'chaotic' | 'spiral' | 'pulsing';
  colorIntensity?: number;
};

const TEMPERAMENTS: Temperament[] = ['Calm', 'Energetic', 'Curious', 'Mischievous', 'Gentle', 'Protective', 'Adventurous'];

const clamp = (value: number, min: number = 0, max: number = 100): number => Math.min(max, Math.max(min, value));

function pickTemperament(field: GuardianField, seed: string = 'TEMPER'): Temperament {
  if (typeof field.hash === 'function') {
    const h = field.hash(seed);
    const idx = Number(h % BigInt(TEMPERAMENTS.length));
    return TEMPERAMENTS[Math.abs(idx)];
  }
  const prng = field.prng ?? Math.random;
  return TEMPERAMENTS[Math.floor(prng() * TEMPERAMENTS.length)];
}

export function derivePersonalityTraitsFromStats(stats: GuardianStats, field: GuardianField, seed?: string): PersonalityTraits {
  const pulse = field.pulse ?? [];
  const ring = field.ring ?? [];
  const temperament = pickTemperament(field, seed);

  return {
    energy: clamp(Math.round(stats.energy * 0.7 + (pulse[0] ?? 5) * 3)),
    curiosity: clamp(Math.round(stats.curiosity * 0.7 + (ring[1] ?? 5) * 2.5)),
    affection: clamp(Math.round(stats.bond * 0.65 + (ring[2] ?? 5) * 2)),
    independence: clamp(Math.round(70 - stats.bond * 0.35 + (pulse[3] ?? 5) * 3)),
    discipline: clamp(Math.round(stats.health * 0.7 + (ring[4] ?? 5) * 3)),
    playfulness: clamp(Math.round((stats.energy + stats.curiosity) / 2 + (pulse[5] ?? 5) * 2)),
    temperament,
  };
}

export function initializeConsciousness(
  traits: PersonalityTraits,
  vitals: GuardianStats,
  position: GuardianPosition,
  fieldResonance: number,
  timeOfDay: TimeOfDay = 'day'
): ConsciousnessState {
  return {
    identity: {
      traits,
      essence: traits.temperament,
    },
    expression: {
      emotional: 'neutral',
      drives: { rest: 0, exploration: 0, connection: 0, expression: 0, resonance: 0 },
      comfort: { overall: 50, source: 'balanced', unmetNeeds: [] },
      vitals,
    },
    memory: {
      actionHistory: [],
      emotionalPatterns: {} as Record<ExpandedEmotionalState, number>,
      personalityDrift: {},
    },
    context: {
      position,
      fieldResonance,
      timeOfDay,
    },
  };
}

export function applyGeneticModulation(baseDrives: GuardianDrive, personality: PersonalityTraits): GuardianDrive {
  const energyMod = (personality.energy - 50) / 100;
  const curiosityMod = (personality.curiosity - 50) / 100;
  const socialMod = ((personality.affection) - 50) / 100;
  const independenceMod = (personality.independence - 50) / 100;
  const disciplineMod = (personality.discipline - 50) / 100;
  const playfulnessMod = (personality.playfulness - 50) / 150;

  return {
    resonance: clamp((baseDrives.resonance ?? 50) * (1 + disciplineMod * 0.3)),
    exploration: clamp((baseDrives.exploration ?? baseDrives.explore ?? 50) * (1 + energyMod * 0.4 + curiosityMod * 0.6)),
    connection: clamp((baseDrives.connection ?? baseDrives.play ?? 50) * (1 + socialMod * 0.4 - independenceMod * 0.3)),
    rest: clamp((baseDrives.rest ?? 50) * (1 - energyMod * 0.3 - disciplineMod * 0.2)),
    expression: clamp((baseDrives.expression ?? baseDrives.play ?? 50) * (1 + playfulnessMod * 0.4)),
    play: baseDrives.play,
    explore: baseDrives.explore,
    focus: baseDrives.focus,
  };
}

export function refineEmotionalExpression(
  baseEmotion: ExpandedEmotionalState,
  personality: PersonalityTraits,
  prng: () => number
): ExpandedEmotionalState {
  const { temperament, energy, playfulness, independence, affection } = personality;

  const temperamentMods: Partial<Record<Temperament, Partial<Record<ExpandedEmotionalState, number>>>> = {
    Calm: { serene: 1.5, calm: 1.4, contemplative: 1.3, restless: 0.5, overwhelmed: 0.3, ecstatic: 0.7 },
    Energetic: { playful: 1.5, curious: 1.4, ecstatic: 1.3, restless: 1.2, calm: 0.6, withdrawn: 0.4 },
    Curious: { curious: 1.6, contemplative: 1.3, playful: 1.2, yearning: 1.1 },
    Mischievous: { mischievous: 1.6, playful: 1.4, restless: 1.2, serene: 0.6 },
    Gentle: { affectionate: 1.5, serene: 1.4, calm: 1.3, mischievous: 0.5, restless: 0.6 },
    Protective: { protective: 1.6, affectionate: 1.3, contemplative: 1.2, playful: 0.8 },
    Adventurous: { curious: 1.5, playful: 1.4, ecstatic: 1.2, restless: 1.1, calm: 0.6 },
  };

  const mods = temperamentMods[temperament];
  const emotionWeight = mods?.[baseEmotion] ?? 1;

  if (emotionWeight < 0.7 && energy > 60 && playfulness > 50 && prng() > 0.4) {
    const activeStates: ExpandedEmotionalState[] = ['playful', 'curious', 'mischievous', 'restless'];
    return activeStates[Math.floor(prng() * activeStates.length)];
  }

  if (emotionWeight < 0.7 && affection > 60 && prng() > 0.5) {
    const connectionStates: ExpandedEmotionalState[] = ['affectionate', 'yearning', 'protective'];
    return connectionStates[Math.floor(prng() * connectionStates.length)];
  }

  if (emotionWeight < 0.7 && independence > 60 && prng() > 0.5) {
    const solitaryStates: ExpandedEmotionalState[] = ['contemplative', 'serene', 'withdrawn'];
    return solitaryStates[Math.floor(prng() * solitaryStates.length)];
  }

  return baseEmotion;
}

const PARTICLE_PRESETS: Partial<Record<ExpandedEmotionalState, ParticleParams>> = {
  serene: { particleCount: 8, particleSpeed: 0.3, particleSize: 0.9, flowPattern: 'calm', colorIntensity: 0.6 },
  calm: { particleCount: 12, particleSpeed: 0.4, particleSize: 1.0, flowPattern: 'calm', colorIntensity: 0.65 },
  curious: { particleCount: 16, particleSpeed: 0.9, particleSize: 1.05, flowPattern: 'spiral', colorIntensity: 0.75 },
  playful: { particleCount: 24, particleSpeed: 1.4, particleSize: 1.1, flowPattern: 'chaotic', colorIntensity: 0.9 },
  affectionate: { particleCount: 18, particleSpeed: 0.9, particleSize: 1.05, flowPattern: 'pulsing', colorIntensity: 0.85 },
  contemplative: { particleCount: 12, particleSpeed: 0.6, particleSize: 0.95, flowPattern: 'spiral', colorIntensity: 0.65 },
  restless: { particleCount: 18, particleSpeed: 1.2, particleSize: 1.05, flowPattern: 'chaotic', colorIntensity: 0.8 },
  yearning: { particleCount: 15, particleSpeed: 0.8, particleSize: 1.0, flowPattern: 'pulsing', colorIntensity: 0.7 },
  overwhelmed: { particleCount: 28, particleSpeed: 1.6, particleSize: 1.1, flowPattern: 'chaotic', colorIntensity: 0.95 },
  withdrawn: { particleCount: 8, particleSpeed: 0.25, particleSize: 0.9, flowPattern: 'calm', colorIntensity: 0.45 },
  ecstatic: { particleCount: 32, particleSpeed: 2.1, particleSize: 1.15, flowPattern: 'spiral', colorIntensity: 1.0 },
  melancholic: { particleCount: 14, particleSpeed: 0.6, particleSize: 1.0, flowPattern: 'pulsing', colorIntensity: 0.55 },
  mischievous: { particleCount: 20, particleSpeed: 1.3, particleSize: 1.05, flowPattern: 'spiral', colorIntensity: 0.85 },
  protective: { particleCount: 18, particleSpeed: 1.0, particleSize: 1.05, flowPattern: 'pulsing', colorIntensity: 0.8 },
  transcendent: { particleCount: 30, particleSpeed: 1.8, particleSize: 1.1, flowPattern: 'spiral', colorIntensity: 1.0 },
};

export function emotionToParticleParams(
  emotion: ExpandedEmotionalState,
  comfort: ComfortState,
  drives: GuardianDrive
): ParticleParams {
  const base = PARTICLE_PRESETS[emotion] ?? { particleCount: 14, particleSpeed: 0.8, particleSize: 1.0, flowPattern: 'calm', colorIntensity: 0.7 };

  const comfortMod = (comfort.overall - 50) / 200; // -0.25 to 0.25
  const driveMod = ((drives.expression ?? drives.play ?? 50) - 50) / 150;

  return {
    particleCount: Math.round((base.particleCount ?? 16) * (1 + comfortMod + driveMod)),
    particleSpeed: (base.particleSpeed ?? 0.8) * (1 + comfortMod * 0.6),
    particleSize: (base.particleSize ?? 1) * (1 + driveMod * 0.4),
    flowPattern: base.flowPattern,
    colorIntensity: clamp((base.colorIntensity ?? 0.7) + comfortMod * 0.5, 0.3, 1.1),
  };
}

export function recordExperience(
  state: ConsciousnessState,
  action: string,
  emotion: ExpandedEmotionalState,
  impact: number
): ConsciousnessState {
  const history = [...state.memory.actionHistory, { action, emotion, timestamp: Date.now(), impact }];
  if (history.length > 30) history.shift();

  const drift = { ...state.memory.personalityDrift };
  const adjust = (key: Exclude<keyof PersonalityTraits, 'temperament'>, delta: number) => {
    const next = clamp((drift[key] ?? 0) + delta, -10, 10);
    drift[key] = next;
  };

  const scaled = impact * 2.5;
  if (action === 'play') {
    adjust('playfulness', scaled);
    adjust('curiosity', scaled * 0.6);
  } else if (action === 'feed') {
    adjust('discipline', scaled * 0.8);
    adjust('energy', scaled * 0.5);
  } else if (action === 'clean') {
    adjust('discipline', scaled * 0.6);
    adjust('affection', scaled * 0.4);
  } else if (action === 'rest') {
    adjust('energy', scaled * 0.8);
    adjust('discipline', scaled * 0.3);
  } else if (action === 'pet') {
    adjust('affection', scaled);
  } else if (action === 'explore' || action === 'game') {
    adjust('curiosity', scaled * 0.9);
    adjust('independence', scaled * 0.4);
  }

  const emotionalPatterns = { ...state.memory.emotionalPatterns };
  emotionalPatterns[emotion] = (emotionalPatterns[emotion] ?? 0) + 1;

  return {
    ...state,
    memory: {
      actionHistory: history,
      emotionalPatterns,
      personalityDrift: drift,
    },
  };
}

export function getEffectivePersonality(consciousness: ConsciousnessState): PersonalityTraits {
  const drift = consciousness.memory.personalityDrift;
  const base = consciousness.identity.traits;

  const applyDrift = (key: Exclude<keyof PersonalityTraits, 'temperament'>): number => clamp((base[key] as number) + (drift[key] ?? 0));

  return {
    energy: applyDrift('energy'),
    curiosity: applyDrift('curiosity'),
    affection: applyDrift('affection'),
    independence: applyDrift('independence'),
    discipline: applyDrift('discipline'),
    playfulness: applyDrift('playfulness'),
    temperament: base.temperament,
  };
}

export function emotionToResponseStyle(
  emotion: ExpandedEmotionalState,
  comfort: ComfortState
): 'happy' | 'neutral' | 'unhappy' | 'tired' | 'excited' | 'contemplative' {
  const emotionStyleMap: Partial<Record<ExpandedEmotionalState, 'happy' | 'neutral' | 'unhappy' | 'tired' | 'excited' | 'contemplative'>> = {
    serene: 'happy',
    calm: 'neutral',
    curious: 'excited',
    playful: 'happy',
    contemplative: 'contemplative',
    affectionate: 'happy',
    restless: 'neutral',
    yearning: 'unhappy',
    overwhelmed: 'unhappy',
    withdrawn: 'tired',
    ecstatic: 'excited',
    melancholic: 'unhappy',
    mischievous: 'excited',
    protective: 'neutral',
    transcendent: 'excited',
    joyful: 'happy',
    content: 'happy',
    tired: 'tired',
    anxious: 'unhappy',
    focused: 'contemplative',
    dreaming: 'contemplative',
    neutral: 'neutral',
    happy: 'happy',
    unhappy: 'unhappy',
    excited: 'excited',
  };

  const mapped = emotionStyleMap[emotion] ?? 'neutral';
  if (comfort.overall < 35) return 'unhappy';
  if (comfort.overall > 70 && (emotion === 'neutral' || emotion === 'contemplative')) return 'happy';
  return mapped;
}

export function consciousnessToResponseContext(
  consciousness: ConsciousnessState,
  vitals: { mood: number; energy: number; hunger: number; hygiene: number }
) {
  return {
    style: emotionToResponseStyle(consciousness.expression.emotional, consciousness.expression.comfort),
    emotion: consciousness.expression.emotional,
    temperament: consciousness.identity.essence,
    comfort: consciousness.expression.comfort,
    drives: consciousness.expression.drives,
    vitals,
    unmetNeeds: consciousness.expression.comfort.unmetNeeds,
  };
}
