import { useStore } from "@/lib/store";
import type { AppConfig, TierLevel } from "@metapet/core/appConfig";

/**
 * useAppConfig - Hook for accessing app configuration and feature gating
 *
 * This hook provides access to the current app configuration and helper methods
 * for checking feature availability based on the user's tier.
 *
 * @example
 * ```tsx
 * const { config, can, tier, upgradeTier } = useAppConfig();
 *
 * if (can.viewGenomeLab()) {
 *   return <GenomeLab />;
 * }
 *
 * return <PaywallMessage feature="genomeLab" />;
 * ```
 */
export function useAppConfig() {
  const config = useStore((s) => s.appConfig);
  const upgradeTier = useStore((s) => s.upgradeTier);
  const setAppConfig = useStore((s) => s.setAppConfig);

  // Helper functions for feature gating
  const can = {
    /**
     * Check if user can add more companions
     */
    addCompanion: (currentCount: number) =>
      currentCount < config.companions.maxSlots,

    /**
     * Check if user can breed companions
     */
    breedCompanions: () => config.companions.canBreed,

    /**
     * Check if user can trade companions
     */
    tradeCompanions: () => config.companions.canTrade,

    /**
     * Check if user can view genome lab
     */
    viewGenomeLab: () => config.genome.showGenomeLab,

    /**
     * Check if user can view element web
     */
    viewElementWeb: () => config.genome.showElementWeb,

    /**
     * Check if user can view trait breakdown
     */
    viewTraitBreakdown: () => config.genome.showTraitBreakdown,

    /**
     * Check if user can view DNA
     */
    viewDNA: () => config.genome.canViewDNA,

    /**
     * Check if specific emotion is enabled
     */
    viewEmotion: (emotion: string) =>
      config.emotions.enabledStates.has(emotion),

    /**
     * Check if user can use specific ritual
     */
    useRitual: (ritual: string) => config.rituals.enabledRituals.has(ritual),

    /**
     * Check if user can evolve to specific stage
     */
    evolveToStage: (stage: number) =>
      config.evolution.enabled && stage <= config.evolution.maxStage,

    /**
     * Check if user can sync to cloud
     */
    syncToCloud: () => config.data.enableCloudSync,

    /**
     * Check if user can use multiple devices
     */
    useMultiDevice: () => config.data.enableMultiDevice,

    /**
     * Check if user can backup data
     */
    backupData: () => config.data.enableBackup,

    /**
     * Check if user can export data
     */
    exportData: () => config.data.enableExport,

    /**
     * Check if user can use cosmetic pack
     */
    useCosmeticPack: (pack: string) =>
      config.visuals.cosmeticPacksAvailable.includes(pack),

    /**
     * Check if user can use sound pack
     */
    useSoundPack: (pack: string) =>
      config.audio.soundPacksAvailable.includes(pack),

    /**
     * Check if user can use audio scale
     */
    useScale: (scale: string) => config.audio.enabledScales.has(scale),

    /**
     * Check if user can see advanced stats
     */
    seeAdvancedStats: () => config.ui.showAdvancedStats,

    /**
     * Check if user can see mathematical readouts
     */
    seeMathReadouts: () => config.ui.showMathematicalReadouts,

    /**
     * Get memory depth for consciousness
     */
    rememberActions: () => config.consciousness.memoryDepth,

    /**
     * Check if personality drift is enabled
     */
    hasPersonalityDrift: () => config.consciousness.enablePersonalityDrift,

    /**
     * Check if quantum effects are enabled
     */
    hasQuantumEffects: () => config.visuals.enableQuantumEffects,

    /**
     * Check if particle fields are enabled
     */
    hasParticleFields: () => config.visuals.enableParticleFields,
  };

  return {
    config,
    can,
    tier: config.tier,
    mode: config.mode,
    upgradeTier,
    setAppConfig,

    // Convenience getters
    isFreeTier: config.tier === "free",
    isPremiumTier: config.tier === "premium" || config.tier === "mythic",
    isMythicTier: config.tier === "mythic",
    isSimpleMode: config.mode === "simple",
    isMythicMode: config.mode === "mythic",
  };
}
