import { Square } from "./Square";

export type FEN = {
  squares: Square[];
  nextPlayerColor: "white" | "black";
  castlingRights: CastlingRights; // Prawa do roszady (np. "KQkq", "-" jeśli brak roszady)
  enPassantSquare: Square | null; // Pole bicia w przelocie (np. "e3"), "-" jeśli brak
  halfMoveClock: number; // Liczba ruchów od ostatniego bicia lub ruchu pionem
  fullMoveNumber: number; // Numer pełnego ruchu (zaczyna się od 1)
};

export type CastlingRights = {
  canWhiteCastleQueenSide: boolean;
  canWhiteCastleKingSide: boolean;
  canBlackCastleQueenSide: boolean;
  canBlackCastleKingSide: boolean;
};
