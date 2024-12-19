import { configureStore } from '@reduxjs/toolkit'
import boardReducer from './boardReducer.ts'
import movesHistoryReducer from "./moveHistoryReducer.ts"
import takenPiecesReducer from "./takenPiecesReducer.ts"

const store = configureStore({
    reducer: {
        board: boardReducer,
        movesHistory: movesHistoryReducer,
        takenPieces: takenPiecesReducer
    },
});

export type AppState = ReturnType<typeof store.getState>;

export default store;