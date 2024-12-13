import { Move } from "../types/Move";
import { Square } from "../types/Square";
import { changeDigitsToLetter } from "./board";

export function generateChessNotation(move: Move, squares: Square[]): string {
    const pieceSymbol = getPieceSymbol(move.piece.src);
    const targetRow = `${move.rowTo}`
    const targetColumn = `${changeDigitsToLetter(move.columnTo).toLowerCase()}`
    const targetSquare = targetColumn + targetRow;
    const capture = squares.find(
        (square) => square.row === move.rowTo && square.column === move.columnTo && square.piece !== null
    );
    const captureSymbol = capture ? "x" : "";
    const fromColumn = `${changeDigitsToLetter(move.columnFrom)}`;

    // Specjalne przypadki
    if (pieceSymbol === "K" && Math.abs(move.columnFrom - move.columnTo) > 1) {
        return move.columnTo === 7 ? "O-O" : "O-O-O";
    }
    
    return `${pieceSymbol}${captureSymbol === "x" ? pieceSymbol === "" ? fromColumn.toLowerCase() + captureSymbol : captureSymbol : ""}${targetSquare}`;
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
