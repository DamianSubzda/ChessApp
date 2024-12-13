import "./MovesHistory.scss"
import { useSelector } from "react-redux";
import React from "react";
import { AppState } from "../../store/store";

function MovesHistory() {
    const moves = useSelector((state: AppState) => state.movesHistory.moves);
    
    return (
        <div className="moves-history-container">
            <h3>Moves:</h3>
            <div className="table-container">
                <table className="table__element">
                    <thead>
                        <tr>
                            <th style={{width: "10%"}}>Lp.</th>
                            <th style={{width: "45%"}}>White</th>
                            <th style={{width: "45%"}}>Black</th>
                        </tr>
                    </thead>
                    <tbody>
                        {moves.map((move, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{move.white}</td>
                                {move.black && <td>{move.black}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MovesHistory;
