import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon, Sun, UtensilsCrossed, PartyPopper, SprayCan, RotateCcw, Sparkles,
  Settings, Clock, Shield, Dna, Microscope, Brain, Infinity, Swords, Zap,
  Target, Activity, GitBranch, Flame, Heart, Trophy, Award
} from "lucide-react";

// ==================== TYPES ====================
type GenomeType = "blue" | "red";
type Difficulty = "Chill" | "Standard" | "Hard";

interface Traits {
  hue: number;
  saturation: number;
  lightness: number;
  bodyShape: number;
  eyeStyle: number;
  crestStyle: number;
  metabolism: number;
  resilience: number;
  curiosity: number;
  sociability: number;
  consciousness: number; // NEW!
}

interface PetState {
  name: string;
  hunger: number;
  fun: number;
  hygiene: number;
  energy: number;
  xp: number;
  level: number;
  bornAt: number;
  lastTick: number;
  isAsleep: boolean;
  genomeType: GenomeType;
  genomeSeed: number;
  generation: number;
  evolutions: number;
  species: string;
  consciousnessLevel: number; // NEW: 0-7
  battleWins: number; // NEW!
  battleLosses: number; // NEW!
}

interface BattleState {
  active: boolean;
  opponent: PetState | null;
  playerHP: number;
  opponentHP: number;
  turn: 'player' | 'opponent';
  log: string[];
}

// ==================== GENOME & TRAITS ====================
function generateGenomeFromSeed(seed: number, type: GenomeType): string {
  const rng = seededRandom(seed);
  const baseGenome = type === "blue" 
    ? "ATGCCGCGTCATATCACGTTATGCTATACTATACCACATCGTGTCACATTGTACTGTGCT".repeat(5)
    : "TTCACTATTATCTATCATTACCCACCATTATTCACTGTTGTCTGTCGTTGCCCGCCGTTA".repeat(4);
  
  return baseGenome.split('').map(base => 
    rng() < 0.02 ? ['A','T','G','C'][Math.floor(rng() * 4)] : base
  ).join('');
}

function decodeTraitsFromProtein(genomeSeed: number): Traits {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = (genomeSeed >> (i * 2)) & 0xff;
  }

  return {
    hue: (bytes[0] / 255) * 360,
    saturation: 50 + (bytes[1] / 255) * 30,
    lightness: 30 + (bytes[2] / 255) * 30,
    bodyShape: bytes[1] % 3,
    eyeStyle: bytes[15] % 3,
    crestStyle: bytes[5] % 3,
    metabolism: 0.85 + (bytes[6] / 255) * 0.3,
    resilience: 0.85 + (bytes[11] / 255) * 0.3,
    curiosity: 0.1 + (bytes[3] / 255) * 0.9,
    sociability: 0.1 + (bytes[4] / 255) * 0.9,
    consciousness: 0
  };
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// ==================== RECURSION CHAMBER ====================
function recursiveCrossover(parent1: PetState, parent2: PetState, depth: number = 0): PetState {
  if (depth > 3) { // Max recursion depth
    return { ...parent1, genomeSeed: Date.now() };
  }

  // Create fractal genome by mixing at multiple scales
  const seed1 = parent1.genomeSeed;
  const seed2 = parent2.genomeSeed;
  
  // Self-similar mixing at different scales
  const mixed = (seed1 & 0xFFFF0000) | (seed2 & 0x0000FFFF);
  const fractalSeed = mixed ^ (mixed >> depth);
  
  const child: PetState = {
    ...parent1,
    name: `${parent1.name} ${depth}`,
    genomeSeed: fractalSeed,
    generation: Math.max(parent1.generation, parent2.generation) + 1,
    species: `Fractal Gen ${Math.max(parent1.generation, parent2.generation) + 1}`,
    bornAt: Date.now(),
    lastTick: Date.now(),
    xp: 0,
    level: 1,
    consciousnessLevel: Math.floor((parent1.consciousnessLevel + parent2.consciousnessLevel) / 2),
    battleWins: 0,
    battleLosses: 0
  };

  // Recursive breeding creates self-similar patterns
  if (depth < 2 && Math.random() < 0.3) {
    return recursiveCrossover(child, parent2, depth + 1);
  }

  return child;
}

// ==================== BATTLE SYSTEM ====================
function calculateBattleStats(pet: PetState, traits: Traits) {
  return {
    attack: traits.metabolism * 100 + pet.level * 5 + traits.consciousness * 0.5,
    defense: traits.resilience * 100 + pet.level * 3,
    speed: traits.curiosity * 100 + pet.level * 2,
    consciousness: traits.consciousness,
    // Emergent properties
    critChance: traits.curiosity * 0.3,
    evasion: traits.sociability * 0.2,
    lifesteal: traits.consciousness > 50 ? traits.consciousness * 0.001 : 0
  };
}

// ==================== INITIAL STATE ====================
function createDefaultPet(): PetState {
  const now = Date.now();
  return {
    name: "Mossy",
    hunger: 75,
    fun: 75,
    hygiene: 75,
    energy: 75,
    xp: 0,
    level: 1,
    bornAt: now,
    lastTick: now,
    isAsleep: false,
    genomeType: "blue",
    genomeSeed: now,
    generation: 1,
    evolutions: 0,
    species: "Blue Gen I",
    consciousnessLevel: 0,
    battleWins: 0,
    battleLosses: 0
  };
}

const STORAGE_KEY = "tamagotchy_ultimate_v1";
const DIFF = { Chill: 0.7, Standard: 1.0, Hard: 1.4 } as const;
const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

// ==================== MINI-GAMES ====================
interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  consciousnessGain: number;
}

const MINI_GAMES: MiniGame[] = [
  {
    id: 'pattern',
    name: 'Pattern Recognition',
    description: 'Find recursive DNA sequences',
    icon: <GitBranch className="w-5 h-5" />,
    consciousnessGain: 5
  },
  {
    id: 'memory',
    name: 'Consciousness Memory',
    description: 'Remember the sequence',
    icon: <Brain className="w-5 h-5" />,
    consciousnessGain: 3
  },
  {
    id: 'meditation',
    name: 'Transcendental Meditation',
    description: 'Focus to increase awareness',
    icon: <Infinity className="w-5 h-5" />,
    consciousnessGain: 2
  },
  {
    id: 'reflex',
    name: 'Quantum Reflex',
    description: 'Catch the quantum particles',
    icon: <Zap className="w-5 h-5" />,
    consciousnessGain: 4
  }
];

// ==================== MAIN COMPONENT ====================
export default function TamagotchiUltimate() {
  // Core state
  const [pet, setPet] = useState<PetState>(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return createDefaultPet();
    try {
      const parsed = JSON.parse(raw) as { pet?: Partial<PetState> };
      return { ...createDefaultPet(), ...(parsed.pet ?? {}) };
    } catch {
      return createDefaultPet();
    }
  });

  const [settings, setSettings] = useState({ difficulty: "Standard" as Difficulty, tickMs: 1000 });
  const [activeTab, setActiveTab] = useState<'main' | 'battle' | 'breed' | 'games' | 'consciousness'>('main');
  const [openSettings, setOpenSettings] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  
  // Battle state
  const [battle, setBattle] = useState<BattleState>({
    active: false,
    opponent: null,
    playerHP: 100,
    opponentHP: 100,
    turn: 'player',
    log: []
  });

  // Mini-game state
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState(0);

  // Breeding state
  const [selectedMate, setSelectedMate] = useState<PetState | null>(null);
  const [breedingMode, setBreedingMode] = useState<'normal' | 'recursive'>('normal');

  // Calculate traits
  const traits = useMemo(() => decodeTraitsFromProtein(pet.genomeSeed), [pet.genomeSeed]);
  const battleStats = useMemo(() => calculateBattleStats(pet, traits), [pet, traits]);

  // Save to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pet, settings }));
  }, [pet, settings]);

  // Pulse log
  const pulse = useCallback((msg: string) => {
    setLog(prev => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev.slice(0, 19)]);
  }, []);

  // Game tick
  useEffect(() => {
    const t = window.setInterval(() => {
      setPet(prev => {
        const now = Date.now();
        const dt = Math.max(0, now - (prev.lastTick || now));
        const minutes = dt / 60_000;
        const k = 0.8 * DIFF[settings.difficulty];
        const sleepBoost = prev.isAsleep ? 1.6 : 1.0;
        const sleepShield = prev.isAsleep ? 0.7 : 1.0;

        const hunger = clamp(prev.hunger - (1.2 * k * minutes * traits.metabolism) * sleepShield);
        const fun = clamp(prev.fun - (1.0 * k * minutes) * sleepShield);
        const hygiene = clamp(prev.hygiene - (0.8 * k * minutes) * sleepShield);
        const energy = prev.isAsleep 
          ? clamp(prev.energy + 0.9 * k * minutes * sleepBoost)
          : clamp(prev.energy - 0.9 * k * minutes);

        const xpGain = 0.25 * minutes * (1 + traits.consciousness * 0.01);
        const xp = prev.xp + xpGain;
        const level = 1 + Math.floor(xp / 25);

        return { ...prev, hunger, fun, hygiene, energy, xp, level, lastTick: now };
      });
    }, settings.tickMs);

    return () => window.clearInterval(t);
  }, [settings.tickMs, settings.difficulty, traits]);

  // ==================== ACTIONS ====================
  const act = (kind: "feed" | "play" | "clean" | "sleep") => {
    if (kind === "sleep") {
      setPet(p => ({ ...p, isAsleep: !p.isAsleep }));
      pulse(pet.isAsleep ? "Woke up" : "Fell asleep");
      return;
    }

    if (pet.isAsleep) {
      pulse("Too sleepy!");
      return;
    }

    setPet(p => {
      let h = p.hunger, f = p.fun, hy = p.hygiene, e = p.energy, xp = p.xp;

      if (kind === "feed") {
        h = clamp(p.hunger + 18 * traits.metabolism);
        e = clamp(e + 4);
        xp += 1.5;
      }
      if (kind === "play") {
        f = clamp(p.fun + 18);
        e = clamp(e - 8 * (1 - traits.resilience));
        xp += 1.8;
      }
      if (kind === "clean") {
        hy = clamp(p.hygiene + 22);
        xp += 1.2;
      }

      pulse({ feed: "Nom nom!", play: "Play time!", clean: "Fresh!", sleep: "Zzz" }[kind]);
      return { ...p, hunger: h, fun: f, hygiene: hy, energy: e, xp };
    });
  };

  // ==================== BATTLE ACTIONS ====================
  const startBattle = () => {
    const opponent = createDefaultPet();
    opponent.name = "Shadow";
    opponent.genomeSeed = Date.now() + 1000;
    opponent.level = pet.level + Math.floor(Math.random() * 3);
    
    setBattle({
      active: true,
      opponent,
      playerHP: 100,
      opponentHP: 100,
      turn: 'player',
      log: ['Battle started!']
    });
    pulse("Battle initiated!");
  };

  const battleAction = (action: 'attack' | 'defend' | 'special') => {
    if (!battle.active || !battle.opponent || battle.turn !== 'player') return;

    setBattle(prev => {
      const opponentTraits = decodeTraitsFromProtein(prev.opponent!.genomeSeed);
      const opponentStats = calculateBattleStats(prev.opponent!, opponentTraits);
      
      let damage = 0;
      let newLog = [...prev.log];
      let newPlayerHP = prev.playerHP;
      let newOpponentHP = prev.opponentHP;

      // Player action
      if (action === 'attack') {
        const isCrit = Math.random() < battleStats.critChance;
        damage = battleStats.attack * (isCrit ? 1.5 : 1) * (0.8 + Math.random() * 0.4);
        newOpponentHP = Math.max(0, prev.opponentHP - damage);
        newLog.push(`⚔️ You deal ${damage.toFixed(0)} damage${isCrit ? ' (CRIT!)' : ''}!`);
      } else if (action === 'defend') {
        newPlayerHP = Math.min(100, prev.playerHP + battleStats.defense * 0.1);
        newLog.push(`🛡️ You defend! +${(battleStats.defense * 0.1).toFixed(0)} HP`);
      } else if (action === 'special') {
        if (traits.consciousness > 50) {
          damage = battleStats.consciousness * 2;
          newOpponentHP = Math.max(0, prev.opponentHP - damage);
          newLog.push(`🧠 Consciousness Strike! ${damage.toFixed(0)} damage!`);
        } else {
          newLog.push('⚠️ Need 50+ consciousness for special!');
        }
      }

      // Check win
      if (newOpponentHP <= 0) {
        newLog.push('🏆 Victory!');
        setPet(p => ({ 
          ...p, 
          battleWins: p.battleWins + 1,
          xp: p.xp + 50,
          traits: { ...traits, consciousness: Math.min(100, traits.consciousness + 5) }
        }));
        setTimeout(() => setBattle(b => ({ ...b, active: false })), 2000);
        return { ...prev, opponentHP: newOpponentHP, log: newLog };
      }

      // Opponent turn
      setTimeout(() => {
        setBattle(b => {
          const enemyDamage = opponentStats.attack * (0.8 + Math.random() * 0.4);
          const evaded = Math.random() < battleStats.evasion;
          const finalDamage = evaded ? 0 : enemyDamage;
          const finalHP = Math.max(0, b.playerHP - finalDamage);
          
          const enemyLog = evaded 
            ? '💨 You evaded the attack!'
            : `🗡️ Opponent deals ${finalDamage.toFixed(0)} damage!`;
          
          const updatedLog = [...b.log, enemyLog];

          if (finalHP <= 0) {
            updatedLog.push('💀 Defeated...');
            setPet(p => ({ ...p, battleLosses: p.battleLosses + 1 }));
            setTimeout(() => setBattle(b => ({ ...b, active: false })), 2000);
          }

          return {
            ...b,
            playerHP: finalHP,
            log: updatedLog,
            turn: 'player'
          };
        });
      }, 1500);

      return {
        ...prev,
        opponentHP: newOpponentHP,
        playerHP: newPlayerHP,
        log: newLog,
        turn: 'opponent'
      };
    });
  };

  // ==================== BREEDING ====================
  const handleBreed = () => {
    if (!selectedMate) return;

    const offspring = breedingMode === 'recursive'
      ? recursiveCrossover(pet, selectedMate, 0)
      : { 
          ...createDefaultPet(), 
          genomeSeed: Date.now(),
          generation: Math.max(pet.generation, selectedMate.generation) + 1
        };

    setPet(offspring);
    pulse(`${breedingMode === 'recursive' ? '🌀 Fractal' : '🧬 Standard'} breeding complete!`);
    setSelectedMate(null);
  };

  // Generate sample mates
  const sampleMates = useMemo(() => {
    return [
      { ...createDefaultPet(), name: "Luna", genomeSeed: 11111, generation: pet.generation },
      { ...createDefaultPet(), name: "Nova", genomeSeed: 22222, generation: pet.generation },
      { ...createDefaultPet(), name: "Echo", genomeSeed: 33333, generation: pet.generation }
    ];
  }, [pet.generation]);

  // ==================== MINI-GAMES ====================
  const playMiniGame = (gameId: string) => {
    setActiveGame(gameId);
    setGameScore(0);
  };

  const completeMiniGame = (score: number) => {
    const game = MINI_GAMES.find(g => g.id === activeGame);
    if (!game) return;

    const consciousnessGain = game.consciousnessGain * (1 + score / 100);
    setPet(p => ({
      ...p,
      traits: { ...traits, consciousness: Math.min(100, traits.consciousness + consciousnessGain) },
      xp: p.xp + score
    }));
    
    pulse(`+${consciousnessGain.toFixed(1)} consciousness!`);
    setActiveGame(null);
  };

  // ==================== RENDER ====================
  const bodyColor = `hsl(${traits.hue} ${traits.saturation}% ${traits.lightness}%)`;
  const mood = useMemo(() => {
    const avg = (pet.hunger + pet.fun + pet.hygiene + pet.energy) / 4;
    if (pet.isAsleep) return { emoji: "😴", label: "Asleep", tone: "blue" };
    if (avg > 75) return { emoji: "🤩", label: "Ecstatic", tone: "emerald" };
    if (avg > 50) return { emoji: "😊", label: "Happy", tone: "cyan" };
    return { emoji: "😐", label: "Okay", tone: "amber" };
  }, [pet]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">TomMyGotchi Ultimate</h1>
            <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm text-purple-300">
              Consciousness Edition
            </div>
          </div>
          <button
            onClick={() => setOpenSettings(v => !v)}
            className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700"
          >
            <Settings className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['main', 'battle', 'breed', 'games', 'consciousness'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {tab === 'main' && <Shield className="w-4 h-4 inline mr-2" />}
              {tab === 'battle' && <Swords className="w-4 h-4 inline mr-2" />}
              {tab === 'breed' && <Heart className="w-4 h-4 inline mr-2" />}
              {tab === 'games' && <Target className="w-4 h-4 inline mr-2" />}
              {tab === 'consciousness' && <Brain className="w-4 h-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Main Tab */}
        {activeTab === 'main' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Pet Card */}
            <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{pet.name}</h2>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-3xl">{mood.emoji}</span>
                  <div className="text-slate-300">Lvl {pet.level}</div>
                </div>
              </div>

              {/* Pet Sprite */}
              <div className="relative h-48 flex items-center justify-center mb-6">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div
                    className="w-32 h-32 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${bodyColor}, ${bodyColor}dd)`,
                      boxShadow: `0 0 30px ${bodyColor}80`
                    }}
                  />
                  {pet.isAsleep && (
                    <Moon className="absolute -top-2 -right-2 w-6 h-6 text-cyan-300" />
                  )}
                </motion.div>

                {/* Consciousness Aura */}
                {traits.consciousness > 30 && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-cyan-400/30"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <StatBar label="Hunger" value={pet.hunger} color="from-orange-500 to-red-500" />
                <StatBar label="Fun" value={pet.fun} color="from-pink-500 to-purple-500" />
                <StatBar label="Hygiene" value={pet.hygiene} color="from-blue-500 to-cyan-500" />
                <StatBar label="Energy" value={pet.energy} color="from-yellow-500 to-orange-500" />
                <StatBar 
                  label="Consciousness" 
                  value={traits.consciousness} 
                  color="from-purple-500 to-cyan-500"
                  icon={<Brain className="w-4 h-4" />}
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <ActionButton icon={<UtensilsCrossed />} label="Feed" onClick={() => act("feed")} />
                <ActionButton icon={<PartyPopper />} label="Play" onClick={() => act("play")} />
                <ActionButton icon={<SprayCan />} label="Clean" onClick={() => act("clean")} />
                <ActionButton 
                  icon={pet.isAsleep ? <Sun /> : <Moon />} 
                  label={pet.isAsleep ? "Wake" : "Sleep"} 
                  onClick={() => act("sleep")} 
                />
              </div>
            </div>

            {/* Info Panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickStat icon={<Trophy />} label="Battles" value={`${pet.battleWins}W-${pet.battleLosses}L`} />
                <QuickStat icon={<Dna />} label="Generation" value={`Gen ${pet.generation}`} />
                <QuickStat icon={<Brain />} label="Consciousness" value={`Lvl ${pet.consciousnessLevel}`} />
                <QuickStat icon={<Sparkles />} label="XP" value={`${Math.floor(pet.xp)}`} />
              </div>

              {/* Activity Log */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activity Log
                </h3>
                <div className="h-48 overflow-y-auto space-y-1 font-mono text-xs">
                  {log.length === 0 ? (
                    <div className="text-slate-500">No events yet...</div>
                  ) : (
                    log.map((line, i) => (
                      <div key={i} className="text-slate-300">{line}</div>
                    ))
                  )}
                </div>
              </div>

              {/* Battle Stats */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Swords className="w-5 h-5" />
                  Battle Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <BattleStat label="Attack" value={battleStats.attack.toFixed(0)} />
                  <BattleStat label="Defense" value={battleStats.defense.toFixed(0)} />
                  <BattleStat label="Speed" value={battleStats.speed.toFixed(0)} />
                  <BattleStat label="Crit %" value={`${(battleStats.critChance * 100).toFixed(1)}%`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Battle Tab */}
        {activeTab === 'battle' && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Swords className="w-6 h-6" />
              Consciousness Battle Arena
            </h2>

            {!battle.active ? (
              <div className="text-center py-12">
                <Flame className="w-20 h-20 text-orange-500 mx-auto mb-4" />
                <p className="text-slate-300 mb-6">
                  Test your creature's emergent battle properties!
                </p>
                <button
                  onClick={startBattle}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-lg text-lg transition-all"
                >
                  Start Battle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Player */}
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400 mb-2">{pet.name}</div>
                  <div 
                    className="w-24 h-24 rounded-full mx-auto mb-2"
                    style={{ background: bodyColor }}
                  />
                  <div className="text-2xl font-bold text-white mb-2">
                    {battle.playerHP.toFixed(0)} HP
                  </div>
                  <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      animate={{ width: `${battle.playerHP}%` }}
                    />
                  </div>
                </div>

                {/* Battle Log */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm font-mono space-y-1 h-48 overflow-y-auto">
                    {battle.log.map((msg, i) => (
                      <div key={i} className="text-slate-300">{msg}</div>
                    ))}
                  </div>
                </div>

                {/* Opponent */}
                <div className="text-center">
                  <div className="text-xl font-bold text-red-400 mb-2">
                    {battle.opponent?.name || "???"}
                  </div>
                  <div className="w-24 h-24 rounded-full mx-auto mb-2 bg-gradient-to-br from-red-500 to-purple-500" />
                  <div className="text-2xl font-bold text-white mb-2">
                    {battle.opponentHP.toFixed(0)} HP
                  </div>
                  <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                      animate={{ width: `${battle.opponentHP}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="md:col-span-3 flex gap-3 justify-center">
                  <button
                    onClick={() => battleAction('attack')}
                    disabled={battle.turn !== 'player'}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-lg transition-all"
                  >
                    ⚔️ Attack
                  </button>
                  <button
                    onClick={() => battleAction('defend')}
                    disabled={battle.turn !== 'player'}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-lg transition-all"
                  >
                    🛡️ Defend
                  </button>
                  <button
                    onClick={() => battleAction('special')}
                    disabled={battle.turn !== 'player' || traits.consciousness < 50}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-lg transition-all"
                  >
                    🧠 Consciousness Strike
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Breed Tab */}
        {activeTab === 'breed' && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-500" />
              Breeding Lab
            </h2>

            {/* Breeding Mode */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setBreedingMode('normal')}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  breedingMode === 'normal'
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                🧬 Standard Breeding
              </button>
              <button
                onClick={() => setBreedingMode('recursive')}
                className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                  breedingMode === 'recursive'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                <Infinity className="w-4 h-4 inline mr-2" />
                Recursion Chamber
              </button>
            </div>

            {breedingMode === 'recursive' && (
              <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-sm text-purple-300">
                  ♾️ <strong>Recursion Chamber:</strong> Creates fractal offspring with self-similar traits at multiple scales. 
                  The child may recursively breed with one parent, creating deep genetic patterns!
                </p>
              </div>
            )}

            {/* Select Mate */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {sampleMates.map(mate => (
                <button
                  key={mate.genomeSeed}
                  onClick={() => setSelectedMate(mate)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMate?.genomeSeed === mate.genomeSeed
                      ? 'border-pink-500 bg-pink-500/20'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="text-white font-bold mb-2">{mate.name}</div>
                  <div className="text-xs text-slate-400">Gen {mate.generation}</div>
                </button>
              ))}
            </div>

            <button
              onClick={handleBreed}
              disabled={!selectedMate}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-lg text-lg transition-all disabled:text-slate-500"
            >
              {breedingMode === 'recursive' ? '♾️ Initiate Recursive Breeding' : '💕 Breed'}
            </button>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-6 h-6" />
              Consciousness Mini-Games
            </h2>

            {!activeGame ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MINI_GAMES.map(game => (
                  <button
                    key={game.id}
                    onClick={() => playMiniGame(game.id)}
                    className="p-6 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl border border-slate-600 text-left transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-purple-400 group-hover:text-purple-300">
                        {game.icon}
                      </div>
                      <div className="text-xl font-bold text-white">{game.name}</div>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{game.description}</p>
                    <div className="text-xs text-cyan-400">
                      +{game.consciousnessGain} consciousness
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
                <div className="text-2xl font-bold text-white mb-2">
                  {MINI_GAMES.find(g => g.id === activeGame)?.name}
                </div>
                <div className="text-slate-300 mb-6">Score: {gameScore}</div>
                <button
                  onClick={() => completeMiniGame(gameScore)}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg"
                >
                  Complete (+{(MINI_GAMES.find(g => g.id === activeGame)?.consciousnessGain || 0)} consciousness)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Consciousness Tab */}
        {activeTab === 'consciousness' && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Consciousness Evolution
            </h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Current Level</span>
                <span className="text-2xl font-bold text-cyan-400">
                  Level {pet.consciousnessLevel}
                </span>
              </div>
              <div className="h-4 bg-slate-900 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500"
                  animate={{ width: `${traits.consciousness}%` }}
                />
              </div>
              <div className="text-right text-sm text-slate-400 mt-1">
                {traits.consciousness.toFixed(1)}% / 100%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[0, 1, 2, 3, 4, 5, 6, 7].map(level => {
                const names = ['Unaware', 'Aware', 'Self-Aware', 'Meta-Aware', 'Transcendent', 'Recursive', 'Ouroboros', 'Enlightened'];
                const thresholds = [0, 10, 25, 40, 60, 75, 90, 100];
                const unlocked = pet.consciousnessLevel >= level;

                return (
                  <div
                    key={level}
                    className={`p-4 rounded-lg border transition-all ${
                      unlocked
                        ? 'bg-purple-500/20 border-cyan-400/50'
                        : 'bg-slate-900/50 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{names[level]}</span>
                      {unlocked ? (
                        <Award className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <div className="text-slate-600">🔒</div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      Requires {thresholds[level]}% consciousness
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== UI COMPONENTS ====================
function StatBar({ label, value, color, icon }: { label: string; value: number; color: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-bold text-white">{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center justify-center gap-2 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
    >
      {icon}
      {label}
    </motion.button>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
        {icon}
        {label}
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function BattleStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}