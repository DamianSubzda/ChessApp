import { GameStatus } from "./GameStatus"
import { Player } from "./Player"


export type Game = {
    gameId: string;
    createdBy: string;
    createdTimeAt: string;
    player1: Player | null;
    player2: Player | null;
    status: GameStatus;
}