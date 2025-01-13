import { useSelector } from "react-redux";
import {
  checkIfPlayersMoveIsCorrect,
  checkIfPlayerWillBeCheckmated,
  checkIfPlayerWillBeInPat,
  checkIfPlayerWillBeInCheck,
  checkIfPieceIsPromoting,
} from "../utils/piecesMoveValidator.ts";
import { AppState } from "../store/store.ts";
import { Move } from "../types/Move.ts";
import { useRef, useEffect } from "react";
import { Square } from "../types/Square.ts";

export default function useMoveValidator() {
  const squares = useSelector((state: AppState) => state.board.squares);
  const squaresRef = useRef<Square[]>([]);

  const isMoveCorrect = (move: Move) => {
    return checkIfPlayersMoveIsCorrect(move, squares);
  };

  const isPlayerInCheck = (move: Move) => {
    return checkIfPlayerWillBeInCheck(move, squares);
  };

  const isPlayerInPat = (move: Move) => {
    return checkIfPlayerWillBeInPat(move, squares);
  };

  const isPlayerInMat = (move: Move) => {
    return checkIfPlayerWillBeCheckmated(move, squares);
  };

  const isPromotion = (move: Move) => {
    return checkIfPieceIsPromoting(move);
  };

  useEffect(() => {
    squaresRef.current = squares;
  }, [squares]);

  return {
    squares,
    squaresRef,
    isMoveCorrect,
    isPlayerInCheck,
    isPlayerInPat,
    isPlayerInMat,
    isPromotion,
  };
}
