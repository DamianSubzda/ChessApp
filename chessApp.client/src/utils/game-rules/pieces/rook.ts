import { Move } from "../../../types/Move";
import { Square } from "../../../types/Square";

function checkRook(move: Move, squares: Square[]){

    if (move.from.row !== move.to.row && move.from.column !== move.to.column) {
        return false;
    }
    
    return !checkRookCollision(move, squares);
}

function checkRookCollision(move: Move, squares: Square[]){
    let deltaRow = move.to.row > move.from.row ? 1 : move.to.row < move.from.row ? -1 : 0;
    let deltaColumn = move.to.column > move.from.column ? 1 : move.to.column < move.from.column ? -1 : 0;

    let currentRow = move.from.row + deltaRow;
    let currentColumn = move.from.column + deltaColumn;

    while (currentRow !== move.to.row || currentColumn !== move.to.column) {
        const square = squares.find(sq => sq.position.row === currentRow && sq.position.column === currentColumn);
        if (square?.piece !== null) {
            return true;
        }
        currentRow += deltaRow;
        currentColumn += deltaColumn;
    }

    return false;
}


export { checkRook }