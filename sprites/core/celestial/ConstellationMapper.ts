/**
 * ConstellationMapper - Define constellation patterns that map to Guardian body parts
 *
 * Each Guardian can be associated with a constellation, and its body parts
 * will be positioned according to the stars in that constellation pattern.
 */

import type { CelestialCoords } from './CelestialCoordinates';

export type ConstellationName =
  | 'Orion'
  | 'Lyra'
  | 'Draco'
  | 'Cygnus'
  | 'Andromeda'
  | 'Phoenix'
  | 'Ursa'
  | 'Custom';

export interface StarPoint {
  id: number;
  name?: string;              // Star name (e.g., "Betelgeuse", "Rigel")
  azimuth: number;            // 0-360 degrees
  altitude: number;           // 0-90 degrees
  magnitude: number;          // 0-6 (0 = brightest, 6 = dimmest)
  color?: string;             // Star color (for visual variety)
  hash?: string;              // Optional genome hash reference
}

export interface ConstellationPattern {
  name: ConstellationName;
  displayName: string;
  description: string;
  stars: StarPoint[];
  connections: [number, number][]; // Pairs of star IDs to connect with lines
  bodyMapping: {
    head?: number;             // Star ID for head/center
    ears?: number[];           // Star IDs for ears
    limbs?: number[];          // Star IDs for limbs (order: FL, FR, BL, BR)
    tail?: number[];           // Star IDs for tail segments
    accessories?: number[];    // Star IDs for accessories
  };
}

/**
 * Orion - The Hunter
 * A classic constellation with bright stars perfect for limbs and structure
 */
const ORION: ConstellationPattern = {
  name: 'Orion',
  displayName: 'Orion the Hunter',
  description: 'A mighty warrior constellation with brilliant structure',
  stars: [
    { id: 0, name: 'Betelgeuse', azimuth: 0, altitude: 70, magnitude: 0, color: '#FF6B35' },      // Head (red supergiant)
    { id: 1, name: 'Left Ear', azimuth: 330, altitude: 60, magnitude: 2, color: '#4ECDC4' },      // Left ear
    { id: 2, name: 'Right Ear', azimuth: 30, altitude: 60, magnitude: 2, color: '#4ECDC4' },      // Right ear
    { id: 3, name: 'Bellatrix', azimuth: 280, altitude: 40, magnitude: 2, color: '#E1BEE7' },     // Front left limb
    { id: 4, name: 'Saiph', azimuth: 80, altitude: 40, magnitude: 2, color: '#E1BEE7' },          // Front right limb
    { id: 5, name: 'Back Left', azimuth: 240, altitude: 25, magnitude: 3, color: '#C4B5FD' },     // Back left limb
    { id: 6, name: 'Back Right', azimuth: 120, altitude: 25, magnitude: 3, color: '#C4B5FD' },    // Back right limb
    { id: 7, name: 'Rigel', azimuth: 180, altitude: 15, magnitude: 1, color: '#60EFFF' },         // Tail tip (blue supergiant)
    { id: 8, name: 'Tail Mid', azimuth: 180, altitude: 25, magnitude: 3, color: '#8B5CF6' },      // Tail middle
  ],
  connections: [
    [0, 1], [0, 2],  // Head to ears
    [0, 3], [0, 4],  // Head to front limbs
    [3, 5], [4, 6],  // Front to back limbs
    [0, 8], [8, 7],  // Head to tail
  ],
  bodyMapping: {
    head: 0,
    ears: [1, 2],
    limbs: [3, 4, 5, 6],
    tail: [8, 7],
  },
};

/**
 * Lyra - The Lyre
 * A compact, harmonious constellation for graceful Guardians
 */
const LYRA: ConstellationPattern = {
  name: 'Lyra',
  displayName: 'Lyra the Lyre',
  description: 'A musical constellation of harmony and grace',
  stars: [
    { id: 0, name: 'Vega', azimuth: 0, altitude: 75, magnitude: 0, color: '#E0E7FF' },           // Head (bright white)
    { id: 1, name: 'Left Ear', azimuth: 340, altitude: 65, magnitude: 3, color: '#FFD700' },     // Left ear
    { id: 2, name: 'Right Ear', azimuth: 20, altitude: 65, magnitude: 3, color: '#FFD700' },     // Right ear
    { id: 3, name: 'Delta', azimuth: 290, altitude: 50, magnitude: 3, color: '#4ECDC4' },        // Front left limb
    { id: 4, name: 'Gamma', azimuth: 70, altitude: 50, magnitude: 3, color: '#4ECDC4' },         // Front right limb
    { id: 5, name: 'Epsilon', azimuth: 250, altitude: 30, magnitude: 4, color: '#C4B5FD' },      // Back left limb
    { id: 6, name: 'Zeta', azimuth: 110, altitude: 30, magnitude: 4, color: '#C4B5FD' },         // Back right limb
    { id: 7, name: 'Tail Tip', azimuth: 180, altitude: 10, magnitude: 4, color: '#8B5CF6' },     // Tail tip
  ],
  connections: [
    [0, 1], [0, 2],  // Head to ears
    [0, 3], [0, 4],  // Head to front limbs
    [3, 5], [4, 6],  // Front to back limbs
    [0, 7],          // Head to tail
  ],
  bodyMapping: {
    head: 0,
    ears: [1, 2],
    limbs: [3, 4, 5, 6],
    tail: [7],
  },
};

/**
 * Draco - The Dragon
 * A winding constellation perfect for serpentine or flowing Guardians
 */
const DRACO: ConstellationPattern = {
  name: 'Draco',
  displayName: 'Draco the Dragon',
  description: 'An ancient dragon constellation, wise and powerful',
  stars: [
    { id: 0, name: 'Thuban', azimuth: 0, altitude: 65, magnitude: 2, color: '#7FFF00' },         // Head
    { id: 1, name: 'Left Horn', azimuth: 330, altitude: 70, magnitude: 3, color: '#32CD32' },    // Left ear (horn)
    { id: 2, name: 'Right Horn', azimuth: 30, altitude: 70, magnitude: 3, color: '#32CD32' },    // Right ear (horn)
    { id: 3, name: 'Front Left Wing', azimuth: 300, altitude: 45, magnitude: 3, color: '#90EE90' }, // Front left limb
    { id: 4, name: 'Front Right Wing', azimuth: 60, altitude: 45, magnitude: 3, color: '#90EE90' },  // Front right limb
    { id: 5, name: 'Back Left Claw', azimuth: 240, altitude: 28, magnitude: 4, color: '#1A4D2E' },   // Back left limb
    { id: 6, name: 'Back Right Claw', azimuth: 120, altitude: 28, magnitude: 4, color: '#1A4D2E' },  // Back right limb
    { id: 7, name: 'Tail Seg 1', azimuth: 195, altitude: 35, magnitude: 3, color: '#7FFF00' },   // Tail segment 1
    { id: 8, name: 'Tail Seg 2', azimuth: 210, altitude: 20, magnitude: 4, color: '#32CD32' },   // Tail segment 2
    { id: 9, name: 'Tail Tip', azimuth: 225, altitude: 8, magnitude: 4, color: '#90EE90' },      // Tail tip
  ],
  connections: [
    [0, 1], [0, 2],      // Head to horns
    [0, 3], [0, 4],      // Head to wings
    [3, 5], [4, 6],      // Wings to claws
    [0, 7], [7, 8], [8, 9], // Winding tail
  ],
  bodyMapping: {
    head: 0,
    ears: [1, 2],
    limbs: [3, 4, 5, 6],
    tail: [7, 8, 9],
  },
};

/**
 * Cygnus - The Swan
 * An elegant cross-shaped constellation for balanced Guardians
 */
const CYGNUS: ConstellationPattern = {
  name: 'Cygnus',
  displayName: 'Cygnus the Swan',
  description: 'A graceful swan constellation soaring through the cosmos',
  stars: [
    { id: 0, name: 'Deneb', azimuth: 0, altitude: 68, magnitude: 1, color: '#E0E7FF' },          // Head (bright white)
    { id: 1, name: 'Left Wing Tip', azimuth: 345, altitude: 58, magnitude: 3, color: '#C4B5FD' }, // Left ear
    { id: 2, name: 'Right Wing Tip', azimuth: 15, altitude: 58, magnitude: 3, color: '#C4B5FD' }, // Right ear
    { id: 3, name: 'Left Wing', azimuth: 270, altitude: 45, magnitude: 2, color: '#8B5CF6' },    // Front left limb
    { id: 4, name: 'Right Wing', azimuth: 90, altitude: 45, magnitude: 2, color: '#8B5CF6' },    // Front right limb
    { id: 5, name: 'Left Foot', azimuth: 250, altitude: 25, magnitude: 4, color: '#4A148C' },    // Back left limb
    { id: 6, name: 'Right Foot', azimuth: 110, altitude: 25, magnitude: 4, color: '#4A148C' },   // Back right limb
    { id: 7, name: 'Tail', azimuth: 180, altitude: 12, magnitude: 3, color: '#6A1B9A' },         // Tail
  ],
  connections: [
    [0, 1], [0, 2],  // Head to wing tips
    [0, 3], [0, 4],  // Head to wings
    [3, 5], [4, 6],  // Wings to feet
    [0, 7],          // Head to tail
    [3, 4],          // Cross connection (wings)
  ],
  bodyMapping: {
    head: 0,
    ears: [1, 2],
    limbs: [3, 4, 5, 6],
    tail: [7],
  },
};

/**
 * Andromeda - The Princess
 * A regal constellation for noble Guardians
 */
const ANDROMEDA: ConstellationPattern = {
  name: 'Andromeda',
  displayName: 'Andromeda the Princess',
  description: 'A royal constellation of elegance and nobility',
  stars: [
    { id: 0, name: 'Alpheratz', azimuth: 0, altitude: 72, magnitude: 2, color: '#FFD700' },      // Head (golden)
    { id: 1, name: 'Left Crown', azimuth: 335, altitude: 65, magnitude: 3, color: '#F4B942' },   // Left ear
    { id: 2, name: 'Right Crown', azimuth: 25, altitude: 65, magnitude: 3, color: '#F4B942' },   // Right ear
    { id: 3, name: 'Mirach', azimuth: 285, altitude: 48, magnitude: 2, color: '#4ECDC4' },       // Front left limb
    { id: 4, name: 'Delta', azimuth: 75, altitude: 48, magnitude: 3, color: '#4ECDC4' },         // Front right limb
    { id: 5, name: 'Back Left', azimuth: 235, altitude: 30, magnitude: 4, color: '#2C3E77' },    // Back left limb
    { id: 6, name: 'Back Right', azimuth: 125, altitude: 30, magnitude: 4, color: '#2C3E77' },   // Back right limb
    { id: 7, name: 'Tail', azimuth: 180, altitude: 18, magnitude: 4, color: '#1a1f3a' },         // Tail
  ],
  connections: [
    [0, 1], [0, 2],  // Head to crown
    [0, 3], [0, 4],  // Head to front limbs
    [3, 5], [4, 6],  // Front to back limbs
    [0, 7],          // Head to tail
  ],
  bodyMapping: {
    head: 0,
    ears: [1, 2],
    limbs: [3, 4, 5, 6],
    tail: [7],
  },
};

/**
 * Phoenix - The Firebird
 * A fiery constellation for energetic Guardians
 */
const PHOENIX: ConstellationPattern = {
  name: 'Phoenix',
  displayName: 'Phoenix the Firebird',
  description: 'A legendary firebird constellation of rebirth and power',
  stars: [
    { id: 0, name: 'Ankaa', azimuth: 0, altitude: 67, magnitude: 2, color: '#FF6F00' },          // Head (orange)
    { id: 1, name: 'Left Flame', azimuth: 325, altitude: 72, magnitude: 3, color: '#FFD600' },   // Left ear
    { id: 2, name: 'Right Flame', azimuth: 35, altitude: 72, magnitude: 3, color: '#FFD600' },   // Right ear
    { id: 3, name: 'Left Wing', azimuth: 295, altitude: 42, magnitude: 3, color: '#FF8C42' },    // Front left limb
    { id: 4, name: 'Right Wing', azimuth: 65, altitude: 42, magnitude: 3, color: '#FF8C42' },    // Front right limb
    { id: 5, name: 'Left Talon', azimuth: 245, altitude: 22, magnitude: 4, color: '#FF1744' },   // Back left limb
    { id: 6, name: 'Right Talon', azimuth: 115, altitude: 22, magnitude: 4, color: '#FF1744' },  // Back right limb
    { id: 7, name: 'Tail Flame 1', azimuth: 200, altitude: 28, magnitude: 3, color: '#FF6F00' }, // Tail segment 1
    { id: 8, name: 'Tail Flame 2', azimuth: 180, altitude: 12, magnitude: 4, color: '#FFD600' }, // Tail tip
  ],
  connections: [
    [0, 1], [0, 2],  // Head to flames
    [0, 3], [0, 4],  // Head to wings
    [3, 5], [4, 6],  // Wings to talons
    [0, 7], [7, 8],  // Tail flames
  ],
  bodyMapping: {
    head: 0,
    ears: [1, 2],
    limbs: [3, 4, 5, 6],
    tail: [7, 8],
  },
};

/**
 * Ursa - The Bear
 * A sturdy constellation for strong, protective Guardians
 */
const URSA: ConstellationPattern = {
  name: 'Ursa',
  displayName: 'Ursa the Great Bear',
  description: 'A mighty bear constellation, strong and steadfast',
  stars: [
    { id: 0, name: 'Dubhe', azimuth: 0, altitude: 65, magnitude: 2, color: '#2DD4BF' },          // Head
    { id: 1, name: 'Left Ear', azimuth: 340, altitude: 70, magnitude: 3, color: '#4ECDC4' },     // Left ear
    { id: 2, name: 'Right Ear', azimuth: 20, altitude: 70, magnitude: 3, color: '#4ECDC4' },     // Right ear
    { id: 3, name: 'Merak', azimuth: 285, altitude: 42, magnitude: 2, color: '#1a4d4d' },        // Front left limb
    { id: 4, name: 'Phecda', azimuth: 75, altitude: 42, magnitude: 2, color: '#1a4d4d' },        // Front right limb
    { id: 5, name: 'Back Left', azimuth: 235, altitude: 28, magnitude: 3, color: '#0d1321' },    // Back left limb
    { id: 6, name: 'Back Right', azimuth: 125, altitude: 28, magnitude: 3, color: '#0d1321' },   // Back right limb
    { id: 7, name: 'Alkaid', azimuth: 180, altitude: 20, magnitude: 2, color: '#2DD4BF' },       // Tail
  ],
  connections: [
    [0, 1], [0, 2],  // Head to ears
    [0, 3], [0, 4],  // Head to front limbs
    [3, 5], [4, 6],  // Front to back limbs
    [0, 7],          // Head to tail
    [3, 4], [5, 6],  // Cross connections (dipper shape)
  ],
  bodyMapping: {
    head: 0,
    ears: [1, 2],
    limbs: [3, 4, 5, 6],
    tail: [7],
  },
};

/**
 * All constellation definitions
 */
export const CONSTELLATIONS: Record<ConstellationName, ConstellationPattern> = {
  Orion: ORION,
  Lyra: LYRA,
  Draco: DRACO,
  Cygnus: CYGNUS,
  Andromeda: ANDROMEDA,
  Phoenix: PHOENIX,
  Ursa: URSA,
  Custom: {
    name: 'Custom',
    displayName: 'Custom Constellation',
    description: 'Create your own unique star pattern',
    stars: [],
    connections: [],
    bodyMapping: {},
  },
};

/**
 * Get constellation by name
 */
export function getConstellation(name: ConstellationName): ConstellationPattern {
  return CONSTELLATIONS[name];
}

/**
 * Get random constellation (excluding Custom)
 */
export function getRandomConstellation(): ConstellationPattern {
  const names = Object.keys(CONSTELLATIONS).filter(n => n !== 'Custom') as ConstellationName[];
  const randomName = names[Math.floor(Math.random() * names.length)];
  return CONSTELLATIONS[randomName];
}

/**
 * Get constellation names as array
 */
export function getConstellationNames(): ConstellationName[] {
  return Object.keys(CONSTELLATIONS) as ConstellationName[];
}

/**
 * Map Guardian form to constellation
 * Provides default constellation associations
 */
export function formToConstellation(formKey: string): ConstellationName {
  const formMap: Record<string, ConstellationName> = {
    radiant: 'Andromeda',    // Noble and balanced
    meditation: 'Ursa',      // Calm and steady
    sage: 'Lyra',            // Harmonious and wise
    vigilant: 'Orion',       // Strong and focused
    celestial: 'Cygnus',     // Ethereal and graceful
    wild: 'Draco',           // Primal and powerful
  };

  return formMap[formKey] || 'Orion';
}
