/**
 * Zone Selector Component
 * Allows switching between unlocked biomes
 */

'use client';

import { BiomeType } from '@/systems/exploration/types';
import { BIOMES, getBiomeUnlockHint } from '@/systems/exploration/biomes';
import { Map } from 'lucide-react';

interface ZoneSelectorProps {
  currentZone: BiomeType;
  unlockedZones: string[];
  onZoneChange: (zone: BiomeType) => void;
  state: {
    scanLevel: number;
    curiosity: number;
    dreamJournalEntries: number;
    achievements: string[];
  };
}

export function ZoneSelector({
  currentZone,
  unlockedZones,
  onZoneChange,
  state,
}: ZoneSelectorProps) {
  const allBiomes: BiomeType[] = [
    'starting-grove',
    'crystal-caverns',
    'void-nexus',
    'dream-spire',
    'eternal-garden',
  ];

  return (
    <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <Map className="w-5 h-5 text-teal-300" />
        <h3 className="text-sm font-semibold text-white">Exploration Zone</h3>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {allBiomes.map((biomeId) => {
          const biome = BIOMES[biomeId];
          const isUnlocked = unlockedZones.includes(biomeId);
          const isCurrent = biomeId === currentZone;

          return (
            <button
              key={biomeId}
              onClick={() => isUnlocked && onZoneChange(biomeId)}
              disabled={!isUnlocked}
              className={`
                relative text-left rounded-lg p-3 border transition-all
                ${isCurrent
                  ? 'border-teal-400 bg-teal-500/20'
                  : isUnlocked
                  ? 'border-slate-700 bg-slate-800/40 hover:bg-slate-800/60 hover:border-slate-600'
                  : 'border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{biome.theme.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      {biome.name}
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-300">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 line-clamp-1">
                      {biome.description.split('.')[0]}
                    </div>
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="text-[10px] text-amber-400 bg-amber-900/30 px-2 py-1 rounded">
                    🔒
                  </div>
                )}
              </div>

              {!isUnlocked && (
                <div className="mt-2 text-[10px] text-zinc-500">
                  {getBiomeUnlockHint(biomeId)}
                </div>
              )}

              {isUnlocked && (
                <div className="mt-2 flex items-center gap-3 text-[10px]">
                  <span className="text-amber-400">
                    {biome.rarityMultiplier}x rarity
                  </span>
                  <span
                    className="px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: biome.theme.primaryColor + '20',
                      color: biome.theme.primaryColor,
                    }}
                  >
                    {biome.theme.ambientEffect}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
