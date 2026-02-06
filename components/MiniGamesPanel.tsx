'use client';

import { useStore } from '@/store/guardian';
import { Gamepad2 } from 'lucide-react';

export function MiniGamesPanel() {
  const miniGames = useStore(s => s.miniGames);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Gamepad2 className="w-5 h-5 text-purple-300" />
        Mini-Games
      </h3>
      <div className="text-sm text-zinc-400">
        <p>Total Plays: <span className="text-white font-semibold">{miniGames.totalPlays}</span></p>
        {Object.keys(miniGames.highScores).length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-zinc-500">High Scores:</p>
            <ul className="space-y-1 mt-1">
              {Object.entries(miniGames.highScores).map(([game, score]) => (
                <li key={game} className="text-xs text-zinc-400">
                  {game}: <span className="text-amber-300 font-semibold">{score}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <p className="text-xs text-zinc-500 italic">More mini-games coming soon...</p>
    </div>
  );
}
