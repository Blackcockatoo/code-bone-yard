'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/guardian';
import { SCAN_ENERGY_COSTS } from '@/systems/exploration/constants';
import type { BiomeType } from '@/systems/exploration/types';
import {
  MapPin,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
  FlaskConical,
  Gift,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  ZoneSelector,
  EquipmentPanel,
  StatRequirements,
  DebuffDisplay,
  ProgressBar,
} from './exploration';

type AnomalyChallenge = {
  anomalyId: string;
  prompt: string;
  correct: string;
  options: string[];
  hint?: string;
};

const SAMPLE_COLORS: Record<string, string> = {
  common: '#A1A1AA',
  rare: '#38BDF8',
  legendary: '#F59E0B',
};

const rarityTag = (rarity?: string) => {
  if (!rarity) return { label: 'common', className: 'text-zinc-300' };
  if (rarity === 'legendary') return { label: rarity, className: 'text-amber-300' };
  if (rarity === 'epic') return { label: rarity, className: 'text-purple-300' };
  if (rarity === 'rare') return { label: rarity, className: 'text-sky-300' };
  return { label: rarity, className: 'text-zinc-300' };
};

function generateAnomalyChallenge(type: string): AnomalyChallenge {
  const glyphs = ['SUN', 'SHADOW', 'VOID', 'PRIME'];
  const runes = ['I ∆', 'II ◎', 'III ✧', 'IV ✦'];
  const circuits = ['Cyan Pulse', 'Amber Flux', 'Violet Spiral', 'Teal Lattice'];

  if (type === 'glyph') {
    const correct = glyphs[Math.floor(Math.random() * glyphs.length)];
    const options = [...glyphs].sort(() => Math.random() - 0.5).slice(0, 3);
    if (!options.includes(correct)) options[0] = correct;
    return {
      anomalyId: `glyph-${Date.now()}`,
      prompt: `Select the ${correct} rune to stabilize the glyph anomaly.`,
      correct,
      options,
      hint: 'Match the rune to the resonance aspect.',
    };
  }

  if (type === 'rift') {
    const correct = runes[Math.floor(Math.random() * runes.length)];
    const options = [...runes].sort(() => Math.random() - 0.5).slice(0, 3);
    if (!options.includes(correct)) options[0] = correct;
    return {
      anomalyId: `rift-${Date.now()}`,
      prompt: `Close the rift with the correct geometric seal.`,
      correct,
      options,
      hint: 'Higher numerals stabilize stronger tears.',
    };
  }

  const correct = circuits[Math.floor(Math.random() * circuits.length)];
  const options = [...circuits].sort(() => Math.random() - 0.5).slice(0, 3);
  if (!options.includes(correct)) options[0] = correct;
  return {
    anomalyId: `echo-${Date.now()}`,
    prompt: `Tune the echo to the right circuit pattern.`,
    correct,
    options,
    hint: 'Match the color resonance to local energy.',
  };
}

export function VimanaMap() {
  const {
    vimana,
    energy,
    curiosity,
    achievements,
    performScan,
    resolveAnomaly,
    collectSample,
    analyzeSample,
    claimReward,
    moveVimana,
    changeZone,
    equipItem,
    purchaseEquipment,
  } = useStore((s) => ({
    vimana: s.vimana,
    energy: s.vitals.energy,
    curiosity: s.curiosity,
    achievements: s.achievements,
    performScan: s.performScan,
    resolveAnomaly: s.resolveAnomaly,
    collectSample: s.collectSample,
    analyzeSample: s.analyzeSample,
    claimReward: s.claimReward,
    moveVimana: s.moveVimana,
    changeZone: s.changeZone,
    equipItem: s.equipItem,
    purchaseEquipment: s.purchaseEquipment,
  }));

  // Calculate energy cost based on current zone
  const currentEnergyCost = SCAN_ENERGY_COSTS[(vimana.currentZone || 'starting-grove') as BiomeType] || 5;

  // Get achievement IDs for zone unlock checks
  const achievementIds = achievements.map((a) => a.id);

  const [anomalyChallenge, setAnomalyChallenge] = useState<AnomalyChallenge | null>(null);
  const [anomalyFeedback, setAnomalyFeedback] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionZone, setTransitionZone] = useState<string | null>(null);

  // Show notification with auto-dismiss
  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Track previous scan level to detect level-ups
  const prevScanLevel = useRef(vimana.scanLevel || 1);

  useEffect(() => {
    const currentLevel = vimana.scanLevel || 1;
    if (currentLevel > prevScanLevel.current) {
      showNotification(`🎉 Scan Level Up! Now Level ${currentLevel}`, 'success');
      prevScanLevel.current = currentLevel;
    }
  }, [vimana.scanLevel]);

  // Detect low energy warning
  useEffect(() => {
    if (energy < 10 && energy > 0) {
      showNotification('⚠️ Low Energy! Consider resting.', 'warning');
    }
  }, [energy]);

  // Zone transition handler with visual effect
  const handleZoneChange = (zone: string) => {
    if (zone === vimana.currentZone) return;

    setTransitionZone(zone);
    setIsTransitioning(true);

    // After fade out animation, change zone
    setTimeout(() => {
      changeZone(zone);
      // After zone change, fade back in
      setTimeout(() => {
        setIsTransitioning(false);
        setTransitionZone(null);
        showNotification(`Arrived at ${formatZoneName(zone)}`, 'info');
      }, 300);
    }, 500);
  };

  const formatZoneName = (zone: string) => {
    return zone
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const zoneColors: Record<string, string> = {
    'starting-grove': 'from-emerald-900/90 to-green-800/90',
    'crystal-caverns': 'from-cyan-900/90 to-blue-800/90',
    'void-nexus': 'from-purple-900/90 to-violet-800/90',
    'dream-spire': 'from-indigo-900/90 to-blue-900/90',
    'eternal-garden': 'from-amber-900/90 to-orange-800/90',
  };

  const currentCell = useMemo(
    () =>
      vimana.cells.find(
        (cell) =>
          cell.x === vimana.currentPosition.x && cell.y === vimana.currentPosition.y
      ),
    [vimana.cells, vimana.currentPosition]
  );

  const currentKey = useMemo(
    () => `${vimana.currentPosition.x}-${vimana.currentPosition.y}`,
    [vimana.currentPosition]
  );

  const currentDiscovery = useMemo(
    () => (vimana.discoveries || []).find(
      (d) => d.coords.x === vimana.currentPosition.x && d.coords.y === vimana.currentPosition.y
    ),
    [vimana.discoveries, vimana.currentPosition]
  );

  const activeAnomaly = (vimana.anomalies || []).find(
    (a) => a.cellKey === currentKey && a.status === 'active'
  );
  const sampleHere = (vimana.samples || []).find(
    (s) => s.source.x === vimana.currentPosition.x && s.source.y === vimana.currentPosition.y
  );
  const unAnalyzedSamples = (vimana.samples || []).filter(
    (s) => s.collected && !s.analyzed
  );

  const startAnomalyChallenge = () => {
    if (!activeAnomaly) return;
    const challenge = generateAnomalyChallenge(activeAnomaly.type);
    setAnomalyChallenge({
      ...challenge,
      anomalyId: activeAnomaly.id,
    });
    setAnomalyFeedback('');
  };

  const resolveChallenge = (choice: string) => {
    if (!anomalyChallenge) return;
    if (choice === anomalyChallenge.correct) {
      resolveAnomaly();
      setAnomalyChallenge(null);
      setAnomalyFeedback('Resonance stabilized.');
    } else {
      setAnomalyFeedback('Resonance destabilized. Try again.');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in relative">
      {/* Zone Transition Overlay */}
      {isTransitioning && (
        <div
          className={`
            fixed inset-0 z-50 flex items-center justify-center
            bg-gradient-to-br ${zoneColors[transitionZone || 'starting-grove'] || 'from-slate-900/90 to-slate-800/90'}
            transition-opacity duration-500
          `}
        >
          <div className="text-center animate-pulse">
            <Compass className="w-16 h-16 text-white/80 mx-auto mb-4 animate-spin" />
            <div className="text-2xl font-bold text-white">
              Traveling to {formatZoneName(transitionZone || '')}
            </div>
            <div className="text-sm text-white/60 mt-2">
              Entering new territory...
            </div>
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {notification && (
        <div
          className={`
            animate-fade-in rounded-lg p-4 border font-semibold text-sm
            ${notification.type === 'success' ? 'bg-emerald-900/30 border-emerald-500 text-emerald-300' :
              notification.type === 'warning' ? 'bg-amber-900/30 border-amber-500 text-amber-300' :
              'bg-blue-900/30 border-blue-500 text-blue-300'}
          `}
        >
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-300" />
            Vimana Exploration
          </h2>
          <div className="text-xs text-zinc-400">
            Position: ({vimana.currentPosition.x}, {vimana.currentPosition.y}) · Scan L{vimana.scanLevel || 1}
          </div>
          {currentCell?.location && (
            <div className="text-xs text-emerald-300 mt-1">
              {currentCell.location} — {currentCell.type.toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="grid grid-cols-3 gap-1">
            <div />
            <Button variant="outline" size="icon" onClick={() => moveVimana('N')}>
              <ArrowUp className="w-4 h-4" />
            </Button>
            <div />
            <Button variant="outline" size="icon" onClick={() => moveVimana('W')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => moveVimana('S')}>
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => moveVimana('E')}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Phase 4: Zone Selector & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-in">
        <ZoneSelector
          currentZone={vimana.currentZone || 'starting-grove'}
          unlockedZones={vimana.unlockedZones || ['starting-grove']}
          onZoneChange={handleZoneChange}
          state={{
            scanLevel: vimana.scanLevel || 1,
            curiosity,
            dreamJournalEntries: vimana.dreamJournalCount || 0,
            achievements: achievementIds,
          }}
        />
        <ProgressBar
          currentXP={vimana.scanExperience || 0}
          currentLevel={vimana.scanLevel || 1}
          showLabel={true}
        />
      </div>

      {/* Phase 4: Equipment & Debuffs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EquipmentPanel
          scanner={vimana.equipment?.scanner || 'basic'}
          toolkit={vimana.equipment?.toolkit || 'none'}
          scanLevel={vimana.scanLevel || 1}
          ownedEquipment={vimana.ownedEquipment || ['basic', 'none']}
          onEquip={equipItem}
          onPurchase={purchaseEquipment}
          state={{
            curiosity,
            samplesCollected: (vimana.samples || []).filter((s) => s.collected).map((s) => s.quality),
          }}
        />
        {vimana.activeDebuffs && vimana.activeDebuffs.length > 0 && (
          <DebuffDisplay activeDebuffs={vimana.activeDebuffs} />
        )}
      </div>

      {/* 7x7 Grid */}
      <div className="grid grid-cols-7 gap-1 p-4 bg-slate-900/40 rounded-xl border border-slate-800">
        {vimana.cells.map((cell, i) => {
          const isCurrent =
            cell.x === vimana.currentPosition.x && cell.y === vimana.currentPosition.y;
          return (
            <div
              key={i}
              className={`
                aspect-square rounded-md border transition-all duration-300 relative hover:scale-105 cursor-pointer
                ${isCurrent ? 'bg-teal-500/30 border-teal-400 animate-pulse-glow' :
                  cell.discovered ? 'bg-slate-700/50 border-slate-600' :
                  'bg-slate-900/60 border-slate-800'}
                ${cell.explored ? 'ring-2 ring-emerald-400/50' : ''}
              `}
            >
              {isCurrent && (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-teal-300" />
                </div>
              )}
              {cell.type !== 'empty' && cell.discovered && (
                <div className="absolute top-1 right-1 text-[10px]">
                  {cell.type === 'anomaly' && '⚡'}
                  {cell.type === 'sample' && '💎'}
                  {cell.type === 'artifact' && '🔮'}
                </div>
              )}
              {cell.location && cell.discovered && (
                <div className="absolute bottom-1 left-1 right-1 text-[9px] text-teal-200 truncate">
                  {cell.location}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 text-sm">
        <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:scale-105">
          <div className="text-zinc-400 text-xs">Scans</div>
          <div className="text-white font-semibold transition-all">{vimana.scansPerformed}</div>
        </div>
        <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:scale-105">
          <div className="text-zinc-400 text-xs">Anomalies</div>
          <div className="text-white font-semibold transition-all">
            {vimana.anomaliesResolved}/{vimana.anomaliesFound}
          </div>
        </div>
        <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:scale-105">
          <div className="text-zinc-400 text-xs">Samples Collected</div>
          <div className="text-white font-semibold transition-all">{vimana.samplesCollected}</div>
        </div>
        <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800 hover:border-teal-600 transition-all duration-300 hover:scale-105">
          <div className="text-zinc-400 text-xs">Scan Level</div>
          <div className="text-teal-300 font-semibold transition-all">L{vimana.scanLevel}</div>
        </div>
      </div>

      {/* Location Detail */}
      <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Current Location</span>
          {currentDiscovery ? (
            <span className={`text-[11px] uppercase ${rarityTag(currentDiscovery.rarity).className}`}>
              {rarityTag(currentDiscovery.rarity).label}
            </span>
          ) : (
            <span className="text-[11px] text-zinc-500">Uncharted</span>
          )}
        </div>
        {currentDiscovery ? (
          <>
            <div className="text-xs text-emerald-300 font-semibold">{currentDiscovery.name}</div>
            <div className="text-xs text-zinc-400">{currentDiscovery.description}</div>
            <div className="text-[11px] text-zinc-500">
              Discovered: {new Date(currentDiscovery.discoveredAt).toLocaleTimeString()}
            </div>
          </>
        ) : (
          <div className="text-xs text-zinc-500">Scan to reveal local details.</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3 bg-slate-900/60 rounded-lg p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Actions</span>
            <Button
              onClick={performScan}
              size="sm"
              className={energy >= currentEnergyCost ? 'animate-pulse-glow' : ''}
              disabled={energy < currentEnergyCost}
            >
              <Compass className="w-4 h-4 mr-2" />
              Scan ({currentEnergyCost} Energy)
            </Button>
          </div>

          {/* Phase 4: Show scan requirements */}
          <StatRequirements
            energyCost={currentEnergyCost}
            currentEnergy={energy}
            scanLevel={vimana.scanLevel || 1}
          />

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={collectSample}
              disabled={!sampleHere || sampleHere.collected}
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              {sampleHere?.collected ? 'Sample Stored' : 'Collect Sample'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={startAnomalyChallenge}
              disabled={!activeAnomaly}
            >
              <Zap className="w-4 h-4 mr-2" />
              {activeAnomaly ? 'Resolve Anomaly' : 'No Anomaly'}
            </Button>
          </div>

          {anomalyChallenge && (
            <div className="rounded-lg border border-purple-500/50 bg-purple-900/20 p-3 space-y-2">
              <div className="text-xs text-purple-200">{anomalyChallenge.prompt}</div>
              {anomalyChallenge.hint && (
                <div className="text-[11px] text-purple-100/80">Hint: {anomalyChallenge.hint}</div>
              )}
              <div className="flex gap-2 flex-wrap">
                {anomalyChallenge.options.map((option) => (
                  <Button key={option} size="sm" variant="outline" onClick={() => resolveChallenge(option)}>
                    {option}
                  </Button>
                ))}
              </div>
              {anomalyFeedback && (
                <div className="text-[11px] text-purple-100">{anomalyFeedback}</div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3 bg-slate-900/60 rounded-lg p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Sample Analysis</span>
            <span className="text-[11px] text-zinc-400">
              {unAnalyzedSamples.length} pending
            </span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {unAnalyzedSamples.length === 0 && (
              <div className="text-xs text-zinc-400">No samples awaiting analysis.</div>
            )}
            {unAnalyzedSamples.map((sample) => (
              <div
                key={sample.id}
                className="flex items-center justify-between rounded border border-slate-800 px-3 py-2 text-xs text-white"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-10 rounded-full"
                    style={{ background: SAMPLE_COLORS[sample.quality] || '#A1A1AA' }}
                  />
                  <div>
                    <div className="font-semibold">{sample.name}</div>
                    <div className="text-[10px] text-zinc-400">
                      Quality: {sample.quality} · ({sample.source.x}, {sample.source.y})
                    </div>
                  </div>
                </div>
                <Button size="sm" className="text-xs" onClick={() => analyzeSample(sample.id)}>
                  Analyze
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800 space-y-2">
          <div className="text-sm font-semibold text-white">Recent Discoveries</div>
          {(vimana.discoveries || []).slice(-4).reverse().map((d) => (
            <div
              key={d.id}
              className="text-xs text-zinc-200 border border-slate-800 rounded px-3 py-2"
            >
              <div className="font-semibold text-emerald-300">{d.name}</div>
              <div className="text-[11px] text-zinc-400">{d.description}</div>
              <div className="text-[10px] text-zinc-500">
                {d.rarity.toUpperCase()} · ({d.coords.x}, {d.coords.y})
              </div>
            </div>
          ))}
          {(vimana.discoveries || []).length === 0 && (
            <div className="text-xs text-zinc-400">Scan to uncover new locations.</div>
          )}
        </div>

        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Rewards</span>
            <Gift className="w-4 h-4 text-amber-300" />
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {(vimana.rewards || []).length === 0 && (
              <div className="text-xs text-zinc-400">Resolve anomalies or analyze samples to earn rewards.</div>
            )}
            {(vimana.rewards || []).map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between rounded border border-slate-800 px-3 py-2 text-xs text-white"
              >
                <div>
                  <div className="font-semibold">{reward.name}</div>
                  <div className="text-[11px] text-zinc-400">{reward.detail}</div>
                </div>
                <Button
                  size="sm"
                  className="text-xs"
                  variant={reward.claimed ? 'outline' : 'default'}
                  disabled={reward.claimed}
                  onClick={() => claimReward(reward.id)}
                >
                  {reward.claimed ? 'Claimed' : 'Claim'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
