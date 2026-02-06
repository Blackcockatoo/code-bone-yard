/**
 * Debuff Display Component
 * Shows active debuffs with countdown timers
 */

'use client';

import { useEffect, useState } from 'react';
import { Debuff } from '@/systems/exploration/types';
import { DEBUFF_CONFIGS } from '@/systems/exploration/constants';
import { AlertOctagon, Clock } from 'lucide-react';

interface DebuffDisplayProps {
  activeDebuffs: Debuff[];
}

export function DebuffDisplay({ activeDebuffs }: DebuffDisplayProps) {
  const [now, setNow] = useState(Date.now());

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (activeDebuffs.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-900/20 rounded-lg p-3 border border-red-800/50">
      <div className="flex items-center gap-2 mb-2">
        <AlertOctagon className="w-4 h-4 text-red-400" />
        <span className="text-xs font-semibold text-red-300">Active Debuffs</span>
      </div>

      <div className="space-y-2">
        {activeDebuffs.map((debuff, index) => {
          const config = DEBUFF_CONFIGS[debuff.id];
          const expiresAt = debuff.appliedAt + debuff.duration * 60 * 1000;
          const remainingMs = Math.max(0, expiresAt - now);
          const remainingMinutes = Math.floor(remainingMs / 1000 / 60);
          const remainingSeconds = Math.floor((remainingMs / 1000) % 60);

          // Get debuff color based on type
          const getDebuffColor = (id: string) => {
            switch (id) {
              case 'corruption':
                return 'text-purple-400';
              case 'disorientation':
                return 'text-yellow-400';
              case 'confusion':
                return 'text-blue-400';
              case 'exhaustion':
                return 'text-gray-400';
              case 'void-sickness':
                return 'text-indigo-400';
              case 'temporal-distortion':
                return 'text-cyan-400';
              default:
                return 'text-red-400';
            }
          };

          return (
            <div
              key={`${debuff.id}-${index}`}
              className="bg-slate-900/60 rounded p-2 border border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`text-xs font-semibold ${getDebuffColor(debuff.id)}`}>
                    {config?.name || debuff.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {config?.description || debuff.description}
                  </div>

                  {/* Effects */}
                  <div className="mt-1 space-y-0.5">
                    {config?.effects.energyCostMultiplier && (
                      <div className="text-[10px] text-amber-400">
                        +{Math.round((config.effects.energyCostMultiplier - 1) * 100)}%
                        energy costs
                      </div>
                    )}
                    {config?.effects.rarityPenalty && (
                      <div className="text-[10px] text-blue-400">
                        -{Math.round((1 - config.effects.rarityPenalty) * 100)}% rarity
                        chance
                      </div>
                    )}
                    {config?.effects.xpPenalty && (
                      <div className="text-[10px] text-purple-400">
                        -{Math.round((1 - config.effects.xpPenalty) * 100)}% XP gain
                      </div>
                    )}
                    {config?.effects.cannotScan && (
                      <div className="text-[10px] text-red-400 font-semibold">
                        Cannot scan
                      </div>
                    )}
                    {config?.effects.statDrain && (
                      <div className="text-[10px] text-red-400">
                        -{config.effects.statDrain.amount} {config.effects.statDrain.stat}{' '}
                        per {config.effects.statDrain.interval}s
                      </div>
                    )}
                  </div>
                </div>

                {/* Timer */}
                <div className="flex items-center gap-1 ml-2 px-2 py-1 rounded bg-slate-800/50">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <span className="text-[10px] text-zinc-300 font-mono">
                    {remainingMinutes}:{remainingSeconds.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
