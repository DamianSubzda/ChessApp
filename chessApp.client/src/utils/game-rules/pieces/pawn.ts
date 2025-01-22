import { Move } from "../../../types/Move";
import { Square } from "../../../types/Square";


function checkPawn(move: Move, squares: Square[]){
    if (move.piece.color === "white"){
        //white pawn
        if (move.from.column !== move.to.column){
            if (Math.abs(move.from.column - move.to.column) === 1 && move.to.row === move.from.row + 1){
                return checkIfPawnCanTake(move, squares);
            }
            return false;
        }
        if (move.to.row === move.from.row + 2){
            //First move
            if (move.from.row === 2){
                return checkPawnCollision(move, squares);
            }else{
                return false;
            }
        }
        if (move.to.row === move.from.row + 1){
            return checkPawnCollision(move, squares);
        }
    }
    else{
        //black pawn
        if (move.from.column !== move.to.column){
            if (Math.abs(move.from.column - move.to.column) === 1 && move.to.row === move.from.row - 1){
                return checkIfPawnCanTake(move, squares);
            }
            return false;
        }
        if (move.to.row === move.from.row - 2){
            //First move
            if (move.from.row === 7){
                return checkPawnCollision(move, squares) ;
            }else{
                return false;
            }
        }
        if (move.to.row === move.from.row - 1){
            return checkPawnCollision(move, squares);
        }
    }

    return false;
}

function checkPawnCollision(move: Move, squares: Square[]){
    if (Math.abs(move.to.row - move.from.row) > 1) {
        if (move.to.row > move.from.row){
            //White
            if (squares.find((sq) => sq.position.row === move.to.row - 1 && sq.position.column === move.to.column)?.piece !== null){//-1 ponieważ to pole które pion by 'przeskoczył'
                return false;
            }
        }else{
            //Black
            if (squares.find((sq) => sq.position.row === move.to.row + 1 && sq.position.column === move.to.column)?.piece !== null){//+1 ponieważ to pole które pion by 'przeskoczył'
                return false;
            }
        }
    }
    return squares.find((sq) => sq.position.row === move.to.row && sq.position.column === move.to.column)?.piece === null;
}

function checkIfPawnCanTake(move: Move, squares: Square[]){
    if (squares.find((sq) => sq.position.row === move.to.row && sq.position.column === move.to.column)?.piece !== null){
        return true;
    }
    return move.isEnPassant;
}

export { checkPawn };