import { Move } from "./Move";
import { Player } from "./Player";

export type GameTurn = {
  player: Player;
  move: Move;
  isPromotion: boolean;
  isCheckmate: boolean;
  isPat: boolean;
};
