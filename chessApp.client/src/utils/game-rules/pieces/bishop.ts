import { Move } from "../../../types/Move";
import { Square } from "../../../types/Square";

function checkBishop(move: Move, squares: Square[]){
    const deltaRow = Math.abs(move.from.row - move.to.row);
    const deltaColumn = Math.abs(move.from.column - move.to.column);

    if (deltaColumn === deltaRow){
        return !checkBishopCollision(move, squares);
    }
    return false;
}

function checkBishopCollision(move: Move, squares: Square[]){
    const deltaRow = move.to.row > move.from.row ? 1 : -1;
    const deltaColumn = move.to.column > move.from.column ? 1 : -1;

    let currentRow = move.from.row + deltaRow;
    let currentColumn = move.from.column + deltaColumn;

    while (currentRow !== move.to.row && currentColumn !== move.to.column) {
        const square = squares.find((sq) => sq.position.row === currentRow && sq.position.column === currentColumn && sq.piece !== null);
        if (square) {
            return true;
        }
        currentRow += deltaRow;
        currentColumn += deltaColumn;
    }

    return false;
}

export { checkBishop };