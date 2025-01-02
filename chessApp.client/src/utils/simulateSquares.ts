import { Move } from "../types/Move";
import { Square } from "../types/Square";

function simulateSquaresAfterMove(move: Move, squares: Square[]) {
    return squares.map((sq) => {
        if (sq.position.row === move.rowFrom && sq.position.column === move.columnFrom) {
            return { ...sq, piece: null };
        }
        if (sq.position.row === move.rowTo && sq.position.column === move.columnTo) {
            return { ...sq, piece: move.piece };
        }
        return sq;
    });
}

export { simulateSquaresAfterMove };