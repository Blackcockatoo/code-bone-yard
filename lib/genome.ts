/**
 * Genome System - Fibonacci-60 Residue calculations
 * Provides residue mapping and metadata for the GenomeJewbleRing
 */

// Fibonacci-60 cycle (last digits)
const FIB60_CYCLE = [
  0, 1, 1, 2, 3, 5, 8, 3, 1, 4, 5, 9, 4, 3, 7, 0, 7, 7, 4, 1,
  5, 6, 1, 7, 8, 5, 3, 8, 1, 9, 0, 9, 9, 8, 7, 5, 2, 7, 9, 6,
  5, 1, 6, 7, 3, 0, 3, 3, 6, 9, 5, 4, 9, 3, 2, 5, 7, 2, 9, 1
];

// Periodic table element symbols for each residue position
const ELEMENTS_2D = [
  [], ['H'], ['He'], ['Li'], ['Be'], ['B'], ['C'], ['N'], ['O'], ['F'],
  ['Ne'], ['Na'], ['Mg'], ['Al'], ['Si'], ['P'], ['S'], ['Cl'], ['Ar'], ['K'],
  ['Ca'], ['Sc'], ['Ti'], ['V'], ['Cr'], ['Mn'], ['Fe'], ['Co'], ['Ni'], ['Cu'],
  ['Zn'], ['Ga'], ['Ge'], ['As'], ['Se'], ['Br'], ['Kr'], ['Rb'], ['Sr'], ['Y'],
  ['Zr'], ['Nb'], ['Mo'], ['Tc'], ['Ru'], ['Rh'], ['Pd'], ['Ag'], ['Cd'], ['In'],
  ['Sn'], ['Sb'], ['Te'], ['I'], ['Xe'], ['Cs'], ['Ba'], ['La'], ['Ce'], ['Pr']
];

const ELEMENTS_3D: string[][] = Array(60).fill([]);

// Frontier residues (prime positions in Fibonacci cycle)
const FRONTIER_RESIDUES = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]);

// Pair-60 residues (positions that have symmetric pairs)
const PAIR_60_RESIDUES = new Set([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);

export interface ResidueMeta {
  residue: number;
  fibDigit: number;
  elements2d: string[];
  elements3d: string[];
  isFrontierResidue: boolean;
  hasPair60: boolean;
}

/**
 * Get the residue (position in Fibonacci-60 cycle) for a value
 */
export function getResidue(value: number): number {
  return ((value % 60) + 60) % 60;
}

/**
 * Get metadata for a residue position
 */
export function getResidueMeta(residue: number): ResidueMeta {
  const normalizedResidue = getResidue(residue);
  return {
    residue: normalizedResidue,
    fibDigit: FIB60_CYCLE[normalizedResidue],
    elements2d: ELEMENTS_2D[normalizedResidue] || [],
    elements3d: ELEMENTS_3D[normalizedResidue] || [],
    isFrontierResidue: FRONTIER_RESIDUES.has(normalizedResidue),
    hasPair60: PAIR_60_RESIDUES.has(normalizedResidue),
  };
}

/**
 * Convert a string sequence to digit array
 */
export function toDigits(sequence: string): number[] {
  return sequence.split('').map(ch => {
    const d = ch.charCodeAt(0) - 48;
    if (d < 0 || d > 9) return 0;
    return d;
  });
}

// MossPrimeSeed sequences
export const RED_SEQUENCE = "113031491493585389543778774590997079619617525721567332336510";
export const BLACK_SEQUENCE = "011235831459437077415617853819099875279651673033695493257291";
export const BLUE_SEQUENCE = "012776329785893036118967145479098334781325217074992143965631";

/**
 * Get default genome digits from MossPrimeSeed
 */
export function getDefaultGenomeDigits() {
  return {
    red: toDigits(RED_SEQUENCE),
    black: toDigits(BLACK_SEQUENCE),
    blue: toDigits(BLUE_SEQUENCE),
  };
}
