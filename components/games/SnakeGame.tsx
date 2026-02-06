'use client';

import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';

// Constants
const GRID_SIZE = 20;
const CELL_SIZE = 16;
const INITIAL_SPEED = 200;
const SPEED_DECREASE = 10;
const MIN_SPEED = 80;
const POINTS_PER_FOOD = 10;
const LEVEL_UP_THRESHOLD = 50;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameState = 'playing' | 'paused' | 'gameover';

interface Position {
  x: number;
  y: number;
}

interface State {
  snake: Position[];
  direction: Direction;
  nextDirection: Direction;
  food: Position;
  score: number;
  level: number;
  gameState: GameState;
  speed: number;
}

type Action =
  | { type: 'MOVE' }
  | { type: 'SET_DIRECTION'; direction: Direction }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'GAME_OVER' }
  | { type: 'RESET'; prng: () => number };

function createInitialState(prng: () => number): State {
  const centerX = Math.floor(GRID_SIZE / 2);
  const centerY = Math.floor(GRID_SIZE / 2);
  const snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];

  return {
    snake,
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: spawnFood(snake, prng),
    score: 0,
    level: 1,
    gameState: 'playing',
    speed: INITIAL_SPEED,
  };
}

function spawnFood(snake: Position[], prng: () => number): Position {
  let newFood: Position;
  let attempts = 0;
  do {
    newFood = {
      x: Math.floor(prng() * GRID_SIZE),
      y: Math.floor(prng() * GRID_SIZE),
    };
    attempts++;
  } while (snake.some((s) => s.x === newFood.x && s.y === newFood.y) && attempts < 1000);
  return newFood;
}

function createReducer(prng: () => number) {
  return function reducer(state: State, action: Action): State {
    switch (action.type) {
      case 'SET_DIRECTION': {
        const { direction } = action;
        const opposite: Record<Direction, Direction> = {
          UP: 'DOWN',
          DOWN: 'UP',
          LEFT: 'RIGHT',
          RIGHT: 'LEFT',
        };
        if (opposite[direction] === state.direction) {
          return state;
        }
        return { ...state, nextDirection: direction };
      }

      case 'MOVE': {
        if (state.gameState !== 'playing') return state;

        const direction = state.nextDirection;
        const head = state.snake[0];
        const delta: Record<Direction, Position> = {
          UP: { x: 0, y: -1 },
          DOWN: { x: 0, y: 1 },
          LEFT: { x: -1, y: 0 },
          RIGHT: { x: 1, y: 0 },
        };

        const newHead: Position = {
          x: head.x + delta[direction].x,
          y: head.y + delta[direction].y,
        };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          return { ...state, gameState: 'gameover' };
        }

        // Self collision (excluding tail since it moves)
        const bodyWithoutTail = state.snake.slice(0, -1);
        if (bodyWithoutTail.some((s) => s.x === newHead.x && s.y === newHead.y)) {
          return { ...state, gameState: 'gameover' };
        }

        // Check if eating food
        const eating = newHead.x === state.food.x && newHead.y === state.food.y;
        const newSnake = eating
          ? [newHead, ...state.snake]
          : [newHead, ...state.snake.slice(0, -1)];

        if (eating) {
          const newScore = state.score + POINTS_PER_FOOD;
          const newLevel = Math.floor(newScore / LEVEL_UP_THRESHOLD) + 1;
          const newSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - (newLevel - 1) * SPEED_DECREASE);

          return {
            ...state,
            snake: newSnake,
            direction,
            food: spawnFood(newSnake, prng),
            score: newScore,
            level: newLevel,
            speed: newSpeed,
          };
        }

        return {
          ...state,
          snake: newSnake,
          direction,
        };
      }

      case 'PAUSE':
        return state.gameState === 'playing' ? { ...state, gameState: 'paused' } : state;

      case 'RESUME':
        return state.gameState === 'paused' ? { ...state, gameState: 'playing' } : state;

      case 'GAME_OVER':
        return { ...state, gameState: 'gameover' };

      case 'RESET':
        return createInitialState(action.prng);

      default:
        return state;
    }
  };
}

export function SnakeGame({
  prng,
  audioEnabled,
  playNote,
  onClose,
  onWin,
  onWhisper,
}: {
  prng: () => number;
  audioEnabled: boolean;
  playNote: (note: number, volume?: number) => void;
  onClose: () => void;
  onWin: (score: number) => void;
  onWhisper: (message: string) => void;
}) {
  const reducer = useCallback(() => createReducer(prng), [prng]);
  const [state, dispatch] = useReducer(reducer(), createInitialState(prng));
  const { snake, food, score, level, gameState, speed, direction } = state;

  const prevScoreRef = useRef(score);
  const prevLevelRef = useRef(level);
  const gameOverHandledRef = useRef(false);

  // Touch state
  const [touchStart, setTouchStart] = useState<Position | null>(null);

  // Sound effects for eating
  useEffect(() => {
    if (score > prevScoreRef.current && audioEnabled) {
      playNote(4, 0.3);
    }
    prevScoreRef.current = score;
  }, [score, audioEnabled, playNote]);

  // Sound effects for level up
  useEffect(() => {
    if (level > prevLevelRef.current && audioEnabled) {
      [0, 2, 4].forEach((n, i) => setTimeout(() => playNote(n, 0.4), i * 100));
      onWhisper(`Level ${level}! Speed increasing...`);
    }
    prevLevelRef.current = level;
  }, [level, audioEnabled, playNote, onWhisper]);

  // Game over handling
  useEffect(() => {
    if (gameState === 'gameover' && !gameOverHandledRef.current) {
      gameOverHandledRef.current = true;
      if (audioEnabled) {
        [6, 4, 2, 0].forEach((n, i) => setTimeout(() => playNote(n, 0.3), i * 150));
      }
      onWhisper(`Game Over! Final score: ${score}`);
      setTimeout(() => {
        onWin(score);
        onClose();
      }, 1500);
    }
  }, [gameState, score, audioEnabled, playNote, onWin, onClose, onWhisper]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      dispatch({ type: 'MOVE' });
    }, speed);

    return () => clearInterval(interval);
  }, [gameState, speed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          dispatch({ type: 'SET_DIRECTION', direction: 'UP' });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          dispatch({ type: 'SET_DIRECTION', direction: 'DOWN' });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          dispatch({ type: 'SET_DIRECTION', direction: 'LEFT' });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          dispatch({ type: 'SET_DIRECTION', direction: 'RIGHT' });
          break;
        case ' ':
          e.preventDefault();
          if (gameState === 'playing') {
            dispatch({ type: 'PAUSE' });
          } else if (gameState === 'paused') {
            dispatch({ type: 'RESUME' });
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, onClose]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;

      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      const minSwipe = 30;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
        dispatch({ type: 'SET_DIRECTION', direction: dx > 0 ? 'RIGHT' : 'LEFT' });
      } else if (Math.abs(dy) > minSwipe) {
        dispatch({ type: 'SET_DIRECTION', direction: dy > 0 ? 'DOWN' : 'UP' });
      }

      setTouchStart(null);
    },
    [touchStart]
  );

  // D-pad button handler
  const handleDpadPress = useCallback((dir: Direction) => {
    dispatch({ type: 'SET_DIRECTION', direction: dir });
  }, []);

  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      dispatch({ type: 'PAUSE' });
    } else if (gameState === 'paused') {
      dispatch({ type: 'RESUME' });
    }
  }, [gameState]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60">
      <div className="w-[400px] max-w-[95vw] rounded-xl border border-emerald-500/30 bg-gray-900/90 p-4 text-white backdrop-blur-sm">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-emerald-400">Snake</h3>
          <div className="flex gap-4 text-sm text-emerald-300">
            <span>Score: {score}</span>
            <span>Level: {level}</span>
          </div>
        </div>

        {/* Game Board */}
        <div
          className="relative mx-auto touch-none rounded-lg border border-emerald-500/20 bg-gray-800"
          style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, #10b981 1px, transparent 1px),
                linear-gradient(to bottom, #10b981 1px, transparent 1px)
              `,
              backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
            }}
          />

          {/* Snake segments */}
          {snake.map((segment, i) => (
            <div
              key={i}
              className={`absolute rounded-sm transition-all duration-75 ${
                i === 0
                  ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50'
                  : 'bg-emerald-600'
              }`}
              style={{
                left: segment.x * CELL_SIZE + 1,
                top: segment.y * CELL_SIZE + 1,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
              }}
            >
              {/* Snake eyes on head */}
              {i === 0 && (
                <>
                  <div
                    className="absolute h-1.5 w-1.5 rounded-full bg-gray-900"
                    style={{
                      top: direction === 'DOWN' ? '60%' : direction === 'UP' ? '10%' : '30%',
                      left: direction === 'RIGHT' ? '60%' : direction === 'LEFT' ? '10%' : '20%',
                    }}
                  />
                  <div
                    className="absolute h-1.5 w-1.5 rounded-full bg-gray-900"
                    style={{
                      top: direction === 'DOWN' ? '60%' : direction === 'UP' ? '10%' : '30%',
                      right: direction === 'LEFT' ? '60%' : direction === 'RIGHT' ? '10%' : '20%',
                    }}
                  />
                </>
              )}
            </div>
          ))}

          {/* Food */}
          <div
            className="absolute animate-pulse rounded-full bg-red-500 shadow-lg shadow-red-500/50"
            style={{
              left: food.x * CELL_SIZE + 3,
              top: food.y * CELL_SIZE + 3,
              width: CELL_SIZE - 6,
              height: CELL_SIZE - 6,
            }}
          />

          {/* Pause overlay */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-400">PAUSED</p>
                <p className="mt-2 text-sm text-gray-400">Press Space to resume</p>
              </div>
            </div>
          )}

          {/* Game over overlay */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/70">
              <div className="text-center">
                <p className="text-xl font-bold text-red-400">GAME OVER</p>
                <p className="mt-2 text-lg text-emerald-400">Score: {score}</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop controls info */}
        <div className="mt-4 hidden text-center text-xs text-gray-400 md:block">
          Arrow keys / WASD to move | Space to pause | Esc to exit
        </div>

        {/* Mobile D-pad */}
        <div className="mt-4 md:hidden">
          <div className="mx-auto grid w-36 grid-cols-3 gap-1">
            <div />
            <button
              onTouchStart={() => handleDpadPress('UP')}
              className="flex h-10 items-center justify-center rounded bg-emerald-700/80 text-sm font-bold text-white active:bg-emerald-600"
            >
              UP
            </button>
            <div />
            <button
              onTouchStart={() => handleDpadPress('LEFT')}
              className="flex h-10 items-center justify-center rounded bg-emerald-700/80 text-sm font-bold text-white active:bg-emerald-600"
            >
              LEFT
            </button>
            <button
              onClick={togglePause}
              className="flex h-10 items-center justify-center rounded bg-gray-700/80 text-xs text-white active:bg-gray-600"
            >
              {gameState === 'paused' ? 'GO' : 'II'}
            </button>
            <button
              onTouchStart={() => handleDpadPress('RIGHT')}
              className="flex h-10 items-center justify-center rounded bg-emerald-700/80 text-sm font-bold text-white active:bg-emerald-600"
            >
              RIGHT
            </button>
            <div />
            <button
              onTouchStart={() => handleDpadPress('DOWN')}
              className="flex h-10 items-center justify-center rounded bg-emerald-700/80 text-sm font-bold text-white active:bg-emerald-600"
            >
              DOWN
            </button>
            <div />
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={togglePause}
            className="hidden rounded bg-emerald-600 px-4 py-2 text-sm hover:bg-emerald-500 md:block"
          >
            {gameState === 'paused' ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={onClose}
            className="rounded bg-gray-700 px-4 py-2 text-sm hover:bg-gray-600"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

export default SnakeGame;
