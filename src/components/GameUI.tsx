import React from 'react';
import { GameState } from '../types/Game';
import { Play, RotateCcw, Trophy } from 'lucide-react';

interface GameUIProps {
  gameState: GameState;
  onStartGame: () => void;
  onRestartGame: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  onStartGame,
  onRestartGame,
}) => {
  if (!gameState.isPlaying && !gameState.isGameOver) {
    return (
      <div className='absolute inset-0 h-[80vh] mx-auto border-2 border-gray-700 rounded-lg shadow-2xl bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center'>
        <div className='text-center text-white flex flex-col justify-center items-center gap-y-4'>
          <h1 className='text-6xl min-h-20 font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent'>
            Block Dash
          </h1>
          <p className='text-xl text-gray-300 max-w-md mx-auto'>
            Use arrow keys to dash falling red blocks. Each block that passes
            increases your score!
          </p>
          <div className='flex justify-center items-center space-x-4 text-gray-400'>
            <div className='flex items-center space-x-2'>
              <Trophy className='w-5 h-5' />
              <span>High Score: {gameState.highScore}</span>
            </div>
          </div>
          <button
            onClick={onStartGame}
            className='inline-flex items-center w-fit space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg'
          >
            <Play className='w-6 h-6' />
            <span className='text-xl'>Start Game</span>
          </button>
          <div className='text-sm text-gray-500 space-y-1'>
            <p>← → Arrow keys to move</p>
            <p>Avoid the red blocks!</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.isGameOver) {
    return (
      <div className='absolute inset-0 h-[80vh] mx-auto border-2 border-gray-700 rounded-lg shadow-2xl bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center'>
        <div className='text-center text-white space-y-6'>
          <h2 className='text-5xl font-bold text-red-500'>Game Over!</h2>
          <div className='space-y-2'>
            <p className='text-3xl font-semibold'>
              Final Score: {gameState.score}
            </p>
            {gameState.score === gameState.highScore && gameState.score > 0 && (
              <p className='text-yellow-400 text-xl font-bold flex items-center justify-center space-x-2'>
                <Trophy className='w-6 h-6' />
                <span>New High Score!</span>
              </p>
            )}
            <p className='text-gray-400'>High Score: {gameState.highScore}</p>
          </div>
          <button
            onClick={onRestartGame}
            className='inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg'
          >
            <RotateCcw className='w-6 h-6' />
            <span className='text-xl'>Play Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2'>
      <div className='bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm'>
        Use ← → arrow keys to move
      </div>
    </div>
  );
};
