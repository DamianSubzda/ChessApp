import { Move } from "./Move";
import { Player } from "./Player";

export type GameTurn = {
  player: Player;
  move: Move;
  isCheckmate: boolean;
  isPat: boolean;
};
