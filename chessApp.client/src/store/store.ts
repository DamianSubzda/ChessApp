import { configureStore } from '@reduxjs/toolkit'
import boardReducer from './boardReducer.ts'
import takenPiecesReducer from "./takenPiecesReducer.ts"
import gameReducer from "./gameReducer.ts"

const store = configureStore({
    reducer: {
        gameStore: gameReducer,
        boardStore: boardReducer,
        takenPiecesStore: takenPiecesReducer,
    },
});

export type AppState = ReturnType<typeof store.getState>;
export default store;