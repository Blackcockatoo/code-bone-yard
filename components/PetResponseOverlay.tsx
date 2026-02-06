'use client';

import React from 'react';

export interface PetResponseOverlayProps {
  enableAudio?: boolean;
  enableAnticipation?: boolean;
}

export function PetResponseOverlay({ enableAudio = false, enableAnticipation = false }: PetResponseOverlayProps) {
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50">
      <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-xs text-zinc-300 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Live Overlay</span>
          <span className={`rounded px-2 py-0.5 ${enableAudio ? 'bg-emerald-600/30 text-emerald-300' : 'bg-zinc-700/50 text-zinc-400'}`}>Audio {enableAudio ? 'on' : 'off'}</span>
          <span className={`rounded px-2 py-0.5 ${enableAnticipation ? 'bg-indigo-600/30 text-indigo-300' : 'bg-zinc-700/50 text-zinc-400'}`}>Anticipation {enableAnticipation ? 'on' : 'off'}</span>
        </div>
      </div>
    </div>
  );
}

export default PetResponseOverlay;
