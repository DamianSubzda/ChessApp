import { Coordinate } from "../../types/Coordinate";
import { GameTurn } from "../../types/GameTurn";
import { Move } from "../../types/Move";
import { Square } from "../../types/Square";
import { isKingInCheck, isKingInCheckmate } from "./pieces/king.ts";
import { simulateSquaresAfterMove } from "./common.ts";
import { checkIfPlayersMoveIsCorrect } from "./validation.ts";

function checkIfPlayerWillBeInCheck(move: Move, squares: Square[]) {
  const simulatedSquares = simulateSquaresAfterMove(move, squares);
  return isKingInCheck(
    move.piece.color === "white" ? "black" : "white",
    simulatedSquares
  );
}

function checkIfPlayerWillBeCheckmated(move: Move, squares: Square[]) {
  //Possition prediction.
  const simulatedSquares = simulateSquaresAfterMove(move, squares);
  const enemyColor = move.piece.color === "white" ? "black" : "white";
  return isKingInCheckmate(enemyColor, simulatedSquares);
}

function checkIfPlayerWillBeInPat(move: Move, squares: Square[]) {
  //Possition prediction.
  const simulatedSquares = simulateSquaresAfterMove(move, squares);
  const enemyColor = move.piece.color === "white" ? "black" : "white";
  return isPlayerInPat(enemyColor, simulatedSquares);
}

function checkIfPlayerWillHaveInsufficientMaterial(
  move: Move,
  squares: Square[]
) {
  const simulatedSquares = simulateSquaresAfterMove(move, squares); //To może trzeba będzie zedytować żeby symulowanie ruchu wykonywało się raz
  const enemyColor = move.piece.color === "white" ? "black" : "white";
  const playerColor = move.piece.color === "white" ? "white" : "black";
  return isInsufficientMaterial(playerColor, enemyColor, simulatedSquares);
}

function checkIfTieBy50MovesRule(move: Move, turns: GameTurn[]) {
  if (move.takenPiece !== null || move.piece.pieceType === "pawn") return false;
  return !turns.some(
    (turn) =>
      turn.move.takenPiece !== null || turn.move.piece.pieceType === "pawn"
  );
}

function isPlayerInPat(color: string, squares: Square[]) {
  if (isKingInCheck(color, squares)) return false;
  // To jest overr kill bo sprawdza się czy figura może ruszyć się na jakiekolwiek dostępne pole na planszy czyli zawsze jest ilość figur * 64;
  for (const square of squares) {
    if (square.piece?.color === color) {
      for (let row = 1; row <= 8; row++) {
        for (let column = 1; column <= 8; column++) {
          const move = {
            from: {
              row: square.position.row,
              column: square.position.column,
            } as Coordinate,
            to: { row: row, column: column } as Coordinate,
            piece: square.piece,
            notation: "",
          } as Move;
          if (checkIfPlayersMoveIsCorrect(move, squares)) {
            return false;
          }
        }
      }
    }
  }

  return true;
}

function isInsufficientMaterial(
  playerColor: "white" | "black",
  enemyColor: "white" | "black",
  simulatedSquares: Square[]
) {
  const piecesPlayer = simulatedSquares
    .filter((sq) => sq.piece !== null && sq.piece.color === playerColor)
    .map((sq) => sq.piece!);

  const piecesEnemy = simulatedSquares
    .filter((sq) => sq.piece !== null && sq.piece.color === enemyColor)
    .map((sq) => sq.piece!);

  // 1. Król vs Król
  if (piecesPlayer.length === 1 && piecesEnemy.length === 1) {
    return true;
  }

  // 2. Król i Lekka vs Król
  if (
    piecesPlayer.length === 2 &&
    piecesPlayer.some(
      (p) => p.pieceType === "knight" || p.pieceType === "bishop"
    ) &&
    piecesEnemy.length === 1
  ) {
    return true;
  }

  if (
    piecesEnemy.length === 2 &&
    piecesEnemy.some(
      (p) => p.pieceType === "knight" || p.pieceType === "bishop"
    ) &&
    piecesPlayer.length === 1
  ) {
    return true;
  }

  return false;
}

export {
  checkIfPlayerWillBeCheckmated,
  checkIfPlayerWillBeInCheck,
  checkIfPlayerWillBeInPat,
  checkIfPlayerWillHaveInsufficientMaterial,
  checkIfTieBy50MovesRule,
};
