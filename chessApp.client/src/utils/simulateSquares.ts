import { Move } from "../types/Move";
import { Square } from "../types/Square";

function simulateSquaresAfterMove(move: Move, squares: Square[]) {
    return squares.map((sq) => {
        if (sq.row === move.rowFrom && sq.column === move.columnFrom) {
            return { ...sq, piece: null };
        }
        if (sq.row === move.rowTo && sq.column === move.columnTo) {
            return { ...sq, piece: move.piece };
        }
        return sq;
    });
}

export { simulateSquaresAfterMove };