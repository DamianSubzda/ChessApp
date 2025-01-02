import "./Square.scss";
import { changeDigitsToLetter } from "../../utils/board";
import { useRef } from "react";
import { memo } from "react";
import type { Square } from "../../types/Square";
import React from "react";

interface SquareProps {
    square: Square,
    onDropPiece: any,
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
function Square({square, onDropPiece}: SquareProps) {
    const pieceRef = useRef<HTMLDivElement | null>(null);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (pieceRef.current) {
            pieceRef.current.classList.add("dragging");
        }
    
        const dragElement = document.createElement("div");
        dragElement.id = "dragging-piece";
        dragElement.style.position = "absolute";
        dragElement.style.pointerEvents = "none";
        dragElement.style.width = "80px";
        dragElement.style.height = "80px";
        dragElement.style.backgroundImage = `url(/assets/pieces/neo/${square.piece?.src})`;
        dragElement.style.backgroundSize = "cover";
        dragElement.style.backgroundPosition = "center";
        dragElement.style.opacity = "1";
        dragElement.style.zIndex = "1000";
    
        document.body.appendChild(dragElement);
        document.body.classList.add("grabbing");
    
        const updatePosition = (e: MouseEvent) => {
            dragElement.style.left = `${e.pageX - 40}px`;
            dragElement.style.top = `${e.pageY - 40}px`;
        };
    
        document.addEventListener("mousemove", updatePosition);
    
        const handleMouseUp = (e: MouseEvent) => {
            if (pieceRef.current) {
                pieceRef.current.classList.remove("dragging");
            }

            document.body.removeChild(dragElement);
            document.body.classList.remove("grabbing");
            document.removeEventListener("mousemove", updatePosition);
            document.removeEventListener("mouseup", handleMouseUp);
    
            let target = document.elementFromPoint(e.clientX, e.clientY);
    
            while (target && !target.classList.contains("square")) {
                target = target.parentElement;
            }
    
            if (target) {
                const htmlTarget = target as HTMLElement;
                onDropPiece(square, { row: Number(htmlTarget.dataset.row), column: Number(htmlTarget.dataset.column) });
            }
        };
    
        document.addEventListener("mouseup", handleMouseUp, { once: true });
    };

    return (
        <div
            className="square"
            data-row={square.position.row}
            data-column={square.position.column}
            id={(square.position.row + square.position.column) % 2 === 1 ? "white" : "black"}
        >
            {square.piece?.src && (
                <div
                    className="piece"
                    id={`${square.position.row}${square.position.column}`}
                    ref={pieceRef}
                    draggable={false}
                    onMouseDown={handleMouseDown}
                >
                    <img src={`/assets/pieces/neo/${square.piece.src}`} alt="" />
                </div>
            )}
            {square.visibleNotation &&
                <div className="notation">
                    <p>{changeDigitsToLetter(square.position.column)}{square.position.row}</p>
                </div>
            }
        </div>
    );
}

export default memo(Square);