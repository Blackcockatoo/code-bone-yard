/**
 * Cosmetics System
 * Unlockable visual customizations for guardians
 */

export type CosmeticCategory = 'accessory' | 'aura' | 'pattern' | 'effect';
export type CosmeticRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface CosmeticVisualData {
  color: string;
  gradient?: string[];
  animation?: string;
  intensity?: number;
}

export interface Cosmetic {
  id: string;
  name: string;
  description: string;
  category: CosmeticCategory;
  rarity: CosmeticRarity;
  unlockCondition: string;
  visualData: CosmeticVisualData;
}

// Cosmetics catalog with all available items
export const COSMETICS_CATALOG: Cosmetic[] = [
  // Accessories
  {
    id: 'golden-crown',
    name: 'Golden Crown',
    description: 'A regal crown befitting a champion',
    category: 'accessory',
    rarity: 'legendary',
    unlockCondition: 'Win 50 resonance duels',
    visualData: { color: '#FFD700', gradient: ['#FFD700', '#FFA500'] },
  },
  {
    id: 'crystal-tiara',
    name: 'Crystal Tiara',
    description: 'Shimmering crystals arranged in an elegant arc',
    category: 'accessory',
    rarity: 'epic',
    unlockCondition: 'Reach QUANTUM evolution stage',
    visualData: { color: '#00FFFF', gradient: ['#00FFFF', '#0088FF'] },
  },
  {
    id: 'battle-crown',
    name: 'Battle Crown',
    description: 'Forged in the heat of combat',
    category: 'accessory',
    rarity: 'epic',
    unlockCondition: 'Win 5 duels in a row',
    visualData: { color: '#DC143C', gradient: ['#DC143C', '#8B0000'] },
  },
  {
    id: 'leaf-wreath',
    name: 'Leaf Wreath',
    description: 'A natural crown of verdant leaves',
    category: 'accessory',
    rarity: 'common',
    unlockCondition: 'Keep all vitals above 80% for 1 hour',
    visualData: { color: '#228B22' },
  },
  {
    id: 'star-halo',
    name: 'Star Halo',
    description: 'A ring of tiny floating stars',
    category: 'accessory',
    rarity: 'rare',
    unlockCondition: 'Discover 10 map locations',
    visualData: { color: '#FFFACD', animation: 'twinkle' },
  },

  // Auras
  {
    id: 'golden-aura',
    name: 'Golden Aura',
    description: 'A warm, radiant glow surrounds your guardian',
    category: 'aura',
    rarity: 'epic',
    unlockCondition: 'Reach 100% in all vital stats',
    visualData: { color: '#FFD700', intensity: 0.8 },
  },
  {
    id: 'shadow-aura',
    name: 'Shadow Aura',
    description: 'Tendrils of darkness swirl gently',
    category: 'aura',
    rarity: 'rare',
    unlockCondition: 'Win 10 duels with Shadow aspect',
    visualData: { color: '#2F2F4F', gradient: ['#2F2F4F', '#000000'] },
  },
  {
    id: 'void-aura',
    name: 'Void Aura',
    description: 'Reality bends around your guardian',
    category: 'aura',
    rarity: 'epic',
    unlockCondition: 'Reach Void aspect with power 90+',
    visualData: { color: '#8B5CF6', animation: 'pulse' },
  },
  {
    id: 'flame-aura',
    name: 'Flame Aura',
    description: 'Dancing flames that never burn',
    category: 'aura',
    rarity: 'rare',
    unlockCondition: 'Have Sun aspect for 24 hours total',
    visualData: { color: '#FF4500', animation: 'flicker' },
  },
  {
    id: 'cosmic-aura',
    name: 'Cosmic Aura',
    description: 'Stars and nebulae orbit your guardian',
    category: 'aura',
    rarity: 'legendary',
    unlockCondition: 'Achieve all evolution stages',
    visualData: { color: '#9400D3', gradient: ['#9400D3', '#00BFFF', '#FFD700'], animation: 'orbit' },
  },

  // Patterns
  {
    id: 'cosmic-pattern',
    name: 'Cosmic Pattern',
    description: 'Swirling galaxies mark your guardian',
    category: 'pattern',
    rarity: 'epic',
    unlockCondition: 'Resolve 10 anomalies',
    visualData: { color: '#9370DB', gradient: ['#9370DB', '#4B0082'] },
  },
  {
    id: 'tiger-stripes',
    name: 'Tiger Stripes',
    description: 'Bold stripes of power',
    category: 'pattern',
    rarity: 'common',
    unlockCondition: 'Win 5 resonance duels',
    visualData: { color: '#FF8C00' },
  },
  {
    id: 'circuit-lines',
    name: 'Circuit Lines',
    description: 'Glowing technological patterns',
    category: 'pattern',
    rarity: 'rare',
    unlockCondition: 'Reach NEURO evolution stage',
    visualData: { color: '#00FF00', animation: 'pulse' },
  },
  {
    id: 'genetic-helix',
    name: 'Genetic Helix',
    description: 'DNA spirals dance across the surface',
    category: 'pattern',
    rarity: 'epic',
    unlockCondition: 'Create 25 offspring',
    visualData: { color: '#FF1493', animation: 'rotate' },
  },
  {
    id: 'void-cracks',
    name: 'Void Cracks',
    description: 'Reality fractures reveal the void beneath',
    category: 'pattern',
    rarity: 'epic',
    unlockCondition: 'Achieve Void aspect with chaotic trait',
    visualData: { color: '#4B0082', gradient: ['#4B0082', '#000000'] },
  },

  // Effects
  {
    id: 'sparkle-trail',
    name: 'Sparkle Trail',
    description: 'Glittering particles follow your guardian',
    category: 'effect',
    rarity: 'common',
    unlockCondition: 'Play 10 mini-games',
    visualData: { color: '#FFFFFF', animation: 'trail' },
  },
  {
    id: 'quantum-glow',
    name: 'Quantum Glow',
    description: 'Your guardian flickers between states',
    category: 'effect',
    rarity: 'epic',
    unlockCondition: 'Reach QUANTUM evolution stage',
    visualData: { color: '#00FFFF', animation: 'quantum' },
  },
  {
    id: 'shadow-wisps',
    name: 'Shadow Wisps',
    description: 'Dark wisps emanate and dissipate',
    category: 'effect',
    rarity: 'rare',
    unlockCondition: 'Resolve 5 shadow-type anomalies',
    visualData: { color: '#36454F', animation: 'wisp' },
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    description: 'Periodic bursts of solar energy',
    category: 'effect',
    rarity: 'epic',
    unlockCondition: 'Have red60 genome value above 90',
    visualData: { color: '#FFD700', animation: 'flare' },
  },
  {
    id: 'reality-warp',
    name: 'Reality Warp',
    description: 'Space bends around your guardian',
    category: 'effect',
    rarity: 'legendary',
    unlockCondition: 'Complete all platinum achievements',
    visualData: { color: '#9400D3', animation: 'warp' },
  },
];

export interface UnlockCheckData {
  evolution?: {
    stage: string;
    totalEvolutions: number;
  };
  battle?: {
    wins: number;
    losses: number;
    streak: number;
    energyShield?: number;
  };
  vimana?: {
    totalSamples: number;
    anomaliesResolved: number;
  };
  miniGames?: {
    totalPlays: number;
  };
  breeding?: {
    offspringCount: number;
  };
}

/**
 * Check which cosmetics are unlocked based on game state
 */
export function checkUnlockConditions(data: UnlockCheckData): string[] {
  const unlockedIds: string[] = [];

  // Battle-based unlocks
  if ((data.battle?.wins ?? 0) >= 50) unlockedIds.push('golden-crown');
  if ((data.battle?.wins ?? 0) >= 5) unlockedIds.push('tiger-stripes');
  if ((data.battle?.streak ?? 0) >= 5) unlockedIds.push('battle-crown');

  // Evolution-based unlocks
  const stage = data.evolution?.stage ?? 'GENETICS';
  if (['NEURO', 'QUANTUM', 'SPECIATION'].includes(stage)) {
    unlockedIds.push('circuit-lines');
  }
  if (['QUANTUM', 'SPECIATION'].includes(stage)) {
    unlockedIds.push('crystal-tiara', 'quantum-glow');
  }
  if (stage === 'SPECIATION') {
    unlockedIds.push('cosmic-aura');
  }

  // Exploration-based unlocks
  if ((data.vimana?.anomaliesResolved ?? 0) >= 10) unlockedIds.push('cosmic-pattern');
  if ((data.vimana?.anomaliesResolved ?? 0) >= 5) unlockedIds.push('shadow-wisps');

  // Mini-games-based unlocks
  if ((data.miniGames?.totalPlays ?? 0) >= 10) unlockedIds.push('sparkle-trail');

  // Breeding-based unlocks
  if ((data.breeding?.offspringCount ?? 0) >= 25) unlockedIds.push('genetic-helix');

  return unlockedIds;
}

/**
 * Get cosmetics by category
 */
export function getCosmeticsByCategory(category: CosmeticCategory): Cosmetic[] {
  return COSMETICS_CATALOG.filter(c => c.category === category);
}

/**
 * Get cosmetics by rarity
 */
export function getCosmeticsByRarity(rarity: CosmeticRarity): Cosmetic[] {
  return COSMETICS_CATALOG.filter(c => c.rarity === rarity);
}

/**
 * Get a specific cosmetic by ID
 */
export function getCosmeticById(id: string): Cosmetic | undefined {
  return COSMETICS_CATALOG.find(c => c.id === id);
}
