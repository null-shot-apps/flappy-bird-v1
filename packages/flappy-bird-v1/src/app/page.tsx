'use client';

import { useEffect, useState, useCallback } from 'react';

export default function FlappyBirdGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [catY, setCatY] = useState(250);
  const [catVelocity, setCatVelocity] = useState(0);
  const [obstacles, setObstacles] = useState<Array<{ x: number; gapY: number; passed: boolean }>>([]);

  const GRAVITY = 0.5;
  const JUMP_STRENGTH = -10;
  const CAT_SIZE = 40;
  const OBSTACLE_WIDTH = 60;
  const GAP_HEIGHT = 180;
  const GAME_HEIGHT = 600;
  const GAME_WIDTH = 400;

  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      setCatY(250);
      setCatVelocity(JUMP_STRENGTH);
      setObstacles([{ x: GAME_WIDTH, gapY: 200, passed: false }]);
    } else if (!gameOver) {
      setCatVelocity(JUMP_STRENGTH);
    } else {
      // Restart game
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      setCatY(250);
      setCatVelocity(JUMP_STRENGTH);
      setObstacles([{ x: GAME_WIDTH, gapY: 200, passed: false }]);
    }
  }, [gameStarted, gameOver]);

  // Handle spacebar press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // Update cat position
      setCatY((prev) => {
        const newY = prev + catVelocity;
        return Math.max(0, Math.min(GAME_HEIGHT - CAT_SIZE, newY));
      });

      setCatVelocity((prev) => prev + GRAVITY);

      // Update obstacles
      setObstacles((prev) => {
        const updated = prev.map((obs) => ({
          ...obs,
          x: obs.x - 3,
        }));

        // Add new obstacle
        if (updated.length === 0 || updated[updated.length - 1].x < GAME_WIDTH - 250) {
          updated.push({
            x: GAME_WIDTH,
            gapY: Math.random() * (GAME_HEIGHT - GAP_HEIGHT - 100) + 50,
            passed: false,
          });
        }

        // Remove off-screen obstacles
        return updated.filter((obs) => obs.x > -OBSTACLE_WIDTH);
      });

      // Check collisions
      const catX = 50;
      obstacles.forEach((obs) => {
        // Check if cat passed obstacle
        if (!obs.passed && obs.x + OBSTACLE_WIDTH < catX) {
          obs.passed = true;
          setScore((prev) => prev + 1);
        }

        // Check collision with obstacle
        if (
          catX + CAT_SIZE > obs.x &&
          catX < obs.x + OBSTACLE_WIDTH &&
          (catY < obs.gapY || catY + CAT_SIZE > obs.gapY + GAP_HEIGHT)
        ) {
          setGameOver(true);
          setHighScore((prev) => Math.max(prev, score));
        }
      });

      // Check collision with ground/ceiling
      if (catY <= 0 || catY >= GAME_HEIGHT - CAT_SIZE) {
        setGameOver(true);
        setHighScore((prev) => Math.max(prev, score));
      }
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, catY, catVelocity, obstacles, score]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-green-400 via-green-500 to-green-600 flex items-center justify-center">
      {/* Jungle background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,0.1) 50px, rgba(0,0,0,0.1) 51px)`,
        }} />
      </div>

      {/* Game container */}
      <div 
        className="relative bg-gradient-to-b from-green-300 to-green-500 shadow-2xl overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {/* Jungle leaves decoration */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-green-700/30 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-800/30 to-transparent pointer-events-none" />

        {/* Score display */}
        <div className="absolute top-4 left-0 right-0 text-center z-20">
          <div className="text-white text-4xl font-bold drop-shadow-lg">{score}</div>
          <div className="text-white text-sm drop-shadow-lg">High Score: {highScore}</div>
        </div>

        {/* Cat */}
        {gameStarted && (
          <div
            className="absolute transition-transform duration-100"
            style={{
              left: 50,
              top: catY,
              width: CAT_SIZE,
              height: CAT_SIZE,
              transform: `rotate(${Math.min(Math.max(catVelocity * 3, -30), 30)}deg)`,
            }}
          >
            <div className="text-4xl">🐱</div>
          </div>
        )}

        {/* Obstacles */}
        {obstacles.map((obs, idx) => (
          <div key={idx}>
            {/* Top obstacle */}
            <div
              className="absolute bg-green-800 border-4 border-green-900"
              style={{
                left: obs.x,
                top: 0,
                width: OBSTACLE_WIDTH,
                height: obs.gapY,
              }}
            />
            {/* Bottom obstacle */}
            <div
              className="absolute bg-green-800 border-4 border-green-900"
              style={{
                left: obs.x,
                top: obs.gapY + GAP_HEIGHT,
                width: OBSTACLE_WIDTH,
                height: GAME_HEIGHT - (obs.gapY + GAP_HEIGHT),
              }}
            />
          </div>
        ))}

        {/* Start screen */}
        {!gameStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10">
            <div className="text-6xl mb-4">🐱</div>
            <h1 className="text-white text-4xl font-bold mb-4 drop-shadow-lg">Flappy Cat</h1>
            <p className="text-white text-xl mb-2 drop-shadow-lg">Press SPACE to Jump</p>
            <p className="text-white text-sm drop-shadow-lg">Avoid the obstacles!</p>
          </div>
        )}

        {/* Game over screen */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-white text-4xl font-bold mb-4 drop-shadow-lg">Game Over!</h2>
            <p className="text-white text-2xl mb-2 drop-shadow-lg">Score: {score}</p>
            <p className="text-white text-xl mb-4 drop-shadow-lg">High Score: {highScore}</p>
            <p className="text-white text-lg drop-shadow-lg">Press SPACE to Restart</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 text-white text-center">
        <p className="text-lg font-semibold drop-shadow-lg">🎮 Press SPACE BAR to make the cat jump!</p>
      </div>
    </div>
  );
}

