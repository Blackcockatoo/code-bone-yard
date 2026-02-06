/**
 * MetaPet Breeding System
 * Advanced genetic combination and resonance logic
 */

import { Offspring } from '@/guardian/persistence';

export interface Genome {
  red60: number;
  blue60: number;
  black60: number;
}

/**
 * Check if a number is prime (used for mutation bonuses)
 */
function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * Calculate resonance between two genomes
 * Higher resonance leads to better stats or unique traits
 */
export function calculateResonance(g1: Genome, g2: Genome): number {
  const diffRed = Math.abs(g1.red60 - g2.red60);
  const diffBlue = Math.abs(g1.blue60 - g2.blue60);
  const diffBlack = Math.abs(g1.black60 - g2.black60);

  // Harmonic resonance: lower difference in certain frequencies is better
  const baseResonance = 100 - (diffRed + diffBlue + diffBlack) / 3;

  // Prime bonus: if the sum of a frequency pair is prime, add resonance
  let primeBonus = 0;
  if (isPrime(Math.floor(g1.red60 + g2.red60))) primeBonus += 5;
  if (isPrime(Math.floor(g1.blue60 + g2.blue60))) primeBonus += 5;
  if (isPrime(Math.floor(g1.black60 + g2.black60))) primeBonus += 5;

  return Math.min(100, baseResonance + primeBonus);
}

/**
 * Generate a mutation value based on resonance and randomness
 */
function getMutation(resonance: number, prng: () => number): number {
  const baseMutationChance = 0.1;
  const mutationIntensity = (100 - resonance) / 10; // Lower resonance = higher mutation

  if (prng() < baseMutationChance) {
    return (prng() - 0.5) * mutationIntensity;
  }
  return 0;
}

/**
 * Breed two parents to create an offspring
 */
export function breed(
  parent1Name: string,
  parent1Genome: Genome,
  parent2Name: string,
  parent2Genome: Genome,
  prng: () => number
): Offspring {
  const resonance = calculateResonance(parent1Genome, parent2Genome);

  const childGenome: Genome = {
    red60: Math.max(0, Math.min(100, (parent1Genome.red60 + parent2Genome.red60) / 2 + getMutation(resonance, prng))),
    blue60: Math.max(0, Math.min(100, (parent1Genome.blue60 + parent2Genome.blue60) / 2 + getMutation(resonance, prng))),
    black60: Math.max(0, Math.min(100, (parent1Genome.black60 + parent2Genome.black60) / 2 + getMutation(resonance, prng))),
  };

  // Generate a name by combining parent names
  const name1Part = parent1Name.slice(0, Math.ceil(parent1Name.length / 2));
  const name2Part = parent2Name.slice(Math.floor(parent2Name.length / 2));
  const childName = `${name1Part}${name2Part}`.toUpperCase();

  return {
    name: childName,
    genome: childGenome,
    parents: [parent1Name, parent2Name],
    birthDate: Date.now(),
  };
}
