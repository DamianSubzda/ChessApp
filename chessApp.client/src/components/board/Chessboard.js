import React from "react";
import { useEffect } from "react";
import Square from "./Square";
import "./Chessboard.scss"

import { useDispatch, useSelector } from "react-redux";
import { setupBoard, reverseBoard } from "../../store/boardReducer";

function Chessboard({ isPlayerWhite, makeMove }) {
    const dispatch = useDispatch();
    const squares = useSelector((state) => state.board.squares);

    useEffect(() => {
        dispatch(setupBoard());
        if (!isPlayerWhite) dispatch(reverseBoard());
    }, [dispatch, isPlayerWhite]);

    return (
        <div className="chessboard">
            {squares.map((square, index) => (
                <Square
                    key={index}
                    row={square.row}
                    column={square.column}
                    pieceSrc={square.pieceSrc}
                    pieceColor ={square.pieceColor}
                    onDropPiece={makeMove}
                />
            ))}
        </div>
    );
}

export default Chessboard;