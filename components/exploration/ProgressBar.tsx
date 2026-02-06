/**
 * Progress Bar Component
 * Shows XP progress towards next scan level
 */

'use client';

import { getXPProgress, getLevelColor } from '@/systems/exploration/progression';
import { TrendingUp } from 'lucide-react';

interface ProgressBarProps {
  currentXP: number;
  currentLevel: number;
  showLabel?: boolean;
}

export function ProgressBar({ currentXP, currentLevel, showLabel = true }: ProgressBarProps) {
  const progress = getXPProgress(currentXP, currentLevel);
  const levelColor = getLevelColor(currentLevel);

  const isMaxLevel = currentLevel >= 5;

  return (
    <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-300" />
            <span className="text-xs font-semibold text-white">
              Scan Level {currentLevel}
            </span>
          </div>
          {!isMaxLevel && (
            <span className="text-[10px] text-zinc-400">
              {progress.current} / {progress.required} XP
            </span>
          )}
        </div>
      )}

      {isMaxLevel ? (
        <div className="text-center py-2">
          <div
            className="text-sm font-bold"
            style={{ color: levelColor }}
          >
            ★ MAX LEVEL ★
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            You've reached the highest scan level!
          </div>
        </div>
      ) : (
        <>
          <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{
                width: `${progress.percentage}%`,
                background: `linear-gradient(90deg, ${levelColor}80, ${levelColor})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>

            {/* XP Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-white drop-shadow-lg">
                {Math.round(progress.percentage)}%
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Level {currentLevel}</span>
            <span className="text-teal-400">Level {currentLevel + 1}</span>
          </div>
        </>
      )}
    </div>
  );
}

// Add shimmer animation to global CSS or tailwind config
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }
