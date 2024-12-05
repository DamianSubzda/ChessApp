import  { useSelector } from "react-redux"
import { checkIfPlayersMoveIsCorrect, checkIfPlayerWillBeCheckmated, checkIfPlayerWillBeInPat } from "../services/piecesMove";

function useCheckMove() {
    const squares = useSelector((state) => state.board.squares);

    return (pieceData, target, isPlayerWhite) => {
        return checkIfPlayersMoveIsCorrect(pieceData, target, isPlayerWhite, squares);
    }
}

function useCheckPat() {
    const squares = useSelector((state) => state.board.squares);
    return (pieceData, target) => {
        return checkIfPlayerWillBeInPat(pieceData, target, squares)
    }
}

function useCheckMat() {
    const squares = useSelector((state) => state.board.squares);
    return (pieceData, target) => {
        return checkIfPlayerWillBeCheckmated(pieceData, target, squares);
    }
}

export { useCheckMove, useCheckPat, useCheckMat };