'use client';

import { ACHIEVEMENTS_CATALOG } from '@/systems/achievements';
import { useStore } from '@/store/guardian';
import { Trophy, Lock } from 'lucide-react';

export function AchievementShelf() {
  const achievements = useStore(s => s.achievements);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-300" />
        Achievements
        <span className="text-xs font-normal text-zinc-400">{achievements.length}/{ACHIEVEMENTS_CATALOG.length} unlocked</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACHIEVEMENTS_CATALOG.map(item => {
          const earned = achievements.find(a => a.id === item.id);
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 bg-slate-900/60 transition ${
                earned
                  ? 'border-amber-400/50 shadow-lg shadow-amber-500/10'
                  : 'border-slate-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  {earned ? <Trophy className="w-4 h-4 text-amber-300" /> : <Lock className="w-4 h-4 text-zinc-500" />}
                  {item.name}
                </div>
                <span className="text-xs text-zinc-500">{earned ? 'Unlocked' : 'Locked'}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{item.description}</p>
              {earned && earned.earnedAt && (
                <p className="text-xs text-amber-200 mt-2">
                  Earned {new Date(earned.earnedAt).toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
