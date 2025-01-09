import { Coordinate } from "./Coordinate";
import { Piece } from "./Piece";

export type Move = {
    piece: Piece,
    from: Coordinate;
    to: Coordinate;
    takenPiece: Piece | null;
    notation: string;
};