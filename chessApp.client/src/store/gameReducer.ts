import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Game, GameStatus } from "../types/Game";
import { GameTurn } from "../types/GameTurn";

const gameSlice = createSlice({
  name: "game",
  initialState: { 
    game: null as Game | null,
  },
  reducers: {
    setGame(state, action: PayloadAction<Game>){
      state.game = action.payload;
    },
    clearGame(state) {
      state.game = null;
    },
    addTurn(state, action: PayloadAction<GameTurn>){
      state.game?.turns.push(action.payload);
    },
    updateStatus(state, action: PayloadAction<GameStatus>) {
      if (state.game) {
        state.game.status = action.payload;
      }
    },
  },
});

export const { 
  setGame,
  clearGame,
  addTurn,
  updateStatus
 } = gameSlice.actions;
export default gameSlice.reducer;
