import { Coordinate } from "./Coordinate";
import { Piece } from "./Piece";

export type Move = {
    piece: Piece,
    from: Coordinate;
    to: Coordinate;
    isPromotion: boolean;
    isCastle: boolean;
    isEnPassant: boolean;
    takenPiece: Piece | null;
    notation: string | null;
};