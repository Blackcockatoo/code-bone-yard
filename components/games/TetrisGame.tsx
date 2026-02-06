'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

// Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 20;
const INITIAL_DROP_SPEED = 1000;
const SPEED_FACTOR = 0.85;
const MIN_DROP_SPEED = 100;
const LINES_PER_LEVEL = 10;

const POINTS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2,
};

type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
type GameState = 'playing' | 'paused' | 'gameover';

interface Position {
  x: number;
  y: number;
}

interface Tetromino {
  type: PieceType;
  shape: boolean[][];
  color: number;
}

// Tetromino definitions
const TETROMINOES: Record<PieceType, { shape: boolean[][]; color: number }> = {
  I: {
    shape: [
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false],
    ],
    color: 1,
  },
  O: {
    shape: [
      [true, true],
      [true, true],
    ],
    color: 2,
  },
  T: {
    shape: [
      [false, true, false],
      [true, true, true],
      [false, false, false],
    ],
    color: 3,
  },
  S: {
    shape: [
      [false, true, true],
      [true, true, false],
      [false, false, false],
    ],
    color: 4,
  },
  Z: {
    shape: [
      [true, true, false],
      [false, true, true],
      [false, false, false],
    ],
    color: 5,
  },
  J: {
    shape: [
      [true, false, false],
      [true, true, true],
      [false, false, false],
    ],
    color: 6,
  },
  L: {
    shape: [
      [false, false, true],
      [true, true, true],
      [false, false, false],
    ],
    color: 7,
  },
};

const COLORS = [
  'transparent',
  '#00FFFF', // I - Cyan
  '#FFFF00', // O - Yellow
  '#9900FF', // T - Purple
  '#00FF00', // S - Green
  '#FF0000', // Z - Red
  '#0000FF', // J - Blue
  '#FF9900', // L - Orange
];

// Wall kick data for SRS (Super Rotation System)
const WALL_KICKS: Record<string, number[][]> = {
  // Normal pieces (T, S, Z, J, L)
  '0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3>0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3>2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

// I piece has different wall kicks
const I_WALL_KICKS: Record<string, number[][]> = {
  '0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '1>0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '2>1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '3>2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '0>3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

function createEmptyBoard(): number[][] {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
}

function rotateMatrix(matrix: boolean[][], clockwise: boolean): boolean[][] {
  const size = matrix.length;
  const rotated: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (clockwise) {
        rotated[x][size - 1 - y] = matrix[y][x];
      } else {
        rotated[size - 1 - x][y] = matrix[y][x];
      }
    }
  }

  return rotated;
}

function getRotatedShape(piece: Tetromino, rotation: number): boolean[][] {
  let shape = piece.shape;
  for (let i = 0; i < rotation; i++) {
    shape = rotateMatrix(shape, true);
  }
  return shape;
}

export function TetrisGame({
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
  // Game state
  const [board, setBoard] = useState<number[][]>(() => createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [piecePosition, setPiecePosition] = useState<Position>({ x: 0, y: 0 });
  const [pieceRotation, setPieceRotation] = useState(0);
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState>('playing');

  // 7-bag randomizer
  const bagRef = useRef<PieceType[]>([]);

  const gameOverHandledRef = useRef(false);
  const lastDropRef = useRef(0);
  const gameLoopRef = useRef<number>();

  // Calculate drop speed based on level
  const dropSpeed = Math.max(MIN_DROP_SPEED, INITIAL_DROP_SPEED * Math.pow(SPEED_FACTOR, level - 1));

  // Get next piece from bag
  const getNextPiece = useCallback((): Tetromino => {
    if (bagRef.current.length === 0) {
      // Refill bag with all 7 pieces
      const pieces: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      // Fisher-Yates shuffle
      for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(prng() * (i + 1));
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
      }
      bagRef.current = pieces;
    }

    const type = bagRef.current.pop()!;
    return {
      type,
      shape: TETROMINOES[type].shape,
      color: TETROMINOES[type].color,
    };
  }, [prng]);

  // Check collision
  const checkCollision = useCallback((
    piece: Tetromino,
    pos: Position,
    rotation: number,
    boardState: number[][]
  ): boolean => {
    const shape = getRotatedShape(piece, rotation);

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;

          // Check bounds
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }

          // Check board collision (only if within visible area)
          if (newY >= 0 && boardState[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }

    return false;
  }, []);

  // Calculate ghost piece Y position
  const calculateGhostY = useCallback((
    piece: Tetromino,
    pos: Position,
    rotation: number,
    boardState: number[][]
  ): number => {
    let ghostY = pos.y;
    while (!checkCollision(piece, { x: pos.x, y: ghostY + 1 }, rotation, boardState)) {
      ghostY++;
    }
    return ghostY;
  }, [checkCollision]);

  // Spawn new piece
  const spawnPiece = useCallback(() => {
    const piece = nextPiece || getNextPiece();
    const next = getNextPiece();

    const startX = Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2);
    const startY = piece.type === 'I' ? -1 : 0;

    if (checkCollision(piece, { x: startX, y: startY }, 0, board)) {
      setGameState('gameover');
      return;
    }

    setCurrentPiece(piece);
    setNextPiece(next);
    setPiecePosition({ x: startX, y: startY });
    setPieceRotation(0);
  }, [nextPiece, getNextPiece, checkCollision, board]);

  // Initialize game
  useEffect(() => {
    spawnPiece();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock piece to board
  const lockPiece = useCallback(() => {
    if (!currentPiece) return;

    const shape = getRotatedShape(currentPiece, pieceRotation);
    const newBoard = board.map(row => [...row]);

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = piecePosition.y + y;
          const boardX = piecePosition.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }

    // Check for completed lines
    const completedLines: number[] = [];
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        completedLines.push(y);
      }
    }

    // Remove completed lines
    if (completedLines.length > 0) {
      for (const lineY of completedLines) {
        newBoard.splice(lineY, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
      }

      // Calculate score
      const linePoints = [0, POINTS.SINGLE, POINTS.DOUBLE, POINTS.TRIPLE, POINTS.TETRIS];
      const pointsEarned = linePoints[completedLines.length] * level;

      setScore(s => s + pointsEarned);
      setLines(l => {
        const newLines = l + completedLines.length;
        const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
          if (audioEnabled) {
            [0, 2, 4, 6].forEach((n, i) => setTimeout(() => playNote(n, 0.5), i * 100));
          }
          onWhisper(`Level ${newLevel}! Speed increasing...`);
        }
        return newLines;
      });

      // Play line clear sound
      if (audioEnabled) {
        const lineNotes: Record<number, number[]> = {
          1: [2],
          2: [2, 4],
          3: [2, 4, 5],
          4: [0, 2, 4, 6],
        };
        lineNotes[completedLines.length]?.forEach((n, i) =>
          setTimeout(() => playNote(n, 0.4), i * 80)
        );
      }
    }

    setBoard(newBoard);

    // Play lock sound
    if (audioEnabled) playNote(0, 0.2);

    // Check game over (pieces locked above visible area)
    if (piecePosition.y < 0) {
      setGameState('gameover');
      return;
    }

    setCurrentPiece(null);
  }, [currentPiece, piecePosition, pieceRotation, board, level, audioEnabled, playNote, onWhisper]);

  // Spawn new piece after locking
  useEffect(() => {
    if (!currentPiece && gameState === 'playing') {
      spawnPiece();
    }
  }, [currentPiece, gameState, spawnPiece]);

  // Move piece
  const movePiece = useCallback((dx: number, dy: number): boolean => {
    if (!currentPiece || gameState !== 'playing') return false;

    const newPos = { x: piecePosition.x + dx, y: piecePosition.y + dy };

    if (!checkCollision(currentPiece, newPos, pieceRotation, board)) {
      setPiecePosition(newPos);
      if (audioEnabled && dx !== 0) playNote(1, 0.1);
      return true;
    }

    return false;
  }, [currentPiece, piecePosition, pieceRotation, board, gameState, checkCollision, audioEnabled, playNote]);

  // Rotate piece with wall kicks
  const rotatePiece = useCallback((clockwise: boolean) => {
    if (!currentPiece || gameState !== 'playing') return;

    const newRotation = clockwise
      ? (pieceRotation + 1) % 4
      : (pieceRotation + 3) % 4;

    const kickKey = `${pieceRotation}>${newRotation}`;
    const kicks = currentPiece.type === 'I' ? I_WALL_KICKS[kickKey] : WALL_KICKS[kickKey];

    if (!kicks) return;

    for (const [dx, dy] of kicks) {
      const newPos = { x: piecePosition.x + dx, y: piecePosition.y - dy }; // Note: SRS uses inverted Y
      if (!checkCollision(currentPiece, newPos, newRotation, board)) {
        setPiecePosition(newPos);
        setPieceRotation(newRotation);
        if (audioEnabled) playNote(3, 0.15);
        return;
      }
    }
  }, [currentPiece, piecePosition, pieceRotation, board, gameState, checkCollision, audioEnabled, playNote]);

  // Soft drop
  const softDrop = useCallback(() => {
    if (movePiece(0, 1)) {
      setScore(s => s + POINTS.SOFT_DROP);
    } else {
      lockPiece();
    }
  }, [movePiece, lockPiece]);

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;

    const ghostY = calculateGhostY(currentPiece, piecePosition, pieceRotation, board);
    const dropDistance = ghostY - piecePosition.y;

    setScore(s => s + dropDistance * POINTS.HARD_DROP);
    setPiecePosition({ x: piecePosition.x, y: ghostY });

    // Lock immediately after hard drop
    setTimeout(() => lockPiece(), 0);
  }, [currentPiece, piecePosition, pieceRotation, board, gameState, calculateGhostY, lockPiece]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastDropRef.current >= dropSpeed) {
        if (!movePiece(0, 1)) {
          lockPiece();
        }
        lastDropRef.current = timestamp;
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, dropSpeed, movePiece, lockPiece]);

  // Game over handling
  useEffect(() => {
    if (gameState === 'gameover' && !gameOverHandledRef.current) {
      gameOverHandledRef.current = true;
      if (audioEnabled) {
        [6, 5, 4, 3, 2, 1, 0].forEach((n, i) => setTimeout(() => playNote(n, 0.25), i * 100));
      }
      onWhisper(`Game Over! Final score: ${score}, Lines: ${lines}`);
      setTimeout(() => {
        onWin(score);
        onClose();
      }, 2000);
    }
  }, [gameState, score, lines, audioEnabled, playNote, onWin, onClose, onWhisper]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'gameover') return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          softDrop();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          rotatePiece(true);
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          rotatePiece(false);
          break;
        case ' ':
          e.preventDefault();
          if (gameState === 'playing') {
            hardDrop();
          }
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          if (gameState === 'playing') {
            setGameState('paused');
          } else if (gameState === 'paused') {
            setGameState('playing');
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, movePiece, softDrop, rotatePiece, hardDrop, onClose]);

  // Render piece helper
  const renderPiece = (
    piece: Tetromino | null,
    pos: Position,
    rotation: number,
    opacity: number = 1
  ) => {
    if (!piece) return null;

    const shape = getRotatedShape(piece, rotation);
    const cells: React.ReactNode[] = [];

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const cellX = (pos.x + x) * CELL_SIZE;
          const cellY = (pos.y + y) * CELL_SIZE;

          if (pos.y + y >= 0) {
            cells.push(
              <div
                key={`${x}-${y}`}
                className="absolute rounded-sm border border-white/30"
                style={{
                  left: cellX,
                  top: cellY,
                  width: CELL_SIZE - 1,
                  height: CELL_SIZE - 1,
                  backgroundColor: COLORS[piece.color],
                  opacity,
                }}
              />
            );
          }
        }
      }
    }

    return cells;
  };

  // Render preview piece
  const renderPreview = (piece: Tetromino | null) => {
    if (!piece) return null;

    const shape = piece.shape;
    const size = shape.length;
    const previewCellSize = 14;
    const offset = (64 - size * previewCellSize) / 2;

    return shape.map((row, y) =>
      row.map((cell, x) =>
        cell && (
          <div
            key={`preview-${x}-${y}`}
            className="absolute rounded-sm border border-white/30"
            style={{
              left: offset + x * previewCellSize,
              top: offset + y * previewCellSize,
              width: previewCellSize - 1,
              height: previewCellSize - 1,
              backgroundColor: COLORS[piece.color],
            }}
          />
        )
      )
    );
  };

  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);

  // Calculate ghost position
  const ghostY = currentPiece
    ? calculateGhostY(currentPiece, piecePosition, pieceRotation, board)
    : piecePosition.y;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60">
      <div className="max-w-[95vw] rounded-xl border border-indigo-500/30 bg-gray-900/90 p-4 text-white backdrop-blur-sm">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-indigo-400">Tetris</h3>
          <div className="flex gap-3 text-sm text-indigo-300">
            <span>Score: {score}</span>
            <span>Lines: {lines}</span>
            <span>Lvl: {level}</span>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Main board */}
          <div
            className="relative overflow-hidden rounded border border-indigo-500/20 bg-gray-800"
            style={{ width: BOARD_WIDTH * CELL_SIZE, height: BOARD_HEIGHT * CELL_SIZE }}
          >
            {/* Grid lines */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #6366f1 1px, transparent 1px),
                  linear-gradient(to bottom, #6366f1 1px, transparent 1px)
                `,
                backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
              }}
            />

            {/* Locked pieces on board */}
            {board.map((row, y) =>
              row.map((cell, x) =>
                cell > 0 && (
                  <div
                    key={`board-${x}-${y}`}
                    className="absolute rounded-sm border border-white/20"
                    style={{
                      left: x * CELL_SIZE,
                      top: y * CELL_SIZE,
                      width: CELL_SIZE - 1,
                      height: CELL_SIZE - 1,
                      backgroundColor: COLORS[cell],
                    }}
                  />
                )
              )
            )}

            {/* Ghost piece */}
            {currentPiece && gameState === 'playing' && renderPiece(
              currentPiece,
              { x: piecePosition.x, y: ghostY },
              pieceRotation,
              0.3
            )}

            {/* Current piece */}
            {currentPiece && gameState === 'playing' && renderPiece(
              currentPiece,
              piecePosition,
              pieceRotation,
              1
            )}

            {/* Pause overlay */}
            {gameState === 'paused' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <p className="text-xl font-bold text-indigo-400">PAUSED</p>
                  <p className="mt-2 text-sm text-gray-400">Press P to resume</p>
                </div>
              </div>
            )}

            {/* Game over overlay */}
            {gameState === 'gameover' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center">
                  <p className="text-xl font-bold text-red-400">GAME OVER</p>
                  <p className="mt-2 text-lg text-indigo-400">Score: {score}</p>
                  <p className="text-sm text-indigo-300">Lines: {lines}</p>
                </div>
              </div>
            )}
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-3">
            {/* Next piece preview */}
            <div className="rounded border border-indigo-500/20 bg-gray-800 p-2">
              <div className="mb-1 text-xs text-indigo-400">Next</div>
              <div className="relative h-16 w-16">
                {renderPreview(nextPiece)}
              </div>
            </div>

            {/* Controls */}
            <button
              onClick={togglePause}
              className="hidden rounded bg-indigo-600 px-3 py-2 text-sm hover:bg-indigo-500 md:block"
            >
              {gameState === 'paused' ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={onClose}
              className="rounded bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Desktop controls info */}
        <div className="mt-3 hidden text-center text-xs text-gray-400 md:block">
          Arrows/WASD: Move | Up/W: Rotate | Z: Rotate CCW | Space: Drop | P: Pause
        </div>

        {/* Mobile controls */}
        <div className="mt-4 md:hidden">
          <div className="grid grid-cols-5 gap-2">
            <button
              onTouchStart={() => rotatePiece(false)}
              className="flex h-12 items-center justify-center rounded bg-indigo-700/80 text-xs font-bold text-white active:bg-indigo-600"
            >
              CCW
            </button>
            <button
              onTouchStart={() => movePiece(-1, 0)}
              className="flex h-12 items-center justify-center rounded bg-indigo-700/80 text-xs font-bold text-white active:bg-indigo-600"
            >
              LEFT
            </button>
            <button
              onTouchStart={hardDrop}
              className="flex h-12 items-center justify-center rounded bg-purple-700/80 text-xs font-bold text-white active:bg-purple-600"
            >
              DROP
            </button>
            <button
              onTouchStart={() => movePiece(1, 0)}
              className="flex h-12 items-center justify-center rounded bg-indigo-700/80 text-xs font-bold text-white active:bg-indigo-600"
            >
              RIGHT
            </button>
            <button
              onTouchStart={() => rotatePiece(true)}
              className="flex h-12 items-center justify-center rounded bg-indigo-700/80 text-xs font-bold text-white active:bg-indigo-600"
            >
              CW
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onTouchStart={softDrop}
              className="flex h-10 items-center justify-center rounded bg-indigo-600/80 text-xs text-white active:bg-indigo-500"
            >
              SOFT DROP
            </button>
            <button
              onClick={togglePause}
              className="flex h-10 items-center justify-center rounded bg-gray-700/80 text-xs text-white active:bg-gray-600"
            >
              {gameState === 'paused' ? 'RESUME' : 'PAUSE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TetrisGame;
