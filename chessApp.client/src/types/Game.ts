import { GameTurn } from "./GameTurn";
import { Player } from "./Player"

export type Game = {
    readonly gameId: string;
    readonly createdBy: string;
    readonly createdAt: string;
    readonly playerWhite: Player | null;
    readonly playerBlack: Player | null;
    turns: GameTurn[];
    status: GameStatus;
    type: GameType;
    timeIncrementPerMove: number;
}

export enum GameStatus {
    Waiting = 0,
    Started = 1,
    Abandoned = 2,
    Ended = 3
}

export enum GameType {
    Bullet = 0,
    Blitz = 1,
    Rapid = 2,
    Standard = 3,
    Classical = 4
}