/**
 * Game Plugin System Types
 * Defines the interface for pluggable mini-games
 */

import type { Genome, DerivedTraits } from "@/lib/genome";
import type { Vitals } from "@/lib/store";
import type { ComponentType } from "react";

/**
 * Game rewards that are applied to the pet after completion
 */
export interface GameRewards {
  xp: number;
  moodBoost: number;
  energyCost: number;
  hygieneChange?: number;
  hungerChange?: number;
}

/**
 * Pet data passed to game components
 */
export interface GamePetData {
  genome: Genome;
  traits: DerivedTraits;
  vitals: Vitals;
}

/**
 * Props passed to game components
 */
export interface GameSlotProps {
  pet: GamePetData;
  onComplete: (rewards: GameRewards) => void;
  onExit: () => void;
}

/**
 * Evolution stages that gate game access
 */
export type EvolutionStage =
  | "EMERGENCE"
  | "AWAKENING"
  | "RESONANCE"
  | "TRANSCENDENCE"
  | "ASCENSION";

/**
 * Game plugin definition
 */
export interface GamePlugin {
  /** Unique game identifier */
  id: string;

  /** Display name */
  name: string;

  /** Short description */
  description: string;

  /** Minimum evolution stage required to unlock */
  requiredEvolutionStage: EvolutionStage;

  /** React component that implements the game */
  component: ComponentType<GameSlotProps>;

  /** Default rewards for completing the game */
  rewards: GameRewards;

  /** Optional icon/emoji for the game */
  icon?: string;

  /** Optional difficulty rating */
  difficulty?: "easy" | "medium" | "hard";
}

/**
 * Game registry - add new games here
 */
export const GAME_REGISTRY: Record<string, GamePlugin> = {
  // Example game entry (commented out)
  // puzzle: {
  //   id: 'puzzle',
  //   name: 'Cosmic Puzzle',
  //   description: 'Match patterns to unlock rewards',
  //   requiredEvolutionStage: 'EMERGENCE',
  //   component: lazy(() => import('@/components/games/PuzzleGame')),
  //   rewards: { xp: 50, moodBoost: 10, energyCost: 15 },
  //   icon: '🧩',
  //   difficulty: 'easy',
  // },
};

/**
 * Check if a game is unlocked for the current evolution stage
 */
export function isGameUnlocked(
  gameId: string,
  currentStage: EvolutionStage,
): boolean {
  const game = GAME_REGISTRY[gameId];
  if (!game) return false;

  const stages: EvolutionStage[] = [
    "EMERGENCE",
    "AWAKENING",
    "RESONANCE",
    "TRANSCENDENCE",
    "ASCENSION",
  ];

  const currentIndex = stages.indexOf(currentStage);
  const requiredIndex = stages.indexOf(game.requiredEvolutionStage);

  return currentIndex >= requiredIndex;
}

/**
 * Get all available games for the current evolution stage
 */
export function getAvailableGames(currentStage: EvolutionStage): GamePlugin[] {
  return Object.values(GAME_REGISTRY).filter((game) =>
    isGameUnlocked(game.id, currentStage),
  );
}
