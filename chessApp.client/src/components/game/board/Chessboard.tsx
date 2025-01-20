import React from "react";
import { useEffect } from "react";
import Square from "./Square.tsx";
import "./Chessboard.scss"
import type { AppState } from "../../../store/store.ts";
import { useDispatch, useSelector } from "react-redux";
import { setupBoard, reverseBoard } from "../../../store/boardReducer.ts";
import { Player } from "../../../types/Player.ts";

interface ChessboardProps {
    player: Player | null
    makeMove: any
}

function Chessboard({player, makeMove}: ChessboardProps) {
    const dispatch = useDispatch();
    const squares = useSelector((state: AppState) => state.boardStore.squares);

    useEffect(() => {
        if (player?.color === null) return;
        dispatch(setupBoard());
        if (player?.color === "black") dispatch(reverseBoard());
    }, [player?.color, dispatch]);

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