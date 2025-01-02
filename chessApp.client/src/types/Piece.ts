export type Piece = {
    pieceType: PieceType,
    color: "white" | "black"
    src: string
}

type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king"