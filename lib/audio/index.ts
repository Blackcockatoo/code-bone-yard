/**
 * Meta-Pet Ambient Audio System
 *
 * Provides immersive audio feedback including:
 * - Ambient background music based on pet state
 * - Interaction sound effects
 * - Achievement/milestone sounds
 * - HeptaCode musical signatures
 */

export type SoundCategory =
  | "ui"
  | "ambient"
  | "interaction"
  | "achievement"
  | "evolution";

export interface AudioSettings {
  masterVolume: number; // 0-1
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
  enabled: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  musicVolume: 0.4,
  sfxVolume: 0.8,
  enabled: true,
};

// Audio context singleton
let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;

// Current settings
let settings: AudioSettings = { ...DEFAULT_SETTINGS };

// Active oscillators for cleanup
const activeOscillators = new Set<OscillatorNode>();

// Musical scales for different moods
const SCALES = {
  peaceful: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25], // C major pentatonic
  energetic: [329.63, 369.99, 415.3, 493.88, 554.37, 659.25], // E major
  mysterious: [220.0, 246.94, 261.63, 329.63, 349.23, 440.0], // A minor
  joyful: [293.66, 329.63, 369.99, 440.0, 493.88, 587.33], // D major
  sleepy: [196.0, 220.0, 261.63, 293.66, 329.63, 392.0], // G lydian
};

type Mood = keyof typeof SCALES;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) {
      throw new Error("Web Audio API not supported");
    }
    audioContext = new AudioCtx();

    // Create gain nodes for mixing
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = settings.masterVolume;

    musicGain = audioContext.createGain();
    musicGain.connect(masterGain);
    musicGain.gain.value = settings.musicVolume;

    sfxGain = audioContext.createGain();
    sfxGain.connect(masterGain);
    sfxGain.gain.value = settings.sfxVolume;
  }
  return audioContext;
}

async function ensureResumed(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

/**
 * Update audio settings
 */
export function updateAudioSettings(newSettings: Partial<AudioSettings>): void {
  settings = { ...settings, ...newSettings };

  if (masterGain) {
    masterGain.gain.setValueAtTime(
      settings.masterVolume,
      audioContext?.currentTime ?? 0,
    );
  }
  if (musicGain) {
    musicGain.gain.setValueAtTime(
      settings.musicVolume,
      audioContext?.currentTime ?? 0,
    );
  }
  if (sfxGain) {
    sfxGain.gain.setValueAtTime(
      settings.sfxVolume,
      audioContext?.currentTime ?? 0,
    );
  }

  // Persist to localStorage
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("metapet-audio-settings", JSON.stringify(settings));
  }
}

/**
 * Load audio settings from localStorage
 */
export function loadAudioSettings(): AudioSettings {
  if (typeof localStorage !== "undefined") {
    try {
      const saved = localStorage.getItem("metapet-audio-settings");
      if (saved) {
        const parsed = JSON.parse(saved) as AudioSettings;
        settings = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // Ignore parse errors
    }
  }
  return settings;
}

/**
 * Get current audio settings
 */
export function getAudioSettings(): AudioSettings {
  return { ...settings };
}

/**
 * Play a simple tone
 */
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gain: GainNode | null = sfxGain,
): void {
  if (!settings.enabled || !gain) return;

  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const envGain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    const now = ctx.currentTime;
    envGain.gain.setValueAtTime(0, now);
    envGain.gain.linearRampToValueAtTime(0.3, now + 0.02);
    envGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(envGain);
    envGain.connect(gain);

    activeOscillators.add(osc);
    osc.start(now);
    osc.stop(now + duration);
    osc.onended = () => activeOscillators.delete(osc);
  } catch {
    // Silently fail if audio unavailable
  }
}

/**
 * Play a chord (multiple tones)
 */
function playChord(
  frequencies: number[],
  duration: number,
  type: OscillatorType = "sine",
): void {
  frequencies.forEach((freq, i) => {
    setTimeout(() => playTone(freq, duration, type), i * 30);
  });
}

// ============== UI Sound Effects ==============

export async function playButtonClick(): Promise<void> {
  await ensureResumed();
  playTone(880, 0.08, "sine");
}

export async function playButtonHover(): Promise<void> {
  await ensureResumed();
  playTone(660, 0.04, "sine");
}

export async function playSuccess(): Promise<void> {
  await ensureResumed();
  playChord([523.25, 659.25, 783.99], 0.3, "sine"); // C major chord
}

export async function playError(): Promise<void> {
  await ensureResumed();
  playTone(220, 0.3, "sawtooth");
}

// ============== Interaction Sound Effects ==============

export async function playFeed(): Promise<void> {
  await ensureResumed();
  const notes = [392, 440, 523.25];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, "sine"), i * 80);
  });
}

export async function playClean(): Promise<void> {
  await ensureResumed();
  // Sparkly cleaning sound
  for (let i = 0; i < 5; i++) {
    setTimeout(() => playTone(800 + Math.random() * 400, 0.1, "sine"), i * 60);
  }
}

export async function playPlay(): Promise<void> {
  await ensureResumed();
  // Playful ascending arpeggio
  const notes = [330, 392, 494, 587, 659];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.12, "triangle"), i * 60);
  });
}

export async function playSleep(): Promise<void> {
  await ensureResumed();
  // Gentle descending lullaby
  const notes = [440, 392, 330, 294, 261.63];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, "sine"), i * 150);
  });
}

// ============== Achievement & Evolution Sounds ==============

export async function playAchievement(): Promise<void> {
  await ensureResumed();
  // Triumphant fanfare
  const melody = [
    { freq: 523.25, delay: 0 },
    { freq: 659.25, delay: 100 },
    { freq: 783.99, delay: 200 },
    { freq: 1046.5, delay: 400 },
  ];
  melody.forEach(({ freq, delay }) => {
    setTimeout(() => playTone(freq, 0.3, "sine"), delay);
  });
}

export async function playEvolution(): Promise<void> {
  await ensureResumed();
  // Epic evolution sound - ascending with harmonics
  const baseNotes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];

  baseNotes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.4, "sine");
      playTone(freq * 1.5, 0.4, "sine"); // Fifth harmony
    }, i * 120);
  });

  // Final chord
  setTimeout(
    () => {
      playChord([523.25, 659.25, 783.99, 1046.5], 1.0, "sine");
    },
    baseNotes.length * 120 + 100,
  );
}

export async function playMilestone(): Promise<void> {
  await ensureResumed();
  // Heartwarming milestone chime
  playChord([392, 494, 587], 0.4, "sine");
  setTimeout(() => playChord([440, 523.25, 659.25], 0.5, "sine"), 250);
}

// ============== Ambient Music Generator ==============

let ambientInterval: ReturnType<typeof setInterval> | null = null;
let currentMood: Mood = "peaceful";

/**
 * Start ambient background music based on mood
 */
export async function startAmbientMusic(
  mood: Mood = "peaceful",
): Promise<void> {
  await ensureResumed();
  stopAmbientMusic();
  currentMood = mood;

  if (!settings.enabled) return;

  const scale = SCALES[mood];

  // Play a note every 2-4 seconds
  const playAmbientNote = () => {
    if (!settings.enabled) return;

    const note = scale[Math.floor(Math.random() * scale.length)];
    const octave = Math.random() > 0.7 ? 2 : 1;
    const duration = 1.5 + Math.random() * 2;

    try {
      const ctx = getAudioContext();
      if (!musicGain) return;

      const osc = ctx.createOscillator();
      const envGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = note * octave;

      const now = ctx.currentTime;
      envGain.gain.setValueAtTime(0, now);
      envGain.gain.linearRampToValueAtTime(0.15, now + 0.3);
      envGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(envGain);
      envGain.connect(musicGain);

      activeOscillators.add(osc);
      osc.start(now);
      osc.stop(now + duration);
      osc.onended = () => activeOscillators.delete(osc);
    } catch {
      // Silently fail
    }
  };

  // Initial note
  playAmbientNote();

  // Schedule recurring notes
  ambientInterval = setInterval(
    () => {
      if (Math.random() > 0.3) {
        playAmbientNote();
      }
    },
    2000 + Math.random() * 2000,
  );
}

/**
 * Stop ambient music
 */
export function stopAmbientMusic(): void {
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }

  // Fade out active oscillators
  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
    } catch {
      // Already stopped
    }
  });
  activeOscillators.clear();
}

/**
 * Update ambient mood based on pet vitals
 */
export function updateAmbientMood(vitals: {
  mood: number;
  energy: number;
}): void {
  let newMood: Mood = "peaceful";

  if (vitals.energy < 20) {
    newMood = "sleepy";
  } else if (vitals.mood > 80) {
    newMood = "joyful";
  } else if (vitals.mood < 30) {
    newMood = "mysterious";
  } else if (vitals.energy > 80) {
    newMood = "energetic";
  }

  if (newMood !== currentMood && ambientInterval) {
    void startAmbientMusic(newMood);
  }
}

// ============== HeptaCode Audio (from existing system) ==============

const HEPTA_SCALE = [
  220.0, // A3
  246.94, // B3
  261.63, // C4
  293.66, // D4
  329.63, // E4
  349.23, // F4
  392.0, // G4
] as const;

/**
 * Play HeptaCode as a musical sequence
 */
export async function playHeptaCode(
  digits: readonly number[],
  options: { tempo?: number; volume?: number } = {},
): Promise<void> {
  await ensureResumed();

  if (!settings.enabled || digits.length === 0) return;

  const tempo = options.tempo ?? 180;
  const volume = options.volume ?? 0.25;
  const stepDuration = 60 / tempo;

  const ctx = getAudioContext();
  const gain = sfxGain;
  if (!gain) return;

  const startTime = ctx.currentTime + 0.05;

  digits.forEach((digit, index) => {
    const safeDigit = Math.max(0, Math.min(6, Math.floor(digit)));
    const baseFreq = HEPTA_SCALE[safeDigit];
    const octaveShift = Math.floor(index / 7);
    const frequency = baseFreq * Math.pow(2, octaveShift / 2);

    const noteStart = startTime + index * stepDuration;
    const noteDuration = stepDuration * 0.8;

    try {
      const osc = ctx.createOscillator();
      const envGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = frequency;

      envGain.gain.setValueAtTime(0, noteStart);
      envGain.gain.linearRampToValueAtTime(volume, noteStart + 0.01);
      envGain.gain.exponentialRampToValueAtTime(
        0.001,
        noteStart + noteDuration,
      );

      osc.connect(envGain);
      envGain.connect(gain);

      activeOscillators.add(osc);
      osc.start(noteStart);
      osc.stop(noteStart + noteDuration);
      osc.onended = () => activeOscillators.delete(osc);
    } catch {
      // Silently fail
    }
  });
}

/**
 * Cleanup audio resources
 */
export function cleanup(): void {
  stopAmbientMusic();

  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
    masterGain = null;
    musicGain = null;
    sfxGain = null;
  }
}

// Export types for use elsewhere
export type { Mood };
