import { useCallback } from "react";
import { useDispatch, useStore } from "react-redux";

import GameService from "services/GameService";

// Redux actions:
import { movePiece, promoteToQueen, enPassant, castle } from "store/boardReducer";
import { addTurn } from "store/gameReducer";
import { addPiece } from "store/takenPiecesReducer";

// Hooks:
import useMoveValidator from "./moves/useMoveValidator";
import useSpecialMoves from "./moves/useSpecialMoves";

// Types:
import { Coordinate } from "types/Coordinate";
import { FEN } from "types/FEN";
import { GameTurn } from "types/GameTurn";
import { Move } from "types/Move";
import { Piece } from "types/Piece";
import { Square } from "types/Square";
import { Player } from "types/Player";

// Utils:
import { generateChessNotation } from "utils/movesNotation";
import { FENGenerator } from "utils/FENGenerator";
import { AppState } from "store/store";


export default function useTurnHandler(player: React.MutableRefObject<Player>) {
  const dispatch = useDispatch();
  const store = useStore<AppState>();

  const moveValidator = useMoveValidator();
  const specialMoves = useSpecialMoves();

  const applyMoveLocally = useCallback((move: Move) => {
      dispatch(movePiece(move));

      if (move.isPromotion) {
        dispatch(promoteToQueen(move));
      }
      if (move.isEnPassant) {
        dispatch(enPassant(move));
      }
      if (move.isCastle) {
        dispatch(castle(move));
      }
    },
    [dispatch]
  );

  const createMove = (square: Square, target: { row: number; column: number }): Move => {
    const from: Coordinate = { row: square.position.row, column: square.position.column };
    const to: Coordinate = { row: target.row, column: target.column };
    const takenPiece: Piece | null =
      moveValidator.squares.find((sq) => sq.position.row === to.row && sq.position.column === to.column)?.piece ?? null;

    return {
      from,
      to,
      piece: square.piece,
      takenPiece,
      isPromotion: specialMoves.isPromotion(from, to, square.piece),
      isCastle: specialMoves.isCastle(from, to, square.piece),
      isEnPassant: specialMoves.isEnPassant(from, to, square.piece),
      notation: null,
    } as Move;
  };


  const createFENNotation = () : string=> {
    const fen = {
      squares: store.getState().boardStore.squares,
      nextPlayerColor: player.current.color === "white" ? "black" : "white",
      castlingRights: moveValidator.castleRights,
      enPassantSquare: moveValidator.enPassantSquare.current,
      halfMoveClock: moveValidator.halfMoveClock.current,
      fullMoveNumber: moveValidator.fullMoveNumber.current,
    } as FEN;
    return FENGenerator(fen);
  }

  const isTurnCorrect = (square: Square, target: any) : boolean => {
    if (square.piece?.color !== player.current?.color) return false;
    
    const move = createMove(square, target);

    if (!moveValidator.isMoveCorrect(move)) return false;

    return true;
  }

  const handleMakeTurn = async (square: Square, target: any, timeLeft: number) => {
    
    const move = createMove(square, target);
    applyMoveLocally(move);

    const fen = createFENNotation()
    const isCheck = moveValidator.isPlayerInCheck(move);
    const isCheckmate = moveValidator.isPlayerInMat(move);
    const isPat = moveValidator.isPlayerInPat(move);
    const isTieByInsufficientMaterial = moveValidator.isTieByInsufficientMaterial(move);
    const isTieBy50MovesRule = moveValidator.isTieBy50MovesRule();
    const isTieByRepeatingPosition = moveValidator.isTieByRepeatingPosition(fen);
    const isTie = isPat || isTieByInsufficientMaterial || isTieBy50MovesRule || isTieByRepeatingPosition;

    const notation = generateChessNotation(
      move,
      moveValidator.squares,
      isCheck,
      isCheckmate,
      isTie
    );
    move.notation = notation;
    
    const turn = {
      player: player.current,
      move: move,
      fen: fen,
      timeLeft: timeLeft,
      isCheckmate: isCheckmate,
      isPat: isPat,
      isTieByInsufficientMaterial: isTieByInsufficientMaterial,
      isTieBy50MovesRule: isTieBy50MovesRule,
      isTieByRepeatingPosition: isTieByRepeatingPosition
      } as GameTurn;

    await GameService.makeTurn(turn);
  };

  
  const handleTurn = (turn: GameTurn) => {
    if (turn.player.connectionId !== player.current?.connectionId){
      applyMoveLocally(turn.move);
      moveValidator.updateHalfMove(turn.move);
      moveValidator.updateCastleRights(turn.move);
    }

    if (turn.move.takenPiece) {
      dispatch(addPiece(turn.move.takenPiece));
    }
    
    dispatch(addTurn(turn));
  };

  return{
    isTurnCorrect,
    handleMakeTurn,
    handleTurn,
  };
}