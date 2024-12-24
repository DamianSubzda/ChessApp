import { useState } from "react";

export default function useGameEnd() {

    const [gameResult, setGameResult] = useState<string | null>(null);
    const [endGameReason, setEndGameReason] = useState<string | null>(null);
  
    const handleVictory = (reason: string) => {
      setGameResult("You won!");
      setEndGameReason(reason);
    };
  
    const handleDefeat = (reason: string) => {
      setGameResult("You lose.");
      setEndGameReason(reason);
    };
  
    const handleDraw = (reason: string) => {
      setGameResult("Draw!");
      setEndGameReason(reason);
    };
  
    return {
      handleVictory,
      handleDefeat,
      handleDraw,
      gameResult,
      endGameReason,
    };
  }
  