import { useRef, useState } from "react";
import { GameResult } from "../types/GameResult";

export default function useGameOver() {
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const hasHandledGameOver = useRef(false);

  const handleGameOver = (result: GameResult) => {
    if (hasHandledGameOver.current) return;
    hasHandledGameOver.current = true;
    setGameResult(result);
  };

  return {
    handleGameOver,
    hasHandledGameOver,
    gameResult,
  };
}
