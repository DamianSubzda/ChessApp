import { Coordinate } from "../../types/Coordinate";
import { GameTurn } from "../../types/GameTurn";
import { Piece } from "../../types/Piece";
import { Square } from "../../types/Square";

function checkIfPieceIsPromoting(
  from: Coordinate,
  to: Coordinate,
  piece: Piece,
  squares: Square[]
) {
  if (piece.color === "white" && piece.pieceType === "pawn") {
    return to.row === 8;
  } else if (piece.color === "black" && piece.pieceType === "pawn") {
    return to.row === 1;
  }
  return false;
}

function checkIfMoveIsEnPassant(
  from: Coordinate,
  to: Coordinate,
  piece: Piece,
  turn: GameTurn,
  squares: Square[]
): boolean {
  if (piece.pieceType !== "pawn") return false;
  if (Math.abs(from.row - to.row) !== 1) return false;
  if (Math.abs(from.column - to.column) !== 1) return false;

  if (turn.move.piece.pieceType !== "pawn") return false;
  if (Math.abs(turn.move.from.row - turn.move.to.row) !== 2) return false;

  if (turn.move.to.column !== to.column) return false;

  if (piece.color === "white") {
    //white pawn
    return turn.move.to.row === to.row - 1;
  } else {
    //Black pawn
    return turn.move.to.row === to.row + 1;
  }
}
//Sprawdzenie czy
function checkIfMoveIsCastle(
  from: Coordinate,
  to: Coordinate,
  piece: Piece,
  squares: Square[]
): boolean {
  if (piece.pieceType !== "king") return false;
  if (from.column)
    if (
      piece.pieceType === "king" &&
      from.column === 5 &&
      (from.row === 1 || from.row === 8) &&
      (to.column === 3 || to.column === 7)
    ) {
      // const rookSquare
      return true;
    }
  return false;
}

export { checkIfMoveIsCastle, checkIfMoveIsEnPassant, checkIfPieceIsPromoting };
