/**
 * Achievements System
 * Track player progress and unlock rewards
 */

export type AchievementCategory = 'care' | 'battle' | 'exploration' | 'evolution' | 'social';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface AchievementReward {
  type: 'points' | 'cosmetic' | 'title';
  value: string;
  cosmeticId?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: number;
  reward: AchievementReward;
}

// Achievement catalog with all possible achievements
export const ACHIEVEMENTS_CATALOG: Achievement[] = [
  // Care Achievements
  {
    id: 'first-feed',
    name: 'First Meal',
    description: 'Feed your guardian for the first time',
    category: 'care',
    tier: 'bronze',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'points', value: '10 points' },
  },
  {
    id: 'dedicated-caretaker',
    name: 'Dedicated Caretaker',
    description: 'Keep all vitals above 80% for 24 hours',
    category: 'care',
    tier: 'silver',
    progress: 0,
    maxProgress: 24,
    unlocked: false,
    reward: { type: 'points', value: '50 points' },
  },
  {
    id: 'perfect-health',
    name: 'Perfect Health',
    description: 'Reach 100% in all vital stats',
    category: 'care',
    tier: 'gold',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'cosmetic', value: 'Golden Aura', cosmeticId: 'golden-aura' },
  },
  {
    id: 'nurturing-soul',
    name: 'Nurturing Soul',
    description: 'Feed your guardian 100 times',
    category: 'care',
    tier: 'platinum',
    progress: 0,
    maxProgress: 100,
    unlocked: false,
    reward: { type: 'title', value: 'The Caretaker' },
  },

  // Battle Achievements
  {
    id: 'first-victory',
    name: 'First Victory',
    description: 'Win your first resonance duel',
    category: 'battle',
    tier: 'bronze',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'points', value: '15 points' },
  },
  {
    id: 'battle-hardened',
    name: 'Battle Hardened',
    description: 'Win 10 resonance duels',
    category: 'battle',
    tier: 'silver',
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    reward: { type: 'points', value: '75 points' },
  },
  {
    id: 'winning-streak',
    name: 'Winning Streak',
    description: 'Win 5 duels in a row',
    category: 'battle',
    tier: 'gold',
    progress: 0,
    maxProgress: 5,
    unlocked: false,
    reward: { type: 'cosmetic', value: 'Battle Crown', cosmeticId: 'battle-crown' },
  },
  {
    id: 'arena-champion',
    name: 'Arena Champion',
    description: 'Win 50 resonance duels',
    category: 'battle',
    tier: 'platinum',
    progress: 0,
    maxProgress: 50,
    unlocked: false,
    reward: { type: 'title', value: 'The Champion' },
  },

  // Exploration Achievements
  {
    id: 'first-scan',
    name: 'First Scan',
    description: 'Perform your first Vimana scan',
    category: 'exploration',
    tier: 'bronze',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'points', value: '10 points' },
  },
  {
    id: 'sample-collector',
    name: 'Sample Collector',
    description: 'Collect 25 samples from exploration',
    category: 'exploration',
    tier: 'silver',
    progress: 0,
    maxProgress: 25,
    unlocked: false,
    reward: { type: 'points', value: '60 points' },
  },
  {
    id: 'anomaly-resolver',
    name: 'Anomaly Resolver',
    description: 'Resolve 10 anomalies',
    category: 'exploration',
    tier: 'gold',
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    reward: { type: 'cosmetic', value: 'Cosmic Pattern', cosmeticId: 'cosmic-pattern' },
  },
  {
    id: 'master-explorer',
    name: 'Master Explorer',
    description: 'Discover all map locations',
    category: 'exploration',
    tier: 'platinum',
    progress: 0,
    maxProgress: 49,
    unlocked: false,
    reward: { type: 'title', value: 'The Explorer' },
  },

  // Evolution Achievements
  {
    id: 'first-evolution',
    name: 'First Evolution',
    description: 'Evolve your guardian for the first time',
    category: 'evolution',
    tier: 'bronze',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'points', value: '25 points' },
  },
  {
    id: 'neuro-stage',
    name: 'Neural Awakening',
    description: 'Reach the NEURO evolution stage',
    category: 'evolution',
    tier: 'silver',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'points', value: '100 points' },
  },
  {
    id: 'quantum-stage',
    name: 'Quantum Leap',
    description: 'Reach the QUANTUM evolution stage',
    category: 'evolution',
    tier: 'gold',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'cosmetic', value: 'Quantum Glow', cosmeticId: 'quantum-glow' },
  },
  {
    id: 'full-evolution',
    name: 'Fully Evolved',
    description: 'Reach the SPECIATION evolution stage',
    category: 'evolution',
    tier: 'platinum',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'title', value: 'The Ascended' },
  },

  // Social Achievements
  {
    id: 'first-breeding',
    name: 'First Offspring',
    description: 'Breed your first guardian',
    category: 'social',
    tier: 'bronze',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'points', value: '20 points' },
  },
  {
    id: 'breeder',
    name: 'Guardian Breeder',
    description: 'Create 5 offspring',
    category: 'social',
    tier: 'silver',
    progress: 0,
    maxProgress: 5,
    unlocked: false,
    reward: { type: 'points', value: '80 points' },
  },
  {
    id: 'genetic-master',
    name: 'Genetic Master',
    description: 'Create 25 offspring',
    category: 'social',
    tier: 'gold',
    progress: 0,
    maxProgress: 25,
    unlocked: false,
    reward: { type: 'cosmetic', value: 'Genetic Helix', cosmeticId: 'genetic-helix' },
  },
  {
    id: 'dynasty-founder',
    name: 'Dynasty Founder',
    description: 'Create 100 offspring',
    category: 'social',
    tier: 'platinum',
    progress: 0,
    maxProgress: 100,
    unlocked: false,
    reward: { type: 'title', value: 'The Progenitor' },
  },
];

export interface AchievementProgressData {
  vitals?: {
    hunger: number;
    hygiene: number;
    mood: number;
    energy: number;
  };
  battle?: {
    wins: number;
    losses: number;
    streak: number;
  };
  vimana?: {
    totalSamples: number;
    anomaliesResolved: number;
    cells?: Array<{ explored: boolean }>;
  };
  evolution?: {
    stage: string;
    totalEvolutions: number;
  };
  breeding?: {
    offspringCount: number;
  };
}

/**
 * Update achievement progress based on current game state
 */
export function updateAchievementProgress(
  achievements: Achievement[],
  data: AchievementProgressData
): Achievement[] {
  return achievements.map(achievement => {
    let progress = achievement.progress;
    let unlocked = achievement.unlocked;

    switch (achievement.id) {
      // Care achievements
      case 'perfect-health':
        if (data.vitals) {
          const allMax = data.vitals.hunger >= 100 &&
                        data.vitals.hygiene >= 100 &&
                        data.vitals.mood >= 100 &&
                        data.vitals.energy >= 100;
          progress = allMax ? 1 : 0;
        }
        break;

      // Battle achievements
      case 'first-victory':
        progress = Math.min(1, data.battle?.wins ?? 0);
        break;
      case 'battle-hardened':
        progress = Math.min(10, data.battle?.wins ?? 0);
        break;
      case 'winning-streak':
        progress = Math.min(5, data.battle?.streak ?? 0);
        break;
      case 'arena-champion':
        progress = Math.min(50, data.battle?.wins ?? 0);
        break;

      // Exploration achievements
      case 'first-scan':
        progress = (data.vimana?.totalSamples ?? 0) > 0 ? 1 : 0;
        break;
      case 'sample-collector':
        progress = Math.min(25, data.vimana?.totalSamples ?? 0);
        break;
      case 'anomaly-resolver':
        progress = Math.min(10, data.vimana?.anomaliesResolved ?? 0);
        break;
      case 'master-explorer':
        progress = data.vimana?.cells?.filter(c => c.explored).length ?? 0;
        break;

      // Evolution achievements
      case 'first-evolution':
        progress = (data.evolution?.totalEvolutions ?? 0) > 0 ? 1 : 0;
        break;
      case 'neuro-stage':
        progress = ['NEURO', 'QUANTUM', 'SPECIATION'].includes(data.evolution?.stage ?? '') ? 1 : 0;
        break;
      case 'quantum-stage':
        progress = ['QUANTUM', 'SPECIATION'].includes(data.evolution?.stage ?? '') ? 1 : 0;
        break;
      case 'full-evolution':
        progress = data.evolution?.stage === 'SPECIATION' ? 1 : 0;
        break;

      // Social achievements
      case 'first-breeding':
        progress = (data.breeding?.offspringCount ?? 0) > 0 ? 1 : 0;
        break;
      case 'breeder':
        progress = Math.min(5, data.breeding?.offspringCount ?? 0);
        break;
      case 'genetic-master':
        progress = Math.min(25, data.breeding?.offspringCount ?? 0);
        break;
      case 'dynasty-founder':
        progress = Math.min(100, data.breeding?.offspringCount ?? 0);
        break;
    }

    // Check if newly unlocked
    if (!unlocked && progress >= achievement.maxProgress) {
      unlocked = true;
    }

    return {
      ...achievement,
      progress,
      unlocked,
      unlockedAt: unlocked && !achievement.unlocked ? Date.now() : achievement.unlockedAt,
    };
  });
}

/**
 * Calculate total achievement points
 */
export function calculateTotalPoints(achievements: Achievement[]): number {
  const tierPoints: Record<AchievementTier, number> = {
    bronze: 10,
    silver: 25,
    gold: 50,
    platinum: 100,
  };

  return achievements
    .filter(a => a.unlocked)
    .reduce((total, a) => total + tierPoints[a.tier], 0);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS_CATALOG.filter(a => a.category === category);
}
