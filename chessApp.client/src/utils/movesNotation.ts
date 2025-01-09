import { Move } from "../types/Move";
import { Square } from "../types/Square";
import { changeDigitsToLetter } from "./board";

export function generateChessNotation(
  move: Move,
  squares: Square[],
  isCheck: boolean,
  isCheckmate: boolean,
  isPat: boolean
): string {
  const pieceSymbol = getPieceSymbol(move.piece.src);
  const targetRow = `${move.to.row}`;
  const targetColumn = `${changeDigitsToLetter(move.to.column).toLowerCase()}`;
  const targetSquare = targetColumn + targetRow;
  const capture = squares.find(
    (square) =>
      square.position.row === move.to.row &&
      square.position.column === move.to.column &&
      square.piece !== null
  );
  const captureSymbol = capture ? "x" : "";
  const fromColumn = `${changeDigitsToLetter(move.from.column)}`;

  // Specjalne przypadki
  if (pieceSymbol === "K" && Math.abs(move.from.column - move.to.column) > 1) {
    return move.to.column === 7 ? "O-O" : "O-O-O";
  }

  return `${pieceSymbol}${
    captureSymbol === "x"
      ? pieceSymbol === ""
        ? fromColumn.toLowerCase() + captureSymbol
        : captureSymbol
      : ""
  }${targetSquare}${isCheckmate ? "#" : isCheck ? "+" : isPat ? "=" : ""}`;
}

function getPieceSymbol(pieceSrc: string): string {
  switch (pieceSrc) {
    case "wk.png":
    case "bk.png":
      return "K";
    case "wq.png":
    case "bq.png":
      return "Q";
    case "wr.png":
    case "br.png":
      return "R";
    case "wb.png":
    case "bb.png":
      return "B";
    case "wn.png":
    case "bn.png":
      return "N";
    default:
      return "";
  }
}
