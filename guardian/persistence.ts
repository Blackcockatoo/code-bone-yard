export interface Offspring {
  name: string;
  genome: {
    red60: number;
    blue60: number;
    black60: number;
  };
  parents: string[];
  birthDate: number;
}

export interface DreamInsightEntry {
  timestamp: number;
  insight: string;
  energy: number;
  curiosity: number;
  bond: number;
  focusedSigils: number[];
}

export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  audioOffByDefault: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  muted: boolean;
}

export interface AIConfigOverrides {
  idleMin?: number;
  idleMax?: number;
  observingMin?: number;
  observingMax?: number;
  focusingMin?: number;
  focusingMax?: number;
  playingMin?: number;
  playingMax?: number;
  dreamingMin?: number;
  dreamingMax?: number;
  idleToDreamProb?: number;
  idleToObserveProb?: number;
  idleToFocusProb?: number;
}

export interface GuardianSaveData {
  seedName: string;
  energy: number;
  curiosity: number;
  bond: number;
  health: number;
  bondHistory: { timestamp: number; bond: number; event: string }[];
  activatedPoints: number[];
  createdAt: number;
  lastSaved: number;
  totalInteractions: number;
  dreamCount: number;
  gamesWon: number;
  highContrast: boolean;
  offspring: Offspring[];
  breedingPartner?: string;
  dreamJournal?: DreamInsightEntry[];
  unlockedLore?: string[];
  accessibility?: AccessibilitySettings;
  audioSettings?: AudioSettings;
  aiConfigOverrides?: AIConfigOverrides;
  sigilAffinities?: Record<number, number>;
  focusHistory?: number[];
}

export const STORAGE_KEY = 'auralia_guardian_state';

export function saveGuardianState(data: GuardianSaveData): { success: boolean; error?: string } {
  try {
    const jsonString = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, jsonString);
    return { success: true };
  } catch (error) {
    let errorMessage = 'Unknown error';

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle quota exceeded specifically
      if (error.name === 'QuotaExceededError' || errorMessage.includes('quota')) {
        errorMessage = 'Storage quota exceeded. Try clearing old save data or browser cache.';
      }
    }

    console.error('Failed to save Guardian state:', error);
    return { success: false, error: errorMessage };
  }
}

export function loadGuardianState(): { data: GuardianSaveData | null; error?: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const data = saved ? (JSON.parse(saved) as GuardianSaveData) : null;

    if (data && !isValidGuardianSaveData(data)) {
      console.error('Loaded data failed validation');
      return { data: null, error: 'Save data is corrupted or invalid' };
    }

    return { data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to load Guardian state:', error);
    return { data: null, error: errorMessage };
  }
}

export function clearGuardianState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear Guardian state:', error);
  }
}

export function exportGuardianState(data: GuardianSaveData): string {
  return JSON.stringify(data, null, 2);
}

export function importGuardianState(json: string): { data: GuardianSaveData | null; error?: string } {
  try {
    const data = JSON.parse(json) as GuardianSaveData;

    if (!isValidGuardianSaveData(data)) {
      throw new Error('Invalid Guardian state data');
    }

    return { data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to import Guardian state:', error);
    return { data: null, error: errorMessage };
  }
}

export function createSnapshot(data: GuardianSaveData): GuardianSaveData {
  return {
    ...data,
    lastSaved: Date.now(),
  };
}

export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function isValidGuardianSaveData(data: GuardianSaveData): boolean {
  // Check required string properties
  if (typeof data.seedName !== 'string' || !data.seedName) {
    return false;
  }

  // Check required number properties with bounds
  const requiredNumbers = [
    data.energy,
    data.curiosity,
    data.bond,
    data.health,
    data.createdAt,
    data.lastSaved,
    data.totalInteractions,
    data.dreamCount,
    data.gamesWon,
  ];
  if (requiredNumbers.some((n) => typeof n !== 'number' || n < 0 || !Number.isFinite(n))) {
    return false;
  }

  // Check required boolean properties
  if (typeof data.highContrast !== 'boolean') {
    return false;
  }

  // Check required array properties
  if (!Array.isArray(data.bondHistory) || !Array.isArray(data.activatedPoints) || !Array.isArray(data.offspring)) {
    return false;
  }

  // Validate bondHistory array contents
  if (data.bondHistory.some((entry) =>
    typeof entry.timestamp !== 'number' ||
    typeof entry.bond !== 'number' ||
    typeof entry.event !== 'string'
  )) {
    return false;
  }

  // Validate activatedPoints array contents
  if (data.activatedPoints.some((point) => typeof point !== 'number')) {
    return false;
  }

  // Validate offspring array contents
  if (data.offspring.some((child) =>
    typeof child.name !== 'string' ||
    !child.genome ||
    typeof child.genome.red60 !== 'number' ||
    typeof child.genome.blue60 !== 'number' ||
    typeof child.genome.black60 !== 'number' ||
    !Array.isArray(child.parents) ||
    typeof child.birthDate !== 'number'
  )) {
    return false;
  }

  // Validate optional properties if present
  if (data.breedingPartner !== undefined && typeof data.breedingPartner !== 'string') {
    return false;
  }

  if (data.dreamJournal !== undefined && !Array.isArray(data.dreamJournal)) {
    return false;
  }

  if (data.unlockedLore !== undefined && !Array.isArray(data.unlockedLore)) {
    return false;
  }

  if (data.accessibility !== undefined && typeof data.accessibility !== 'object') {
    return false;
  }

  if (data.audioSettings !== undefined && typeof data.audioSettings !== 'object') {
    return false;
  }

  if (data.sigilAffinities !== undefined && typeof data.sigilAffinities !== 'object') {
    return false;
  }

  if (data.focusHistory !== undefined && !Array.isArray(data.focusHistory)) {
    return false;
  }

  return true;
}
