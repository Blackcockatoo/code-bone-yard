/**
 * Temple With Curtains - App Configuration System
 *
 * This config controls what features are exposed without removing any code.
 * Switch between Simple Mode (freemium) and Mythic Mode (premium) by changing one value.
 *
 * Philosophy: Ship the cool stuff behind curtains so free users get a clean,
 * lovable experience and power users can pay to open more doors.
 */

export type TierLevel = 'free' | 'premium' | 'mythic';
export type AppMode = 'simple' | 'mythic';

export function cloneConfig(config: AppConfig): AppConfig {
  return {
    ...config,
    companions: { ...config.companions },
    emotions: {
      ...config.emotions,
      enabledStates: new Set(config.emotions.enabledStates),
    },
    consciousness: { ...config.consciousness },
    genome: { ...config.genome },
    visuals: {
      ...config.visuals,
      cosmeticPacksAvailable: [...config.visuals.cosmeticPacksAvailable],
    },
    audio: {
      ...config.audio,
      enabledScales: new Set(config.audio.enabledScales),
      soundPacksAvailable: [...config.audio.soundPacksAvailable],
    },
    evolution: { ...config.evolution },
    rituals: {
      ...config.rituals,
      enabledRituals: new Set(config.rituals.enabledRituals),
    },
    data: { ...config.data },
    performance: { ...config.performance },
    ui: { ...config.ui },
  dreams: { ...config.dreams },
  };
}

export interface AppConfig {
  // User's current tier
  tier: TierLevel;

  // UI complexity mode
  mode: AppMode;

  // Companion limits
  companions: {
    maxSlots: number;
    canBreed: boolean;
    canTrade: boolean;
  };

  // Emotional spectrum (subset of the full 15 states)
  emotions: {
    enabledStates: Set<string>; // Which of the 15 emotional states are visible
    showEmotionDetails: boolean; // Show emotion name vs just emoji
    showDriveMeters: boolean; // Show drive bars (resonance, exploration, etc)
  };

  // Consciousness & AI behavior
  consciousness: {
    enablePersonalityDrift: boolean; // Can personality evolve over time?
    enableSelfRegulation: boolean; // Show self-regulation behaviors
    showConsciousnessReadout: boolean; // Advanced AI state panel
    memoryDepth: number; // How many actions to remember (20, 50, 100)
  };

  // Genome & genetics
  genome: {
    showGenomeLab: boolean; // Full genome viewer
    showElementWeb: boolean; // Element web visualization
    showTraitBreakdown: boolean; // Detailed trait source
    showBridgeScore: boolean; // Mathematical trait metrics
    canViewDNA: boolean; // See the actual red60/blue60/black60
  };

  // Visual effects
  visuals: {
    enableParticleFields: boolean;
    enableQuantumEffects: boolean;
    enableTemporalTrails: boolean;
    enableYantraBackdrops: boolean;
    maxParticleCount: number; // Cap for performance
    enableAdvancedGlow: boolean;
    cosmeticPacksAvailable: string[]; // 'base', 'celestial', 'void', 'primal'
  };

  // Audio
  audio: {
    enabledScales: Set<string>; // 'harmonic', 'pentatonic', 'dorian', 'phrygian'
    enableAdaptiveTimbre: boolean;
    enableFieldSonification: boolean;
    soundPacksAvailable: string[]; // 'core', 'sacred', 'cosmic', 'tribal'
  };

  // Evolution system
  evolution: {
    enabled: boolean;
    showEvolutionReadout: boolean; // Show evolution stage details
    showRequirements: boolean; // Show what's needed to evolve
    maxStage: number; // 1=GENETICS, 2=NEURO, 3=QUANTUM, 4=SPECIATION
  };

  // Interaction & rituals
  rituals: {
    enabledRituals: Set<string>; // Which rituals are available
    showRitualEffects: boolean; // Show detailed ritual outcomes
    enableAdvancedInteractions: boolean; // Deep bonding actions
  };

  // Data & cloud
  data: {
    enableCloudSync: boolean;
    enableMultiDevice: boolean;
    enableBackup: boolean;
    enableExport: boolean; // Can export/import pet data
  };

  // Performance
  performance: {
    batteryMode: boolean; // Reduce effects to save battery
    lazyLoadEffects: boolean; // Load heavy visuals on demand
    targetFPS: number; // 30 or 60
  };

  // UI customization
  ui: {
    showAdvancedStats: boolean; // Detailed stat breakdowns
    showMathematicalReadouts: boolean; // Show the math
    enableDarkMode: boolean;
    theme: string; // 'clean', 'mystical', 'technical'
  };

  // Dream Journal System
  dreams: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'on_demand';
    detailLevel: 'vague' | 'detailed' | 'mythic';
    canInfluenceEvolution: boolean;
    canLucidDream: boolean;
    maxJournalEntries: number;
  };
}

// ===== TIER PRESETS =====

export const FREE_CONFIG: AppConfig = {
  tier: 'free',
  mode: 'simple',

  companions: {
    maxSlots: 1,
    canBreed: false,
    canTrade: false,
  },

  emotions: {
    // Curated 8 emotions that span the range
    enabledStates: new Set([
      'calm',       // Neutral baseline
      'curious',    // Exploration
      'playful',    // High energy
      'affectionate', // Connection
      'contemplative', // Introspection
      'restless',   // Unmet needs
      'serene',     // Peak harmony
      'withdrawn',  // Low energy
    ]),
    showEmotionDetails: false, // Just show emoji
    showDriveMeters: false,
  },

  consciousness: {
    enablePersonalityDrift: false, // Personality is static
    enableSelfRegulation: false,
    showConsciousnessReadout: false,
    memoryDepth: 20, // Limited memory
  },

  genome: {
    showGenomeLab: false,
    showElementWeb: false,
    showTraitBreakdown: false,
    showBridgeScore: false,
    canViewDNA: false,
  },

  visuals: {
    enableParticleFields: true, // Keep some magic!
    enableQuantumEffects: false,
    enableTemporalTrails: false,
    enableYantraBackdrops: false,
    maxParticleCount: 15, // Modest particle count
    enableAdvancedGlow: false,
    cosmeticPacksAvailable: ['base'], // Just base cosmetics
  },

  audio: {
    enabledScales: new Set(['pentatonic', 'harmonic']), // 2 scales
    enableAdaptiveTimbre: false,
    enableFieldSonification: false,
    soundPacksAvailable: ['core'],
  },

  evolution: {
    enabled: true, // Evolution is core to the experience
    showEvolutionReadout: false, // Don't show details
    showRequirements: false, // Mystery evolution
    maxStage: 2, // Can reach NEURO only
  },

  rituals: {
    enabledRituals: new Set(['resonate', 'play', 'rest', 'feed', 'clean']),
    showRitualEffects: false, // Simple "your pet is happy"
    enableAdvancedInteractions: false,
  },

  data: {
    enableCloudSync: false,
    enableMultiDevice: false,
    enableBackup: false,
    enableExport: true, // Can export (but not sync)
  },

  performance: {
    batteryMode: false,
    lazyLoadEffects: true,
    targetFPS: 30,
  },

  ui: {
    showAdvancedStats: false,
    showMathematicalReadouts: false,
    enableDarkMode: true,
    theme: 'clean',
  },

  dreams: {
    enabled: true,
    frequency: 'weekly',
    detailLevel: 'vague',
    canInfluenceEvolution: false,
    canLucidDream: false,
    maxJournalEntries: 10,
  },
};

export const PREMIUM_CONFIG: AppConfig = {
  tier: 'premium',
  mode: 'simple', // Still simple by default, can toggle to mythic

  companions: {
    maxSlots: 5,
    canBreed: true,
    canTrade: true,
  },

  emotions: {
    // Full emotional spectrum
    enabledStates: new Set([
      'serene', 'calm', 'curious', 'playful', 'contemplative',
      'affectionate', 'restless', 'yearning', 'overwhelmed',
      'withdrawn', 'ecstatic', 'melancholic', 'mischievous',
      'protective', 'transcendent',
    ]),
    showEmotionDetails: true,
    showDriveMeters: true,
  },

  consciousness: {
    enablePersonalityDrift: true,
    enableSelfRegulation: true,
    showConsciousnessReadout: true,
    memoryDepth: 100,
  },

  genome: {
    showGenomeLab: true,
    showElementWeb: true,
    showTraitBreakdown: true,
    showBridgeScore: true,
    canViewDNA: true,
  },

  visuals: {
    enableParticleFields: true,
    enableQuantumEffects: true,
    enableTemporalTrails: true,
    enableYantraBackdrops: true,
    maxParticleCount: 40,
    enableAdvancedGlow: true,
    cosmeticPacksAvailable: ['base', 'celestial', 'void', 'primal'],
  },

  audio: {
    enabledScales: new Set(['harmonic', 'pentatonic', 'dorian', 'phrygian']),
    enableAdaptiveTimbre: true,
    enableFieldSonification: true,
    soundPacksAvailable: ['core', 'sacred', 'cosmic', 'tribal'],
  },

  evolution: {
    enabled: true,
    showEvolutionReadout: true,
    showRequirements: true,
    maxStage: 4, // Full evolution path
  },

  rituals: {
    enabledRituals: new Set([
      'resonate', 'play', 'rest', 'feed', 'clean',
      'attune', 'explore', 'meditate', 'celebrate', 'dream-weave',
    ]),
    showRitualEffects: true,
    enableAdvancedInteractions: true,
  },

  data: {
    enableCloudSync: true,
    enableMultiDevice: true,
    enableBackup: true,
    enableExport: true,
  },

  performance: {
    batteryMode: false,
    lazyLoadEffects: false,
    targetFPS: 60,
  },

  ui: {
    showAdvancedStats: true,
    showMathematicalReadouts: false, // Still simple mode by default
    enableDarkMode: true,
    theme: 'mystical',
  },

  dreams: {
    enabled: true,
    frequency: 'daily',
    detailLevel: 'detailed',
    canInfluenceEvolution: false,
    canLucidDream: false,
    maxJournalEntries: 50,
  },
};

export const MYTHIC_CONFIG: AppConfig = {
  ...PREMIUM_CONFIG,
  tier: 'mythic',
  mode: 'mythic', // Full cathedral experience

  companions: {
    maxSlots: 20,
    canBreed: true,
    canTrade: true,
  },

  consciousness: {
    enablePersonalityDrift: true,
    enableSelfRegulation: true,
    showConsciousnessReadout: true,
    memoryDepth: 500, // Deep memory
  },

  ui: {
    showAdvancedStats: true,
    showMathematicalReadouts: true, // Full genome math
    enableDarkMode: true,
    theme: 'technical', // Cathedral/technical aesthetic
  },

  dreams: {
    enabled: true,
    frequency: 'daily',
    detailLevel: 'mythic',
    canInfluenceEvolution: true,
    canLucidDream: true,
    maxJournalEntries: 100,
  },
};

// ===== CONFIG MANAGEMENT =====

type ConfigChangeListener = (config: AppConfig) => void;

const configListeners = new Set<ConfigChangeListener>();

export function subscribeToConfigChanges(listener: ConfigChangeListener): () => void {
  configListeners.add(listener);
  return () => configListeners.delete(listener);
}

function notifyConfigChange(config: AppConfig): void {
  configListeners.forEach((listener) => listener(cloneConfig(config)));
}

let currentConfig: AppConfig = cloneConfig(FREE_CONFIG);

export function getConfig(): AppConfig {
  return cloneConfig(currentConfig);
}

export function setConfig(config: AppConfig): void {
  currentConfig = cloneConfig(config);
  notifyConfigChange(currentConfig);
}

export function upgradeTier(tier: TierLevel): void {
  switch (tier) {
    case 'free':
      currentConfig = cloneConfig(FREE_CONFIG);
      break;
    case 'premium':
      currentConfig = cloneConfig(PREMIUM_CONFIG);
      break;
    case 'mythic':
      currentConfig = cloneConfig(MYTHIC_CONFIG);
      break;
  }

  notifyConfigChange(currentConfig);
}

export function toggleMode(): void {
  // Premium/Mythic users can toggle between simple and mythic mode
  if (currentConfig.tier === 'free') {
    console.warn('Free tier cannot access Mythic Mode');
    return;
  }

  const base = cloneConfig(currentConfig);
  const nextMode = base.mode === 'simple' ? 'mythic' : 'simple';

  const nextUi =
    nextMode === 'mythic'
      ? {
          ...base.ui,
          showAdvancedStats: true,
          showMathematicalReadouts: true,
          theme: 'technical',
        }
      : {
          ...base.ui,
          showAdvancedStats: true, // Keep stats
          showMathematicalReadouts: false, // Hide math
          theme: 'mystical',
        };

  currentConfig = {
    ...base,
    mode: nextMode,
    ui: nextUi,
  };

  notifyConfigChange(currentConfig);
}

export function enableBatteryMode(enabled: boolean): void {
  const base = cloneConfig(currentConfig);
  const performance = { ...base.performance, batteryMode: enabled };
  const visuals = { ...base.visuals };

  if (enabled) {
    performance.targetFPS = 30;
    visuals.maxParticleCount = Math.min(base.visuals.maxParticleCount, 15);
    visuals.enableQuantumEffects = false;
    visuals.enableTemporalTrails = false;
  } else {
    const tier = base.tier;
    if (tier === 'free') {
      performance.targetFPS = 30;
      visuals.maxParticleCount = 15;
    } else if (tier === 'premium') {
      performance.targetFPS = 60;
      visuals.maxParticleCount = 40;
      visuals.enableQuantumEffects = true;
      visuals.enableTemporalTrails = true;
    } else {
      performance.targetFPS = 60;
      visuals.maxParticleCount = 60;
      visuals.enableQuantumEffects = true;
      visuals.enableTemporalTrails = true;
    }
  }

  currentConfig = {
    ...base,
    performance,
    visuals,
  };

  notifyConfigChange(currentConfig);
}

// ===== FEATURE CHECKS (Use these throughout your code) =====

export const can = {
  addCompanion: (currentCount: number) =>
    currentCount < currentConfig.companions.maxSlots,

  breedCompanions: () =>
    currentConfig.companions.canBreed,

  viewGenomeLab: () =>
    currentConfig.genome.showGenomeLab,

  viewEmotion: (emotion: string) =>
    currentConfig.emotions.enabledStates.has(emotion),

  useRitual: (ritual: string) =>
    currentConfig.rituals.enabledRituals.has(ritual),

  evolveToStage: (stage: number) =>
    currentConfig.evolution.enabled && stage <= currentConfig.evolution.maxStage,

  syncToCloud: () =>
    currentConfig.data.enableCloudSync,

  useCosmeticPack: (pack: string) =>
    currentConfig.visuals.cosmeticPacksAvailable.includes(pack),

  useSoundPack: (pack: string) =>
    currentConfig.audio.soundPacksAvailable.includes(pack),

  useScale: (scale: string) =>
    currentConfig.audio.enabledScales.has(scale),

  seeAdvancedStats: () =>
    currentConfig.ui.showAdvancedStats,

  seeMathReadouts: () =>
    currentConfig.ui.showMathematicalReadouts,

  rememberActions: () =>
    currentConfig.consciousness.memoryDepth,
};

// ===== COSMETIC & SOUND PACK DEFINITIONS =====

export const COSMETIC_PACKS = {
  base: {
    name: 'Base Collection',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
    patterns: ['Solid', 'Gradient'],
    features: ['Wings', 'Aura'],
    price: 0,
  },
  celestial: {
    name: 'Celestial Pack',
    colors: ['#FFD700', '#87CEEB', '#E6E6FA', '#FFF8DC'],
    patterns: ['Iridescent', 'Fractal'],
    features: ['Crown', 'Halo', 'Star Trail'],
    price: 2.99,
  },
  void: {
    name: 'Void Pack',
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#533483'],
    patterns: ['Shadow Weave', 'Null Pattern'],
    features: ['Void Aura', 'Dark Matter Crown'],
    price: 2.99,
  },
  primal: {
    name: 'Primal Pack',
    colors: ['#8B4513', '#228B22', '#DC143C', '#FF8C00'],
    patterns: ['Tribal', 'Ancient Runes'],
    features: ['Horns', 'Tail Flame', 'Feral Eyes'],
    price: 2.99,
  },
};

export const SOUND_PACKS = {
  core: {
    name: 'Core Soundscape',
    scales: ['pentatonic', 'harmonic'],
    instruments: ['sine', 'triangle'],
    price: 0,
  },
  sacred: {
    name: 'Sacred Harmonics',
    scales: ['dorian', 'harmonic'],
    instruments: ['choir', 'bells'],
    price: 1.99,
  },
  cosmic: {
    name: 'Cosmic Resonance',
    scales: ['phrygian'],
    instruments: ['theremin', 'drone'],
    price: 1.99,
  },
  tribal: {
    name: 'Tribal Rhythms',
    scales: ['pentatonic'],
    instruments: ['drums', 'flute'],
    price: 1.99,
  },
};

// ===== PRICING =====

export const PRICING = {
  premium: {
    monthly: 4.99,
    yearly: 39.99,
    lifetime: 99.99,
  },
  mythic: {
    monthly: 9.99,
    yearly: 79.99,
    lifetime: 199.99,
  },
};

// ===== PAYWALL MESSAGES (Non-punishing) =====

export const PAYWALL_MESSAGES = {
  companions: {
    title: 'Expand Your Garden',
    message: 'Your companion thrives! Want to nurture more souls at once?',
    cta: 'Unlock More Slots',
  },
  genomeLab: {
    title: 'Genome Lab',
    message: 'Dive deeper into the mathematical DNA that makes your companion unique.',
    cta: 'Open the Lab',
  },
  emotions: {
    title: 'Emotional Spectrum',
    message: 'Your companion has even more feelings waiting to be expressed.',
    cta: 'Unlock Full Spectrum',
  },
  cloudSync: {
    title: 'Cloud Sanctuary',
    message: 'Keep your companions safe across all your devices.',
    cta: 'Enable Cloud Sync',
  },
  cosmeticPack: {
    title: 'New Aesthetics',
    message: 'Beautiful new forms and colors for your companion to embody.',
    cta: 'Get Pack',
  },
  mythicMode: {
    title: 'Mythic Mode',
    message: 'For those who wish to see the mathematics behind the magic.',
    cta: 'Enter the Cathedral',
  },
};
