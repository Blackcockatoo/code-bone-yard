/**
 * useAppConfig Hook
 *
 * React hook for accessing app configuration and feature flags
 * throughout your component tree.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getConfig,
  cloneConfig,
  upgradeTier,
  toggleMode,
  enableBatteryMode,
  subscribeToConfigChanges,
  can,
  PAYWALL_MESSAGES,
  COSMETIC_PACKS,
  SOUND_PACKS,
  PRICING,
  type AppConfig,
  type TierLevel,
} from './appConfig';

// ===== MAIN HOOK =====

export function useAppConfig() {
  const [config, setLocalConfig] = useState<AppConfig>(getConfig());

  useEffect(() => {
    // Subscribe to config changes
    const unsubscribe = subscribeToConfigChanges((newConfig) => {
      setLocalConfig(cloneConfig(newConfig));
    });

    return unsubscribe;
  }, []);

  const upgrade = useCallback((tier: TierLevel) => {
    upgradeTier(tier);
  }, []);

  const toggleUiMode = useCallback(() => {
    toggleMode();
  }, []);

  const setBatteryMode = useCallback((enabled: boolean) => {
    enableBatteryMode(enabled);
  }, []);

  return {
    config,
    tier: config.tier,
    mode: config.mode,
    can,
    upgrade,
    toggleUiMode,
    setBatteryMode,
    paywallMessages: PAYWALL_MESSAGES,
    cosmeticPacks: COSMETIC_PACKS,
    soundPacks: SOUND_PACKS,
    pricing: PRICING,
  };
}

// ===== SPECIALIZED HOOKS =====

/**
 * Hook for checking companion limits
 */
export function useCompanionLimits(currentCount: number) {
  const { config } = useAppConfig();

  return {
    current: currentCount,
    max: config.companions.maxSlots,
    canAdd: can.addCompanion(currentCount),
    canBreed: config.companions.canBreed,
    canTrade: config.companions.canTrade,
    progress: currentCount / config.companions.maxSlots,
  };
}

/**
 * Hook for emotion filtering
 */
export function useEmotions() {
  const { config } = useAppConfig();

  const isEnabled = useCallback(
    (emotion: string) => config.emotions.enabledStates.has(emotion),
    [config.emotions.enabledStates]
  );

  return {
    enabledEmotions: Array.from(config.emotions.enabledStates),
    isEnabled,
    showDetails: config.emotions.showEmotionDetails,
    showDrives: config.emotions.showDriveMeters,
  };
}

/**
 * Hook for genome/genetics features
 */
export function useGenomeFeatures() {
  const { config } = useAppConfig();

  return {
    canViewLab: config.genome.showGenomeLab,
    canViewElementWeb: config.genome.showElementWeb,
    canViewTraitBreakdown: config.genome.showTraitBreakdown,
    canViewBridgeScore: config.genome.showBridgeScore,
    canViewDNA: config.genome.canViewDNA,
  };
}

/**
 * Hook for visual effects management
 */
export function useVisualEffects() {
  const { config } = useAppConfig();

  return {
    particlesEnabled: config.visuals.enableParticleFields,
    quantumEnabled: config.visuals.enableQuantumEffects,
    trailsEnabled: config.visuals.enableTemporalTrails,
    yantrasEnabled: config.visuals.enableYantraBackdrops,
    maxParticles: config.visuals.maxParticleCount,
    advancedGlow: config.visuals.enableAdvancedGlow,
    availablePacks: config.visuals.cosmeticPacksAvailable,
    canUsePack: (pack: string) => can.useCosmeticPack(pack),
  };
}

/**
 * Hook for audio features
 */
export function useAudioFeatures() {
  const { config } = useAppConfig();

  return {
    enabledScales: Array.from(config.audio.enabledScales),
    adaptiveTimbre: config.audio.enableAdaptiveTimbre,
    fieldSonification: config.audio.enableFieldSonification,
    availablePacks: config.audio.soundPacksAvailable,
    canUseScale: (scale: string) => can.useScale(scale),
    canUsePack: (pack: string) => can.useSoundPack(pack),
  };
}

/**
 * Hook for evolution features
 */
export function useEvolution() {
  const { config } = useAppConfig();

  return {
    enabled: config.evolution.enabled,
    showReadout: config.evolution.showEvolutionReadout,
    showRequirements: config.evolution.showRequirements,
    maxStage: config.evolution.maxStage,
    canEvolveToStage: (stage: number) => can.evolveToStage(stage),
  };
}

/**
 * Hook for ritual/interaction features
 */
export function useRituals() {
  const { config } = useAppConfig();

  return {
    availableRituals: Array.from(config.rituals.enabledRituals),
    showEffects: config.rituals.showRitualEffects,
    advancedInteractions: config.rituals.enableAdvancedInteractions,
    canUse: (ritual: string) => can.useRitual(ritual),
  };
}

/**
 * Hook for consciousness features
 */
export function useConsciousness() {
  const { config } = useAppConfig();

  return {
    personalityDrift: config.consciousness.enablePersonalityDrift,
    selfRegulation: config.consciousness.enableSelfRegulation,
    showReadout: config.consciousness.showConsciousnessReadout,
    memoryDepth: config.consciousness.memoryDepth,
  };
}

/**
 * Hook for data/sync features
 */
export function useDataFeatures() {
  const { config } = useAppConfig();

  return {
    cloudSync: config.data.enableCloudSync,
    multiDevice: config.data.enableMultiDevice,
    backup: config.data.enableBackup,
    export: config.data.enableExport,
    canSync: can.syncToCloud(),
  };
}

/**
 * Hook for performance settings
 */
export function usePerformance() {
  const { config, setBatteryMode } = useAppConfig();

  return {
    batteryMode: config.performance.batteryMode,
    lazyLoad: config.performance.lazyLoadEffects,
    targetFPS: config.performance.targetFPS,
    setBatteryMode,
  };
}

/**
 * Hook for UI customization
 */
export function useUISettings() {
  const { config } = useAppConfig();

  return {
    showAdvancedStats: config.ui.showAdvancedStats,
    showMathReadouts: config.ui.showMathematicalReadouts,
    darkMode: config.ui.enableDarkMode,
    theme: config.ui.theme,
    canSeeAdvanced: can.seeAdvancedStats(),
    canSeeMath: can.seeMathReadouts(),
  };
}

/**
 * Hook for paywall/upgrade prompts
 */
export function usePaywall() {
  const { config, paywallMessages, pricing, upgrade } = useAppConfig();

  const showUpgradePrompt = useCallback(
    (feature: keyof typeof PAYWALL_MESSAGES) => {
      return {
        shouldShow: config.tier === 'free',
        message: paywallMessages[feature],
        pricing,
        onUpgrade: (tier: TierLevel) => upgrade(tier),
      };
    },
    [config.tier, paywallMessages, pricing, upgrade]
  );

  return {
    tier: config.tier,
    showUpgradePrompt,
    pricing,
    upgrade,
  };
}

/**
 * Hook to check if a feature is locked
 */
export function useFeatureLock(
  feature: 'companion' | 'genomeLab' | 'emotions' | 'cloudSync' | 'cosmeticPack' | 'mythicMode',
  options?: { currentCount?: number; pack?: string }
) {
  const { config } = useAppConfig();

  let isLocked = false;
  let reason = '';

  switch (feature) {
    case 'companion':
      isLocked = !can.addCompanion(options?.currentCount || 0);
      reason = 'Companion limit reached. Upgrade to nurture more souls.';
      break;

    case 'genomeLab':
      isLocked = !can.viewGenomeLab();
      reason = 'Genome Lab is available in Premium tier.';
      break;

    case 'emotions':
      isLocked = config.emotions.enabledStates.size < 15;
      reason = 'Full emotional spectrum available in Premium tier.';
      break;

    case 'cloudSync':
      isLocked = !can.syncToCloud();
      reason = 'Cloud sync is available in Premium tier.';
      break;

    case 'cosmeticPack':
      isLocked = !can.useCosmeticPack(options?.pack || '');
      reason = 'This cosmetic pack is locked. Purchase to unlock.';
      break;

    case 'mythicMode':
      isLocked = config.tier === 'free';
      reason = 'Mythic Mode is available in Premium tier.';
      break;
  }

  return {
    isLocked,
    reason,
    canAccess: !isLocked,
  };
}

/**
 * Hook to check current tier capabilities
 */
export function useTierCapabilities() {
  const { config } = useAppConfig();

  const capabilities = {
    free: {
      companions: 1,
      emotions: 8,
      evolutions: 2,
      cosmetics: 1,
      soundPacks: 1,
      cloudSync: false,
      genomeLab: false,
    },
    premium: {
      companions: 5,
      emotions: 15,
      evolutions: 4,
      cosmetics: 4,
      soundPacks: 4,
      cloudSync: true,
      genomeLab: true,
    },
    mythic: {
      companions: 20,
      emotions: 15,
      evolutions: 4,
      cosmetics: 4,
      soundPacks: 4,
      cloudSync: true,
      genomeLab: true,
    },
  };

  return {
    current: capabilities[config.tier],
    tier: config.tier,
    isFreeTier: config.tier === 'free',
    isPremiumTier: config.tier === 'premium',
    isMythicTier: config.tier === 'mythic',
  };
}
