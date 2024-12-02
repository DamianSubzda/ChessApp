import  { useSelector } from "react-redux"
import checkMove from "../services/piecesMove";

function useCheckMove() {
    const squares = useSelector((state) => state.board.squares);

    return (pieceData, targetPosition) => {
        return checkMove(pieceData, targetPosition, squares);
    }
}

export default useCheckMove;