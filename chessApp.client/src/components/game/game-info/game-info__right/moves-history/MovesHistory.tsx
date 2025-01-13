import "./MovesHistory.scss"
import { useSelector } from "react-redux";
import React, { useRef, useEffect } from "react";
import { AppState } from "../../store/store";

function MovesHistory() {
    const tableContainerRef = useRef<HTMLDivElement | null>(null);
    const moves = useSelector((state: AppState) => state.movesHistory.moves);

    useEffect(() => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
        }
    }, [moves]);

    return (
        <div className="moves-history-container">
            <div className="table-container" ref={tableContainerRef}>
                <table className="table__element">
                    <thead>
                        <tr>
                            <th>Lp.</th>
                            <th>White</th>
                            <th>Black</th>
                        </tr>
                    </thead>
                    <tbody>
                        {moves.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="no-moves">No moves recorded...</td>
                            </tr>
                        ) : (
                            moves.map((move, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{move.white}</td>
                                    <td>{move.black || "-"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MovesHistory;