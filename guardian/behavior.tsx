'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calculateGBSPState } from './stats';
import type {
  AIBehaviorConfig,
  AudioConfig,
  GuardianAIMode,
  GuardianField,
  GuardianPosition,
  GuardianScaleName,
  GuardianSigilPoint,
  GuardianStats,
  InteractionResponse,
  SpontaneousBehavior,
  TimeOfDay,
  TimeTheme,
} from './types';

export const TIME_THEMES: Record<TimeOfDay, TimeTheme> = {
  dawn: {
    bg: 'from-orange-900 via-pink-900 to-purple-900',
    accent: '#FFB347',
    glow: 'rgba(255, 179, 71, 0.3)',
  },
  day: {
    bg: 'from-blue-900 via-cyan-900 to-teal-900',
    accent: '#4ECDC4',
    glow: 'rgba(78, 205, 196, 0.3)',
  },
  dusk: {
    bg: 'from-purple-900 via-indigo-900 to-blue-900',
    accent: '#B8A5D6',
    glow: 'rgba(184, 165, 214, 0.3)',
  },
  night: {
    bg: 'from-gray-900 via-blue-950 to-gray-900',
    accent: '#6B7FD7',
    glow: 'rgba(107, 127, 215, 0.3)',
  },
};

export const DEFAULT_AI_CONFIG: AIBehaviorConfig = {
  timings: {
    idle: { min: 3000, max: 8000 },
    observing: { min: 5000, max: 12000 },
    focusing: { min: 2000, max: 4000 },
    playing: { min: 3000, max: 6000 },
    dreaming: { min: 8000, max: 15000 },
  },
  probabilities: {
    idleToDream: 0.15,
    idleToObserve: 0.5,
    idleToFocus: 0.25,
  },
};

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  masterVolume: 0.3,
  reverbMix: 0.2,
  attackTime: 0.01,
  releaseTime: 0.5,
  lfoRate: 0.5,
  lfoDepth: 0.1,
};

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

export function getTimeTheme(timeOfDay: TimeOfDay): TimeTheme {
  return TIME_THEMES[timeOfDay] || TIME_THEMES.day;
}

export function getAdaptiveTimeTheme(): TimeTheme {
  return getTimeTheme(getTimeOfDay());
}

export function useAuraliaAudio(
  enabled: boolean,
  stats: GuardianStats,
  scale: GuardianScaleName,
  settings: AudioConfig
) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const lfoNodeRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      audioContextRef.current = new AudioContextClass();

      const masterGain = audioContextRef.current.createGain();
      masterGain.gain.value = settings.masterVolume;
      masterGain.connect(audioContextRef.current.destination);
      masterGainRef.current = masterGain;

      const reverbNode = audioContextRef.current.createConvolver();
      const reverbLength = audioContextRef.current.sampleRate * 2;
      const reverbBuffer = audioContextRef.current.createBuffer(2, reverbLength, audioContextRef.current.sampleRate);

      for (let channel = 0; channel < 2; channel++) {
        const channelData = reverbBuffer.getChannelData(channel);
        for (let i = 0; i < reverbLength; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 2);
        }
      }

      reverbNode.buffer = reverbBuffer;
      reverbNodeRef.current = reverbNode;

      const filter = audioContextRef.current.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      filter.Q.value = 1;
      filterNodeRef.current = filter;

      const lfo = audioContextRef.current.createOscillator();
      lfo.frequency.value = settings.lfoRate;
      const lfoGain = audioContextRef.current.createGain();
      lfoGain.gain.value = settings.lfoDepth * 1000;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      lfoNodeRef.current = lfo;
    }

    return () => {
      if (lfoNodeRef.current) {
        lfoNodeRef.current.stop();
        lfoNodeRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [enabled, settings.masterVolume, settings.lfoRate, settings.lfoDepth]);

  const noteIndexToFreq = (index: number, s: GuardianScaleName): number => {
    const base = 220;
    const scales: Record<GuardianScaleName, number[]> = {
      harmonic: [1, 1.125, 1.25, 1.333, 1.5, 1.667, 1.875],
      pentatonic: [1, 1.122, 1.26, 1.498, 1.681, 1.997, 2.244],
      dorian: [1, 1.122, 1.189, 1.335, 1.498, 1.681, 1.781],
      phrygian: [1, 1.059, 1.122, 1.189, 1.335, 1.414, 1.498],
    };
    const ratios = scales[s];
    const r = ratios[((index % 7) + 7) % 7];
    return base * r;
  };

  const playNote = useCallback((noteIndex: number, duration: number = 0.3) => {
    if (!audioContextRef.current || !masterGainRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.frequency.value = noteIndexToFreq(noteIndex, scale);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + settings.attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.connect(gainNode);

    if (filterNodeRef.current && reverbNodeRef.current) {
      const dryGain = ctx.createGain();
      dryGain.gain.value = 1 - settings.reverbMix;
      gainNode.connect(dryGain);
      dryGain.connect(filterNodeRef.current);
      filterNodeRef.current.connect(masterGainRef.current);

      const wetGain = ctx.createGain();
      wetGain.gain.value = settings.reverbMix;
      gainNode.connect(wetGain);
      wetGain.connect(reverbNodeRef.current);
      reverbNodeRef.current.connect(masterGainRef.current);
    } else if (masterGainRef.current) {
      gainNode.connect(masterGainRef.current);
    }

    oscillator.start(now);
    oscillator.stop(now + duration);
  }, [settings.attackTime, settings.reverbMix, scale]);

  const setVolume = useCallback((volume: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
  }, []);

  return { playNote, setVolume };
}

export interface GuardianAIOptions {
  config: AIBehaviorConfig;
  stats: GuardianStats;
  onPlay?: (targetIndex: number) => void;
  onSpontaneous?: (behavior: SpontaneousBehavior) => void;
}

export function useGuardianAI(
  field: GuardianField,
  sigilPoints: GuardianSigilPoint[],
  onWhisper: (message: string) => void,
  onFocusChange: (sigilId: number | null) => void,
  onDreamComplete: (insight: string) => void,
  options: GuardianAIOptions
) {
  const [mode, setMode] = useState<GuardianAIMode>('idle');
  const [focusedSigil, setFocusedSigil] = useState<number | null>(null);
  const [focusHistory, setFocusHistory] = useState<number[]>([]);
  const [position, setPosition] = useState<GuardianPosition>({ x: 0.5, y: 0.5, vx: 0, vy: 0 });
  const targetPositionRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [since, setSince] = useState<number>(0);
  const [gbspTimestamp, setGbspTimestamp] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transitionToNextMode = useCallback(function transitionToNextModeInner() {
    const { config, stats } = options;
    const { energy, curiosity } = stats;
    if (mode === 'idle') {
      const rand = Math.random();
      if (energy < 30 && rand < config.probabilities.idleToDream) {
        setMode('dreaming');
        const dreamDuration = config.timings.dreaming.min + Math.random() * (config.timings.dreaming.max - config.timings.dreaming.min);
        timerRef.current = setTimeout(() => {
          setMode('idle');
          onDreamComplete('A gentle dream passes.');
        }, dreamDuration);
      } else if (rand < config.probabilities.idleToObserve) {
        setMode('observing');
        const observeDuration = config.timings.observing.min + Math.random() * (config.timings.observing.max - config.timings.observing.min);
        timerRef.current = setTimeout(() => setMode('idle'), observeDuration);
      } else if (curiosity > 40 && rand < config.probabilities.idleToFocus + config.probabilities.idleToObserve) {
        setMode('focusing');
        const focusDuration = config.timings.focusing.min + Math.random() * (config.timings.focusing.max - config.timings.focusing.min);
        timerRef.current = setTimeout(() => {
          setMode('playing');
          const randomSigil = sigilPoints[Math.floor(Math.random() * sigilPoints.length)];
          if (randomSigil) {
            setFocusedSigil(randomSigil.id);
            setFocusHistory(prev => [...prev, randomSigil.id]);
            onFocusChange(randomSigil.id);
            if (options.onPlay) options.onPlay(randomSigil.id);
            if (options.onSpontaneous) options.onSpontaneous({ type: 'pulse', intensity: 0.6 });
          }
          timerRef.current = setTimeout(() => {
            setFocusedSigil(null);
            onFocusChange(null);
            setMode('idle');
          }, config.timings.playing.min + Math.random() * (config.timings.playing.max - config.timings.playing.min));
        }, focusDuration);
      } else {
        const idleDuration = config.timings.idle.min + Math.random() * (config.timings.idle.max - config.timings.idle.min);
        timerRef.current = setTimeout(() => transitionToNextMode(), idleDuration);
      }
    } else {
      const idleDuration = config.timings.idle.min + Math.random() * (config.timings.idle.max - config.timings.idle.min);
      timerRef.current = setTimeout(() => transitionToNextModeInner(), idleDuration);
    }
  }, [mode, sigilPoints, onFocusChange, onDreamComplete, options]);

  useEffect(() => {
    setSince(Date.now());
    if (mode === 'idle') {
      transitionToNextMode();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mode, transitionToNextMode]);

  useEffect(() => {
    setGbspTimestamp(Date.now());
    const id = setInterval(() => setGbspTimestamp(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap at 100ms
      lastTime = currentTime;

      setPosition(prev => {
        const target = targetPositionRef.current;
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.01) return prev;

        const stiffness = 2.0;
        const damping = 0.8;
        const ax = dx * stiffness - prev.vx * damping;
        const ay = dy * stiffness - prev.vy * damping;

        const newVx = prev.vx + ax * deltaTime;
        const newVy = prev.vy + ay * deltaTime;

        return {
          x: Math.max(0.1, Math.min(0.9, prev.x + newVx * deltaTime)),
          y: Math.max(0.1, Math.min(0.9, prev.y + newVy * deltaTime)),
          vx: newVx * 0.98,
          vy: newVy * 0.98,
        };
      });

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const prng = field.prng || Math.random;

    if (mode === 'focusing' && focusedSigil !== null && sigilPoints[focusedSigil]) {
      const sigil = sigilPoints[focusedSigil];
      targetPositionRef.current = { x: sigil.x / 400, y: sigil.y / 400 };
    } else if (mode === 'playing') {
      targetPositionRef.current = { x: prng(), y: prng() };
    } else if (mode === 'dreaming') {
      targetPositionRef.current = { x: 0.5 + (prng() - 0.5) * 0.2, y: 0.5 + (prng() - 0.5) * 0.2 };
    } else {
      targetPositionRef.current = { x: 0.5, y: 0.5 };
    }
  }, [mode, focusedSigil, sigilPoints, field]);

  useEffect(() => {
    if (!options.onSpontaneous) return;

    const prng = field.prng || Math.random;
    const onSpontaneous = options.onSpontaneous;

    const interval = setInterval(() => {
      const rand = prng();
      const { energy, curiosity, bond } = options.stats;

      if (energy > 80 && rand < 0.05) {
        onSpontaneous({ type: 'pulse', intensity: energy / 100 });
      } else if (energy < 20 && rand < 0.03) {
        onSpontaneous({ type: 'sigh', intensity: 0.5 });
      }

      if (curiosity > 70 && rand < 0.04) {
        onSpontaneous({ type: 'shimmer', intensity: curiosity / 100 });
      }

      if (bond > 80 && rand < 0.06) {
        onSpontaneous({ type: 'giggle', intensity: bond / 100 });
      }

      if (mode === 'playing' && rand < 0.1) {
        onSpontaneous({ type: 'pulse', intensity: 0.7 });
      } else if (mode === 'dreaming' && rand < 0.02) {
        onSpontaneous({ type: 'shimmer', intensity: 0.8 });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [mode, options, field]);

  const fieldResonance = useMemo(() => {
    if (!sigilPoints || sigilPoints.length === 0) return 0;

    let minDist = Infinity;
    sigilPoints.forEach(point => {
      const px = point.x / 400;
      const py = point.y / 400;
      const dist = Math.sqrt((position.x - px) ** 2 + (position.y - py) ** 2);
      minDist = Math.min(minDist, dist);
    });

    const proximityFactor = Math.max(0, 1 - minDist * 5);
    const pulseIndex = Math.floor((Date.now() / 100) % 60);
    const pulseValue = (field.pulse?.[pulseIndex] ?? 5) / 10;

    return (proximityFactor * 0.6 + options.stats.curiosity / 100 * 0.3 + pulseValue * 0.1);
  }, [position, sigilPoints, options.stats.curiosity, field]);

  const gbsp = useMemo(() => {
    return calculateGBSPState(position, field, options.stats, mode, gbspTimestamp);
  }, [position, field, options.stats, mode, gbspTimestamp]);

  return {
    mode,
    focusedSigil,
    target: focusedSigil,
    focusHistory,
    spontaneousBehavior: null,
    position,
    targetPosition: targetPositionRef.current,
    since,
    fieldResonance,
    gbsp,
  };
}

export function useGuardianInteraction(
  aiState: ReturnType<typeof useGuardianAI>,
  stats: GuardianStats,
  field: GuardianField,
  handlers: {
    onReaction: (response: InteractionResponse) => void;
    onWhisper: (message: string) => void;
    onStatChange: (changes: Partial<GuardianStats>) => void;
  }
) {
  const lastInteractionRef = useRef<number>(0);
  const pokeCountRef = useRef<number>(0);
  const lastPokeTimeRef = useRef<number>(0);

  const handlePoke = useCallback((pos: { x: number; y: number }) => {
    const now = Date.now();

    if (now - lastPokeTimeRef.current < 500) {
      pokeCountRef.current++;
    } else {
      pokeCountRef.current = 1;
    }
    lastPokeTimeRef.current = now;

    if (pokeCountRef.current >= 3) {
      handlers.onReaction({ type: 'tickle', intensity: 1.0, message: 'Hehe!', reaction: { type: 'delight', intensity: 1.0, visualEffect: 'glow' } });
      handlers.onStatChange({ energy: Math.min(100, stats.energy + 5) });
      pokeCountRef.current = 0;
    } else {
      handlers.onReaction({ type: 'poke', intensity: 0.5, message: 'Hey!', reaction: { type: 'excitement', intensity: 0.5, visualEffect: 'shimmer' } });
      handlers.onStatChange({ curiosity: Math.min(100, stats.curiosity + 2) });
    }

    lastInteractionRef.current = now;
  }, [stats, handlers]);

  const handlePet = useCallback((pos: { x: number; y: number }, intensity?: number) => {
    const amt = intensity ?? 0.7;
    handlers.onReaction({ type: 'pet', intensity: amt, message: 'Purr~', reaction: { type: 'delight', intensity: amt, visualEffect: 'bloom' } });
    handlers.onStatChange({ bond: Math.min(100, stats.bond + 3) });
    lastInteractionRef.current = Date.now();
  }, [stats, handlers]);

  const handleDrag = useCallback((pos: { x: number; y: number }, velocity?: { vx: number; vy: number }) => {
    const speed = velocity ? Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy) : 0;

    if (speed > 5) {
      handlers.onReaction({ type: 'shake', intensity: speed / 10, message: 'Whoa!', reaction: { type: 'startle', intensity: speed / 10, visualEffect: 'fragment' } });
      handlers.onStatChange({ energy: Math.max(0, stats.energy - 2) });
    } else {
      handlers.onReaction({ type: 'drag', intensity: 0.3, reaction: { type: 'excitement', intensity: 0.3, visualEffect: 'wave' } });
    }

    lastInteractionRef.current = Date.now();
  }, [stats, handlers]);

  const handleGrab = useCallback((pos: { x: number; y: number }) => {
    handlers.onReaction({ type: 'grab', intensity: 0.6, message: 'Hey!', reaction: { type: 'annoy', intensity: 0.3, visualEffect: 'contract' } });
    lastInteractionRef.current = Date.now();
  }, [handlers]);

  const handleShake = useCallback((intensity: number) => {
    handlers.onReaction({ type: 'shake', intensity, message: 'Whoa!', reaction: { type: 'fear', intensity, visualEffect: 'fragment' } });
    handlers.onStatChange({ energy: Math.max(0, stats.energy - Math.floor(intensity * 3)) });
    lastInteractionRef.current = Date.now();
  }, [stats, handlers]);

  const handleRelease = useCallback((velocity?: { vx: number; vy: number }) => {
    handlers.onReaction({ type: 'release', intensity: 0.3, message: 'Free!', reaction: { type: 'content', intensity: 0.3, visualEffect: 'glow' } });
    lastInteractionRef.current = Date.now();
  }, [handlers]);

  const handleTickle = useCallback((pos: { x: number; y: number }) => {
    handlers.onReaction({ type: 'tickle', intensity: 0.8, message: 'Hehe!', reaction: { type: 'delight', intensity: 0.8, visualEffect: 'shimmer' } });
    handlers.onStatChange({ energy: Math.min(100, stats.energy + 5) });
    lastInteractionRef.current = Date.now();
  }, [stats, handlers]);

  return {
    handlePoke,
    handlePet,
    handleDrag,
    handleGrab,
    handleShake,
    handleRelease,
    handleTickle,
    isHeld: false,
  };
}

export function generateSigilPoints(
  seed: number,
  count: number,
  centerX: number,
  centerY: number
): GuardianSigilPoint[] {
  const points: GuardianSigilPoint[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const angle = i * goldenAngle + (seed % 360) * (Math.PI / 180);
    const radius = 60 + (i * 15) + ((seed * 7) % 40);

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    points.push({
      id: i,
      x,
      y,
      angle,
      radius,
    });
  }

  return points;
}

export function GuardianSigilCanvas({
  sigilPoints,
  aiState
}: {
  sigilPoints: GuardianSigilPoint[];
  aiState?: { mode: string; position: { x: number; y: number }; since: number; focusedSigil?: number | null };
}) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="sigilGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ff8800" stopOpacity="0" />
        </radialGradient>
      </defs>

      {sigilPoints.map((point, idx) => {
        const isFocused = aiState?.focusedSigil === point.id;
        const scale = isFocused ? 1.3 : 1.0;
        const opacity = isFocused ? 1.0 : 0.7;

        return (
          <g key={point.id} transform={`translate(${point.x}, ${point.y})`}>
            {isFocused && (
              <circle
                r={12 * scale}
                fill="url(#sigilGlow)"
                opacity={0.5}
              />
            )}
            <circle
              r={6 * scale}
              fill="#ffd700"
              stroke="#ff8800"
              strokeWidth={1.5}
              opacity={opacity}
            />
            <text
              x={0}
              y={-12}
              textAnchor="middle"
              fill="#ffd700"
              fontSize={10}
              opacity={0.6}
            >
              {idx + 1}
            </text>
          </g>
        );
      })}

      {sigilPoints.length > 1 && (
        <g opacity={0.3}>
          {sigilPoints.map((point, idx) => {
            const nextPoint = sigilPoints[(idx + 1) % sigilPoints.length];
            return (
              <line
                key={`line-${idx}`}
                x1={point.x}
                y1={point.y}
                x2={nextPoint.x}
                y2={nextPoint.y}
                stroke="#4488ff"
                strokeWidth={1}
                strokeDasharray="4 2"
              />
            );
          })}
        </g>
      )}
    </svg>
  );
}
