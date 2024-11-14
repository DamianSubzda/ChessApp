import React from "react";
import { useState, useEffect } from "react";
import Square from "./Square";
import "./Chessboard.scss"
import Timer from "./Timer"
import checkMove from "../../services/piecesMove";
import { useDispatch, useSelector } from "react-redux";
import { setupBoard, reverseBoard, movePiece } from "../../store/boardReducer";

function Chessboard(){
    const dispatch = useDispatch();
    const squares = useSelector((state) => state.board.squares);

    useEffect( () => {
        dispatch(setupBoard());
    }, [dispatch])

    function reverse(){
        dispatch(reverseBoard());
    }

    const onDropPiece = (pieceData, targetPosition) => {
        if (!checkMove(pieceData, targetPosition, squares)) return;
        //Timer
        dispatch(movePiece({ pieceData, targetPosition }))

    };

    function stopTimer(){
        console.log("STOP/START");
    }

    return(
        <React.Fragment>
        <Timer initialTime={600} onStop={stopTimer}/>
        
        <button onClick={reverse}>Reverse</button>
        <div className="chessboard">
            {squares.map((square, index) => (
                <Square
                    key={index}
                    row={square.row}
                    column={square.column}
                    piece={square.piece}
                    onDropPiece={onDropPiece}
                />
            ))}
        </div>
        <Timer initialTime={600} onStop={stopTimer}/>
        </React.Fragment>
        
    )
}

export default Chessboard;