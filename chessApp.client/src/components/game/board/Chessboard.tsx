import React from "react";
import { useEffect } from "react";
import Square from "./Square.tsx";
import "./Chessboard.scss"
import type { AppState } from "../../../store/store.ts";
import { useDispatch, useSelector } from "react-redux";
import { setupBoard, reverseBoard } from "../../../store/boardReducer.ts";

function Chessboard({ colorOfPOV, makeMove }) {
    const dispatch = useDispatch();
    const squares = useSelector((state: AppState) => state.board.squares);

    useEffect(() => {
        dispatch(setupBoard());
    }, []);

    useEffect(() => {
        if (colorOfPOV === "black") dispatch(reverseBoard());
    }, [colorOfPOV, dispatch])

    return (
        <div className="chessboard">
            {squares.map((square, index) => (
                <Square
                    key={index}
                    square={square}
                    onDropPiece={makeMove}
                />
            ))}
        </div>
    );
}

export default Chessboard;