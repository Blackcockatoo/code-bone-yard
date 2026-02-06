import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Debuff, BiomeType, ScannerType, ToolkitType } from '@/systems/exploration/types';
import type { KeyState } from '@/systems/keys/types';
import { craftKey as craftKeyLogic, canCraftKey, getAvailableKeys, applyKeyUnlocks, getUnlockNotifications, getKey } from '@/systems/keys';
import { SCAN_ENERGY_COSTS } from '@/systems/exploration/constants';
import { getEquipment, canAffordEquipment } from '@/systems/exploration/progression';

interface Vitals {
  hunger: number;
  hygiene: number;
  mood: number;
  energy: number;
}

interface EvolutionState {
  stage: 'GENETICS' | 'NEURO' | 'QUANTUM' | 'SPECIATION';
  totalEvolutions: number;
  lastEvolution: number | null;
}

interface BattleState {
  wins: number;
  losses: number;
  streak: number;
  energyShield: number;
}

interface VimanaCell {
  x: number;
  y: number;
  discovered: boolean;
  explored: boolean;
  type: 'empty' | 'anomaly' | 'sample' | 'artifact';
  location?: string;
}

interface LocationDiscovery {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  discoveredAt: number;
  coords: { x: number; y: number };
}

interface AnomalyRecord {
  id: string;
  cellKey: string;
  type: 'echo' | 'rift' | 'glyph';
  status: 'active' | 'resolved';
  reward?: string;
}

interface SampleRecord {
  id: string;
  name: string;
  quality: 'common' | 'rare' | 'legendary';
  collected: boolean;
  analyzed: boolean;
  source: { x: number; y: number };
}

interface ExplorationReward {
  id: string;
  name: string;
  type: 'scanUpgrade' | 'artifact' | 'anomaly' | 'sample';
  claimed: boolean;
  detail: string;
}

interface VimanaState {
  // Existing fields (Phase 3)
  cells: VimanaCell[];
  currentPosition: { x: number; y: number };
  scansPerformed: number;
  anomaliesFound: number;
  anomaliesResolved: number;
  samplesCollected: number;
  discoveries: LocationDiscovery[];
  anomalies: AnomalyRecord[];
  samples: SampleRecord[];
  rewards: ExplorationReward[];
  scanLevel: number;

  // Phase 4 enhancement fields
  currentZone: 'starting-grove' | 'crystal-caverns' | 'void-nexus' | 'dream-spire' | 'eternal-garden';
  unlockedZones: string[];
  scanExperience: number; // XP towards next level
  equipment: {
    scanner: 'basic' | 'advanced' | 'quantum';
    toolkit: 'none' | 'field-kit' | 'master-kit';
  };
  ownedEquipment: string[]; // Equipment IDs that have been purchased
  cooldowns: Record<string, number>; // anomalyId -> cooldown end timestamp
  activeDebuffs: Debuff[];
  statistics: {
    totalScans: number;
    successfulScans: number;
    failedAnomalies: number;
    successfulAnomalies: number;
    rareSamplesFound: number;
    legendaryItemsFound: number;
    energySpent: number;
    healthLost: number;
    biomeCompletions: Record<string, number>;
  };
  achievementProgress: {
    consecutiveSuccesses: number;
    voidNexusScans: number;
    uniqueAnomaliesCompleted: string[];
  };

  // Dream journal count for zone unlocks
  dreamJournalCount: number;

  // Phase 5: Keys system
  keys: KeyState;
}

interface MiniGamesState {
  totalPlays: number;
  highScores: Record<string, number>;
}

interface BreedingState {
  offspringCount: number;
  lastBreed: number | null;
}

interface EarnedAchievement {
  id: string;
  earnedAt: number;
}

interface CosmeticItem {
  id: string;
  equipped: boolean;
  unlocked?: boolean;
}

interface PetState {
  // Core vitals
  vitals: Vitals;
  lastUpdate: number;
  isActive: boolean;

  // Evolution system
  evolution: EvolutionState;

  // Battle system
  battle: BattleState;

  // Phase 4: Curiosity stat (0-200)
  curiosity: number;

  // Vimana exploration
  vimana: VimanaState;

  // Mini-games
  miniGames: MiniGamesState;

  // Breeding
  breeding: BreedingState;

  // Achievements
  achievements: EarnedAchievement[];

  // Cosmetics
  cosmetics: CosmeticItem[];

  // Vitals actions
  feed: () => void;
  clean: () => void;
  play: () => void;
  sleep: () => void;

  // Evolution actions
  evolve: () => boolean;

  // Battle actions
  recordBattleWin: () => void;
  recordBattleLoss: () => void;

  // Vimana actions
  performScan: () => void;
  resolveAnomaly: () => void;
  collectSample: () => void;
  analyzeSample: (sampleId: string) => void;
  claimReward: (rewardId: string) => void;
  moveVimana: (direction: 'N' | 'S' | 'E' | 'W') => void;

  // Phase 4: Vimana enhancement actions
  changeZone: (zone: string) => void;
  equipItem: (itemId: string) => void;
  purchaseEquipment: (itemId: string) => void;
  addCuriosity: (amount: number) => void;
  incrementDreamJournal: () => void;

  // Mini-game actions
  recordGamePlay: (gameId: string, score: number) => void;

  // Breeding actions
  recordBreeding: () => void;

  // Achievement actions
  unlockAchievement: (achievementId: string) => void;

  // Cosmetic actions
  unlockCosmetic: (cosmeticId: string) => void;
  equipCosmetic: (cosmeticId: string) => void;
  unequipCosmetic: (cosmeticId: string) => void;

  // Phase 5: Keys system actions
  craftKey: (keyId: string) => { success: boolean; error?: string };
  checkAvailableKeys: () => void;

  // Tick system
  startTick: () => void;
  stopTick: () => void;
  tick: () => void;
}

const DECAY_RATE = 0.1;
const TICK_INTERVAL = 1000;

let tickInterval: ReturnType<typeof setInterval> | null = null;

const LOCATION_POOL: Array<Omit<LocationDiscovery, 'id' | 'discoveredAt' | 'coords'>> = [
  { name: 'Shimmer Vale', description: 'Crystalline reeds hum in harmonic waves.', rarity: 'common' },
  { name: 'Glyphic Ruins', description: 'Ancient runes pulse with faint resonance.', rarity: 'common' },
  { name: 'Auric Ridge', description: 'Golden dust drifts along the cliff edges.', rarity: 'rare' },
  { name: 'Void Tidemark', description: 'Gravity ripples bend the light at the shoreline.', rarity: 'rare' },
  { name: 'Prism Canopy', description: 'Fractal leaves split light into aurora trails.', rarity: 'epic' },
  { name: 'Echo Cathedral', description: 'Whispering vault that responds to bond energy.', rarity: 'epic' },
  { name: 'Crown of Yantra', description: 'Heptagonal spire aligned to Fibonacci resonance.', rarity: 'legendary' },
];

const ANOMALY_TYPES: AnomalyRecord['type'][] = ['echo', 'rift', 'glyph'];

const SAMPLE_POOL: Array<Omit<SampleRecord, 'id' | 'collected' | 'analyzed' | 'source'>> = [
  { name: 'Prism Seed', quality: 'common' },
  { name: 'Aeon Petal', quality: 'rare' },
  { name: 'Void Shard', quality: 'rare' },
  { name: 'Hepta Core', quality: 'legendary' },
];

const cellKey = (x: number, y: number) => `${x}-${y}`;

const pickFrom = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const addAchievementEntry = (achievements: EarnedAchievement[], id: string): EarnedAchievement[] => {
  if (achievements.some((a) => a.id === id)) return achievements;
  return [...achievements, { id, earnedAt: Date.now() }];
};

const addCosmeticEntry = (cosmetics: CosmeticItem[], id: string): CosmeticItem[] => {
  if (cosmetics.some((c) => c.id === id)) return cosmetics;
  return [...cosmetics, { id, equipped: false, unlocked: true }];
};

const calculateExplorationUnlocks = (vimana: VimanaState) => {
  const achievementIds: string[] = [];
  const cosmeticIds: string[] = [];

  if (vimana.scansPerformed >= 1) achievementIds.push('first-scan');
  if (vimana.samplesCollected >= 25) achievementIds.push('sample-collector');
  if (vimana.anomaliesResolved >= 10) achievementIds.push('anomaly-resolver');

  const exploredCount = vimana.cells.filter((c) => c.explored).length;
  if (exploredCount >= 49) achievementIds.push('master-explorer');

  if (vimana.anomaliesResolved >= 5) cosmeticIds.push('shadow-wisps');
  if (vimana.anomaliesResolved >= 10) cosmeticIds.push('cosmic-pattern');
  if ((vimana.discoveries || []).length >= 10) cosmeticIds.push('star-halo');

  return { achievementIds, cosmeticIds };
};

// Initialize 7x7 Vimana grid
function initializeVimanaGrid(): VimanaCell[] {
  const cells: VimanaCell[] = [];
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      cells.push({
        x,
        y,
        discovered: x === 3 && y === 3, // Center discovered by default
        explored: false,
        type: 'empty',
      });
    }
  }
  return cells;
}

export const useStore = create<PetState>()(
  persist(
    (set, get) => ({
      // Initial vitals
      vitals: {
        hunger: 100,
        hygiene: 100,
        mood: 100,
        energy: 100,
      },
      lastUpdate: Date.now(),
      isActive: false,

      // Initial evolution state
      evolution: {
        stage: 'GENETICS',
        totalEvolutions: 0,
        lastEvolution: null,
      },

      // Initial battle state
      battle: {
        wins: 0,
        losses: 0,
        streak: 0,
        energyShield: 100,
      },

      // Phase 4: Initial curiosity stat
      curiosity: 0,

      // Initial Vimana state
      vimana: {
        // Phase 3 fields
        cells: initializeVimanaGrid(),
        currentPosition: { x: 3, y: 3 },
        scansPerformed: 0,
        anomaliesFound: 0,
        anomaliesResolved: 0,
        samplesCollected: 0,
        discoveries: [],
        anomalies: [],
        samples: [],
        rewards: [],
        scanLevel: 1,

        // Phase 4 fields
        currentZone: 'starting-grove',
        unlockedZones: ['starting-grove'],
        scanExperience: 0,
        equipment: {
          scanner: 'basic',
          toolkit: 'none',
        },
        ownedEquipment: ['basic', 'none'], // Start with basic scanner and no toolkit
        cooldowns: {},
        activeDebuffs: [],
        statistics: {
          totalScans: 0,
          successfulScans: 0,
          failedAnomalies: 0,
          successfulAnomalies: 0,
          rareSamplesFound: 0,
          legendaryItemsFound: 0,
          energySpent: 0,
          healthLost: 0,
          biomeCompletions: {},
        },
        achievementProgress: {
          consecutiveSuccesses: 0,
          voidNexusScans: 0,
          uniqueAnomaliesCompleted: [],
        },

        // Dream journal count for zone unlocks
        dreamJournalCount: 0,

        // Phase 5: Keys system
        keys: {
          crafted: [],
          available: [],
          unlockedLocations: [],
          unlockedEquipment: [],
          unlockedCosmetics: [],
        },
      },

      // Initial mini-games state
      miniGames: {
        totalPlays: 0,
        highScores: {},
      },

      // Initial breeding state
      breeding: {
        offspringCount: 0,
        lastBreed: null,
      },

      // Initial achievements
      achievements: [],

      // Initial cosmetics
      cosmetics: [],

      // Vitals actions
      feed: () =>
        set((state) => ({
          vitals: {
            ...state.vitals,
            hunger: Math.min(100, state.vitals.hunger + 25),
            mood: Math.min(100, state.vitals.mood + 5),
          },
        })),

      clean: () =>
        set((state) => ({
          vitals: {
            ...state.vitals,
            hygiene: Math.min(100, state.vitals.hygiene + 30),
            mood: Math.min(100, state.vitals.mood + 10),
          },
        })),

      play: () =>
        set((state) => ({
          vitals: {
            ...state.vitals,
            mood: Math.min(100, state.vitals.mood + 20),
            energy: Math.max(0, state.vitals.energy - 15),
            hunger: Math.max(0, state.vitals.hunger - 10),
          },
        })),

      sleep: () =>
        set((state) => ({
          vitals: {
            ...state.vitals,
            energy: Math.min(100, state.vitals.energy + 35),
            mood: Math.min(100, state.vitals.mood + 5),
          },
        })),

      // Evolution action
      evolve: () => {
        const state = get();
        const stages: EvolutionState['stage'][] = ['GENETICS', 'NEURO', 'QUANTUM', 'SPECIATION'];
        const currentIndex = stages.indexOf(state.evolution.stage);

        if (currentIndex >= stages.length - 1) return false; // Already max

        set({
          evolution: {
            stage: stages[currentIndex + 1],
            totalEvolutions: state.evolution.totalEvolutions + 1,
            lastEvolution: Date.now(),
          },
        });
        return true;
      },

      // Battle actions
      recordBattleWin: () =>
        set((state) => ({
          battle: {
            ...state.battle,
            wins: state.battle.wins + 1,
            streak: state.battle.streak + 1,
          },
        })),

      recordBattleLoss: () =>
        set((state) => ({
          battle: {
            ...state.battle,
            losses: state.battle.losses + 1,
            streak: 0,
          },
        })),

      // Vimana actions
      performScan: () =>
        set((state) => {
          const { vimana } = state;

          // Phase 4: Check energy requirements based on current zone
          const energyCost = SCAN_ENERGY_COSTS[vimana.currentZone] || 5;
          if (state.vitals.energy < energyCost) {
            console.warn('Not enough energy to scan');
            return state;
          }

          let achievements = [...state.achievements];
          let cosmetics = [...state.cosmetics];
          const cells = [...vimana.cells];
          const key = cellKey(vimana.currentPosition.x, vimana.currentPosition.y);
          const now = Date.now();
          const cellIndex = cells.findIndex((c) => cellKey(c.x, c.y) === key);
          if (cellIndex === -1) return state;

          const currentCell = { ...cells[cellIndex], discovered: true, explored: true };
          let scanLevel = vimana.scanLevel || 1;

          const discoveries = [...(vimana.discoveries || [])];
          const anomalies = [...(vimana.anomalies || [])];
          const samples = [...(vimana.samples || [])];
          const rewards = [...(vimana.rewards || [])];

          // Assign a content type if the tile was empty
          if (currentCell.type === 'empty') {
            const roll = Math.random();
            let newType: VimanaCell['type'] = 'empty';
            if (roll > 0.82) newType = 'artifact';
            else if (roll > 0.58) newType = 'sample';
            else if (roll > 0.38) newType = 'anomaly';
            currentCell.type = newType;
          }

          // Location discovery
          const alreadyLogged = discoveries.some(
            (d) => d.coords.x === currentCell.x && d.coords.y === currentCell.y
          );
          if (currentCell.type !== 'empty' && !alreadyLogged) {
            const rarityRoll = Math.random();
            let rarity: LocationDiscovery['rarity'] = 'common';
            if (rarityRoll > 0.85) rarity = 'legendary';
            else if (rarityRoll > 0.65) rarity = 'epic';
            else if (rarityRoll > 0.45) rarity = 'rare';
            const pool =
              LOCATION_POOL.filter((loc) => loc.rarity === rarity) || LOCATION_POOL;
            const base = pool.length > 0 ? pickFrom(pool) : pickFrom(LOCATION_POOL);
            const entry: LocationDiscovery = {
              ...base,
              id: `loc-${key}-${now}`,
              discoveredAt: now,
              coords: { ...vimana.currentPosition },
            };
            discoveries.push(entry);
            currentCell.location = entry.name;
          }

          // Anomaly spawn
          let anomaliesFound = vimana.anomaliesFound;
          if (
            currentCell.type === 'anomaly' &&
            !anomalies.some((a) => a.cellKey === key)
          ) {
            anomalies.push({
              id: `anomaly-${key}-${now}`,
              cellKey: key,
              type: pickFrom(ANOMALY_TYPES),
              status: 'active',
            });
            anomaliesFound += 1;
          }

          // Sample spawn
          if (
            currentCell.type === 'sample' &&
            !samples.some((s) => s.source.x === currentCell.x && s.source.y === currentCell.y)
          ) {
            const sampleTemplate = pickFrom(SAMPLE_POOL);
            samples.push({
              ...sampleTemplate,
              id: `sample-${key}-${now}`,
              collected: false,
              analyzed: false,
              source: { ...vimana.currentPosition },
            });
          }

          // Artifact reward
          if (currentCell.type === 'artifact') {
            const rewardId = `artifact-${key}`;
            if (!rewards.some((r) => r.id === rewardId)) {
              rewards.push({
                id: rewardId,
                name: currentCell.location || 'Unknown Artifact',
                type: 'artifact',
                claimed: false,
                detail: 'Recovered artifact resonance shard.',
              });
            }
          }

          // Reveal nearby tiles based on scan level
          const revealRadius = Math.min(2, scanLevel);
          const revealedCells = cells.map((cell) => {
            const distance =
              Math.abs(cell.x - vimana.currentPosition.x) +
              Math.abs(cell.y - vimana.currentPosition.y);
            if (distance <= revealRadius) {
              return { ...cell, discovered: true };
            }
            return cell;
          });
          revealedCells[cellIndex] = currentCell;

          const scansPerformed = vimana.scansPerformed + 1;
          const newScanLevel = Math.min(3, 1 + Math.floor(scansPerformed / 4));
          if (newScanLevel > scanLevel) {
            scanLevel = newScanLevel;
            const rewardId = `scan-upgrade-${scanLevel}`;
            if (!rewards.some((r) => r.id === rewardId)) {
              rewards.push({
                id: rewardId,
                name: `Scan upgrade ${scanLevel}`,
                type: 'scanUpgrade',
                claimed: false,
                detail: `Scan radius increased to level ${scanLevel}.`,
              });
            }
          }

          const updatedVimana: VimanaState = {
            ...vimana,
            cells: revealedCells,
            discoveries,
            anomalies,
            samples,
            rewards,
            anomaliesFound,
            scansPerformed,
            scanLevel,
          };

          const unlocks = calculateExplorationUnlocks(updatedVimana);
          unlocks.achievementIds.forEach((id) => {
            achievements = addAchievementEntry(achievements, id);
          });
          unlocks.cosmeticIds.forEach((id) => {
            cosmetics = addCosmeticEntry(cosmetics, id);
          });

          // Phase 4: Deduct energy cost
          const newEnergy = Math.max(0, state.vitals.energy - energyCost);

          // Phase 4: Award scan XP (5 per scan)
          const scanExperience = (vimana.scanExperience || 0) + 5;

          // Phase 4: Award curiosity based on content found
          let curiosity = state.curiosity;
          if (currentCell.type === 'anomaly') {
            curiosity = Math.min(200, curiosity + 20);
          } else if (currentCell.type === 'sample') {
            curiosity = Math.min(200, curiosity + 15);
          } else if (currentCell.type === 'artifact') {
            curiosity = Math.min(200, curiosity + 30);
          } else {
            curiosity = Math.min(200, curiosity + 5);
          }

          // Phase 4: Update statistics
          const statistics = {
            ...vimana.statistics,
            totalScans: (vimana.statistics?.totalScans || 0) + 1,
            successfulScans: (vimana.statistics?.successfulScans || 0) + 1,
            energySpent: (vimana.statistics?.energySpent || 0) + energyCost,
          };

          // Phase 4: Check for level up (simple thresholds: 100, 300, 600, 1000, 2000)
          const levelThresholds = [0, 100, 300, 600, 1000];
          const newLevel = levelThresholds.findIndex((threshold, idx) =>
            scanExperience < threshold || idx === levelThresholds.length - 1
          );
          const actualLevel = newLevel === -1 ? 5 : newLevel;

          return {
            vimana: {
              ...updatedVimana,
              scanExperience,
              scanLevel: Math.max(scanLevel, actualLevel),
              statistics,
            },
            vitals: {
              ...state.vitals,
              energy: newEnergy,
            },
            curiosity,
            achievements,
            cosmetics,
          };
        }),

      resolveAnomaly: () =>
        set((state) => {
          const { vimana } = state;
          let achievements = [...state.achievements];
          let cosmetics = [...state.cosmetics];
          const key = cellKey(vimana.currentPosition.x, vimana.currentPosition.y);
          const anomalies = [...(vimana.anomalies || [])];
          const anomalyIndex = anomalies.findIndex(
            (a) => a.cellKey === key && a.status === 'active'
          );
          if (anomalyIndex === -1) return state;

          anomalies[anomalyIndex] = { ...anomalies[anomalyIndex], status: 'resolved' };
          const rewards = [...(vimana.rewards || [])];
          const rewardId = `anomaly-${anomalies[anomalyIndex].id}`;
          if (!rewards.some((r) => r.id === rewardId)) {
            rewards.push({
              id: rewardId,
              name: 'Anomaly stabilized',
              type: 'anomaly',
              claimed: false,
              detail: `Calmed ${anomalies[anomalyIndex].type} signature.`,
            });
          }

          const cells = vimana.cells.map((cell) =>
            cellKey(cell.x, cell.y) === key ? { ...cell, explored: true } : cell
          );

          const updatedVimana: VimanaState = {
            ...vimana,
            anomalies,
            rewards,
            anomaliesResolved: vimana.anomaliesResolved + 1,
            cells,
          };

          const unlocks = calculateExplorationUnlocks(updatedVimana);
          unlocks.achievementIds.forEach((id) => {
            achievements = addAchievementEntry(achievements, id);
          });
          unlocks.cosmeticIds.forEach((id) => {
            cosmetics = addCosmeticEntry(cosmetics, id);
          });

          return {
            vimana: updatedVimana,
            achievements,
            cosmetics,
          };
        }),

      collectSample: () =>
        set((state) => {
          const { vimana } = state;
          let achievements = [...state.achievements];
          let cosmetics = [...state.cosmetics];
          const key = cellKey(vimana.currentPosition.x, vimana.currentPosition.y);
          const samples = [...(vimana.samples || [])];
          const sampleIndex = samples.findIndex(
            (s) => s.source.x === vimana.currentPosition.x && s.source.y === vimana.currentPosition.y
          );
          if (sampleIndex === -1 || samples[sampleIndex].collected) return state;

          samples[sampleIndex] = { ...samples[sampleIndex], collected: true };
          const cells = vimana.cells.map((cell) =>
            cellKey(cell.x, cell.y) === key ? { ...cell, explored: true } : cell
          );

          const updatedVimana: VimanaState = {
            ...vimana,
            samples,
            samplesCollected: vimana.samplesCollected + 1,
            cells,
          };

          const unlocks = calculateExplorationUnlocks(updatedVimana);
          unlocks.achievementIds.forEach((id) => {
            achievements = addAchievementEntry(achievements, id);
          });
          unlocks.cosmeticIds.forEach((id) => {
            cosmetics = addCosmeticEntry(cosmetics, id);
          });

          return {
            vimana: updatedVimana,
            achievements,
            cosmetics,
          };
        }),

      analyzeSample: (sampleId: string) =>
        set((state) => {
          const { vimana } = state;
          let achievements = [...state.achievements];
          let cosmetics = [...state.cosmetics];
          const samples = [...(vimana.samples || [])];
          const sampleIndex = samples.findIndex((s) => s.id === sampleId);
          if (
            sampleIndex === -1 ||
            !samples[sampleIndex].collected ||
            samples[sampleIndex].analyzed
          ) {
            return state;
          }

          samples[sampleIndex] = { ...samples[sampleIndex], analyzed: true };
          const rewards = [...(vimana.rewards || [])];
          const rewardId = `sample-${sampleId}`;
          if (!rewards.some((r) => r.id === rewardId)) {
            rewards.push({
              id: rewardId,
              name: `${samples[sampleIndex].name} insights`,
              type: 'sample',
              claimed: false,
              detail: `Analysis of ${samples[sampleIndex].quality} sample complete.`,
            });
          }

          const updatedVimana: VimanaState = {
            ...vimana,
            samples,
            rewards,
          };

          const unlocks = calculateExplorationUnlocks(updatedVimana);
          unlocks.achievementIds.forEach((id) => {
            achievements = addAchievementEntry(achievements, id);
          });
          unlocks.cosmeticIds.forEach((id) => {
            cosmetics = addCosmeticEntry(cosmetics, id);
          });

          return {
            vimana: updatedVimana,
            achievements,
            cosmetics,
          };
        }),

      claimReward: (rewardId: string) =>
        set((state) => ({
          vimana: {
            ...state.vimana,
            rewards: (state.vimana.rewards || []).map((reward) =>
              reward.id === rewardId ? { ...reward, claimed: true } : reward
            ),
          },
        })),

      moveVimana: (direction) =>
        set((state) => {
          const { vimana } = state;
          const delta =
            direction === 'N'
              ? { x: 0, y: -1 }
              : direction === 'S'
                ? { x: 0, y: 1 }
                : direction === 'E'
                  ? { x: 1, y: 0 }
                  : { x: -1, y: 0 };

          const nextX = Math.max(0, Math.min(6, vimana.currentPosition.x + delta.x));
          const nextY = Math.max(0, Math.min(6, vimana.currentPosition.y + delta.y));

          if (nextX === vimana.currentPosition.x && nextY === vimana.currentPosition.y) {
            return state;
          }

          const cells = vimana.cells.map((cell) =>
            cell.x === nextX && cell.y === nextY ? { ...cell, discovered: true } : cell
          );

          return {
            vimana: {
              ...vimana,
              cells,
              currentPosition: { x: nextX, y: nextY },
            },
          };
        }),

      // Phase 4: Vimana enhancement actions
      changeZone: (zone: string) =>
        set((state) => {
          // Check if zone is unlocked
          if (!state.vimana.unlockedZones.includes(zone)) {
            console.warn('Zone not unlocked:', zone);
            return state;
          }

          return {
            vimana: {
              ...state.vimana,
              currentZone: zone as BiomeType,
            },
          };
        }),

      equipItem: (itemId: string) =>
        set((state) => {
          // Determine if it's a scanner or toolkit
          const scanners: ScannerType[] = ['basic', 'advanced', 'quantum'];
          const toolkits: ToolkitType[] = ['none', 'field-kit', 'master-kit'];

          if (scanners.includes(itemId as ScannerType)) {
            return {
              vimana: {
                ...state.vimana,
                equipment: {
                  ...state.vimana.equipment,
                  scanner: itemId as ScannerType,
                },
              },
            };
          } else if (toolkits.includes(itemId as ToolkitType)) {
            return {
              vimana: {
                ...state.vimana,
                equipment: {
                  ...state.vimana.equipment,
                  toolkit: itemId as ToolkitType,
                },
              },
            };
          }

          console.warn('Unknown item:', itemId);
          return state;
        }),

      purchaseEquipment: (itemId: string) =>
        set((state) => {
          const equipment = getEquipment(itemId as ScannerType | ToolkitType);
          if (!equipment) {
            console.warn('Unknown equipment:', itemId);
            return state;
          }

          // Check if already owned
          if (state.vimana.ownedEquipment.includes(itemId)) {
            console.warn('Equipment already owned:', itemId);
            return state;
          }

          // Check if can afford
          const samplesCollected = (state.vimana.samples || [])
            .filter((s) => s.collected)
            .map((s) => s.quality);

          const affordCheck = canAffordEquipment(equipment, {
            curiosity: state.curiosity,
            samplesCollected,
          });

          if (!affordCheck.canAfford) {
            console.warn('Cannot afford equipment:', itemId, affordCheck);
            return state;
          }

          // Deduct curiosity cost
          const newCuriosity = state.curiosity - equipment.cost.curiosity;

          // Add to owned equipment
          const ownedEquipment = [...state.vimana.ownedEquipment, itemId];

          // Automatically equip the new item
          const newEquipment = { ...state.vimana.equipment };
          if (equipment.type === 'scanner') {
            newEquipment.scanner = itemId as ScannerType;
          } else if (equipment.type === 'toolkit') {
            newEquipment.toolkit = itemId as ToolkitType;
          }

          return {
            curiosity: newCuriosity,
            vimana: {
              ...state.vimana,
              ownedEquipment,
              equipment: newEquipment,
            },
          };
        }),

      addCuriosity: (amount: number) =>
        set((state) => ({
          curiosity: Math.min(200, Math.max(0, state.curiosity + amount)),
        })),

      incrementDreamJournal: () =>
        set((state) => ({
          vimana: {
            ...state.vimana,
            dreamJournalCount: (state.vimana.dreamJournalCount || 0) + 1,
          },
        })),

      // Mini-game actions
      recordGamePlay: (gameId: string, score: number) =>
        set((state) => ({
          miniGames: {
            totalPlays: state.miniGames.totalPlays + 1,
            highScores: {
              ...state.miniGames.highScores,
              [gameId]: Math.max(state.miniGames.highScores[gameId] || 0, score),
            },
          },
        })),

      // Breeding actions
      recordBreeding: () =>
        set((state) => ({
          breeding: {
            offspringCount: state.breeding.offspringCount + 1,
            lastBreed: Date.now(),
          },
        })),

      // Achievement actions
      unlockAchievement: (achievementId: string) =>
        set((state) => ({
          achievements: addAchievementEntry(state.achievements, achievementId),
        })),

      // Cosmetic actions
      unlockCosmetic: (cosmeticId: string) =>
        set((state) => ({
          cosmetics: addCosmeticEntry(state.cosmetics, cosmeticId),
        })),

      equipCosmetic: (cosmeticId: string) =>
        set((state) => {
          const cosmetics = addCosmeticEntry(state.cosmetics, cosmeticId);
          return {
            cosmetics: cosmetics.map((c) =>
              c.id === cosmeticId ? { ...c, equipped: true, unlocked: true } : { ...c, equipped: false }
            ),
          };
        }),

      unequipCosmetic: (cosmeticId: string) =>
        set((state) => ({
          cosmetics: state.cosmetics.map(c =>
            c.id === cosmeticId ? { ...c, equipped: false } : c
          ),
        })),

      // Phase 5: Keys system actions
      craftKey: (keyId: string) => {
        const state = get();
        const { vimana } = state;

        // Look up the key definition
        const key = getKey(keyId);
        if (!key) {
          return { success: false, error: `Key not found: ${keyId}` };
        }

        // Get all collected sample IDs from vimana
        const samplesCollected = (vimana.samples || [])
          .filter(s => s.collected)
          .map(s => s.id);

        // Attempt to craft the key
        const result = craftKeyLogic(key, samplesCollected);

        if (!result.success) {
          return { success: false, error: result.error };
        }

        // Key crafted successfully! Apply updates
        set((state) => {
          const { vimana } = state;
          const keys = vimana.keys;

          // Remove consumed samples from inventory
          const samplesUsedSet = new Set(result.samplesUsed || []);
          const updatedSamples = (vimana.samples || []).filter(
            (sample) => !samplesUsedSet.has(sample.id) || !sample.collected
          );

          // Add key to crafted list
          const craftedKeys = [...keys.crafted, keyId];

          // Apply key unlocks
          const unlockResult = applyKeyUnlocks(result.key!, {
            unlockedLocations: keys.unlockedLocations,
            unlockedEquipment: keys.unlockedEquipment,
            unlockedCosmetics: keys.unlockedCosmetics,
          });

          // Get notifications for UI
          const notifications = getUnlockNotifications(unlockResult.newUnlocks);

          // Log notifications (could be displayed in UI later)
          notifications.forEach(notif => console.log('[Key Unlock]', notif));

          // Update achievements and cosmetics
          const achievements = [...state.achievements];
          const cosmetics = [...state.cosmetics];

          // Unlock cosmetics from key
          if (unlockResult.newUnlocks.cosmetics.length > 0) {
            unlockResult.newUnlocks.cosmetics.forEach(cosmeticId => {
              if (!cosmetics.find(c => c.id === cosmeticId)) {
                cosmetics.push({
                  id: cosmeticId,
                  unlocked: true,
                  equipped: false,
                });
              }
            });
          }

          return {
            vimana: {
              ...vimana,
              samples: updatedSamples,
              keys: {
                ...keys,
                crafted: craftedKeys,
                unlockedLocations: unlockResult.unlockedLocations,
                unlockedEquipment: unlockResult.unlockedEquipment,
                unlockedCosmetics: unlockResult.unlockedCosmetics,
              },
            },
            achievements,
            cosmetics,
          };
        });

        // Update available keys after crafting
        get().checkAvailableKeys();

        return { success: true };
      },

      checkAvailableKeys: () =>
        set((state) => {
          const { vimana } = state;
          const samplesCollected = (vimana.samples || [])
            .filter(s => s.collected)
            .map(s => s.id);
          const craftedKeys = vimana.keys.crafted;

          // Get list of keys that can currently be crafted
          const availableKeys = getAvailableKeys(samplesCollected, craftedKeys);
          const availableKeyIds = availableKeys.map(key => key.id);

          return {
            vimana: {
              ...vimana,
              keys: {
                ...vimana.keys,
                available: availableKeyIds,
              },
            },
          };
        }),

      // Tick system
      tick: () =>
        set((state) => {
          const now = Date.now();
          const timeSinceLastUpdate = now - state.lastUpdate;
          const ticksPassed = Math.floor(timeSinceLastUpdate / TICK_INTERVAL);

          if (ticksPassed < 1) return state;

          const newVitals = {
            hunger: Math.max(0, state.vitals.hunger - DECAY_RATE * ticksPassed),
            hygiene: Math.max(0, state.vitals.hygiene - DECAY_RATE * ticksPassed * 0.8),
            mood: Math.max(0, state.vitals.mood - DECAY_RATE * ticksPassed * 0.6),
            energy: Math.max(0, state.vitals.energy - DECAY_RATE * ticksPassed * 0.5),
          };

          return {
            vitals: newVitals,
            lastUpdate: now,
          };
        }),

      startTick: () => {
        const state = get();
        if (state.isActive || tickInterval !== null) return;

        set({ isActive: true, lastUpdate: Date.now() });

        tickInterval = setInterval(() => {
          get().tick();
        }, TICK_INTERVAL);
      },

      stopTick: () => {
        set({ isActive: false });
        if (tickInterval) {
          clearInterval(tickInterval);
          tickInterval = null;
        }
      },
    }),
    {
      name: 'metapet-storage',
      partialize: (state) => ({
        vitals: state.vitals,
        evolution: state.evolution,
        battle: state.battle,
        vimana: state.vimana,
        miniGames: state.miniGames,
        breeding: state.breeding,
        achievements: state.achievements,
        cosmetics: state.cosmetics,
        curiosity: state.curiosity,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Clean up expired cooldowns
        const now = Date.now();
        if (state.vimana?.cooldowns) {
          const validCooldowns: Record<string, number> = {};
          for (const [key, endTime] of Object.entries(state.vimana.cooldowns)) {
            if (endTime > now) {
              validCooldowns[key] = endTime;
            }
          }
          state.vimana.cooldowns = validCooldowns;
        }

        // Clean up expired debuffs
        if (state.vimana?.activeDebuffs) {
          state.vimana.activeDebuffs = state.vimana.activeDebuffs.filter((debuff) => {
            const expiresAt = debuff.appliedAt + (debuff.duration * 60 * 1000);
            return expiresAt > now;
          });
        }

        // Ensure ownedEquipment exists (migration for old saves)
        if (!state.vimana?.ownedEquipment) {
          state.vimana.ownedEquipment = ['basic', 'none'];
        }
      },
    }
  )
);
