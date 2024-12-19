import { Piece } from './../types/Piece';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GroupedPieces } from "./../types/GroupedPieces.ts"


const initialState = {
    whiteGroupedPieces: [] as GroupedPieces[],
    blackGroupedPieces: [] as GroupedPieces[] 
};

const takenPiecesSlice = createSlice({
    name: 'pieces',
    initialState,
    reducers: {
        clearPieces(state) {
            state.whiteGroupedPieces = [];
            state.blackGroupedPieces = [];
        },
        addPiece(state, action: PayloadAction<Piece | null>) {
            const piece = action.payload;
            if (!piece) return;
            
            if (piece.color === 'white') {
                const group = state.whiteGroupedPieces.find((group) => group.piece.src === piece.src);
                if (group){
                    group.count++;
                }
                else{
                    state.whiteGroupedPieces.push({ piece: piece, count: 1 } as GroupedPieces)
                }
            } else {
                const group = state.blackGroupedPieces.find((group) => group.piece.src === piece.src);
                if (group){
                    group.count++;
                }
                else{
                    state.blackGroupedPieces.push({ piece: piece, count: 1 } as GroupedPieces)
                }
            }
        },
    }
});

export const { clearPieces, addPiece } = takenPiecesSlice.actions;
export default takenPiecesSlice.reducer;