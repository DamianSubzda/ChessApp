import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
    moves: [] as { white: string, black: string | null}[], 
};

const movehistorySlice = createSlice({
    name: 'moves',
    initialState,
    reducers: {
        clearMoves(state) {
            state.moves = [];
        },
        addMove(state, action: PayloadAction<{ notation: string; color: 'white' | 'black' }>) {
            const { notation, color } = action.payload;
            if (color === 'white') {
                state.moves.push({ white: notation, black: null });
            } else {
                const lastMove = state.moves[state.moves.length - 1];
                if (lastMove && lastMove.black === null) {
                    lastMove.black = notation;
                };
            }
        },
    }
});

export const { clearMoves, addMove } = movehistorySlice.actions;
export default movehistorySlice.reducer;