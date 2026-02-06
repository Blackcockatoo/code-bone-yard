'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { initField, type MossPrimeField } from '@/core';
import type { GuardianSaveData, Offspring, DreamInsightEntry } from '@/guardian/persistence';
import {
  loadGuardianState,
  saveGuardianState,
} from '@/guardian/persistence';
import {
  DEFAULT_AI_CONFIG,
  getTimeOfDay,
  getTimeTheme,
  useAuraliaAudio,
  useGuardianAI,
  useGuardianInteraction,
} from '@/guardian/behavior';
import { GUARDIAN_FORMS, DEFAULT_FORM_KEY, type FormKey, type GuardianForm } from '@/guardian/forms';
import {
  selectScaleFromStats,
  getUnlockedLore,
} from '@/guardian/stats';
import {
  type AIBehaviorConfig,
  type GuardianScaleName,
  type GuardianSigilPoint,
  type InteractionResponse,
  type SpontaneousBehavior,
} from '@/guardian/types';
import { useConsciousness, deriveTraitsFromCurrentState, type ConsciousnessActions } from '@/auralia/useConsciousness';
import { getEmotionalIdleResponse, getEmotionalResponse, type ActionType } from '@/lib/realtime/consciousResponse';
import { SubAtomicParticleField } from '@/ui/guardian/SubAtomicParticleField';
import { TemporalEchoTrail } from '@/ui/guardian/TemporalEchoTrail';
import { YantraMorphBackdrop } from '@/ui/guardian/YantraMorphBackdrop';
import { calculateEyeState, EyeRenderer, type EyeState } from '@/ui/guardian/GuardianEyes';
import { EyeEmotionFilters } from '@/ui/guardian/EyeFilters';
import { SnakeGame } from '@/components/games/SnakeGame';
import { TetrisGame } from '@/components/games/TetrisGame';
import { BreedingCenter } from '@/components/BreedingCenter';
import { GenomeJewbleRing } from '@/components/GenomeJewbleRing';
import { EvolutionPanel } from '@/components/EvolutionPanel';
import { FeaturesDashboard } from '@/components/FeaturesDashboard';
import { HUD } from '@/components/HUD';
import { useStore } from '@/store/guardian';
import { breed } from '@/systems/breeding';
import { toDigits } from '@/lib/genome';
import { GuardianBody, BODY_ANCHORS, getAnchorPosition } from '@/sprites/body/GuardianBody';
import { Limbs } from '@/sprites/body/Limbs';
import { Tail } from '@/sprites/body/Tail';
import { Ears } from '@/sprites/body/Ears';
import { formToConstellation, type ConstellationName } from '@/sprites/core/celestial/ConstellationMapper';

// ===== TYPE DEFINITIONS =====
type Field = MossPrimeField;
type SigilPoint = GuardianSigilPoint;
type ScaleName = GuardianScaleName;
type Crackle = { id: number; x: number; y: number; life: number; };
type SigilPulse = { id: number; x: number; y: number; life: number; color: string; };
type AuraRipple = { id: number; x: number; y: number; radius: number; life: number; color: string; };
type Form = GuardianForm;
type BondHistoryEntry = { timestamp: number; bond: number; event: string; };
type MiniGameType = 'sigilPattern' | 'fibonacciTrivia' | 'snake' | 'tetris' | null;
type PatternChallenge = { sequence: number[]; userSequence: number[]; active: boolean; };
type TriviaQuestion = { question: string; answer: number; options: number[]; };
type ActivePanel = 'care' | 'games' | 'lore' | 'evolution' | 'settings' | 'features';

// ===== MINI-GAME HELPERS =====
const generateFibonacciTrivia = (field: Field): TriviaQuestion => {
  const questions = [
    { n: 7, question: "What is the 7th Fibonacci number?", answer: Number(field.fib(7)) },
    { n: 10, question: "What is the 10th Fibonacci number?", answer: Number(field.fib(10)) },
    { n: 8, question: "What is the 8th Lucas number?", answer: Number(field.lucas(8)) },
    { n: 6, question: "What is the 6th Lucas number?", answer: Number(field.lucas(6)) },
    { n: 12, question: "What is the 12th Fibonacci number?", answer: Number(field.fib(12)) }
  ];

  const q = questions[Math.floor(field.prng() * questions.length)];
  const wrong1 = q.answer + Math.floor(field.prng() * 20) - 10;
  const wrong2 = q.answer * 2;
  const wrong3 = Math.floor(q.answer / 2);

  const options = [q.answer, wrong1, wrong2, wrong3].sort(() => field.prng() - 0.5);

  return { question: q.question, answer: q.answer, options };
};

// Form definitions
const forms: Record<FormKey, Form> = GUARDIAN_FORMS;

// ===== MAIN COMPONENT =====
const AuraliaMetaPet: React.FC = () => {
  // Store hooks for vitals
  const feed = useStore(s => s.feed);
  const clean = useStore(s => s.clean);
  const play = useStore(s => s.play);
  const sleep = useStore(s => s.sleep);

  const [seedName, setSeedName] = useState<string>("AURALIA");
  const [field, setField] = useState<Field>(() => initField("AURALIA"));
  const [energy, setEnergy] = useState<number>(50);
  const [curiosity, setCuriosity] = useState<number>(50);
  const [bond, setBond] = useState<number>(50);
  const [health, setHealth] = useState<number>(80);
  const [selectedSigilPoint, setSelectedSigilPoint] = useState<number | null>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [transitioning, setTransitioning] = useState<boolean>(false);
  const prevFormRef = useRef<FormKey>(DEFAULT_FORM_KEY);

  const [eyePos, setEyePos] = useState<{ x: number; y: number; }>({ x: 0, y: 0 });
  const eyeVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [eyeTarget, setEyeTarget] = useState<{ x: number; y: number; }>({ x: 0, y: 0 });
  const eyeTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pupilSize, setPupilSize] = useState<number>(8);
  const [crackles, setCrackles] = useState<Crackle[]>([]);
  const [sigilPulses, setSigilPulses] = useState<SigilPulse[]>([]);
  const [auraRipples, setAuraRipples] = useState<AuraRipple[]>([]);
  const [hoverIntensity, setHoverIntensity] = useState<number>(0);
  const [hoveredSigilIndex, setHoveredSigilIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [orbDeformation, setOrbDeformation] = useState<{ x: number; y: number; intensity: number }>({ x: 0, y: 0, intensity: 0 });
  const [annoyanceLevel, setAnnoyanceLevel] = useState<number>(0);
  const [isBeingSquished, setIsBeingSquished] = useState<boolean>(false);
  const [transformationMode, setTransformationMode] = useState<'normal' | 'squished' | 'stretched' | 'bouncy' | 'grumpy'>('normal');
  const lastAnnoyanceDecayRef = useRef<number>(Date.now());
  const consciousnessActionsRef = useRef<ConsciousnessActions | null>(null);

  const [whisper, setWhisper] = useState<{ text: string; key: number }>({ text: 'The Guardian awakens...', key: 0 });
  const [aiFocus, setAiFocus] = useState<SigilPoint | null>(null);
  const [activatedPoints, setActivatedPoints] = useState<Set<number>>(new Set());
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [bondHistory, setBondHistory] = useState<BondHistoryEntry[]>([]);
  const [totalInteractions, setTotalInteractions] = useState<number>(0);
  const [dreamCount, setDreamCount] = useState<number>(0);
  const [gamesWon, setGamesWon] = useState<number>(0);
  const [createdAt] = useState<number>(() => Date.now());
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>(() => getTimeOfDay());

  const [currentGame, setCurrentGame] = useState<MiniGameType>(null);
  const [patternChallenge, setPatternChallenge] = useState<PatternChallenge>({ sequence: [], userSequence: [], active: false });
  const [triviaQuestion, setTriviaQuestion] = useState<TriviaQuestion | null>(null);
  const [audioScale, setAudioScale] = useState<ScaleName>('harmonic');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [offspring, setOffspring] = useState<Offspring[]>([]);
  const [breedingPartner, setBreedingPartner] = useState<string>('');

  const [masterVolume, setMasterVolume] = useState<number>(0.8);
  const [audioMuted, setAudioMuted] = useState<boolean>(true);
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [showDebugOverlay, setShowDebugOverlay] = useState<boolean>(false);
  const [dreamJournal, setDreamJournal] = useState<DreamInsightEntry[]>([]);
  const [unlockedLore, setUnlockedLore] = useState<string[]>([]);
  const [isDraggingSigil, setIsDraggingSigil] = useState<number | null>(null);
  const [aiConfig, setAiConfig] = useState<AIBehaviorConfig>(DEFAULT_AI_CONFIG);
  const [autoSelectScale, setAutoSelectScale] = useState<boolean>(true);
  const [showBreedingCenter, setShowBreedingCenter] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>('care');
  const [showFeaturesOverlay, setShowFeaturesOverlay] = useState<boolean>(false);

  // Celestial sprites state
  const [constellation, setConstellation] = useState<ConstellationName>('Orion');
  const [animationTime, setAnimationTime] = useState<number>(0);

  // Unique ID counter for particles to prevent duplicate keys
  const particleIdCounter = useRef<number>(0);
  const getUniqueParticleId = () => ++particleIdCounter.current;

  // Breathing animation - body scale oscillation (very visible for testing)
  const breathCycle = 2000; // 2 second cycle
  const breathScale = 1 + Math.sin(animationTime / breathCycle * Math.PI * 2) * 0.08; // 8% scale change - very visible

  // Eye micro-saccades - tiny involuntary eye movements
  const [microSaccade, setMicroSaccade] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastSaccadeTimeRef = useRef<number>(0);

  // Look-away behavior - pet occasionally looks elsewhere
  const [lookAwayTarget, setLookAwayTarget] = useState<{ x: number; y: number } | null>(null);
  const lastLookAwayTimeRef = useRef<number>(Date.now());
  const aiModeRef = useRef<string>('idle');
  const curiosityRef = useRef<number>(50);

  // Interaction blink trigger
  const [triggerBlink, setTriggerBlink] = useState<boolean>(false);

  // Pupil dilation for interactions
  const [pupilDilationBonus, setPupilDilationBonus] = useState<number>(0);

  const stats = useMemo(() => ({ energy, curiosity, bond, health }), [energy, curiosity, bond, health]);

  const effectiveScale = useMemo(() => {
    if (autoSelectScale) {
      return selectScaleFromStats(stats);
    }
    return audioScale;
  }, [autoSelectScale, stats, audioScale]);

  const { playNote, setVolume } = useAuraliaAudio(
    audioEnabled && !audioMuted && isVisible,
    stats,
    effectiveScale,
    { masterVolume, reverbMix: 0.2, attackTime: 0.05, releaseTime: 0.3, lfoRate: 0.5, lfoDepth: 0.1 }
  );

  // Visibility observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setIsVisible(entry.isIntersecting)),
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Reduce motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReduceMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Animation loop for celestial sprites
  useEffect(() => {
    if (reduceMotion) return;
    let animationFrameId: number;
    const animate = () => {
      setAnimationTime(prev => prev + 16); // ~60fps
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [reduceMotion]);

  // Annoyance decay
  useEffect(() => {
    const decayInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastAnnoyanceDecayRef.current > 1000) {
        setAnnoyanceLevel(prev => {
          const newLevel = Math.max(0, prev - 2);
          if (newLevel >= 80) setTransformationMode('grumpy');
          else if (newLevel >= 50) setTransformationMode('squished');
          else if (newLevel > 0) setTransformationMode('bouncy');
          else setTransformationMode('normal');
          return newLevel;
        });
        lastAnnoyanceDecayRef.current = now;
      }
      setOrbDeformation(prev => ({ x: prev.x * 0.9, y: prev.y * 0.9, intensity: prev.intensity * 0.95 }));
    }, 100);
    return () => clearInterval(decayInterval);
  }, []);

  const addToBondHistory = useCallback((event: string) => {
    setBondHistory(prev => [...prev.slice(-29), { timestamp: Date.now(), bond, event }]);
  }, [bond]);

  const handleWhisper = useCallback((text: string) => setWhisper({ text, key: Date.now() }), []);

  const handleAIPlay = useCallback((targetIndex: number) => {
    if (audioEnabled && !audioMuted) playNote(targetIndex, 0.6);
  }, [audioEnabled, audioMuted, playNote]);

  const handleSpontaneous = useCallback((behavior: SpontaneousBehavior) => {
    const centerX = 200, centerY = 210;
    const intensityMultiplier = behavior.intensity || 0.5;

    switch (behavior.type) {
      case 'pulse': {
        const rippleCount = Math.ceil(1 + (energy / 50) * intensityMultiplier);
        for (let i = 0; i < rippleCount; i++) {
          setTimeout(() => {
            setAuraRipples(prev => [...prev, { id: getUniqueParticleId(), x: centerX, y: centerY, radius: 15 + i * 10, life: 1, color: energy > 70 ? '#FFD700' : '#4ECDC4' }]);
          }, i * 150);
        }
        break;
      }
      case 'shimmer': {
        const sparkleCount = Math.ceil(5 + curiosity / 20);
        for (let i = 0; i < sparkleCount; i++) {
          const angle = (Math.PI * 2 * i) / sparkleCount;
          const radius = 80 + Math.random() * 40;
          setSigilPulses(prev => [...prev, { id: getUniqueParticleId(), x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius, life: 1, color: bond > 70 ? '#FFB6C1' : '#A29BFE' }]);
        }
        break;
      }
      case 'startle': {
        const burstCount = Math.ceil(6 + intensityMultiplier * 4);
        for (let i = 0; i < burstCount; i++) {
          const angle = (Math.PI * 2 * i) / burstCount;
          const distance = 50 + Math.random() * 30;
          setCrackles(prev => [...prev, { id: getUniqueParticleId(), x: centerX + Math.cos(angle) * distance, y: centerY + Math.sin(angle) * distance, life: 1 }]);
        }
        setAuraRipples(prev => [...prev, { id: getUniqueParticleId(), x: centerX, y: centerY, radius: 30, life: 1, color: '#FF6B35' }]);
        break;
      }
      case 'giggle': {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const randAngle = field.prng() * Math.PI * 2;
            const randRadius = 60 + field.prng() * 40;
            setSigilPulses(prev => [...prev, { id: getUniqueParticleId(), x: centerX + Math.cos(randAngle) * randRadius, y: centerY + Math.sin(randAngle) * randRadius, life: 1, color: '#FFB347' }]);
          }, i * 200);
        }
        break;
      }
      case 'stretch': {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            setAuraRipples(prev => [...prev, { id: getUniqueParticleId(), x: centerX, y: centerY, radius: 40 + i * 20, life: 1, color: '#4ECDC4' }]);
          }, i * 300);
        }
        break;
      }
      case 'sigh':
        setAuraRipples(prev => [...prev, { id: getUniqueParticleId(), x: centerX, y: centerY - 20, radius: 25, life: 1, color: '#6B7280' }]);
        break;
    }

    if (audioEnabled && !audioMuted) {
      if (behavior.type === 'giggle') [2, 4, 6].forEach((note, i) => setTimeout(() => playNote(note, 0.25), i * 100));
      else if (behavior.type === 'pulse' && energy > 60) playNote(Math.floor(field.prng() * 7), 0.35);
      else if (behavior.type === 'startle') playNote(0, 0.5);
      else if (behavior.type === 'shimmer' && bond > 60) [1, 3, 5, 7].forEach((note, i) => setTimeout(() => playNote(note % 7, 0.15), i * 80));
    }
  }, [audioEnabled, audioMuted, playNote, field, energy, curiosity, bond]);

  // Load saved state
  useEffect(() => {
    const { data: saved, error } = loadGuardianState();
    if (error) {
      console.error('Failed to load Guardian state:', error);
    }
    if (!saved) return;

    // Safeguard required values in case older save data is missing fields
    setSeedName(saved.seedName || 'AURALIA');
    setEnergy(saved.energy);
    setCuriosity(saved.curiosity);
    setBond(saved.bond);
    setHealth(saved.health);
    setBondHistory(saved.bondHistory || []);
    setActivatedPoints(new Set(saved.activatedPoints || []));
    setTotalInteractions(saved.totalInteractions || 0);
    setDreamCount(saved.dreamCount || 0);
    setGamesWon(saved.gamesWon || 0);
    setHighContrast(saved.highContrast || false);
    setOffspring(saved.offspring || []);
    setBreedingPartner(saved.breedingPartner || '');

    if (saved.dreamJournal) setDreamJournal(saved.dreamJournal);
    if (saved.unlockedLore) setUnlockedLore(saved.unlockedLore);
    if (saved.accessibility) {
      setReduceMotion(saved.accessibility.reduceMotion);
      setHighContrast(saved.accessibility.highContrast);
      setAudioMuted(saved.accessibility.audioOffByDefault);
    }
    if (saved.audioSettings) {
      setMasterVolume(saved.audioSettings.masterVolume);
      setAudioMuted(saved.audioSettings.muted);
    }

    handleWhisper('Welcome back. The patterns remember you.');
  }, [handleWhisper]);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      const saveData: GuardianSaveData = {
        seedName, energy, curiosity, bond, health, bondHistory,
        activatedPoints: Array.from(activatedPoints), createdAt, lastSaved: Date.now(),
        totalInteractions, dreamCount, gamesWon, highContrast, offspring, breedingPartner,
        dreamJournal, unlockedLore,
        accessibility: { reduceMotion, highContrast, audioOffByDefault: audioMuted },
        audioSettings: { masterVolume, muted: audioMuted },
      };
      const { success, error } = saveGuardianState(saveData);
      if (!success && error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [seedName, energy, curiosity, bond, health, bondHistory, activatedPoints, createdAt, totalInteractions, dreamCount, gamesWon, highContrast, offspring, breedingPartner, dreamJournal, unlockedLore, reduceMotion, audioMuted, masterVolume]);

  // Update time of day
  useEffect(() => {
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setField(initField(seedName));
  }, [seedName]);

  const computeGenome = (): { red60: number; blue60: number; black60: number; } => {
    const pulseSum = field.pulse.slice(0, 20).reduce((a, b) => a + b, 0);
    const ringSum = field.ring.slice(0, 20).reduce((a, b) => a + b, 0);
    const red60 = Math.min(100, (pulseSum * 1.2 + energy * 0.7 + (100 - health) * 0.3) % 100);
    const blue60 = Math.min(100, (ringSum * 1.1 + curiosity * 0.6 + bond * 0.5) % 100);
    const black60 = Math.min(100, ((pulseSum + ringSum) * 0.8 + energy * 0.4 + bond * 0.6) % 100);
    return { red60, blue60, black60 };
  };

  const { red60, blue60, black60 } = computeGenome();

  const generateSigil = useCallback((seed: string): SigilPoint[] => {
    const h = field.hash(seed);
    const points: SigilPoint[] = [];
    const haloRadius = 140;
    for (let i = 0; i < 7; i++) {
      // Fixed circular halo arrangement
      const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
      const haloX = 200 + Math.cos(angle) * haloRadius;
      const haloY = 200 + Math.sin(angle) * haloRadius;
      points.push({
        x: haloX,
        y: haloY,
        hash: (h >> BigInt(i * 8)).toString(16).slice(0, 4),
        id: i,
        angle,
        radius: haloRadius
      });
    }
    return points;
  }, [field]);

  const sigilPoints = useMemo(() => generateSigil(seedName), [seedName, generateSigil]);

  const handleFocusChange = useCallback((id: number | null) => {
    setAiFocus(id !== null ? sigilPoints[id] : null);
  }, [sigilPoints]);

  const handleDreamComplete = useCallback((insight: string) => {
    const newDreamCount = dreamCount + 1;
    setDreamCount(newDreamCount);
    addToBondHistory(`Dream #${newDreamCount}: ${insight}`);
    const journalEntry: DreamInsightEntry = { timestamp: Date.now(), insight, energy, curiosity, bond, focusedSigils: Array.from(activatedPoints) };
    setDreamJournal(prev => [...prev, journalEntry]);
    const newLore = getUnlockedLore(newDreamCount);
    setUnlockedLore(newLore);
    consciousnessActionsRef.current?.recordAction('rest', 0.4);
  }, [dreamCount, addToBondHistory, energy, curiosity, bond, activatedPoints]);

  // Use refs for frequently changing values to prevent infinite re-render loop
  const statsRef = useRef(stats);
  const handleSpontaneousRef = useRef(handleSpontaneous);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { handleSpontaneousRef.current = handleSpontaneous; }, [handleSpontaneous]);

  // Memoize AI options with stable references
  const aiOptions = useMemo(() => ({
    config: aiConfig,
    get stats() { return statsRef.current; },
    onPlay: handleAIPlay,
    onSpontaneous: (behavior: SpontaneousBehavior) => handleSpontaneousRef.current(behavior),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [aiConfig, handleAIPlay]);

  const aiState = useGuardianAI(field, sigilPoints, handleWhisper, handleFocusChange, handleDreamComplete, aiOptions);

  const personalityTraits = useMemo(
    () => deriveTraitsFromCurrentState(stats, field, seedName),
    [stats, field, seedName]
  );

  const [consciousness, consciousnessActions] = useConsciousness({
    traits: personalityTraits,
    vitals: stats,
    field,
    position: aiState.position,
    fieldResonance: aiState.fieldResonance ?? 0,
    mode: aiState.mode,
  });

  // Keep ref updated for callbacks defined before useConsciousness
  consciousnessActionsRef.current = consciousnessActions;

  const particleParams = useMemo(
    () => consciousnessActions.getParticleParams(),
    [consciousnessActions, consciousness.expression]
  );

  useEffect(() => {
    const prng = field.prng ?? Math.random;
    const interval = setInterval(() => {
      const idleResponse = getEmotionalIdleResponse(
        consciousness.expression.emotional,
        consciousness.expression.comfort,
        consciousness.expression.drives,
        consciousness.identity.traits,
        prng
      );
      handleWhisper(idleResponse.text);
    }, 30000);
    return () => clearInterval(interval);
  }, [consciousness.expression, consciousness.identity.traits, field, handleWhisper]);

  const handleInteractionReaction = useCallback((response: InteractionResponse) => {
    const { reaction } = response;
    if (!reaction) return;

    // Interaction blink - trigger blink on startle or poke
    if (reaction.type === 'startle' || response.type === 'poke') {
      setTriggerBlink(true);
    }

    // Pupil dilation based on reaction type
    if (reaction.type === 'delight' || reaction.type === 'excitement') {
      // Dilate pupils on positive reactions (+1-2px)
      setPupilDilationBonus(1.5 * reaction.intensity);
    } else if (reaction.type === 'fear' || reaction.type === 'startle') {
      // Constrict pupils on fear/startle (-1-2px)
      setPupilDilationBonus(-1.5 * reaction.intensity);
    }

    if (reaction.type === 'annoy' || reaction.type === 'fear') {
      setAnnoyanceLevel(prev => Math.min(100, prev + 15 * reaction.intensity));
      setOrbDeformation({ x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 20, intensity: reaction.intensity });
      setIsBeingSquished(true);
      setTimeout(() => setIsBeingSquished(false), 500);
      if (annoyanceLevel > 60) {
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            setCrackles(prev => [...prev, { id: getUniqueParticleId(), x: 200 + (Math.random() - 0.5) * 60, y: 210 + (Math.random() - 0.5) * 60, life: 0.8 }]);
          }, i * 50);
        }
      }
    } else if (reaction.type === 'delight' || reaction.type === 'excitement') {
      setAnnoyanceLevel(prev => Math.max(0, prev - 5));
      setOrbDeformation({ x: 0, y: -10 * reaction.intensity, intensity: reaction.intensity * 0.5 });
    } else if (reaction.type === 'startle') {
      setAnnoyanceLevel(prev => Math.min(100, prev + 5));
    }
    if (reaction) {
      switch (reaction.visualEffect) {
        case 'bloom':
        case 'glow':
          setAuraRipples(prev => [...prev, { id: getUniqueParticleId(), x: aiState.position.x * 400, y: aiState.position.y * 400, radius: 20, life: 1, color: '#f472b6' }]);
          break;
        case 'shimmer':
        case 'flicker':
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              setSigilPulses(prev => [...prev, { id: getUniqueParticleId(), x: aiState.position.x * 400 + (Math.random() - 0.5) * 30, y: aiState.position.y * 400 + (Math.random() - 0.5) * 30, life: 1, color: '#22d3ee' }]);
            }, i * 100);
          }
          break;
        case 'spiral':
        case 'wave':
          setAuraRipples(prev => [...prev, { id: getUniqueParticleId(), x: aiState.position.x * 400, y: aiState.position.y * 400, radius: 10, life: 1, color: '#f4b942' }]);
          break;
        case 'contract':
          setSigilPulses(prev => [...prev, { id: getUniqueParticleId(), x: aiState.position.x * 400, y: aiState.position.y * 400, life: 0.5, color: '#64748b' }]);
          break;
        case 'fragment':
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            setCrackles(prev => [...prev, { id: getUniqueParticleId(), x: aiState.position.x * 400 + Math.cos(angle) * 20, y: aiState.position.y * 400 + Math.sin(angle) * 20, life: 1 }]);
          }
          break;
      }
    }

    const impact = reaction.type === 'annoy' || reaction.type === 'fear' ? -0.6 : 0.8;
    const prng = field.prng ?? Math.random;
    consciousnessActions.recordAction(response.type as ActionType, impact);
    const emotionalResponse = getEmotionalResponse(
      response.type as ActionType,
      consciousness.expression.emotional,
      consciousness.identity.traits,
      consciousness.expression.comfort,
      prng
    );
    handleWhisper(emotionalResponse.text);
  }, [aiState.position, annoyanceLevel, field, consciousnessActions, consciousness.expression, consciousness.identity.traits, handleWhisper]);

  const handleInteractionStatChange = useCallback((changes: Partial<typeof stats>) => {
    if (changes.energy !== undefined) setEnergy(e => Math.max(0, Math.min(100, e + changes.energy!)));
    if (changes.curiosity !== undefined) setCuriosity(c => Math.max(0, Math.min(100, c + changes.curiosity!)));
    if (changes.bond !== undefined) {
      setBond(b => {
        const newBond = Math.max(0, Math.min(100, b + changes.bond!));
        if (changes.bond! > 0) setBondHistory(prev => [...prev.slice(-50), { timestamp: Date.now(), bond: newBond, event: 'Interaction' }]);
        return newBond;
      });
    }
  }, []);

  const interaction = useGuardianInteraction(aiState, stats, field, {
    onReaction: handleInteractionReaction, onWhisper: handleWhisper, onStatChange: handleInteractionStatChange,
  });

  const [timeInState, setTimeInState] = useState(0);
  useEffect(() => {
    const updateTime = () => setTimeInState(Math.floor((Date.now() - aiState.since) / 1000));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [aiState.since]);

  const interactionRef = useRef<{
    isDown: boolean; startPos: { x: number; y: number } | null; lastPos: { x: number; y: number } | null;
    lastTime: number; velocity: { vx: number; vy: number }; moveHistory: Array<{ x: number; y: number; t: number }>;
  }>({ isDown: false, startPos: null, lastPos: null, lastTime: 0, velocity: { vx: 0, vy: 0 }, moveHistory: [] });

  const lastPetTimeRef = useRef(0);
  const lastShakeTimeRef = useRef(0);
  const lastDragTimeRef = useRef(0);

  const handleOrbMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else if ('clientX' in e) { clientX = e.clientX; clientY = e.clientY; }
    else return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    interactionRef.current = { isDown: true, startPos: { x, y }, lastPos: { x, y }, lastTime: Date.now(), velocity: { vx: 0, vy: 0 }, moveHistory: [{ x, y, t: Date.now() }] };
    interaction.handleGrab({ x, y });
  }, [interaction]);

  const handleOrbMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!interactionRef.current.isDown) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else if ('clientX' in e) { clientX = e.clientX; clientY = e.clientY; }
    else return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const now = Date.now();
    const { lastPos, lastTime, moveHistory } = interactionRef.current;
    if (lastPos && now - lastTime > 10) {
      const dt = Math.max(0.01, (now - lastTime) / 1000);
      const vx = (x - lastPos.x) / dt;
      const vy = (y - lastPos.y) / dt;
      interactionRef.current.velocity = { vx, vy };
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > 0.1 && speed < 2.5 && Math.abs(vx) > Math.abs(vy) * 1.5) {
        if (now - lastPetTimeRef.current > 200) { interaction.handlePet({ x, y }, Math.min(1, speed / 2)); lastPetTimeRef.current = now; }
      }
      if (moveHistory.length >= 5 && now - lastShakeTimeRef.current > 300) {
        const recentMoves = moveHistory.slice(-5);
        let directionChanges = 0;
        for (let i = 2; i < recentMoves.length; i++) {
          const dx1 = recentMoves[i - 1].x - recentMoves[i - 2].x;
          const dx2 = recentMoves[i].x - recentMoves[i - 1].x;
          if (dx1 * dx2 < -0.0001) directionChanges++;
        }
        if (directionChanges >= 2 && speed > 4) { interaction.handleShake(Math.min(1, speed / 6)); lastShakeTimeRef.current = now; }
      }
      if (speed > 0.8 && now - lastDragTimeRef.current > 100) { interaction.handleDrag({ x, y }, { vx: vx * 0.01, vy: vy * 0.01 }); lastDragTimeRef.current = now; }
    }
    interactionRef.current.lastPos = { x, y };
    interactionRef.current.lastTime = now;
    interactionRef.current.moveHistory = [...moveHistory.slice(-10), { x, y, t: now }];
  }, [interaction]);

  const handleOrbMouseUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!interactionRef.current.isDown) return;
    const { startPos, lastPos, velocity } = interactionRef.current;
    const holdDuration = Date.now() - (interactionRef.current.moveHistory[0]?.t ?? Date.now());
    const speed = Math.sqrt(velocity.vx ** 2 + velocity.vy ** 2);
    if (holdDuration < 200 && startPos && lastPos) {
      const dist = Math.sqrt((lastPos.x - startPos.x) ** 2 + (lastPos.y - startPos.y) ** 2);
      if (dist < 0.05) interaction.handlePoke(lastPos);
    }
    if (speed > 1.5) interaction.handleRelease({ vx: velocity.vx * 0.015, vy: velocity.vy * 0.015 });
    else interaction.handleRelease();
    interactionRef.current.isDown = false;
    interactionRef.current.startPos = null;
    interactionRef.current.moveHistory = [];
  }, [interaction]);

  const tapCountRef = useRef<{ count: number; lastTap: number }>({ count: 0, lastTap: 0 });
  const handleOrbClick = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    if (now - tapCountRef.current.lastTap < 350) {
      tapCountRef.current.count++;
      if (tapCountRef.current.count >= 3) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        interaction.handleTickle({ x, y });
        tapCountRef.current.count = 0;
      }
    } else tapCountRef.current.count = 1;
    tapCountRef.current.lastTap = now;
  }, [interaction]);

  // Animation loop
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      if (!reduceMotion && isVisible) {
        if (Math.random() < 0.02 * (energy / 50)) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 100 + Math.random() * 50;
          setCrackles(prev => [...prev, { id: getUniqueParticleId(), x: 200 + Math.cos(angle) * radius, y: 210 + Math.sin(angle) * radius, life: 1 }]);
        }
        setCrackles(prev => prev.map(c => ({ ...c, life: c.life - 0.05 })).filter(c => c.life > 0));
        setSigilPulses(prev => prev.map(p => ({ ...p, life: p.life - 0.04 })).filter(p => p.life > 0));
        setAuraRipples(prev => prev.map(r => ({ ...r, radius: r.radius + 2.2, life: r.life - 0.025 })).filter(r => r.life > 0.05).slice(-40));
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [energy, reduceMotion, isVisible]);

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      blinkTimeout = setTimeout(blink, 3000 + Math.random() * 5000);
    };
    blinkTimeout = setTimeout(blink, 3000 + Math.random() * 5000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Trigger blink on interaction (will reset after 150ms)
  useEffect(() => {
    if (triggerBlink) {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        setTriggerBlink(false);
      }, 150);
    }
  }, [triggerBlink]);

  // Micro-saccades - tiny involuntary eye movements every 100-300ms
  useEffect(() => {
    if (reduceMotion) return;
    const saccadeInterval = setInterval(() => {
      const now = Date.now();
      // Generate saccades more frequently (always, not just when at rest)
      // This creates constant subtle eye movement
      if (now - lastSaccadeTimeRef.current > 100 + Math.random() * 200) {
        setMicroSaccade({
          x: (Math.random() - 0.5) * 2.0, // Increased from 1.2 to 2.0
          y: (Math.random() - 0.5) * 1.5  // Increased from 0.8 to 1.5
        });
        lastSaccadeTimeRef.current = now;
      }
    }, 80);
    return () => clearInterval(saccadeInterval);
  }, [reduceMotion]);

  // Sync refs for look-away behavior to avoid dependency issues
  useEffect(() => {
    aiModeRef.current = aiState.mode;
  }, [aiState.mode]);

  useEffect(() => {
    curiosityRef.current = curiosity;
  }, [curiosity]);

  // Look-away behavior - pet occasionally looks at random point (more frequent for testing)
  useEffect(() => {
    if (reduceMotion) return;
    let isActive = true;

    const lookAwayInterval = setInterval(() => {
      if (!isActive) return;
      const now = Date.now();
      const timeSinceLastLookAway = now - lastLookAwayTimeRef.current;
      // Look away every 3-6 seconds for more noticeable effect
      const lookAwayChance = 3000 + Math.random() * 3000;

      // Use refs to check conditions without adding dependencies
      if (timeSinceLastLookAway > lookAwayChance) {
        // Pick a random direction to look
        const angle = Math.random() * Math.PI * 2;
        const distance = 4 + Math.random() * 3; // Increased distance
        setLookAwayTarget({
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance
        });
        lastLookAwayTimeRef.current = now;

        // Return to normal after 0.8-2 seconds
        setTimeout(() => {
          if (isActive) {
            setLookAwayTarget(null);
          }
        }, 800 + Math.random() * 1200);
      }
    }, 500); // Check more frequently

    return () => {
      isActive = false;
      clearInterval(lookAwayInterval);
    };
  }, [reduceMotion]);

  // Pupil dilation decay - runs continuously, checks value via ref
  const pupilDilationRef = useRef<number>(0);
  useEffect(() => {
    pupilDilationRef.current = pupilDilationBonus;
  }, [pupilDilationBonus]);

  useEffect(() => {
    const decayInterval = setInterval(() => {
      if (pupilDilationRef.current !== 0) {
        setPupilDilationBonus(prev => {
          if (prev === 0) return 0;
          const decay = prev > 0 ? -0.3 : 0.3;
          const newVal = prev + decay;
          // Return to 0 when close enough
          if (Math.abs(newVal) < 0.3) return 0;
          return newVal;
        });
      }
    }, 50);
    return () => clearInterval(decayInterval);
  }, []); // No dependencies - runs once on mount

  const getActiveForm = (): FormKey => {
    if (energy < 30 && health < 50) return 'meditation';
    if (bond > 80 && dreamCount > 3) return 'celestial';
    if (energy > 80 && curiosity > 70 && activatedPoints.size >= 5) return 'wild';
    if (energy > 70 && curiosity > 60) return 'vigilant';
    if (bond > 60 && curiosity > 50) return 'sage';
    return 'radiant';
  };

  const activeForm = getActiveForm();

  useEffect(() => {
    if (prevFormRef.current !== activeForm) {
      setTransitioning(true);
      setConstellation(formToConstellation(activeForm));
      if (audioEnabled) [0, 2, 4, 6].forEach((note, i) => setTimeout(() => playNote(note, 0.8), i * 100));
      const transitionTimeout = setTimeout(() => setTransitioning(false), 1200);
      prevFormRef.current = activeForm;
      return () => clearTimeout(transitionTimeout);
    }
  }, [activeForm, audioEnabled, playNote]);

  useEffect(() => {
    let newTarget = { x: 0, y: 0 };
    if (aiState.mode === 'observing') {
      const angle = (Date.now() / 2000) * Math.PI * 2;
      newTarget = { x: Math.cos(angle) * 4, y: Math.sin(angle) * 2 };
    } else if (aiFocus) {
      const dx = aiFocus.x - 200;
      const dy = aiFocus.y - 145;
      const dist = Math.sqrt(dx * dx + dy * dy);
      newTarget = { x: (dx / dist) * 4, y: (dy / dist) * 4 };
    } else if (lookAwayTarget) {
      // Pet is looking at a random point (awareness behavior)
      newTarget = lookAwayTarget;
    } else if (aiState.mode === 'idle') {
      newTarget = { x: 0, y: 0 };
    }
    setEyeTarget(newTarget);
    eyeTargetRef.current = newTarget;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiState.mode, aiFocus, lookAwayTarget]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return;
    const { x, y } = pt.matrixTransform(screenCTM.inverse());
    const dx = x - 200;
    const dy = y - 145;
    const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
    const maxDist = 4;
    if (activeForm !== 'meditation' && aiState.mode === 'idle') {
      const newTarget = { x: (dx / dist) * Math.min(dist, maxDist), y: (dy / dist) * Math.min(dist, maxDist) };
      setEyeTarget(newTarget);
      eyeTargetRef.current = newTarget; // Sync ref for micro-saccades check
    }
    const hover = Math.max(0, 1 - Math.min(1, dist / 180));
    setHoverIntensity(hover);
  };

  const spawnRipple = (x: number, y: number, color: string) => {
    setAuraRipples((prev) => [...prev.slice(-30), { id: getUniqueParticleId(), x, y, radius: 6, life: 1, color }]);
  };

  const handleSigilHover = useCallback((index: number | null, point?: SigilPoint) => {
    setHoveredSigilIndex(index);
    if (index !== null && point) {
      if (audioEnabled && !audioMuted) playNote(index, 0.15);
      const hoverWhispers = [`Point ${index + 1} hums gently...`, `The ${index + 1}th node resonates...`, `Attention drawn to sigil ${index + 1}...`];
      handleWhisper(hoverWhispers[index % hoverWhispers.length]);
    }
  }, [audioEnabled, audioMuted, playNote, handleWhisper]);

  const handleSigilDragStart = useCallback((index: number) => {
    setIsDraggingSigil(index);
    if (audioEnabled && !audioMuted) playNote(index, 0.3);
    handleWhisper(`Grasping sigil ${index + 1}...`);
  }, [audioEnabled, audioMuted, playNote, handleWhisper]);

  const handleSigilDragEnd = useCallback(() => {
    if (isDraggingSigil !== null) {
      if (audioEnabled && !audioMuted) playNote(isDraggingSigil, 0.2);
      handleWhisper(`Released sigil ${isDraggingSigil + 1}.`);
      setIsDraggingSigil(null);
    }
  }, [isDraggingSigil, audioEnabled, audioMuted, playNote, handleWhisper]);

  const handleSigilClick = (index: number, point: SigilPoint) => {
    setSelectedSigilPoint(index);
    if (audioEnabled && !audioMuted) playNote(index);
    setSigilPulses(prev => [...prev, { id: getUniqueParticleId(), x: point.x, y: point.y, life: 1, color: currentForm.tealAccent }]);
    setTotalInteractions(prev => prev + 1);
    const dx = point.x - 200;
    const dy = point.y - 145;
    const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
    setEyeTarget({ x: (dx / dist) * Math.min(dist, 6), y: (dy / dist) * Math.min(dist, 6) });
    setTimeout(() => { if (aiState.mode === 'idle') setEyeTarget({ x: 0, y: 0 }); }, 300);

    if (patternChallenge.active) {
      const newUserSequence = [...patternChallenge.userSequence, index];
      setPatternChallenge(prev => ({ ...prev, userSequence: newUserSequence }));
      if (newUserSequence.length === patternChallenge.sequence.length) {
        const success = newUserSequence.every((v, i) => v === patternChallenge.sequence[i]);
        if (success) {
          setBond(b => Math.min(100, b + 10));
          setCuriosity(c => Math.min(100, c + 5));
          setGamesWon(prev => prev + 1);
          addToBondHistory(`Won pattern game! Sequence: ${patternChallenge.sequence.map(i => i + 1).join(', ')}`);
          handleWhisper("Perfect resonance! The pattern is revealed.");
        } else handleWhisper("The pattern eludes you... Try again.");
        setPatternChallenge({ sequence: [], userSequence: [], active: false });
        setCurrentGame(null);
      }
      return;
    }

    if (!activatedPoints.has(index)) {
      setBond(b => Math.min(100, b + 5));
      setActivatedPoints(prev => new Set(prev).add(index));
      addToBondHistory(`Activated sigil point ${index + 1}`);
      handleWhisper("A new connection forms.");
    } else addToBondHistory(`Resonated with sigil point ${index + 1}`);
  };

  const handleAvatarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 400;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    spawnRipple(x, y, currentForm.tealAccent);
    setHoverIntensity(1);
    setBond((b) => Math.min(100, b + 1.5));
    setCuriosity((c) => Math.min(100, c + 1));
    setEnergy((en) => Math.min(100, en + 0.5));
    setTotalInteractions((prev) => prev + 1);
    consciousnessActions.recordAction('pet', 0.4);
    if (audioEnabled) playNote(Math.floor((x / 400) * 7), 0.35);
  };

  const handleAvatarPointerUp = () => setHoverIntensity((h) => Math.max(0.15, h * 0.6));

  const handlePanelChange = (panel: ActivePanel) => {
    setActivePanel(panel);
  };

  const startPatternGame = () => {
    const length = 3 + Math.floor(field.prng() * 3);
    const sequence: number[] = [];
    for (let i = 0; i < length; i++) sequence.push(Math.floor(field.prng() * 7));
    setPatternChallenge({ sequence, userSequence: [], active: true });
    setCurrentGame('sigilPattern');
    handleWhisper(`Memorize this pattern: ${sequence.map(i => i + 1).join(' -> ')}`);
    consciousnessActions.recordAction('game', 0.3);
    if (audioEnabled) sequence.forEach((note, i) => setTimeout(() => playNote(note, 0.5), i * 600));
  };

  const startTriviaGame = () => {
    const question = generateFibonacciTrivia(field);
    setTriviaQuestion(question);
    setCurrentGame('fibonacciTrivia');
    handleWhisper(question.question);
    consciousnessActions.recordAction('game', 0.3);
  };

  const answerTrivia = (answer: number) => {
    if (!triviaQuestion) return;
    if (answer === triviaQuestion.answer) {
      setBond(b => Math.min(100, b + 8));
      setCuriosity(c => Math.min(100, c + 12));
      setGamesWon(prev => prev + 1);
      addToBondHistory(`Answered trivia correctly: ${triviaQuestion.answer}`);
      const response = getEmotionalResponse(
        'game',
        consciousness.expression.emotional,
        consciousness.identity.traits,
        consciousness.expression.comfort,
        field.prng ?? Math.random
      );
      handleWhisper(response.text);
      consciousnessActions.recordAction('game', 0.8);
      if (audioEnabled) [0, 2, 4].forEach((note, i) => setTimeout(() => playNote(note, 0.3), i * 150));
    } else {
      handleWhisper(`Not quite. The answer was ${triviaQuestion.answer}.`);
      consciousnessActions.recordAction('game', -0.2);
    }
    setTriviaQuestion(null);
    setCurrentGame(null);
  };

  const startSnakeGame = useCallback(() => {
    setCurrentGame('snake');
    const response = getEmotionalResponse(
      'game',
      consciousness.expression.emotional,
      consciousness.identity.traits,
      consciousness.expression.comfort,
      field.prng ?? Math.random
    );
    handleWhisper(response.text);
    consciousnessActions.recordAction('game', 0.3);
  }, [consciousness.expression, consciousness.identity.traits, consciousnessActions, field, handleWhisper]);

  const startTetrisGame = useCallback(() => {
    setCurrentGame('tetris');
    const response = getEmotionalResponse(
      'game',
      consciousness.expression.emotional,
      consciousness.identity.traits,
      consciousness.expression.comfort,
      field.prng ?? Math.random
    );
    handleWhisper(response.text);
    consciousnessActions.recordAction('game', 0.3);
  }, [consciousness.expression, consciousness.identity.traits, consciousnessActions, field, handleWhisper]);
  const closeCurrentGame = useCallback(() => setCurrentGame(null), []);

  const handleSnakeWin = useCallback((score: number) => {
    setBond((b) => Math.min(100, b + 15));
    setEnergy((e) => Math.min(100, e + 10));
    setGamesWon((g) => g + 1);
    addToBondHistory(`Won Snake game with score ${score}!`);
    consciousnessActions.recordAction('game', 0.9);
  }, [addToBondHistory, consciousnessActions]);

  const handleTetrisWin = useCallback((score: number) => {
    setBond((b) => Math.min(100, b + 20));
    setCuriosity((c) => Math.min(100, c + 15));
    setGamesWon((g) => g + 1);
    addToBondHistory(`Won Tetris game with score ${score}!`);
    consciousnessActions.recordAction('game', 0.9);
  }, [addToBondHistory, consciousnessActions]);

  const handleBreed = (customChild?: Offspring) => {
    if (customChild) {
      setOffspring(prev => [...prev, customChild]);
      setBond(b => Math.min(100, b + 25));
      setCuriosity(c => Math.min(100, c + 20));
      setEnergy(e => Math.max(0, e - 50));
      addToBondHistory(`Bred new Guardian: ${customChild.name}`);
      handleWhisper(`New Guardian born: ${customChild.name}! The lineage continues.`);
      setShowBreedingCenter(false);
      if (audioEnabled) [0, 2, 4, 5, 7].forEach((note, i) => setTimeout(() => playNote(note, 0.5), i * 200));
      return;
    }
    if (!breedingPartner || bond < 70) {
      handleWhisper('Bond must be at least 70 to breed, and you need a partner name.');
      return;
    }
    const partnerField = initField(breedingPartner);
    const partnerGenome = {
      red60: Math.min(100, (partnerField.pulse.slice(0, 20).reduce((a, b) => a + b, 0) * 1.5) % 100),
      blue60: Math.min(100, (partnerField.ring.slice(0, 20).reduce((a, b) => a + b, 0) * 1.3) % 100),
      black60: Math.min(100, ((partnerField.pulse.slice(0, 10).reduce((a, b) => a + b, 0) + partnerField.ring.slice(0, 10).reduce((a, b) => a + b, 0)) * 1.1) % 100)
    };
    const child = breed(seedName, { red60, blue60, black60 }, breedingPartner, partnerGenome, field.prng);
    setOffspring(prev => [...prev, child]);
    setBond(b => Math.min(100, b + 25));
    setCuriosity(c => Math.min(100, c + 20));
    setEnergy(e => Math.max(0, e - 50));
    addToBondHistory(`Bred new Guardian: ${child.name}`);
    handleWhisper(`New Guardian born: ${child.name}! The lineage continues.`);
    if (audioEnabled) [0, 2, 4, 5, 7].forEach((note, i) => setTimeout(() => playNote(note, 0.5), i * 200));
  };

  const switchToOffspring = (child: Offspring) => {
    setSeedName(child.name);
    setEnergy(100);
    setCuriosity(30);
    setBond(10);
    setHealth(100);
    setActivatedPoints(new Set());
    setDreamCount(0);
    setGamesWon(0);
    addToBondHistory(`Switched to new Guardian: ${child.name}`);
    handleWhisper(`You are now guiding ${child.name}. A new journey begins.`);
  };

  const currentForm = forms[activeForm];
  const timeTheme = getTimeTheme(timeOfDay);

  const eyeState = useMemo<EyeState>(() => {
    return calculateEyeState(
      { energy, curiosity, bond, health },
      { activeForm, annoyanceLevel, transformationMode, aiState, currentGame, isBlinking, recentEvents: [] },
      currentForm.eyeColor
    );
  }, [energy, curiosity, bond, health, activeForm, annoyanceLevel, transformationMode, aiState, currentGame, isBlinking, currentForm.eyeColor]);

  useEffect(() => {
    let rafId: number;
    let lastTime = Date.now();
    const updatePhysics = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      setEyePos(currentPos => {
        const currentVel = eyeVelocityRef.current;
        const stiffness = eyeState.trackingSpeed * 18; // Slightly higher for snappier response
        // Lower damping allows for natural overshoot and settle (under-damped spring)
        const damping = 5.5;
        const dx = eyeTarget.x - currentPos.x;
        const dy = eyeTarget.y - currentPos.y;
        const ax = dx * stiffness - currentVel.x * damping;
        const ay = dy * stiffness - currentVel.y * damping;
        const newVelX = currentVel.x + ax * dt;
        const newVelY = currentVel.y + ay * dt;
        eyeVelocityRef.current = { x: newVelX, y: newVelY };
        return { x: currentPos.x + newVelX * dt, y: currentPos.y + newVelY * dt };
      });
      rafId = requestAnimationFrame(updatePhysics);
    };
    rafId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(rafId);
  }, [eyeTarget, eyeState.trackingSpeed]);

  useEffect(() => {
    const targetSize = eyeState.pupilSize;
    let rafId: number;
    const startTime = Date.now();
    const duration = eyeState.emotion === 'surprised' || eyeState.emotion === 'scared' ? 200 : 500;
    const startSize = pupilSize;
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const newSize = startSize + (targetSize - startSize) * eased;
      setPupilSize(newSize);
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eyeState.pupilSize, eyeState.emotion]);

  // Genome digits for JewbleRing
  const genomeDigits = useMemo(() => ({
    red: toDigits(field.red),
    black: toDigits(field.black),
    blue: toDigits(field.blue),
  }), [field.red, field.black, field.blue]);

  // ===== RENDER =====
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${highContrast ? 'high-contrast' : ''}`}
      style={{ background: timeTheme.bg, transition: 'background 1s' }}
      onPointerMove={handlePointerMove}
    >
      {/* Background effects */}
      <YantraMorphBackdrop energy={energy} curiosity={curiosity} bond={bond} reduceMotion={reduceMotion} isVisible={isVisible} />

      {/* Main Layout Grid */}
      <div className="relative z-10 w-full h-full grid grid-cols-[1fr_auto_1fr] grid-rows-[auto_1fr_auto] gap-4 p-4">

        {/* Top Left - Stats Panel */}
        <div className="col-start-1 row-start-1 flex flex-col gap-2">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 shadow-lg">
            <h2 className="text-lg font-bold mb-2" style={{ color: currentForm.primaryGold }}>{seedName}</h2>
            <div className="text-sm mb-2" style={{ color: currentForm.secondaryGold }}>{currentForm.name}</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <StatBar label="Energy" value={energy} color="#FFD700" />
              <StatBar label="Curiosity" value={curiosity} color="#4ECDC4" />
              <StatBar label="Bond" value={bond} color="#FFB347" />
              <StatBar label="Health" value={health} color="#A29BFE" />
            </div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 shadow-lg">
            <div className="text-sm font-semibold text-slate-200 mb-2">Consciousness</div>
            <div className="text-xs text-slate-400">Feeling: <span className="font-semibold" style={{ color: currentForm.primaryGold }}>{consciousness.expression.emotional}</span></div>
            <div className="text-xs text-slate-400 mt-1">Comfort: {Math.round(consciousness.expression.comfort.overall)} / 100</div>
            <div className="text-xs text-slate-400 mt-1">Temperament: {consciousness.identity.essence}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {consciousness.expression.comfort.unmetNeeds.length === 0 ? (
                <span className="text-[10px] text-slate-500 px-2 py-1 rounded-full bg-slate-800/70 border border-slate-700/60">balanced</span>
              ) : (
                consciousness.expression.comfort.unmetNeeds.map((need) => (
                  <span key={need} className="text-[10px] text-amber-200 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/40">
                    needs {need}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Center - Empty or Title */}
        <div className="col-start-2 row-start-1" />

        {/* Top Right - Controls */}
        <div className="col-start-3 row-start-1 flex justify-end">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-3 shadow-lg flex gap-2 flex-wrap justify-end">
            <button onClick={() => setAudioEnabled(a => !a)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${audioEnabled ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
              {audioEnabled ? 'Sound On' : 'Sound Off'}
            </button>
            <button onClick={() => setHighContrast(h => !h)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${highContrast ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
              Contrast
            </button>
            <button onClick={() => setShowDebugOverlay(d => !d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${showDebugOverlay ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
              Debug
            </button>
          </div>
        </div>

        {/* Left Side - Genome Jewble Ring */}
        <div className="col-start-1 row-start-2 flex items-center justify-center">
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-4 shadow-xl">
            <GenomeJewbleRing
              redDigits={genomeDigits.red}
              blackDigits={genomeDigits.black}
              blueDigits={genomeDigits.blue}
              variant="clarity"
              showFrontier={true}
            />
            <div className="text-center mt-3 text-xs text-slate-400">Genome Ring</div>
          </div>
        </div>

        {/* Center - Main Pet Avatar */}
        <div className="col-start-2 row-start-2 flex items-center justify-center">
          <div
            className="relative cursor-pointer select-none"
            style={{ width: 400, height: 400, touchAction: 'none' }}
            onMouseDown={handleOrbMouseDown}
            onMouseMove={handleOrbMouseMove}
            onMouseUp={handleOrbMouseUp}
            onMouseLeave={handleOrbMouseUp}
            onTouchStart={handleOrbMouseDown}
            onTouchMove={handleOrbMouseMove}
            onTouchEnd={handleOrbMouseUp}
            onClick={handleOrbClick}
          >
            {/* Orb Background */}
            <div
              className="absolute inset-0 rounded-full transition-all duration-1000"
              style={{
                background: currentForm.baseColor,
                boxShadow: `0 0 80px 20px ${currentForm.glowColor}, inset 0 0 60px rgba(0,0,0,0.3)`,
                border: `4px solid ${currentForm.primaryGold}`,
                transform: `scale(${1 + orbDeformation.intensity * 0.1}) translateX(${orbDeformation.x}px) translateY(${orbDeformation.y}px)`,
              }}
            />

            {/* SVG Layer for Guardian Body and Eyes */}
            <svg
              ref={svgRef}
              width={400}
              height={400}
              className="absolute inset-0"
              style={{ pointerEvents: 'none' }}
            >
              <defs>
                {/* Gradient for guardian body */}
                <radialGradient id="guardianBodyGradient" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor={currentForm.primaryGold} stopOpacity="0.3" />
                  <stop offset="50%" stopColor={currentForm.baseColor} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={currentForm.baseColor} stopOpacity="1" />
                </radialGradient>
                {/* Glow filter */}
                <filter id="guardianGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Inner shadow */}
                <filter id="innerShadow">
                  <feOffset dx="0" dy="2" />
                  <feGaussianBlur stdDeviation="3" result="shadow" />
                  <feComposite in="SourceGraphic" in2="shadow" operator="over" />
                </filter>
              </defs>

              {/* Aura ripples */}
              {auraRipples.map(r => (
                <circle key={r.id} cx={r.x} cy={r.y} r={r.radius} fill="none" stroke={r.color} strokeWidth={2} opacity={r.life * 0.5} />
              ))}

              {/* Sigil pulses */}
              {sigilPulses.map(p => (
                <circle key={p.id} cx={p.x} cy={p.y} r={12 * p.life} fill={p.color} opacity={p.life * 0.5} />
              ))}

              {/* Crackles */}
              {crackles.map(c => (
                <circle key={c.id} cx={c.x} cy={c.y} r={6 * c.life} fill="#fff" opacity={c.life * 0.7} />
              ))}

              {/* Sri Yantra Sigil Halo - Clean circular arrangement (rendered behind guardian) */}
              <g opacity="0.8">
                {sigilPoints.map((pt, i) => {
                  const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
                  const haloRadius = 140;
                  const haloX = 200 + Math.cos(angle) * haloRadius;
                  const haloY = 200 + Math.sin(angle) * haloRadius;
                  const isActive = activatedPoints.has(i);
                  const isHovered = i === hoveredSigilIndex;

                  return (
                    <g key={i} style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
                      {/* Outer glow when active */}
                      {isActive && (
                        <circle
                          cx={haloX}
                          cy={haloY}
                          r={14}
                          fill={currentForm.primaryGold}
                          opacity={0.2}
                        />
                      )}
                      {/* Main sigil point */}
                      <circle
                        cx={haloX}
                        cy={haloY}
                        r={isActive ? 8 : 5}
                        fill={isActive ? currentForm.primaryGold : currentForm.tealAccent}
                        stroke={isHovered ? currentForm.primaryGold : 'transparent'}
                        strokeWidth={2}
                        opacity={isActive ? 1 : 0.5}
                        onPointerEnter={() => handleSigilHover(i, pt)}
                        onPointerLeave={() => handleSigilHover(null)}
                        onPointerDown={() => handleSigilDragStart(i)}
                        onPointerUp={handleSigilDragEnd}
                        onClick={() => handleSigilClick(i, pt)}
                      />
                      {/* Number overlay - only on hover or active */}
                      {(isHovered || isActive) && (
                        <text
                          x={haloX}
                          y={haloY + 3}
                          textAnchor="middle"
                          fontSize={9}
                          fill="#fff"
                          pointerEvents="none"
                          fontWeight={600}
                        >
                          {i + 1}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* GUARDIAN BODY - Celestial geometric design with body parts */}
              <g>
                {/* Calculate anchor positions for body parts */}
                {(() => {
                  const centerX = 200;
                  const centerY = 200;
                  const radiusX = 85;
                  const radiusY = 95;

                  // Calculate all anchor positions
                  const earLeftPos = getAnchorPosition(BODY_ANCHORS.ears.left, centerX, centerY, radiusX, radiusY);
                  const earRightPos = getAnchorPosition(BODY_ANCHORS.ears.right, centerX, centerY, radiusX, radiusY);
                  const limbFLPos = getAnchorPosition(BODY_ANCHORS.limbs.frontLeft, centerX, centerY, radiusX, radiusY);
                  const limbFRPos = getAnchorPosition(BODY_ANCHORS.limbs.frontRight, centerX, centerY, radiusX, radiusY);
                  const limbBLPos = getAnchorPosition(BODY_ANCHORS.limbs.backLeft, centerX, centerY, radiusX, radiusY);
                  const limbBRPos = getAnchorPosition(BODY_ANCHORS.limbs.backRight, centerX, centerY, radiusX, radiusY);
                  const tailPos = getAnchorPosition(BODY_ANCHORS.tail, centerX, centerY, radiusX, radiusY);

                  return (
                    <>
                      {/* Tail (behind body) */}
                      <Tail
                        style="constellation"
                        position={tailPos}
                        segments={8}
                        length={1}
                        flowIntensity={0.5}
                        form={currentForm}
                        energy={energy}
                        curiosity={curiosity}
                        bond={bond}
                        time={animationTime}
                      />

                      {/* Back limbs (behind body) */}
                      <Limbs
                        type="back-left"
                        position={limbBLPos}
                        segments={3}
                        length={1}
                        jointStyle="star"
                        animated={!reduceMotion}
                        form={currentForm}
                        energy={energy}
                        curiosity={curiosity}
                        sigilGlow={activatedPoints.has(5)}
                        time={animationTime}
                      />
                      <Limbs
                        type="back-right"
                        position={limbBRPos}
                        segments={3}
                        length={1}
                        jointStyle="star"
                        animated={!reduceMotion}
                        form={currentForm}
                        energy={energy}
                        curiosity={curiosity}
                        sigilGlow={activatedPoints.has(6)}
                        time={animationTime}
                      />

                      {/* Main body with breathing animation */}
                      <GuardianBody
                        centerX={centerX}
                        centerY={centerY}
                        radiusX={radiusX}
                        radiusY={radiusY}
                        form={currentForm}
                        annoyanceLevel={annoyanceLevel}
                        bond={bond}
                        orbDeformation={{
                          scaleX: (transformationMode === 'squished' ? 0.8 : transformationMode === 'stretched' ? 1.2 : 1) * (1 + (breathScale - 1) * 0.3), // Subtle horizontal
                          scaleY: (transformationMode === 'squished' ? 1.2 : transformationMode === 'stretched' ? 0.8 : 1) * breathScale, // Primary vertical breathing
                        }}
                      />

                      {/* Front limbs (in front of body) */}
                      <Limbs
                        type="front-left"
                        position={limbFLPos}
                        segments={3}
                        length={1}
                        jointStyle="star"
                        animated={!reduceMotion}
                        form={currentForm}
                        energy={energy}
                        curiosity={curiosity}
                        sigilGlow={activatedPoints.has(3)}
                        time={animationTime}
                      />
                      <Limbs
                        type="front-right"
                        position={limbFRPos}
                        segments={3}
                        length={1}
                        jointStyle="star"
                        animated={!reduceMotion}
                        form={currentForm}
                        energy={energy}
                        curiosity={curiosity}
                        sigilGlow={activatedPoints.has(4)}
                        time={animationTime}
                      />

                      {/* Ears (on top of body) */}
                      <Ears
                        shape="crescent-moon"
                        side="left"
                        position={earLeftPos}
                        size={1}
                        rotation={0}
                        form={currentForm}
                        curiosity={curiosity}
                        bond={bond}
                        animated={!reduceMotion}
                        time={animationTime}
                      />
                      <Ears
                        shape="crescent-moon"
                        side="right"
                        position={earRightPos}
                        size={1}
                        rotation={0}
                        form={currentForm}
                        curiosity={curiosity}
                        bond={bond}
                        animated={!reduceMotion}
                        time={animationTime}
                      />
                    </>
                  );
                })()}
              </g>

              {/* Eye system - positioned on face with micro-saccades */}
              <g>
                <EyeRenderer
                  eyeState={{
                    ...eyeState,
                    pupilSize: eyeState.pupilSize + pupilDilationBonus, // Apply interaction-based dilation
                  }}
                  eyePos={{
                    x: eyePos.x + microSaccade.x,
                    y: eyePos.y + microSaccade.y
                  }}
                  leftEyeCenter={{ x: 180, y: 175 }}
                  rightEyeCenter={{ x: 220, y: 175 }}
                  annoyanceLevel={annoyanceLevel}
                />
                <EyeEmotionFilters />
              </g>
            </svg>

            {/* Particle effects */}
            <SubAtomicParticleField
              energy={energy}
              curiosity={curiosity}
              bond={bond}
              size={400}
              reduceMotion={reduceMotion}
              isVisible={isVisible}
              {...particleParams}
            />
            <TemporalEchoTrail energy={energy} curiosity={curiosity} bond={bond} size={400} color={currentForm.primaryGold} reduceMotion={reduceMotion} isVisible={isVisible} />
          </div>
        </div>

        {/* Right Side - Care & Activities Panel */}
        <div className="col-start-3 row-start-2 flex items-center">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 shadow-lg max-w-xs w-full max-h-[500px] overflow-y-auto">
            {/* Panel Tabs */}
            <div className="flex gap-1 mb-4 border-b border-slate-700 pb-2">
              {(['care', 'games', 'lore', 'evolution', 'settings', 'features'] as const).map(panel => (
                <button
                  key={panel}
                  onClick={() => handlePanelChange(panel)}
                  className={`px-2 py-1.5 rounded-t text-xs font-medium transition ${activePanel === panel ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {panel.charAt(0).toUpperCase() + panel.slice(1)}
                </button>
              ))}
            </div>

            {/* Care Panel */}
            {activePanel === 'care' && (
              <div className="space-y-4">
                <HUD
                  onFeed={() => {
                    setHealth(h => Math.min(100, h + 15));
                    setEnergy(e => Math.min(100, e + 5));
                    const response = getEmotionalResponse(
                      'feed',
                      consciousness.expression.emotional,
                      consciousness.identity.traits,
                      consciousness.expression.comfort,
                      field.prng ?? Math.random
                    );
                    handleWhisper(response.text);
                    consciousnessActions.recordAction('feed', 0.8);
                    addToBondHistory('Fed guardian');
                    if (audioEnabled && !audioMuted) playNote(2, 0.4);
                  }}
                  onClean={() => {
                    setHealth(h => Math.min(100, h + 10));
                    setBond(b => Math.min(100, b + 3));
                    const response = getEmotionalResponse(
                      'clean',
                      consciousness.expression.emotional,
                      consciousness.identity.traits,
                      consciousness.expression.comfort,
                      field.prng ?? Math.random
                    );
                    handleWhisper(response.text);
                    consciousnessActions.recordAction('clean', 0.6);
                    addToBondHistory('Cleaned guardian');
                    if (audioEnabled && !audioMuted) playNote(4, 0.4);
                  }}
                  onPlay={() => {
                    setCuriosity(c => Math.min(100, c + 15));
                    setBond(b => Math.min(100, b + 8));
                    setEnergy(e => Math.max(0, e - 10));
                    const response = getEmotionalResponse(
                      'play',
                      consciousness.expression.emotional,
                      consciousness.identity.traits,
                      consciousness.expression.comfort,
                      field.prng ?? Math.random
                    );
                    handleWhisper(response.text);
                    consciousnessActions.recordAction('play', 0.9);
                    addToBondHistory('Played with guardian');
                    if (audioEnabled && !audioMuted) [0, 2, 4].forEach((n, i) => setTimeout(() => playNote(n, 0.3), i * 100));
                  }}
                  onSleep={() => {
                    setEnergy(e => Math.min(100, e + 25));
                    setHealth(h => Math.min(100, h + 5));
                    const response = getEmotionalResponse(
                      'rest',
                      consciousness.expression.emotional,
                      consciousness.identity.traits,
                      consciousness.expression.comfort,
                      field.prng ?? Math.random
                    );
                    handleWhisper(response.text);
                    consciousnessActions.recordAction('rest', 0.7);
                    addToBondHistory('Guardian rested');
                    if (audioEnabled && !audioMuted) playNote(0, 0.3);
                  }}
                />
                <div className="pt-2 border-t border-slate-700">
                  <div className="text-xs text-slate-500">Interactions: {totalInteractions}</div>
                  <div className="text-xs text-slate-500">Dreams: {dreamCount}</div>
                </div>
              </div>
            )}

            {/* Games Panel */}
            {activePanel === 'games' && (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-300 mb-2">Mini-Games</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={startPatternGame} className="px-3 py-2 bg-purple-600/80 hover:bg-purple-600 rounded-lg text-xs text-white transition">Pattern</button>
                  <button onClick={startTriviaGame} className="px-3 py-2 bg-cyan-600/80 hover:bg-cyan-600 rounded-lg text-xs text-white transition">Trivia</button>
                  <button onClick={startSnakeGame} className="px-3 py-2 bg-green-600/80 hover:bg-green-600 rounded-lg text-xs text-white transition">Snake</button>
                  <button onClick={startTetrisGame} className="px-3 py-2 bg-orange-600/80 hover:bg-orange-600 rounded-lg text-xs text-white transition">Tetris</button>
                </div>
                <button onClick={() => setShowBreedingCenter(b => !b)} className="w-full px-3 py-2 bg-pink-600/80 hover:bg-pink-600 rounded-lg text-xs text-white transition mt-2">
                  {showBreedingCenter ? 'Close Breeding' : 'Breeding Center'}
                </button>
                <div className="text-xs text-slate-500 mt-2">Games Won: {gamesWon}</div>
              </div>
            )}

            {/* Lore Panel */}
            {activePanel === 'lore' && (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-300">Dream Journal</div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {dreamJournal.length === 0 ? (
                    <div className="text-xs text-slate-500">No dreams recorded yet...</div>
                  ) : (
                    dreamJournal.slice(-5).map((entry) => (
                      <div key={entry.timestamp} className="text-xs text-slate-400 border-l-2 border-purple-500 pl-2">
                        {entry.insight}
                      </div>
                    ))
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-300 mt-4">Unlocked Lore</div>
                <div className="space-y-1">
                  {unlockedLore.length === 0 ? (
                    <div className="text-xs text-slate-500">Keep dreaming to unlock lore...</div>
                  ) : (
                    unlockedLore.map((lore, i) => (
                      <div key={i} className="text-xs" style={{ color: currentForm.primaryGold }}>{lore}</div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Evolution Panel */}
            {activePanel === 'evolution' && (
              <EvolutionPanel
                genome={{ red60, blue60, black60 }}
                onEvolve={() => {
                  handleWhisper('Evolution complete! The genome awakens to new potential...');
                  if (audioEnabled && !audioMuted) {
                    [0, 2, 4, 6].forEach((note, i) => setTimeout(() => playNote(note, 0.8), i * 100));
                  }
                }}
              />
            )}

            {/* Features Dashboard */}
            {activePanel === 'features' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="text-sm font-semibold text-slate-200">Feature Panels</div>
                <p>Launching the full dashboard opens a wide overlay so Vimana, Battle, Achievements, and Cosmetics have room to breathe.</p>
                <button
                  onClick={() => setShowFeaturesOverlay(true)}
                  className="w-full px-3 py-2 bg-indigo-600/80 hover:bg-indigo-600 rounded-lg text-white font-semibold transition"
                >
                  Open Features Dashboard
                </button>
              </div>
            )}

            {/* Settings Panel */}
            {activePanel === 'settings' && (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-300">Settings</div>
                <label className="flex items-center gap-2 text-xs text-slate-400">
                  <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} className="rounded" />
                  Reduce Motion
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-400">
                  <input type="checkbox" checked={autoSelectScale} onChange={(e) => setAutoSelectScale(e.target.checked)} className="rounded" />
                  Auto Audio Scale
                </label>
                <div className="text-xs text-slate-500">
                  <div>AI Mode: {aiState.mode}</div>
                  <div>Time: {timeOfDay}</div>
                  <div>Form: {activeForm}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Left - Offspring */}
        <div className="col-start-1 row-start-3">
          {offspring.length > 0 && (
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-3 shadow-lg">
              <div className="text-xs font-semibold text-slate-300 mb-2">Offspring</div>
              <div className="flex gap-2 flex-wrap">
                {offspring.map((child) => (
                  <button key={child.name} onClick={() => switchToOffspring(child)} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition">
                    {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Center - Whisper */}
        <div className="col-start-2 row-start-3 flex justify-center">
          <div
            key={whisper.key}
            className="bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-700/50 px-6 py-3 shadow-lg max-w-md text-center animate-fade-in"
          >
            <p className="text-sm text-slate-200 italic font-serif">{whisper.text}</p>
          </div>
        </div>

        {/* Bottom Right - Debug (if enabled) */}
        <div className="col-start-3 row-start-3 flex justify-end">
          {showDebugOverlay && (
            <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl border border-cyan-500/50 p-3 shadow-lg text-xs font-mono text-cyan-400">
              <div>red60: {red60.toFixed(1)}</div>
              <div>blue60: {blue60.toFixed(1)}</div>
              <div>black60: {black60.toFixed(1)}</div>
              <div>Interactions: {totalInteractions}</div>
              <div>Dreams: {dreamCount}</div>
            </div>
          )}
        </div>
      </div>

      {/* Features Dashboard Overlay */}
      {showFeaturesOverlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-slate-200">Feature Panels</div>
                <div className="text-xs text-slate-400">Explore battle, exploration, cosmetics, games, and achievements.</div>
              </div>
              <button
                onClick={() => handlePanelChange('care')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <FeaturesDashboard />
          </div>
        </div>
      )}

      {/* Modal Games */}
      {currentGame === 'snake' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <SnakeGame prng={field.prng} audioEnabled={audioEnabled && !audioMuted} playNote={playNote} onClose={closeCurrentGame} onWin={handleSnakeWin} onWhisper={handleWhisper} />
        </div>
      )}
      {currentGame === 'tetris' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <TetrisGame prng={field.prng} audioEnabled={audioEnabled && !audioMuted} playNote={playNote} onClose={closeCurrentGame} onWin={handleTetrisWin} onWhisper={handleWhisper} />
        </div>
      )}
      {currentGame === 'fibonacciTrivia' && triviaQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 shadow-2xl max-w-md">
            <div className="text-lg font-bold text-white mb-4">{triviaQuestion.question}</div>
            <div className="grid grid-cols-2 gap-3">
              {triviaQuestion.options.map(opt => (
                <button key={opt} onClick={() => answerTrivia(opt)} className="px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold transition">
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={() => { setCurrentGame(null); setTriviaQuestion(null); }} className="mt-4 text-slate-400 hover:text-white text-sm">Cancel</button>
          </div>
        </div>
      )}
      {currentGame === 'sigilPattern' && patternChallenge.active && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 rounded-xl border border-purple-500 p-4 shadow-2xl">
          <div className="text-sm font-bold text-purple-400 mb-2">Pattern Challenge</div>
          <div className="text-xs text-slate-300">Sequence: {patternChallenge.sequence.map(i => i + 1).join(' -> ')}</div>
          <div className="text-xs text-slate-400 mt-1">Your Input: {patternChallenge.userSequence.map(i => i + 1).join(' -> ') || '...'}</div>
          <div className="text-xs text-slate-500 mt-2">Click the sigil points in order!</div>
        </div>
      )}

      {/* Breeding Center Modal */}
      {showBreedingCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <BreedingCenter
            currentPetName={seedName}
            currentPetGenome={{ red60, blue60, black60 }}
            offspring={offspring}
            bond={bond}
            onBreed={(child) => handleBreed(child)}
            prng={field.prng}
          />
          <button onClick={() => setShowBreedingCenter(false)} className="absolute top-4 right-4 text-white text-2xl hover:text-red-400">&times;</button>
        </div>
      )}
    </div>
  );
};

// Stat Bar Component
function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span style={{ color }} className="font-bold">{Math.round(value)}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default AuraliaMetaPet;
