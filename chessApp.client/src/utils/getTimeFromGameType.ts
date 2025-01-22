import { GameType } from './../types/Game.ts';


export function getTimeFromGameType(type: GameType): number {
    switch (type) {
        case GameType.Bullet:
            return 60;
        case GameType.Blitz:
            return 60 * 3;
        case GameType.Rapid:
            return 60 * 10;
        case GameType.Standard:
            return 60 * 15;
        case GameType.Classical:
            return 60 * 60;
    }
}