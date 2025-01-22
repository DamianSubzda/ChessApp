import { useSelector } from "react-redux";
import { AppState } from "../../store/store.ts";
import { GameTurn } from "../../types/GameTurn.ts";
import { Coordinate } from "../../types/Coordinate.ts";
import { Piece } from "../../types/Piece.ts";
import {
  checkIfMoveIsCastle,
  checkIfMoveIsEnPassant,
  checkIfPieceIsPromoting,
} from "../../utils/game-rules/specialMoves.ts";

export default function useSpecialMoves() {
  const squares = useSelector((state: AppState) => state.boardStore.squares);
  const turns = useSelector((state: AppState) => state.gameStore.game?.turns) ?? [] as GameTurn[];

  const isPromotion = (from: Coordinate,
    to: Coordinate,
    piece: Piece) => {
    return checkIfPieceIsPromoting(from, to, piece, squares);
  };

  const isEnPassant = (from: Coordinate, to: Coordinate, piece: Piece) => {
    return checkIfMoveIsEnPassant(from,to,piece,turns[turns.length - 1],squares);
  };

  const isCastle = (from: Coordinate, to: Coordinate, piece: Piece) => {
    return checkIfMoveIsCastle(from, to, piece, squares);
  };

  return {
    isPromotion,
    isEnPassant,
    isCastle,
  };
}
