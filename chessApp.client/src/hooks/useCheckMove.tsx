import  { useSelector } from "react-redux"
import { checkIfPlayersMoveIsCorrect, checkIfPlayerWillBeCheckmated, checkIfPlayerWillBeInPat, checkIfPlayerWillBeInCheck } from "../services/piecesMove.ts";
import { AppState } from "../store/store.ts";
import { Move } from "../types/Move.ts";

function useCheckMove() {
    const squares = useSelector((state: AppState) => state.board.squares);

    return (move: Move) => {
        return checkIfPlayersMoveIsCorrect(move, squares);
    }
}

function useCheck() {
    const squares = useSelector((state: AppState) => state.board.squares);

    return (move: Move) => {
        return checkIfPlayerWillBeInCheck(move, squares);
    }
}

function useCheckPat() {
    const squares = useSelector((state: AppState) => state.board.squares);
    return (move: Move) => {
        return checkIfPlayerWillBeInPat(move, squares)
    }
}

function useCheckMat() {
    const squares = useSelector((state: AppState) => state.board.squares);
    return (move: Move) => {
        return checkIfPlayerWillBeCheckmated(move, squares);
    }
}

export { useCheckMove, useCheckPat, useCheckMat, useCheck };