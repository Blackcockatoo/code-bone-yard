/**
 * Stat Requirements Component
 * Displays resource costs and requirements for actions
 */

'use client';

import { Zap, Brain, Heart, AlertTriangle } from 'lucide-react';

interface StatRequirementsProps {
  energyCost?: number;
  currentEnergy?: number;
  curiosityRequired?: number;
  currentCuriosity?: number;
  healthRisk?: {
    chance: number;
    damage: number;
  };
  scanLevel?: number;
  requiredLevel?: number;
}

export function StatRequirements({
  energyCost,
  currentEnergy,
  curiosityRequired,
  currentCuriosity,
  healthRisk,
  scanLevel,
  requiredLevel,
}: StatRequirementsProps) {
  const hasEnoughEnergy =
    energyCost === undefined ||
    currentEnergy === undefined ||
    currentEnergy >= energyCost;

  const hasEnoughCuriosity =
    curiosityRequired === undefined ||
    currentCuriosity === undefined ||
    currentCuriosity >= curiosityRequired;

  const hasRequiredLevel =
    requiredLevel === undefined ||
    scanLevel === undefined ||
    scanLevel >= requiredLevel;

  const canProceed = hasEnoughEnergy && hasEnoughCuriosity && hasRequiredLevel;

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {/* Energy Cost */}
      {energyCost !== undefined && (
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded ${
            hasEnoughEnergy
              ? 'bg-blue-900/30 text-blue-300'
              : 'bg-red-900/30 text-red-400'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span className="font-semibold">{energyCost}</span>
          {currentEnergy !== undefined && (
            <span className="text-[10px] opacity-75">/ {currentEnergy}</span>
          )}
        </div>
      )}

      {/* Curiosity Required */}
      {curiosityRequired !== undefined && curiosityRequired > 0 && (
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded ${
            hasEnoughCuriosity
              ? 'bg-purple-900/30 text-purple-300'
              : 'bg-red-900/30 text-red-400'
          }`}
        >
          <Brain className="w-3 h-3" />
          <span className="font-semibold">{curiosityRequired}</span>
          {currentCuriosity !== undefined && (
            <span className="text-[10px] opacity-75">/ {currentCuriosity}</span>
          )}
        </div>
      )}

      {/* Scan Level Required */}
      {requiredLevel !== undefined && requiredLevel > 1 && (
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded ${
            hasRequiredLevel
              ? 'bg-emerald-900/30 text-emerald-300'
              : 'bg-red-900/30 text-red-400'
          }`}
        >
          <span className="font-semibold">L{requiredLevel}</span>
          {scanLevel !== undefined && (
            <span className="text-[10px] opacity-75">/ L{scanLevel}</span>
          )}
        </div>
      )}

      {/* Health Risk */}
      {healthRisk && healthRisk.chance > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-900/30 text-amber-400">
          <AlertTriangle className="w-3 h-3" />
          <span className="text-[10px]">
            {Math.round(healthRisk.chance * 100)}% risk (-{healthRisk.damage}
            <Heart className="w-2 h-2 inline ml-0.5" />)
          </span>
        </div>
      )}

      {/* Status Indicator */}
      {!canProceed && (
        <div className="text-[10px] text-red-400 font-semibold">
          Requirements not met
        </div>
      )}
    </div>
  );
}
