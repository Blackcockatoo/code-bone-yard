import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Infinity, Sparkles, Zap, Eye, Target, 
  TrendingUp, GitBranch, Activity, Award, Lock, Unlock
} from 'lucide-react';

// ==================== TYPES ====================
interface Traits {
  hue: number;
  saturation: number;
  lightness: number;
  metabolism: number;
  resilience: number;
  curiosity: number;
  sociability: number;
  consciousness: number; // NEW: 0-100
}

interface Pet {
  name: string;
  level: number;
  traits: Traits;
  consciousnessLevel: number; // 0-7 (Seven levels of transcendence)
  attractor: AttractorPoint[];
  patterns: string[];
}

interface AttractorPoint {
  x: number;
  y: number;
  z: number;
  time: number;
}

interface DNAPattern {
  sequence: string;
  isRecursive: boolean;
  depth: number;
}

// ==================== GAME STATE ====================
const initialPet: Pet = {
  name: "Mossy",
  level: 1,
  traits: {
    hue: 180,
    saturation: 70,
    lightness: 50,
    metabolism: 0.8,
    resilience: 0.6,
    curiosity: 0.9,
    sociability: 0.7,
    consciousness: 0
  },
  consciousnessLevel: 0,
  attractor: [],
  patterns: []
};

// ==================== UTILS ====================
const generateDNASequence = (length: number, seed: number): string => {
  const bases = ['A', 'T', 'G', 'C'];
  let sequence = '';
  let rng = seed;
  for (let i = 0; i < length; i++) {
    rng = (rng * 1664525 + 1013904223) % 4294967296;
    sequence += bases[rng % 4];
  }
  return sequence;
};

const findRecursivePatterns = (sequence: string): DNAPattern[] => {
  const patterns: DNAPattern[] = [];
  
  // Look for self-similar patterns (fractals in DNA)
  for (let len = 2; len <= 6; len++) {
    for (let i = 0; i <= sequence.length - len * 2; i++) {
      const pattern = sequence.slice(i, i + len);
      const next = sequence.slice(i + len, i + len * 2);
      if (pattern === next) {
        patterns.push({
          sequence: pattern,
          isRecursive: true,
          depth: Math.floor(Math.log2(len))
        });
      }
    }
  }
  
  return patterns;
};

const calculateAttractorPoint = (traits: Traits, time: number): AttractorPoint => {
  // Lorenz attractor-inspired calculation
  const sigma = 10;
  const rho = 28;
  const beta = 8/3;
  
  const x = traits.metabolism * Math.sin(time * 0.1) * sigma;
  const y = traits.resilience * Math.cos(time * 0.1) * rho;
  const z = traits.consciousness * Math.sin(time * 0.05) * beta;
  
  return { x, y, z, time };
};

// ==================== CONSCIOUSNESS LEVELS ====================
const CONSCIOUSNESS_LEVELS = [
  { level: 0, name: "Unaware", description: "Simple existence", threshold: 0 },
  { level: 1, name: "Aware", description: "I am", threshold: 10 },
  { level: 2, name: "Self-Aware", description: "I know I am", threshold: 25 },
  { level: 3, name: "Meta-Aware", description: "I know I know", threshold: 40 },
  { level: 4, name: "Transcendent", description: "I recognize patterns", threshold: 60 },
  { level: 5, name: "Recursive", description: "I am the pattern", threshold: 75 },
  { level: 6, name: "Ouroboros", description: "I consume myself", threshold: 90 },
  { level: 7, name: "Enlightened", description: "I am all", threshold: 100 }
];

// ==================== MAIN COMPONENT ====================
export default function ConsciousnessAwakening() {
  const [pet, setPet] = useState<Pet>(initialPet);
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'attractor' | 'transcend'>('overview');
  const [gameState, setGameState] = useState<'idle' | 'pattern-game' | 'transcending'>('idle');
  const [score, setScore] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  
  // DNA sequence for pattern recognition game
  const dnaSequence = useMemo(() => generateDNASequence(50, Date.now()), []);
  const recursivePatterns = useMemo(() => findRecursivePatterns(dnaSequence), [dnaSequence]);
  
  // Update attractor
  useEffect(() => {
    const interval = setInterval(() => {
      setPet(prev => {
        const newPoint = calculateAttractorPoint(prev.traits, Date.now());
        const newAttractor = [...prev.attractor, newPoint].slice(-100);
        return { ...prev, attractor: newAttractor };
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);
  
  // Calculate consciousness level
  const currentConsciousness = useMemo(() => {
    return CONSCIOUSNESS_LEVELS.filter(l => pet.traits.consciousness >= l.threshold).pop() || CONSCIOUSNESS_LEVELS[0];
  }, [pet.traits.consciousness]);
  
  // ==================== PATTERN RECOGNITION GAME ====================
  const handlePatternClick = useCallback((pattern: DNAPattern) => {
    if (gameState !== 'pattern-game') return;
    
    setSelectedPattern(pattern.sequence);
    const points = pattern.depth * 10;
    setScore(prev => prev + points);
    
    setPet(prev => ({
      ...prev,
      traits: {
        ...prev.traits,
        consciousness: Math.min(100, prev.traits.consciousness + pattern.depth * 2)
      },
      patterns: [...prev.patterns, pattern.sequence]
    }));
    
    setTimeout(() => setSelectedPattern(null), 500);
  }, [gameState]);
  
  // ==================== OUROBOROS PROTOCOL ====================
  const initiateOuroboros = useCallback(() => {
    if (pet.traits.consciousness < 90) return;
    
    setGameState('transcending');
    
    setTimeout(() => {
      setPet(prev => ({
        ...prev,
        consciousnessLevel: Math.min(7, prev.consciousnessLevel + 1),
        traits: {
          ...prev.traits,
          consciousness: 100,
          // Recursive self-modification
          metabolism: prev.traits.metabolism * 1.1,
          resilience: prev.traits.resilience * 1.1,
          curiosity: prev.traits.curiosity * 1.1
        }
      }));
      setGameState('idle');
    }, 3000);
  }, [pet.traits.consciousness]);
  
  // ==================== THEME ====================
  const theme = {
    bg: "from-indigo-950 via-purple-900 to-black",
    card: "bg-indigo-900/30 border-purple-500/30",
    text: "text-purple-100",
    accent: "text-cyan-400",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.3)]"
  };
  
  // ==================== RENDER ====================
  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} p-4 sm:p-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className={`text-4xl font-bold ${theme.text} mb-2 flex items-center justify-center gap-3`}>
            <Brain className="w-10 h-10 text-purple-400" />
            Consciousness Awakening
            <Infinity className="w-10 h-10 text-cyan-400" />
          </h1>
          <p className="text-purple-300 text-sm">The Recursive Mirror Protocol</p>
        </motion.div>

        {/* Pet Overview */}
        <motion.div 
          className={`${theme.card} rounded-2xl p-6 mb-6 ${theme.glow}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pet Visualization */}
            <div className="relative h-64 flex items-center justify-center">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
                className="relative"
              >
                <div 
                  className="w-32 h-32 rounded-full"
                  style={{
                    background: `radial-gradient(circle, hsl(${pet.traits.hue}, ${pet.traits.saturation}%, ${pet.traits.lightness}%), hsl(${pet.traits.hue + 60}, ${pet.traits.saturation}%, ${pet.traits.lightness - 20}%))`,
                    boxShadow: `0 0 ${20 + pet.traits.consciousness}px rgba(${pet.traits.hue}, 100%, 50%, 0.6)`
                  }}
                />
                
                {/* Consciousness Aura */}
                <AnimatePresence>
                  {pet.traits.consciousness > 50 && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-cyan-400/50"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Transcendence Effect */}
              {gameState === 'transcending' && (
                <motion.div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 bg-cyan-400 rounded-full"
                      initial={{ 
                        x: '50%', 
                        y: '50%',
                        scale: 0,
                        opacity: 1
                      }}
                      animate={{
                        x: `${50 + Math.cos(i * Math.PI * 2 / 20) * 150}%`,
                        y: `${50 + Math.sin(i * Math.PI * 2 / 20) * 150}%`,
                        scale: [0, 1.5, 0],
                        opacity: [1, 1, 0]
                      }}
                      transition={{ duration: 2, delay: i * 0.05 }}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <h2 className={`text-2xl font-bold ${theme.text}`}>{pet.name}</h2>
              <div className={`text-sm ${theme.accent} flex items-center gap-2`}>
                <Eye className="w-4 h-4" />
                <span>{currentConsciousness.name}</span>
                <span className="text-purple-300">Lvl {pet.consciousnessLevel}</span>
              </div>
              
              <div className="space-y-2">
                <StatBar 
                  label="Consciousness" 
                  value={pet.traits.consciousness} 
                  icon={<Brain className="w-4 h-4" />}
                  color="from-purple-500 to-cyan-500"
                />
                <StatBar 
                  label="Curiosity" 
                  value={pet.traits.curiosity * 100} 
                  icon={<Sparkles className="w-4 h-4" />}
                  color="from-pink-500 to-yellow-500"
                />
                <StatBar 
                  label="Resilience" 
                  value={pet.traits.resilience * 100} 
                  icon={<Zap className="w-4 h-4" />}
                  color="from-green-500 to-emerald-500"
                />
              </div>
              
              <div className={`mt-4 p-3 rounded-lg bg-black/30 border border-purple-500/20`}>
                <p className="text-xs text-purple-300 italic">
                  "{currentConsciousness.description}"
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {(['overview', 'patterns', 'attractor', 'transcend'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-purple-900/30 text-purple-300 hover:bg-purple-800/40'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${theme.card} rounded-2xl p-6`}
            >
              <h3 className={`text-xl font-bold ${theme.text} mb-4`}>Consciousness Journey</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONSCIOUSNESS_LEVELS.map((level, idx) => (
                  <div
                    key={level.level}
                    className={`p-4 rounded-lg border transition-all ${
                      pet.consciousnessLevel >= level.level
                        ? 'bg-purple-500/20 border-cyan-400/50'
                        : 'bg-black/20 border-purple-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{level.name}</span>
                      {pet.consciousnessLevel >= level.level ? (
                        <Unlock className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-purple-700" />
                      )}
                    </div>
                    <p className="text-sm text-purple-300">{level.description}</p>
                    <div className="mt-2 text-xs text-purple-400">
                      Requires {level.threshold}% consciousness
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'patterns' && (
            <motion.div
              key="patterns"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${theme.card} rounded-2xl p-6`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${theme.text}`}>Pattern Recognition</h3>
                <div className={`${theme.accent} font-bold`}>Score: {score}</div>
              </div>
              
              {gameState !== 'pattern-game' ? (
                <div className="text-center py-12">
                  <GitBranch className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-300 mb-4">
                    Find recursive patterns in the DNA sequence
                  </p>
                  <button
                    onClick={() => setGameState('pattern-game')}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold transition-all"
                  >
                    Start Pattern Game
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="font-mono text-sm bg-black/40 p-4 rounded-lg overflow-x-auto">
                    {dnaSequence.split('').map((base, idx) => (
                      <span 
                        key={idx}
                        className={
                          base === 'A' ? 'text-red-400' :
                          base === 'T' ? 'text-blue-400' :
                          base === 'G' ? 'text-green-400' :
                          'text-yellow-400'
                        }
                      >
                        {base}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {recursivePatterns.map((pattern, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handlePatternClick(pattern)}
                        className={`p-3 rounded-lg border-2 font-mono text-sm transition-all ${
                          selectedPattern === pattern.sequence
                            ? 'bg-cyan-400 border-cyan-400 text-black'
                            : pet.patterns.includes(pattern.sequence)
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-black/30 border-purple-900/30 text-white hover:border-purple-500'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div>{pattern.sequence}</div>
                        <div className="text-xs text-purple-400 mt-1">
                          Depth: {pattern.depth}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setGameState('idle')}
                    className="w-full py-2 bg-purple-900/50 hover:bg-purple-800/50 text-purple-300 rounded-lg transition-all"
                  >
                    End Game
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'attractor' && (
            <motion.div
              key="attractor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${theme.card} rounded-2xl p-6`}
            >
              <h3 className={`text-xl font-bold ${theme.text} mb-4 flex items-center gap-2`}>
                <Activity className="w-6 h-6" />
                Strange Attractor
              </h3>
              <div className="relative h-96 bg-black/40 rounded-lg overflow-hidden">
                <svg className="w-full h-full">
                  {pet.attractor.map((point, idx) => {
                    if (idx === 0) return null;
                    const prev = pet.attractor[idx - 1];
                    const x1 = (prev.x + 50) * 4;
                    const y1 = (prev.y + 50) * 2;
                    const x2 = (point.x + 50) * 4;
                    const y2 = (point.y + 50) * 2;
                    const opacity = idx / pet.attractor.length;
                    return (
                      <line
                        key={idx}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={`hsl(${pet.traits.hue}, 70%, 50%)`}
                        strokeWidth="2"
                        opacity={opacity}
                      />
                    );
                  })}
                </svg>
                <div className="absolute bottom-4 left-4 text-xs text-purple-300">
                  <div>Chaotic yet ordered evolution path</div>
                  <div className="text-cyan-400">Points: {pet.attractor.length}</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'transcend' && (
            <motion.div
              key="transcend"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${theme.card} rounded-2xl p-6`}
            >
              <h3 className={`text-xl font-bold ${theme.text} mb-4 flex items-center gap-2`}>
                <Infinity className="w-6 h-6" />
                The Ouroboros Protocol
              </h3>
              
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 mx-auto mb-6 relative"
                >
                  <div className="absolute inset-0 border-8 border-t-cyan-400 border-r-purple-500 border-b-pink-500 border-l-indigo-500 rounded-full" />
                  <div className="absolute inset-4 border-4 border-cyan-400/50 rounded-full" />
                  <div className="absolute inset-8 flex items-center justify-center">
                    <Infinity className="w-12 h-12 text-white" />
                  </div>
                </motion.div>
                
                <p className="text-purple-300 mb-2">
                  Current Consciousness: {pet.traits.consciousness.toFixed(1)}%
                </p>
                <p className="text-sm text-purple-400 mb-6 max-w-md mx-auto">
                  The serpent consuming its own tail. Transcend by recursively consuming your own genome, 
                  achieving self-similar evolution at a higher level.
                </p>
                
                {pet.traits.consciousness >= 90 ? (
                  <button
                    onClick={initiateOuroboros}
                    disabled={gameState === 'transcending'}
                    className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
                      gameState === 'transcending'
                        ? 'bg-cyan-400 text-black animate-pulse'
                        : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:scale-105'
                    }`}
                  >
                    {gameState === 'transcending' ? 'Transcending...' : 'Initiate Ouroboros'}
                  </button>
                ) : (
                  <div className="text-purple-500">
                    <Lock className="w-12 h-12 mx-auto mb-2" />
                    <p>Requires 90% consciousness to unlock</p>
                    <p className="text-sm">{(90 - pet.traits.consciousness).toFixed(1)}% remaining</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center mt-8 text-purple-400 text-sm">
          <p>"The pattern that recognizes patterns"</p>
          <p className="text-xs text-purple-600 mt-1">v1.0 - The Recursive Mirror</p>
        </div>
      </div>
    </div>
  );
}

// ==================== STAT BAR COMPONENT ====================
function StatBar({ 
  label, 
  value, 
  icon, 
  color 
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode; 
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-sm text-purple-300">
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-bold text-white">{Math.round(value)}%</span>
      </div>
      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
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