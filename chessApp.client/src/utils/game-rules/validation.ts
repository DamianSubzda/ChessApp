import { Move } from "../../types/Move";
import { Square } from "../../types/Square";
import { checkBishop } from "./pieces/bishop.ts";
import { isKingInCheck, checkKing } from "./pieces/king.ts";
import { checkKnight } from "./pieces/knight.ts";
import { checkPawn } from "./pieces/pawn.ts";
import { checkQueen } from "./pieces/queen.ts";
import { checkRook } from "./pieces/rook.ts";
import { checkIfSquareIsClearFromAllyPieces, simulateSquaresAfterMove } from "./common.ts";


function checkIfPlayersMoveIsCorrect(move: Move, squares: Square[]){
    if (move.from.column === move.to.column && move.from.row === move.to.row) return false;

    let canMove =  checkPieces(move, squares); 
    
    if (canMove) {
        const simulatedSquares = simulateSquaresAfterMove(move, squares);
        if (isKingInCheck(move.piece.color, simulatedSquares)){
            canMove = false;
        }
    }

    return canMove;
}

function checkPieces(move: Move, squares: Square[]){

    if (!checkIfSquareIsClearFromAllyPieces(move, squares)) return false;

    switch (move.piece.pieceType) {
        case "pawn":
            return checkPawn(move, squares);
        case "rook":
            return checkRook(move, squares);
        case "knight":
            return checkKnight(move, squares);
        case "bishop":
            return checkBishop(move, squares);
        case "queen":
            return checkQueen(move, squares);
        case "king":
            return checkKing(move, squares);
        default:
            return false;
    }
}


export { checkIfPlayersMoveIsCorrect, checkPieces };