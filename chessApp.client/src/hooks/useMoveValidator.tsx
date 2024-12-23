import  { useSelector } from "react-redux"
import { checkIfPlayersMoveIsCorrect, checkIfPlayerWillBeCheckmated, checkIfPlayerWillBeInPat, checkIfPlayerWillBeInCheck } from "../services/piecesMove.ts";
import { AppState } from "../store/store.ts";
import { Move } from "../types/Move.ts";

export default function useMoveValidator() {
    const squares = useSelector((state: AppState) => state.board.squares);

    const isMoveCorrect = (move: Move) => {
        return checkIfPlayersMoveIsCorrect(move, squares);
    }

    const isPlayerInCheck = (move: Move) => {
        return checkIfPlayerWillBeInCheck(move, squares);
    }

    const isPlayerInPat = (move: Move) => {
        return checkIfPlayerWillBeInPat(move, squares);
    }

    const isPlayerInMat = (move: Move) => {
        return checkIfPlayerWillBeCheckmated(move, squares);
    }

    return {
        isMoveCorrect,
        isPlayerInCheck,
        isPlayerInPat,
        isPlayerInMat
    }
}
