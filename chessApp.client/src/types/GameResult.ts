
export type GameResult = {
  result: GameOutcome;
  reason: string;
}

export type GameOutcome = "Win" | "Lose" | "Tie" | "Neutral";