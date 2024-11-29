import "./Square.scss";
import { changeDigitsToLetter } from "../../utils/boardUtil";
import { useRef, useState } from "react";

function Square(props) {
    const { row, column, pieceSrc, pieceColor, onDropPiece } = props;
    const pieceRef = useRef(null);

    const handleMouseDown = (e) => {
        e.preventDefault();
        const pieceData = { pieceSrc, pieceColor, row, column };

        if (pieceRef.current) {
            pieceRef.current.classList.add("dragging");
        }
    
        const dragElement = document.createElement("div");
        dragElement.id = "dragging-piece";
        dragElement.style.position = "absolute";
        dragElement.style.pointerEvents = "none";
        dragElement.style.width = "80px";
        dragElement.style.height = "80px";
        dragElement.style.backgroundImage = `url(/assets/pieces/neo/${pieceSrc})`;
        dragElement.style.backgroundSize = "cover";
        dragElement.style.backgroundPosition = "center";
        dragElement.style.opacity = "1";
        dragElement.style.zIndex = "1000";
    
        document.body.appendChild(dragElement);
        document.body.classList.add("grabbing");
    
        const updatePosition = (event) => {
            dragElement.style.left = `${event.pageX - 40}px`;
            dragElement.style.top = `${event.pageY - 40}px`;
        };
    
        document.addEventListener("mousemove", updatePosition);
    
        const handleMouseUp = (event) => {
            if (pieceRef.current) {
                pieceRef.current.classList.remove("dragging");
            }

            document.body.removeChild(dragElement);
            document.body.classList.remove("grabbing");
            document.removeEventListener("mousemove", updatePosition);
            document.removeEventListener("mouseup", handleMouseUp);
    
            let target = document.elementFromPoint(event.clientX, event.clientY);
    
            while (target && !target.classList.contains("square")) {
                target = target.parentElement;
            }
    
            if (target) {
                onDropPiece(pieceData, { row: Number(target.dataset.row), column: Number(target.dataset.column) });
            }
        };
    
        document.addEventListener("mouseup", handleMouseUp, { once: true });
    };

    return (
        <div
            className="square"
            data-row={row}
            data-column={column}
            style={{ backgroundColor: (row + column) % 2 === 1 ? "white" : "green" }}
        >
            {pieceSrc && (
                <div
                    className="piece"
                    id={`${row}${column}`}
                    ref={pieceRef}
                    draggable={false}
                    onMouseDown={handleMouseDown}
                >
                    <img src={`/assets/pieces/neo/${pieceSrc}`} alt="" />
                </div>
            )}
            {(column === 1 || row === 1) && (
                <div className="notation">
                    <p>{changeDigitsToLetter(column)}{row}</p>
                </div>
            )}
        </div>
    );
}

export default Square;