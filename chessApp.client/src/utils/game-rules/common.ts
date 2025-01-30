import { Coordinate } from "types/Coordinate";
import { Move } from "../../types/Move";
import { Square } from "../../types/Square";
import { checkPieces } from "./validation";


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

function checkIfSquareIsAttacked(color: "white" | "black", attackedSquare: Square, squares: Square[]) {
    const enemyColor = color === "white" ? "black" : "white";

    for (const square of squares) {
        if (square.piece?.color === enemyColor && attackedSquare) {
            const move = {
                from: { row: square.position.row, column: square.position.column} as Coordinate,
                to: { row: attackedSquare.position.row, column: attackedSquare.position.column} as Coordinate,
                piece: square.piece,
            } as Move;
            const isMovePossible = checkPieces(move, squares);
            if (isMovePossible) return true;
        }
    }
    return false;
}


export { simulateSquaresAfterMove, getLineOfAttack, checkIfSquareIsClearFromAllyPieces, checkIfSquareIsAttacked };