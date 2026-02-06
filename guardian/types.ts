import type { MossPrimeField } from '@/core';

export type GuardianScaleName = 'harmonic' | 'pentatonic' | 'dorian' | 'phrygian';

export interface GuardianSigilPoint {
  id: number;
  x: number;
  y: number;
  angle: number;
  radius: number;
  hash?: string;
}

export type GuardianAIMode = 'idle' | 'observing' | 'focusing' | 'playing' | 'dreaming';

export interface AIBehaviorConfig {
  timings: {
    idle: { min: number; max: number };
    observing: { min: number; max: number };
    focusing: { min: number; max: number };
    playing: { min: number; max: number };
    dreaming: { min: number; max: number };
  };
  probabilities: {
    idleToDream: number;
    idleToObserve: number;
    idleToFocus: number;
  };
}

export interface SpontaneousBehavior {
  type: 'pulse' | 'shimmer' | 'startle' | 'giggle' | 'stretch' | 'sigh';
  intensity?: number;
}

export interface GuardianPosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface InteractionResponse {
  type: 'poke' | 'pet' | 'tickle' | 'shake' | 'drag' | 'grab' | 'release';
  intensity: number;
  message?: string;
  reaction?: {
    type: 'annoy' | 'fear' | 'delight' | 'excitement' | 'startle' | 'content';
    intensity: number;
    visualEffect?: 'bloom' | 'glow' | 'shimmer' | 'flicker' | 'spiral' | 'wave' | 'contract' | 'fragment';
  };
}

export interface GuardianStats {
  energy: number;
  curiosity: number;
  bond: number;
  health: number;
}

export interface GuardianField extends Partial<MossPrimeField> {
  width?: number;
  height?: number;
  centerX?: number;
  centerY?: number;
}

export interface GuardianDrive {
  explore?: number;
  rest: number;
  play?: number;
  focus?: number;
  resonance?: number;
  exploration?: number;
  connection?: number;
  expression?: number;
}

export interface ComfortState {
  physical?: number;
  mental?: number;
  emotional?: number;
  overall: number;
  source: string;
  unmetNeeds: string[];
  dominantDrive?: string;
}

export type ExpandedEmotionalState =
  | 'joyful'
  | 'curious'
  | 'content'
  | 'tired'
  | 'anxious'
  | 'playful'
  | 'focused'
  | 'dreaming'
  | 'neutral'
  | 'serene'
  | 'ecstatic'
  | 'contemplative'
  | 'mischievous'
  | 'affectionate'
  | 'protective'
  | 'restless'
  | 'yearning'
  | 'withdrawn'
  | 'calm'
  | 'happy'
  | 'unhappy'
  | 'excited'
  | 'overwhelmed'
  | 'melancholic'
  | 'transcendent';

export interface GBSPState {
  drives: GuardianDrive;
  comfort: ComfortState;
  emotionalState: ExpandedEmotionalState;
  awareness: number;
  sentiment: number;
  position: GuardianPosition;
}

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface TimeTheme {
  bg: string;
  accent: string;
  glow: string;
}

export interface AudioConfig {
  masterVolume: number;
  reverbMix: number;
  attackTime: number;
  releaseTime: number;
  lfoRate: number;
  lfoDepth: number;
}
