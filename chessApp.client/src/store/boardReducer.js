import { createSlice } from '@reduxjs/toolkit'
import { changeDigitsToLetter } from '../utils/boardUtil';

const initialState = {
    squares: [],
};

const boardSlice = createSlice({
    name: 'board',
    initialState,
    reducers: {
        setupBoard(state) {
            state.squares = setupInitialBoard();
        },
        reverseBoard(state) {
            state.squares = [...state.squares].reverse()
        },
        movePiece(state, action) {
            const { pieceData, targetPosition } = action.payload;

            // Ruch pionka na końcowy rząd uruchamia promocję
            if (pieceData.piece.src === 'wp.png' && targetPosition.row === 8) {
                state.squares = state.squares.map((square) => {
                    if (square.row === targetPosition.row && square.column === targetPosition.column) {
                        return { ...square, piece: {src: 'wq.png', color: 'white' }}; // Biała królowa
                    }
                    if (square.row === pieceData.row && square.column === pieceData.column) {
                        return { ...square, piece: null};
                    }
                    return square;
                });
            } else if (pieceData.piece.src === 'bp.png' && targetPosition.row === 1) {
                state.squares = state.squares.map((square) => {
                    if (square.row === targetPosition.row && square.column === targetPosition.column) {
                        return { ...square, piece: {src: 'bq.png', color: 'black' }}; // Czarna królowa
                    }
                    if (square.row === pieceData.row && square.column === pieceData.column) {
                        return { ...square, piece: null };
                    }
                    return square;
                });
            } else {
                // Normalne przesunięcie figury
                state.squares = state.squares.map((square) => {
                    if (square.row === targetPosition.row && square.column === targetPosition.column) {
                        return { ...square, piece: pieceData.piece };
                    }
                    if (square.row === pieceData.row && square.column === pieceData.column) {
                        return { ...square, piece: null };
                    }
                    
                    return square;
                });
            }
        },
    }
});

export const { setupBoard, movePiece, reverseBoard } = boardSlice.actions;
export default boardSlice.reducer;

function setupInitialBoard() {

    const initialPositions = {
        'A1': 'wr.png', 'H1': 'wr.png', 'B1': 'wn.png', 'G1': 'wn.png', 'C1': 'wb.png', 'F1': 'wb.png', 'D1': 'wq.png', 'E1': 'wk.png',
        'A2': 'wp.png', 'H2': 'wp.png', 'B2': 'wp.png', 'G2': 'wp.png', 'C2': 'wp.png', 'F2': 'wp.png', 'D2': 'wp.png', 'E2': 'wp.png',
        'A8': 'br.png', 'H8': 'br.png', 'B8': 'bn.png', 'G8': 'bn.png', 'C8': 'bb.png', 'F8': 'bb.png', 'D8': 'bq.png', 'E8': 'bk.png',
        'A7': 'bp.png', 'H7': 'bp.png', 'B7': 'bp.png', 'G7': 'bp.png', 'C7': 'bp.png', 'F7': 'bp.png', 'D7': 'bp.png', 'E7': 'bp.png',
    };

    return Array.from({ length: 64 }, (_, index) => {
        const row = Math.abs(Math.floor(index / 8) - 8);
        const column = (index % 8) + 1;
        const position = `${changeDigitsToLetter(column)}${row}`;
        const piece = initialPositions[position]
            ? {
                  src: initialPositions[position], 
                  color: row < 5 ? 'white' : 'black'
              }
            : null;
        return { row, column, piece };
    });
}