import { Move } from "../types/Move";
import { Square } from "../types/Square";
import { changeDigitsToLetter } from "./board";

export function generateChessNotation(
  move: Move,
  squares: Square[],
  isPromotion: boolean,
  isCheck: boolean,
  isCheckmate: boolean,
  isTie: boolean
): string {
  const pieceSymbol = isPromotion ? "" : getPieceSymbol(move.piece.pieceType); 
  const targetRow = `${move.to.row}`;
  const targetColumn = `${changeDigitsToLetter(move.to.column).toLowerCase()}`;
  const targetSquare = targetColumn + targetRow;

  const isCapture = squares.some(
    (square) =>
      square.position.row === move.to.row &&
      square.position.column === move.to.column &&
      square.piece !== null
  );
  
  const fromColumn = changeDigitsToLetter(move.from.column).toLowerCase();

  // Roszada
  if (pieceSymbol === "K" && Math.abs(move.from.column - move.to.column) > 1) {
    return move.to.column === 7 ? "O-O" : "O-O-O";
  }

  return (
    `${pieceSymbol}${isCapture ? (pieceSymbol === "" ? fromColumn : "") + "x" : ""}` +
    `${targetSquare}` +
    `${isPromotion ? "=Q" : ""}` +
    `${isCheckmate ? "#" : isCheck ? "+" : ""}` +
    `${isTie ? "=" : ""}`
  );
  
}

function getPieceSymbol(pieceType: string): string {
  switch (pieceType) {
    case "king":
      return "K";
    case "queen":
      return "Q";
    case "rook":
      return "R";
    case "bishop":
      return "B";
    case "knight":
      return "N";
    default:
      return "";
  }
}
