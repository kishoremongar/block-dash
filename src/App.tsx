import { useState, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameUI } from './components/GameUI';
import { GameState } from './types/Game';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [highScore, setHighScore] = useLocalStorage('blockDodgeHighScore', 0);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isGameOver: false,
    isPlaying: false,
    highScore,
  });

  const handleStartGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      score: 0,
      isGameOver: false,
      isPlaying: true,
    }));
  }, []);

  const handleRestartGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      score: 0,
      isGameOver: false,
      isPlaying: true,
    }));
  }, []);

  const handleScoreUpdate = useCallback(
    (newScore: number) => {
      setGameState((prev) => {
        const newHighScore = Math.max(prev.highScore, newScore);
        if (newHighScore > highScore) {
          setHighScore(newHighScore);
        }
        return {
          ...prev,
          score: newScore,
          highScore: newHighScore,
        };
      });
    },
    [highScore, setHighScore]
  );

  const handleGameOver = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isGameOver: true,
      isPlaying: false,
    }));
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex justify-center overflow-hidden p-4'>
      <div className='relative'>
        <GameCanvas
          gameState={gameState}
          onScoreUpdate={handleScoreUpdate}
          onGameOver={handleGameOver}
        />
        <GameUI
          gameState={gameState}
          onStartGame={handleStartGame}
          onRestartGame={handleRestartGame}
        />
      </div>
    </div>
  );
}

export default App;
