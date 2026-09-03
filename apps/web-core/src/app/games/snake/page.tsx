'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

type Point = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = useCallback((): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setFood(generateFood());
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && !isGameOver) {
        setIsPaused((p) => !p);
        return;
      }

      if (isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isGameOver, isPaused]);

  useEffect(() => {
    if (isGameOver || isPaused) return;

    const moveSnake = () => {
      setSnake((prev) => {
        const head = prev[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        // Collision with walls
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          return prev;
        }

        // Collision with self
        if (prev.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setIsGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Eat food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => {
            const newScore = s + 10;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10);
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [direction, food, generateFood, highScore, isGameOver, isPaused, score]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
          &larr; Back to Work
        </Link>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
          Break Time!
        </h1>
        <div className="flex items-center justify-center space-x-8 text-zinc-400 font-mono">
          <div className="flex items-center space-x-2 text-emerald-400">
            <span>SCORE: {score}</span>
          </div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <Trophy size={16} />
            <span>BEST: {highScore}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div 
          className="bg-zinc-900 border-2 border-zinc-800 rounded-xl overflow-hidden shadow-2xl"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 20px)`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnake = snake.some((s) => s.x === x && s.y === y);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={i}
                className={`
                  w-[20px] h-[20px] border-[0.5px] border-zinc-800/30
                  ${isHead ? 'bg-emerald-400' : isSnake ? 'bg-emerald-500/80' : isFood ? 'bg-rose-500 rounded-full scale-75' : ''}
                `}
              />
            );
          })}
        </div>

        {(isGameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              {isGameOver ? 'GAME OVER' : 'PAUSED'}
            </h2>
            <button
              onClick={isGameOver ? resetGame : () => setIsPaused(false)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg flex items-center space-x-2 transition-transform active:scale-95"
            >
              <RefreshCcw size={20} />
              <span>{isGameOver ? 'Play Again' : 'Resume'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-zinc-500 text-sm flex space-x-6">
        <span>Use <strong className="text-zinc-300">Arrow Keys</strong> to move</span>
        <span>Press <strong className="text-zinc-300">Space</strong> to pause</span>
      </div>
    </div>
  );
}
