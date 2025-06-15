import { Graphics } from 'pixi.js';

export interface GameState {
  score: number;
  isGameOver: boolean;
  isPlaying: boolean;
  highScore: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Block {
  id: number;
  x: number;
  y: number;
  speed: number;
  graphics: Graphics;
}

export interface GameConfig {
  width: number;
  height: number;
  playerSpeed: number;
  blockWidth: number;
  blockHeight: number;
  initialBlockSpeed: number;
  blockSpawnRate: number;
  speedIncreaseRate: number;
}
