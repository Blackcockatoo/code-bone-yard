'use client';

import { useStore } from '@/store/guardian';
import { calculateTrinityAspect, calculateEvolutionTrait, calculateEvolutionPower, type TrinityAspect } from '@/systems/evolution';
import { Sparkles, Zap, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';

interface EvolutionPanelProps {
  genome: { red60: number; blue60: number; black60: number };
  onEvolve?: () => void;
}

const STAGE_NAMES = ['GENETICS', 'NEURO', 'QUANTUM', 'SPECIATION'] as const;

const ASPECT_COLORS: Record<TrinityAspect, string> = {
  sun: '#FFD700',
  shadow: '#8B5CF6',
  void: '#1A1A1A',
};

export function EvolutionPanel({ genome, onEvolve }: EvolutionPanelProps) {
  const evolution = useStore(state => state.evolution);
  const evolve = useStore(state => state.evolve);

  const trinityAspect = calculateTrinityAspect(genome);
  const evolutionTrait = calculateEvolutionTrait(genome, trinityAspect, null);
  const evolutionPower = calculateEvolutionPower(genome);

  const currentStageIndex = STAGE_NAMES.indexOf(evolution.stage);
  const canEvolve = currentStageIndex < STAGE_NAMES.length - 1;

  const handleEvolve = () => {
    const success = evolve();
    if (success && onEvolve) {
      onEvolve();
    }
  };

  const aspectColor = ASPECT_COLORS[trinityAspect];

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="text-center space-y-2">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2"
          style={{
            borderColor: aspectColor,
            backgroundColor: `${aspectColor}20`,
          }}
        >
          <Sparkles className="w-4 h-4" style={{ color: aspectColor }} />
          <span className="font-bold text-white text-lg">{evolution.stage}</span>
        </div>
        <p className="text-slate-400 text-sm">Stage {currentStageIndex + 1}/{STAGE_NAMES.length}</p>
        <p className="text-slate-300 text-xs capitalize">{evolutionTrait} • {trinityAspect} aspect</p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp className="w-4 h-4" />
            <span>Power</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${evolutionPower}%`,
                  backgroundColor: aspectColor,
                }}
              />
            </div>
            <span className="text-white font-medium">{Math.round(evolutionPower)}</span>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Zap className="w-4 h-4" />
            <span>Evolutions</span>
          </div>
          <div className="text-white font-medium text-lg">{evolution.totalEvolutions}</div>
        </div>
      </section>

      {/* Trinity Genome */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 space-y-3">
        <p className="text-white font-semibold text-sm">Genome Trinity</p>
        <div className="space-y-2">
          <GenomeBar label="Sun (Red)" value={genome.red60} color="#FF4444" />
          <GenomeBar label="Shadow (Blue)" value={genome.blue60} color="#4444FF" />
          <GenomeBar label="Void (Black)" value={genome.black60} color="#444444" />
        </div>
      </section>

      {/* Evolution Info */}
      <section className="bg-slate-900/30 border border-slate-800 rounded-lg p-4 space-y-3 text-xs text-slate-300">
        <p className="font-semibold text-white text-sm">Stage Focus</p>
        <ul className="list-disc list-inside space-y-1">
          {evolution.stage === 'GENETICS' && (
            <>
              <li>Base genome expression</li>
              <li>Learning fundamental behaviors</li>
              <li>Building initial bond</li>
            </>
          )}
          {evolution.stage === 'NEURO' && (
            <>
              <li>Enhanced consciousness</li>
              <li>Complex behavior patterns</li>
              <li>Advanced AI responses</li>
            </>
          )}
          {evolution.stage === 'QUANTUM' && (
            <>
              <li>Non-local awareness</li>
              <li>Spontaneous insights</li>
              <li>Dream generation</li>
            </>
          )}
          {evolution.stage === 'SPECIATION' && (
            <>
              <li>Unique species emergence</li>
              <li>Maximum differentiation</li>
              <li>Breeding unlocked</li>
            </>
          )}
        </ul>
      </section>

      {/* Evolve Button */}
      {canEvolve && (
        <section className="space-y-3">
          <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-100 text-xs rounded-lg px-3 py-2">
            Ready to evolve to {STAGE_NAMES[currentStageIndex + 1]}!
          </div>
          <Button
            onClick={handleEvolve}
            className="w-full gap-2 font-bold text-lg"
            style={{
              background: `linear-gradient(135deg, ${aspectColor}, #4ECDC4)`,
              boxShadow: `0 0 20px ${aspectColor}50`,
            }}
          >
            <Sparkles className="w-5 h-5" />
            Evolve Now!
          </Button>
        </section>
      )}

      {!canEvolve && (
        <div className="text-center text-sm text-slate-500 py-4">
          Maximum evolution reached
        </div>
      )}

      {evolution.lastEvolution && (
        <footer className="text-center text-xs text-slate-500">
          Last evolved: {new Date(evolution.lastEvolution).toLocaleString()}
        </footer>
      )}
    </div>
  );
}

interface GenomeBarProps {
  label: string;
  value: number;
  color: string;
}

function GenomeBar({ label, value, color }: GenomeBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="text-slate-300 font-medium">{Math.round(value)}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${Math.min(100, value)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
