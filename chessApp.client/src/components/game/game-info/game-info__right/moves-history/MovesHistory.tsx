import "./MovesHistory.scss";
import { useSelector } from "react-redux";
import React, { useRef, useEffect } from "react";
import { AppState } from "./../../../../../store/store.ts";
import { GameTurn } from "../../../../../types/GameTurn.ts";

type Row = {
  white: string;
  black: string;
};

function MovesHistory() {
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const turns = useSelector((state: AppState) => state.gameStore.game?.turns);

  useEffect(() => {
    if (tableContainerRef.current && turns) {
      tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
    }
  }, [turns]);

  const groupTurnsIntoRows = (turns: GameTurn[] | undefined): Row[] => {
    if (!turns) return [];

    return turns.reduce<Row[]>((rows, turn, index) => {
      if (index % 2 === 0) {
        rows.push({
          white: turn.player.color === "white" ? turn.move.notation : "-",
          black: "-",
        });
      } else {
        const lastRow = rows[rows.length - 1];
        lastRow.black = turn.player.color === "black" ? turn.move.notation : "-";
      }
      return rows;
    }, []);
  };

  const renderTableBody = (rows: Row[]) => {
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={3} className="no-moves">
            No moves recorded...
          </td>
        </tr>
      );
    }

    return rows.map((row, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{row.white}</td>
        <td>{row.black}</td>
      </tr>
    ));
  };

  const rows = groupTurnsIntoRows(turns);

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
          <tbody>{renderTableBody(rows)}</tbody>
        </table>
      </div>
    </div>
  );
}

export default MovesHistory;