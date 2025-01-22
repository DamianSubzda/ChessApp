import { Move } from "../../types/Move";
import { Square } from "../../types/Square";


function simulateSquaresAfterMove(move: Move, squares: Square[]) {
    return squares.map((sq) => {
        if (sq.position.row === move.from.row && sq.position.column === move.from.column) {
            return { ...sq, piece: null };
        }
        if (sq.position.row === move.to.row && sq.position.column === move.to.column) {
            return { ...sq, piece: move.piece };
        }
        return sq;
    });
}

function getLineOfAttack(kingSquare: Square, attackerSquare: Square) {
    const lineOfAttack = [] as Square[];
    const deltaRow = Math.sign(attackerSquare.position.row - kingSquare.position.row);
    const deltaColumn = Math.sign(attackerSquare.position.column - kingSquare.position.column);

    let currentRow = kingSquare.position.row + deltaRow;
    let currentColumn = kingSquare.position.column + deltaColumn;

    while (
        currentRow !== attackerSquare.position.row &&
        currentColumn !== attackerSquare.position.column
    ) {
        lineOfAttack.push({ position: { row: currentRow, column: currentColumn }} as Square);
        currentRow += deltaRow;
        currentColumn += deltaColumn;
    }

    return lineOfAttack;
}

function checkIfSquareIsClearFromAllyPieces(move: Move, squares: Square[]) {
    const targetSquare = squares.find(
        (sq) => sq.position.row === move.to.row && sq.position.column === move.to.column
    );

    if (targetSquare && targetSquare.piece && targetSquare.piece.color === move.piece.color) {
        return false;
    }

    return true;
}


export { simulateSquaresAfterMove, getLineOfAttack, checkIfSquareIsClearFromAllyPieces };