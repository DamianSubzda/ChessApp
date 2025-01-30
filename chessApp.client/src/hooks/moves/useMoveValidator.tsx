import { useSelector } from "react-redux";
import { AppState } from "../../store/store.ts";
import { Move } from "../../types/Move.ts";
import {
  checkIfPlayerWillBeInCheck,
  checkIfPlayerWillBeInPat,
  checkIfPlayerWillBeCheckmated,
  checkIfPlayerWillHaveInsufficientMaterial,
} from "../../utils/game-rules/gameStatus.ts";
import { checkIfPlayersMoveIsCorrect } from "../../utils/game-rules/validation.ts";
import { useRef, useState } from "react";
import { CastlingRights } from "types/FEN.ts";
import { Square } from "types/Square.ts";

export default function useMoveValidator() {
  const squares = useSelector((state: AppState) => state.boardStore.squares);

  const fullMoveNumber = useRef<number>(0);
  const halfMoveClock = useRef<number>(0);
  const enPassantSquare = useRef<Square | null>(null);
  const [castleRights, setCastleRights] = useState<CastlingRights>({
    canBlackCastleKingSide: true,
    canBlackCastleQueenSide: true,
    canWhiteCastleKingSide: true,
    canWhiteCastleQueenSide: true,
  });
  const fenMapRef = useRef<Map<string, number>>(
    new Map().set("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -", 1)
  );

  const incrementFullMoveNumber = () => {
    fullMoveNumber.current = fullMoveNumber.current + 1;
  };

  const incrementHalfMoveClock = () => {
    halfMoveClock.current = halfMoveClock.current + 1;
  };

  const resetHalfMoveClock = () => {
    halfMoveClock.current = 0;
  };

  const isMoveCorrect = (move: Move) => {
    const isCorrect = checkIfPlayersMoveIsCorrect(move, squares);

    if (isCorrect) {
      updateCastleRights(move);
      updateEnPassantSquare(move);
      incrementFullMoveNumber();

      if (isPawnMoveOrPieceTaken(move)) {
        resetHalfMoveClock();
      } else {
        incrementHalfMoveClock();
      }
    }
    return isCorrect;
  };

  const updateHalfMove = (move: Move) => {
    if (isPawnMoveOrPieceTaken(move)) {
      resetHalfMoveClock();
    };
  }

  const updateEnPassantSquare = (move: Move) => {
    if (
      move.piece.pieceType === "pawn" &&
      Math.abs(move.from.row - move.to.row) === 2
    ) {
      const enPassantRow = move.piece.color === "white" ? move.from.row + 1 : move.from.row - 1;
      const square = squares.find(
      (sq) =>
        sq.position.column === move.to.column &&
        sq.position.row === enPassantRow
      );
      enPassantSquare.current = square ?? null;
    } else {
      enPassantSquare.current = null;
    }
  };

  const updateCastleRights = (move: Move) => {
    if (!Object.values(castleRights).some((right) => right)) return;
    if (move.piece.pieceType === "king") {
      if (move.piece.color === "white") {
        setCastleRights((prev: CastlingRights) => {
          return {
            ...prev,
            canWhiteCastleKingSide: false,
            canWhiteCastleQueenSide: false,
          };
        });
      } else {
        setCastleRights((prev: CastlingRights) => {
          return {
            ...prev,
            canBlackCastleKingSide: false,
            canBlackCastleQueenSide: false,
          };
        });
      }
    }

    if (move.piece.pieceType === "rook") {
      if (move.piece.color === "white") {
        if (move.from.column === 1) {
          // rook - queen
          setCastleRights((prev: CastlingRights) => ({
            ...prev,
            canWhiteCastleQueenSide: false,
          }));
        }
        if (move.from.column === 8) {
          // rook - king
          setCastleRights((prev: CastlingRights) => ({
            ...prev,
            canWhiteCastleKingSide: false,
          }));
        }
      } else if (move.piece.color === "black") {
        if (move.from.column === 1) {
          // rook - queen
          setCastleRights((prev: CastlingRights) => ({
            ...prev,
            canBlackCastleQueenSide: false,
          }));
        }
        if (move.from.column === 8) {
          // rook - king
          setCastleRights((prev: CastlingRights) => ({
            ...prev,
            canBlackCastleKingSide: false,
          }));
        }
      }
    }
  };

  const isPawnMoveOrPieceTaken = (move: Move) => {
    return move.takenPiece !== null || move.piece.pieceType === "pawn";
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

  const isTieByInsufficientMaterial = (move: Move) => { //Tu są już squersy zaktualizowane (?, do sprawdzenia)
    return checkIfPlayerWillHaveInsufficientMaterial(move, squares);
  };

  const isTieBy50MovesRule = () => {
    return halfMoveClock.current >= 50;
  };

  const isTieByRepeatingPosition = (currentFEN: string): boolean => {
    const normalizeFEN = (fen: string): string => {
      return fen.split(" ").slice(0, 4).join(" ");
    };

    const normalizedCurrentFEN = normalizeFEN(currentFEN);
    fenMapRef.current.set(normalizedCurrentFEN, (fenMapRef.current.get(normalizedCurrentFEN) || 0) + 1);
    return (fenMapRef.current.get(normalizedCurrentFEN) || 0) >= 3;
  };
  

  return {
    squares,
    fullMoveNumber,
    halfMoveClock,
    enPassantSquare,
    castleRights,
    isMoveCorrect,
    isPlayerInCheck,
    isPlayerInPat,
    isPlayerInMat,
    updateHalfMove,
    updateCastleRights,
    isTieByInsufficientMaterial,
    isTieBy50MovesRule,
    isTieByRepeatingPosition,
  };
}
