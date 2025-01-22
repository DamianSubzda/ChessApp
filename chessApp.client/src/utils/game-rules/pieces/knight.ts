import { Move } from "../../../types/Move";
import { Square } from "../../../types/Square";

function checkKnight(move: Move, squares: Square[]){

    if (Math.abs(move.from.row - move.to.row) === 1){
        //Na boki
        return Math.abs(move.from.column - move.to.column) === 2;
    }
    else if (Math.abs(move.from.row - move.to.row) === 2){
        //góra/dół
        return Math.abs(move.from.column - move.to.column) === 1;
    }

    return false;
}

export { checkKnight };