import { Move } from './../types/Move';
import { Square } from './../types/Square';
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { changeDigitsToLetter } from '../utils/board';

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
            state.squares = [...state.squares].reverse()
        },
        movePiece(state, action: PayloadAction<Move>) {
            const move = action.payload;
            //Promocja
            if (move.piece.src === 'wp.png' && move.rowTo === 8) {
                move.piece.src = 'wq.png';
            } else if (move.piece.src === 'bp.png' && move.rowTo === 1) {
                move.piece.src = 'bq.png';
            }
        
            state.squares = state.squares.map((square) => {
                //Dodanie figury
                if (square.row === move.rowTo && square.column === move.columnTo) {
                    return { ...square, piece: move.piece };
                }
                //Usunięcie figury
                if (square.row === move.rowFrom && square.column === move.columnFrom) {
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
    const initialPositions = new Map<string, string>([
        ['A1', 'wr.png'], ['H1', 'wr.png'], ['B1', 'wn.png'], ['G1', 'wn.png'], 
        ['C1', 'wb.png'], ['F1', 'wb.png'], ['D1', 'wq.png'], ['E1', 'wk.png'],
        ['A2', 'wp.png'], ['H2', 'wp.png'], ['B2', 'wp.png'], ['G2', 'wp.png'], 
        ['C2', 'wp.png'], ['F2', 'wp.png'], ['D2', 'wp.png'], ['E2', 'wp.png'],
        ['A8', 'br.png'], ['H8', 'br.png'], ['B8', 'bn.png'], ['G8', 'bn.png'], 
        ['C8', 'bb.png'], ['F8', 'bb.png'], ['D8', 'bq.png'], ['E8', 'bk.png'],
        ['A7', 'bp.png'], ['H7', 'bp.png'], ['B7', 'bp.png'], ['G7', 'bp.png'], 
        ['C7', 'bp.png'], ['F7', 'bp.png'], ['D7', 'bp.png'], ['E7', 'bp.png'],
    ]);

    return Array.from({ length: 64 }, (_, index) => {
        const row = Math.abs(Math.floor(index / 8) - 8);
        const column = (index % 8) + 1;
        const position = `${changeDigitsToLetter(column)}${row}`;
        const pieceSrc = initialPositions.get(position) ?? null;

        return {
            row,
            column,
            piece: pieceSrc
                ? {
                    color: row < 5 ? 'white' : 'black',
                    src: pieceSrc,
                  }
                : null,
        } as Square;
    });
}
