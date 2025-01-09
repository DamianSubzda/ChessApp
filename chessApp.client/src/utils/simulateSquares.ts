import { Move } from "../types/Move";
import { Square } from "../types/Square";

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

export { simulateSquaresAfterMove };