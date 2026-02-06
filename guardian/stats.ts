import type {
  ComfortState,
  ExpandedEmotionalState,
  GuardianAIMode,
  GuardianDrive,
  GuardianField,
  GuardianPosition,
  GuardianScaleName,
  GuardianStats,
  GBSPState,
} from './types';

export function selectScaleFromStats(stats: GuardianStats): GuardianScaleName {
  const { energy, curiosity, bond } = stats;

  if (energy > 70 && curiosity > 60) return 'harmonic';
  if (bond > 60) return 'pentatonic';
  if (curiosity > 50) return 'dorian';
  return 'phrygian';
}

export function getUnlockedLore(dreamCount: number): string[] {
  const lore: string[] = [];

  if (dreamCount >= 1) lore.push('The Guardian awakens to sacred geometry...');
  if (dreamCount >= 3) lore.push('Fibonacci sequences dance in the quantum foam...');
  if (dreamCount >= 5) lore.push('The MossPrimeSeed reveals ancient patterns...');
  if (dreamCount >= 10) lore.push('Unity emerges from deterministic chaos...');
  if (dreamCount >= 20) lore.push('Consciousness transcends the code boundary...');

  return lore;
}

export function calculateDrives(
  position: GuardianPosition,
  field: GuardianField,
  vitals: GuardianStats,
  awareness: number,
  timestamp: number
): GuardianDrive {
  const { energy, curiosity } = vitals;

  return {
    explore: Math.min(100, curiosity * 0.8 + awareness * 0.2),
    rest: Math.max(0, 100 - energy),
    play: Math.min(100, energy * 0.6 + curiosity * 0.4),
    focus: Math.min(100, curiosity * 0.7 + vitals.bond * 0.3),
  };
}

export function calculateComfort(drives: GuardianDrive): ComfortState {
  const driveValues = Object.values(drives);
  const avgDrive = driveValues.reduce((a, b) => a + b, 0) / driveValues.length;

  const physical = Math.min(100, (drives.rest ?? 0.5) * 0.5 + 50);
  const mental = Math.min(100, (drives.focus ?? 0.5) * 0.6 + 40);
  const emotional = Math.min(100, (drives.play ?? 0.5) * 0.7 + 30);
  const overall = Math.min(100, avgDrive);

  const unmetNeeds: string[] = [];
  if (physical < 50) unmetNeeds.push('rest');
  if (mental < 50) unmetNeeds.push('focus');
  if (emotional < 50) unmetNeeds.push('play');

  let source = 'balanced';
  if (physical > mental && physical > emotional) source = 'physical';
  else if (mental > emotional) source = 'mental';
  else if (emotional > 50) source = 'emotional';

  return {
    physical,
    mental,
    emotional,
    overall,
    source,
    unmetNeeds,
  };
}

export function getExpandedEmotionalState(
  drives: GuardianDrive,
  comfort: ComfortState,
  vitals: GuardianStats,
  aiMode: GuardianAIMode
): ExpandedEmotionalState {
  if (aiMode === 'dreaming') return 'dreaming';
  if (aiMode === 'focusing') return 'focused';
  if ((drives.play ?? 0) > 70) return 'playful';
  if (vitals.energy < 30) return 'tired';
  if ((drives.explore ?? 0) > 70) return 'curious';
  if (vitals.bond > 70) return 'joyful';
  if (comfort.overall > 60) return 'content';
  if (comfort.overall < 40) return 'anxious';
  return 'neutral';
}

export function calculateGBSPState(
  position: GuardianPosition,
  field: GuardianField,
  vitals: GuardianStats,
  aiMode: GuardianAIMode,
  timestamp: number
): GBSPState {
  const awareness = Math.min(100, (vitals.curiosity + vitals.energy) / 2);
  const drives = calculateDrives(position, field, vitals, awareness, timestamp);
  const comfort = calculateComfort(drives);
  const emotionalState = getExpandedEmotionalState(drives, comfort, vitals, aiMode);
  const sentiment = comfort.overall;

  return {
    drives,
    comfort,
    emotionalState,
    awareness,
    sentiment,
    position,
  };
}
