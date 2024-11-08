import React from "react";
import { useState, useEffect } from "react";
import Square from "./Square";
import "./Chessboard.scss"
import Timer from "./Timer"

function Chessboard(){
    const [squares, setSquares] = useState([]);
    const boardSize = 8;

    useEffect( () => {
        setSquares(createBoard());
    }, [])

    function reverseBoard(){
        setSquares([...squares].reverse());
    }

    function createBoard(){
        const board = [];
        for(let row = boardSize; row > 0; row--){
            for(let col = 1; col <= boardSize; col++){
                const isWhite = (row + col) % 2 === 1;
                board.push(
                    <Square key={`${row}${col}`} isWhite={isWhite} row={row} column={col} />
                )
            }
        }
        return board;
    }

    function stopTimer(){
        console.log("STOP/START");
    }

    return(
        <React.Fragment>
        <Timer initialTime={7290} onStop={stopTimer}/>
        
        <button onClick={reverseBoard}>Reverse</button>
        <div className="chessboard">
            {squares}
        </div>
        <Timer initialTime={500} onStop={stopTimer}/>
        </React.Fragment>
        
    )
}

export default Chessboard;