import { createSlice } from '@reduxjs/toolkit';
import { changeDigitsToLetter } from '../utils/boardUtil';
import { Move } from './../types/move';

const initialState: { moves: Move[] } = {
    moves: []
};

const movesSlice = createSlice({
    name: 'moves',
    initialState,
    reducers: {
        clearMoves(state) {
            state.moves = [];
        },
        addMove(state, action) {
            const { move, playerColor } = action.payload;
            state.moves = [...state.moves, { move, playerColor }];
        },
    }
});

export const { clearMoves, addMove } = movesSlice.actions;
export default movesSlice.reducer;
//TODO: zmiana wszystkich plików na tsx i ts