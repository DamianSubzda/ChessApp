import { Move } from './../types/Move';
import { Square } from './../types/Square';
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { changeDigitsToLetter } from '../utils/board';
import { Piece } from '../types/Piece';

const boardSlice = createSlice({
    name: 'board',
    initialState: { squares: [] as Square[] },
    reducers: {
        clearBoard(state){
            state.squares = [];
        },
        setupBoard(state) {
            state.squares = setupInitialBoard();
        },
        reverseBoard(state) {
            state.squares = [...state.squares].reverse() //Tu zmiana visibleNotation
        },
        movePiece(state, action: PayloadAction<Move>) {
            const move = action.payload;
            //Promocja
            if (move.piece.src === 'wp.png' && move.rowTo === 8) {
                move.piece.src = 'wq.png';
                move.piece.pieceType = "queen";
            } else if (move.piece.src === 'bp.png' && move.rowTo === 1) {
                move.piece.src = 'bq.png';
                move.piece.pieceType = "queen";
            }
        
            state.squares = state.squares.map((square) => {
                //Dodanie figury
                if (square.position.row === move.rowTo && square.position.column === move.columnTo) {
                    console.log("moved piece here: ", square.position.row, square.position.column);
                    console.log(move.piece);
                    return { ...square, piece: move.piece };
                }
                //Usunięcie figury
                if (square.position.row === move.rowFrom && square.position.column === move.columnFrom) {
                    return { ...square, piece: null };
                }
                
                return square;
            });
        },
    }
});

export const { setupBoard, movePiece, reverseBoard, clearBoard } = boardSlice.actions;
export default boardSlice.reducer;

function setupInitialBoard(): Square[] {
    const initialPieces = new Map<string, Piece>([
        // Białe figury
        ['A1', { pieceType: "rook", color: "white", src: 'wr.png' }],
        ['H1', { pieceType: "rook", color: "white", src: 'wr.png' }],
        ['B1', { pieceType: "knight", color: "white", src: 'wn.png' }],
        ['G1', { pieceType: "knight", color: "white", src: 'wn.png' }],
        ['C1', { pieceType: "bishop", color: "white", src: 'wb.png' }],
        ['F1', { pieceType: "bishop", color: "white", src: 'wb.png' }],
        ['D1', { pieceType: "queen", color: "white", src: 'wq.png' }],
        ['E1', { pieceType: "king", color: "white", src: 'wk.png' }],
        ['A2', { pieceType: "pawn", color: "white", src: 'wp.png' }],
        ['B2', { pieceType: "pawn", color: "white", src: 'wp.png' }],
        ['C2', { pieceType: "pawn", color: "white", src: 'wp.png' }],
        ['D2', { pieceType: "pawn", color: "white", src: 'wp.png' }],
        ['E2', { pieceType: "pawn", color: "white", src: 'wp.png' }],
        ['F2', { pieceType: "pawn", color: "white", src: 'wp.png' }],
        ['G2', { pieceType: "pawn", color: "white", src: 'wp.png' }],
        ['H2', { pieceType: "pawn", color: "white", src: 'wp.png' }],
    
        // Czarne figury
        ['A8', { pieceType: "rook", color: "black", src: 'br.png' }],
        ['H8', { pieceType: "rook", color: "black", src: 'br.png' }],
        ['B8', { pieceType: "knight", color: "black", src: 'bn.png' }],
        ['G8', { pieceType: "knight", color: "black", src: 'bn.png' }],
        ['C8', { pieceType: "bishop", color: "black", src: 'bb.png' }],
        ['F8', { pieceType: "bishop", color: "black", src: 'bb.png' }],
        ['D8', { pieceType: "queen", color: "black", src: 'bq.png' }],
        ['E8', { pieceType: "king", color: "black", src: 'bk.png' }],
        ['A7', { pieceType: "pawn", color: "black", src: 'bp.png' }],
        ['B7', { pieceType: "pawn", color: "black", src: 'bp.png' }],
        ['C7', { pieceType: "pawn", color: "black", src: 'bp.png' }],
        ['D7', { pieceType: "pawn", color: "black", src: 'bp.png' }],
        ['E7', { pieceType: "pawn", color: "black", src: 'bp.png' }],
        ['F7', { pieceType: "pawn", color: "black", src: 'bp.png' }],
        ['G7', { pieceType: "pawn", color: "black", src: 'bp.png' }],
        ['H7', { pieceType: "pawn", color: "black", src: 'bp.png' }],
    ]);
    

    return Array.from({ length: 64 }, (_, index) => {
        const row = Math.abs(Math.floor(index / 8) - 8);
        const column = (index % 8) + 1;
        const notation = `${changeDigitsToLetter(column)}${row}`;
        const piece = initialPieces.get(notation) ?? null;

        return {
            position: { row: row, column: column},
            visibleNotation: true, // Do ustawienia - tu dla białych.
            piece: piece
        } as Square;
    });
}
