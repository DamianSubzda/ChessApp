import { Piece } from "./Piece";

export type Move = {
    rowFrom: number,
    columnFrom: number,
    rowTo: number,
    columnTo: number,
    moveNotation: string,
    piece: Piece,
    timeLeft: number,
};

