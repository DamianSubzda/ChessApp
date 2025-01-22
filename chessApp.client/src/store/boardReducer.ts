import { Move } from "./../types/Move";
import { Square } from "./../types/Square";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeDigitsToLetter } from "../utils/board.ts";
import { Piece } from "../types/Piece";

const boardSlice = createSlice({
  name: "board",
  initialState: { squares: [] as Square[] },
  reducers: {
    clearBoard(state) {
      state.squares = [];
    },
    setupBoard(state) {
      state.squares = setupInitialBoard();
    },
    reverseBoard(state) {
      if (state.squares[0].visibleNotation) {
        state.squares = [...state.squares].reverse();
        state.squares.forEach(
          (sq) =>
            (sq.visibleNotation =
              sq.position.row === 8 || sq.position.column === 8)
        );
      } else {
        state.squares = [...state.squares].reverse();
        state.squares.forEach(
          (sq) =>
            (sq.visibleNotation =
              sq.position.row === 1 || sq.position.column === 1)
        );
      }
    },
    movePiece(state, action: PayloadAction<Move>) {
      const move = action.payload;
      state.squares = state.squares.map((square) => {
        //Dodanie figury
        if (
          square.position.row === move.to.row &&
          square.position.column === move.to.column
        ) {
          return { ...square, piece: move.piece };
        }
        //Usunięcie figury
        if (
          square.position.row === move.from.row &&
          square.position.column === move.from.column
        ) {
          return { ...square, piece: null };
        }

        return square;
      });
    },

    promoteToQueen(state, action: PayloadAction<Move>) {
      const move = action.payload;

      if (
        move.piece.pieceType === "pawn" &&
        move.piece.color === "white" &&
        move.to.row === 8
      ) {
        move.piece = {
          src: "wq.png",
          pieceType: "queen",
          color: "white",
        } as Piece;
      } else if (
        move.piece.pieceType === "pawn" &&
        move.piece.color === "black" &&
        move.to.row === 1
      ) {
        move.piece = {
          src: "bq.png",
          pieceType: "queen",
          color: "black",
        } as Piece;
      }

      state.squares = state.squares.map((square) => {
        if (
          square.position.row === move.to.row &&
          square.position.column === move.to.column
        ) {
          return { ...square, piece: move.piece };
        }
        if (
          square.position.row === move.from.row &&
          square.position.column === move.from.column
        ) {
          return { ...square, piece: null };
        }

        return square;
      });
    },
    enPassant(state, action: PayloadAction<Move>) {
      const move = action.payload;
      
      state.squares = state.squares.map((square) => {
        //Usunięcie zbitej figury
        if (
          square.position.row === move.from.row &&
          square.position.column === move.to.column
        ) {
          return { ...square, piece: null };
        }

        return square;
      });
    },
    castle(state, action: PayloadAction<Move>) {
      const move = action.payload;
      //TODO
      
    },
  },
});

export const {
  setupBoard,
  movePiece,
  promoteToQueen,
  reverseBoard,
  clearBoard,
  enPassant,
  castle,
} = boardSlice.actions;
export default boardSlice.reducer;

function setupInitialBoard(): Square[] {
  const initialPieces = new Map<string, Piece>([
    // Białe figury
    ["A1", { pieceType: "rook", color: "white", src: "wr.png" }],
    ["H1", { pieceType: "rook", color: "white", src: "wr.png" }],
    ["B1", { pieceType: "knight", color: "white", src: "wn.png" }],
    ["G1", { pieceType: "knight", color: "white", src: "wn.png" }],
    ["C1", { pieceType: "bishop", color: "white", src: "wb.png" }],
    ["F1", { pieceType: "bishop", color: "white", src: "wb.png" }],
    ["D1", { pieceType: "queen", color: "white", src: "wq.png" }],
    ["E1", { pieceType: "king", color: "white", src: "wk.png" }],
    ["A2", { pieceType: "pawn", color: "white", src: "wp.png" }],
    ["B2", { pieceType: "pawn", color: "white", src: "wp.png" }],
    ["C2", { pieceType: "pawn", color: "white", src: "wp.png" }],
    ["D2", { pieceType: "pawn", color: "white", src: "wp.png" }],
    ["E2", { pieceType: "pawn", color: "white", src: "wp.png" }],
    ["F2", { pieceType: "pawn", color: "white", src: "wp.png" }],
    ["G2", { pieceType: "pawn", color: "white", src: "wp.png" }],
    ["H2", { pieceType: "pawn", color: "white", src: "wp.png" }],

    // Czarne figury
    ["A8", { pieceType: "rook", color: "black", src: "br.png" }],
    ["H8", { pieceType: "rook", color: "black", src: "br.png" }],
    ["B8", { pieceType: "knight", color: "black", src: "bn.png" }],
    ["G8", { pieceType: "knight", color: "black", src: "bn.png" }],
    ["C8", { pieceType: "bishop", color: "black", src: "bb.png" }],
    ["F8", { pieceType: "bishop", color: "black", src: "bb.png" }],
    ["D8", { pieceType: "queen", color: "black", src: "bq.png" }],
    ["E8", { pieceType: "king", color: "black", src: "bk.png" }],
    ["A7", { pieceType: "pawn", color: "black", src: "bp.png" }],
    ["B7", { pieceType: "pawn", color: "black", src: "bp.png" }],
    ["C7", { pieceType: "pawn", color: "black", src: "bp.png" }],
    ["D7", { pieceType: "pawn", color: "black", src: "bp.png" }],
    ["E7", { pieceType: "pawn", color: "black", src: "bp.png" }],
    ["F7", { pieceType: "pawn", color: "black", src: "bp.png" }],
    ["G7", { pieceType: "pawn", color: "black", src: "bp.png" }],
    ["H7", { pieceType: "pawn", color: "black", src: "bp.png" }],
  ]);

  return Array.from({ length: 64 }, (_, index) => {
    const row = Math.abs(Math.floor(index / 8) - 8);
    const column = (index % 8) + 1;
    const notation = `${changeDigitsToLetter(column)}${row}`;
    const piece = initialPieces.get(notation) ?? null;

    return {
      position: { row: row, column: column },
      visibleNotation: row === 1 ? true : column === 1 ? true : false,
      piece: piece,
    } as Square;
  });
}
