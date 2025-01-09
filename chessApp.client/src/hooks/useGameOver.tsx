import { useState } from "react";
import { GameResult } from "../types/GameResult";

export default function useGameOver() {
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const handleGameOver = (result: GameResult) => {
    setGameResult(result);
  };

  return {
    handleGameOver,
    gameResult,
  };
}
