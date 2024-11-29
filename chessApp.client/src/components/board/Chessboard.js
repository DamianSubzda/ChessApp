import React from "react";
import { useState, useEffect } from "react";
import Square from "./Square";
import "./Chessboard.scss"

import checkMove from "../../services/piecesMove";
import { useDispatch, useSelector } from "react-redux";
import { setupBoard, reverseBoard, movePiece } from "../../store/boardReducer";

function Chessboard({ isPlayerWhite, isPlayerPlaying, isPlayersMove, makeMove }) {
    const dispatch = useDispatch();
    const squares = useSelector((state) => state.board.squares);

    useEffect(() => {
        dispatch(setupBoard());
        if (!isPlayerWhite) dispatch(reverseBoard());
    }, [dispatch, isPlayerWhite]);

    const onDropPiece = (pieceData, targetPosition) => {
        if (!isPlayerPlaying || !isPlayersMove) return;

        if (!checkMove(pieceData, targetPosition, squares)) return;
        //Timer
        dispatch(movePiece({ pieceData, targetPosition }));


        makeMove({
            piece: {
                column: pieceData.column,
                row: pieceData.row,
                color: pieceData.pieceColor,
                src: pieceData.pieceSrc
            },
            row: targetPosition.row,
            column: targetPosition.column
        });
    };

    return (
        <div className="chessboard">
            {squares.map((square, index) => (
                <Square
                    key={index}
                    row={square.row}
                    column={square.column}
                    pieceSrc={square.pieceSrc}
                    pieceColor ={square.pieceColor}
                    onDropPiece={onDropPiece}
                />
            ))}
        </div>
    );
}

export default Chessboard;