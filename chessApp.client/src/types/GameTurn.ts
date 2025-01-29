import { Move } from "./Move";
import { Player } from "./Player";

export type GameTurn = {
  player: Player;
  move: Move;
  fen: string;
  timeLeft: number;
  isCheckmate: boolean;
  isPat: boolean;
  isTieByInsufficientMaterial: boolean;
  isTieBy50MovesRule: boolean;
  isTieByRepeatingPosition: boolean;
};
