import { CastlingRights, FEN } from "types/FEN";
import { Square } from "../types/Square";
import { Coordinate } from "types/Coordinate";
import { changeDigitsToLetter } from "./board";

export function FENGenerator(fenData: FEN): string {
  return (
    getPositionStringForFEN(fenData.squares) +
    " " +
    fenData.nextPlayerColor[0] +
    " " +
    getCastlingRightsStringForFEN(fenData.castlingRights) +
    " " +
    getEnPassantStringForFEN(fenData.enPassantSquare) +
    " " +
    fenData.halfMoveClock +
    " " +
    fenData.fullMoveNumber
  );
}

function getPositionStringForFEN(squares: Square[]): string {
  const ranks = squares.map((sq) => {
    if (!sq.piece) {
      return { pieceType: "", position: sq.position };
    }

    const letter = sq.piece.pieceType === "knight"
      ? "n"
      : sq.piece.pieceType[0];
  
    const pieceType = sq.piece.color === "white"
      ? letter.toUpperCase()
      : letter.toLowerCase();
  
    return {
      pieceType,
      position: sq.position
    };
  });

  const groupedByRow: Record<
    number,
    { pieceType: string; position: Coordinate }[]
  > = ranks.reduce((acc, sq) => {
    const row = sq.position.row;
    acc[row] = acc[row] || [];
    acc[row].push(sq);
    acc[row].sort((a, b) => a.position.col - b.position.col);
    return acc;
  }, {});

  let fenString = "";

  for (let row = 8; row >= 1; row--) {
    const currentRow = groupedByRow[row] || [];
    let emptyCount = 0;
    let rowString = "";

    for (let col = 1; col <= 8; col++) {
      const square = currentRow.find((sq) => {
        return sq.position.column === col;
      });
      if (!square || square.pieceType === "") {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rowString += emptyCount.toString();
          emptyCount = 0;
        }
        rowString += square.pieceType;
      }
    }

    if (emptyCount > 0) {
      rowString += emptyCount.toString();
    }

    fenString += row === 1 ? rowString : `${rowString}/`;
  }
  return fenString;
}

function getCastlingRightsStringForFEN(castlingRights: CastlingRights): string {
  const castlingRightsString =
    (castlingRights.canWhiteCastleKingSide ? "K" : "") +
    (castlingRights.canWhiteCastleQueenSide ? "Q" : "") +
    (castlingRights.canBlackCastleKingSide ? "k" : "") +
    (castlingRights.canBlackCastleQueenSide ? "q" : "");

  return castlingRightsString === "" ? "-" : castlingRightsString;
}

function getEnPassantStringForFEN(square: Square | null): string {
    return square === null ? "-" : (changeDigitsToLetter(square.position.column).toLowerCase() + square.position.row.toString())
}
