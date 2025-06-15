import React, { useRef, useEffect, useCallback } from 'react';
import { Application, Graphics } from 'pixi.js';
import { GameState, Block, GameConfig } from '../types/Game';

interface GameCanvasProps {
  gameState: GameState;
  onScoreUpdate: (score: number) => void;
  onGameOver: () => void;
}

const GAME_CONFIG: GameConfig = {
  width: window.innerWidth * 0.75,
  height: window.innerHeight * 0.8,
  playerSpeed: 8,
  blockWidth: 24,
  blockHeight: 24,
  initialBlockSpeed: 3,
  blockSpawnRate: 30,
  speedIncreaseRate: 0.02,
};

const PLAYER_WIDTH = 70;
const PLAYER_HEIGHT = 20;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  onScoreUpdate,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const playerRef = useRef<Graphics | null>(null);
  const blocksRef = useRef<Block[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const frameCountRef = useRef(0);
  const nextBlockIdRef = useRef(0);
  const isInitializedRef = useRef(false);

  const createPlayer = useCallback(() => {
    const player = new Graphics();
    player.rect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    player.fill({ color: 0x22c55e });
    player.x = GAME_CONFIG.width / 2 - PLAYER_WIDTH / 2;
    player.y = GAME_CONFIG.height - PLAYER_HEIGHT - 20;
    return player;
  }, []);

  const createBlock = useCallback(
    (x: number, y: number, speed: number): Block => {
      const graphics = new Graphics();
      graphics.rect(0, 0, GAME_CONFIG.blockWidth, GAME_CONFIG.blockHeight);
      graphics.fill({ color: 0xef4444 });
      graphics.x = x;
      graphics.y = y;

      return {
        id: nextBlockIdRef.current++,
        x,
        y,
        speed,
        graphics,
      };
    },
    []
  );

  const spawnBlock = useCallback(() => {
    if (!appRef.current) return;

    const x = Math.random() * (GAME_CONFIG.width - GAME_CONFIG.blockWidth);
    const baseSpeed = GAME_CONFIG.initialBlockSpeed;
    const speedMultiplier = 1 + gameState.score * GAME_CONFIG.speedIncreaseRate;
    const speed = baseSpeed * speedMultiplier;

    const block = createBlock(x, -GAME_CONFIG.blockHeight, speed);
    blocksRef.current.push(block);
    appRef.current.stage.addChild(block.graphics);
  }, [createBlock, gameState.score]);

  const checkCollision = useCallback(
    (player: Graphics, block: Block): boolean => {
      const playerBounds = {
        x: player.x,
        y: player.y,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
      };

      const blockBounds = {
        x: block.x,
        y: block.y,
        width: GAME_CONFIG.blockWidth,
        height: GAME_CONFIG.blockHeight,
      };

      return (
        playerBounds.x < blockBounds.x + blockBounds.width &&
        playerBounds.x + playerBounds.width > blockBounds.x &&
        playerBounds.y < blockBounds.y + blockBounds.height &&
        playerBounds.y + playerBounds.height > blockBounds.y
      );
    },
    []
  );

  const gameLoop = useCallback(() => {
    if (
      !appRef.current ||
      !playerRef.current ||
      gameState.isGameOver ||
      !gameState.isPlaying
    ) {
      return;
    }

    frameCountRef.current++;

    if (keysRef.current['ArrowLeft'] && playerRef.current.x > 0) {
      playerRef.current.x -= GAME_CONFIG.playerSpeed;
    }
    if (
      keysRef.current['ArrowRight'] &&
      playerRef.current.x < GAME_CONFIG.width - PLAYER_WIDTH
    ) {
      playerRef.current.x += GAME_CONFIG.playerSpeed;
    }

    const spawnRate = Math.max(
      15,
      GAME_CONFIG.blockSpawnRate - Math.floor(gameState.score / 3)
    );
    if (frameCountRef.current % spawnRate === 0) {
      spawnBlock();
    }

    let newScore = gameState.score;
    const blocksToRemove: number[] = [];

    blocksRef.current.forEach((block, index) => {
      block.y += block.speed;
      block.graphics.y = block.y;

      if (block.y > GAME_CONFIG.height) {
        newScore++;
        blocksToRemove.push(index);
        appRef.current!.stage.removeChild(block.graphics);
        block.graphics.destroy();
      } else if (checkCollision(playerRef.current!, block)) {
        onGameOver();
        return;
      }
    });

    const reversedIndices = [...blocksToRemove].reverse();
    reversedIndices.forEach((index) => {
      blocksRef.current.splice(index, 1);
    });

    if (newScore !== gameState.score) {
      onScoreUpdate(newScore);
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, spawnBlock, checkCollision, onScoreUpdate, onGameOver]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      event.preventDefault();
      keysRef.current[event.code] = true;
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      event.preventDefault();
      keysRef.current[event.code] = false;
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current || isInitializedRef.current || appRef.current) {
      return;
    }

    if (canvasRef.current.children.length > 0) {
      return;
    }

    const canvasElement = canvasRef.current;
    const app = new Application();

    const init = async () => {
      try {
        await app.init({
          width: GAME_CONFIG.width,
          height: GAME_CONFIG.height,
          backgroundColor: 0x1a1a2e,
          antialias: true,
        });

        appRef.current = app;
        isInitializedRef.current = true;

        if (canvasElement) {
          canvasElement.innerHTML = '';
          canvasElement.appendChild(app.canvas);
        }

        const player = createPlayer();
        playerRef.current = player;
        app.stage.addChild(player);
      } catch (error) {
        console.error('Error initializing PixiJS:', error);
        appRef.current = null;
        isInitializedRef.current = false;
      }
    };

    init();

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }

      blocksRef.current.forEach((block) => {
        if (appRef.current) {
          appRef.current.stage.removeChild(block.graphics);
        }
        block.graphics.destroy();
      });
      blocksRef.current = [];

      if (playerRef.current && appRef.current) {
        appRef.current.stage.removeChild(playerRef.current);
        playerRef.current.destroy();
        playerRef.current = null;
      }

      if (appRef.current) {
        try {
          appRef.current.destroy(true);
        } catch (error) {
          console.error('Error destroying PixiJS application:', error);
        }
        appRef.current = null;
      }

      isInitializedRef.current = false;

      if (canvasElement) {
        canvasElement.innerHTML = '';
      }
    };
  }, [createPlayer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isGameOver, gameLoop]);

  useEffect(() => {
    if (
      gameState.isPlaying &&
      !gameState.isGameOver &&
      appRef.current &&
      playerRef.current
    ) {
      playerRef.current.x = GAME_CONFIG.width / 2 - PLAYER_WIDTH / 2;
      playerRef.current.y = GAME_CONFIG.height - PLAYER_HEIGHT - 20;

      blocksRef.current.forEach((block) => {
        appRef.current!.stage.removeChild(block.graphics);
        block.graphics.destroy();
      });
      blocksRef.current = [];

      frameCountRef.current = 0;
      nextBlockIdRef.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.isPlaying]);

  return (
    <div className='relative'>
      <div
        ref={canvasRef}
        className='border-2 border-gray-700 rounded-lg shadow-2xl mx-auto'
        style={{ lineHeight: 0, width: '100%', height: '100%' }}
      />
      <div className='absolute top-4 left-4 text-white font-bold text-xl bg-black bg-opacity-50 px-3 py-1 rounded'>
        Score: {gameState.score}
      </div>
      <div className='absolute top-16 left-4 text-white font-bold text-lg bg-black bg-opacity-50 px-3 py-1 rounded'>
        High Score: {gameState.highScore}
      </div>
    </div>
  );
};
