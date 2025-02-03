import React from "react";
import "./TakenPieces.scss"
import { GroupedPieces } from "../../types/GroupedPieces"

type TakenPiecesPropsType = {
    groupedPieces: GroupedPieces[],
}

function TakenPieces({ groupedPieces }: TakenPiecesPropsType) {

    const sortingOrder = [
        "p", // Pawn
        "r", // Rook
        "n", // Knight
        "b", // Bishop
        "q", // Queen
        "k", // King
    ];

    const sortedGroupedPieces = [...groupedPieces].sort((a, b) => {
        const indexA = sortingOrder.indexOf(a.piece.src[1]);
        const indexB = sortingOrder.indexOf(b.piece.src[1]);
        return indexA - indexB;
    });


    return (
        <div className="taken-pieces-container">
            {sortedGroupedPieces.map((group, groupIndex) => (
                <div
                    key={`${group.piece.src}-${groupIndex}`}
                    className="taken-pieces-group"
                    style={{ "--max-count": group.count } as React.CSSProperties}
                >
                    {[...Array(group.count)].map((_, imgIndex) => (
                        <img
                            key={`${group.piece.src}-${imgIndex}`}
                            src={`/assets/pieces/neo/${group.piece.src}`}
                            alt=""
                            style={{ "--index": imgIndex } as React.CSSProperties}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export default TakenPieces;