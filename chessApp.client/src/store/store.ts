import { configureStore } from '@reduxjs/toolkit'
import boardReducer from './boardReducer.ts'
import movesHistoryReducer from "./moveHistoryReducer.ts"

const store = configureStore({
    reducer: {
        board: boardReducer,
        movesHistory: movesHistoryReducer,
    },
});

export type AppState = ReturnType<typeof store.getState>;

export default store;