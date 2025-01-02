import { useState, useRef } from "react";
import GameService from "../services/GameService.ts";
import { movePiece } from "../store/boardReducer.ts";
import { addMove } from "../store/moveHistoryReducer.ts";
import { addPiece } from "../store/takenPiecesReducer.ts";
import { Move } from "../types/Move";
import { Piece } from "../types/Piece";
import { Square } from "../types/Square";
import { generateChessNotation } from "../utils/movesNotation.ts";
import useTimer from "./useTimer.tsx";
import useDrawRequest from "./useDrawRequest.tsx";
import useGameEnd from "./useGameEnd.tsx";
import useMoveValidator from "./useMoveValidator.tsx";
import { useDispatch } from "react-redux";
import { Player } from "../types/Player";

export default function useGameController() {
  const timer = useTimer(600)
  const enemyTimer = useTimer(600);
  const moveValidator = useMoveValidator();
  const gameEnd = useGameEnd();
  const drawRequest = useDrawRequest(gameEnd.gameResult);

  const dispatch = useDispatch();

  const [userRole, setUserRole] = useState("observer");
  const isPlayerWhiteRef = useRef<boolean>(true);
  const [isPlayerMove, setIfPlayerCanMove] = useState<boolean>(false);
  
  const handlePlayerJoin = (playerData: Player) => {
    isPlayerWhiteRef.current = playerData.isWhite;
    setUserRole("player");
  };

  const handleGameStart = () => {
    setIfPlayerCanMove(isPlayerWhiteRef.current);
  };

  const handleGameFull = () => {
    setUserRole("observer");
  };

  const handleMakeMove = async (square: Square, target: any) => {
    if (userRole !== "player" || !isPlayerMove) return;
    if (square.piece?.color !== (isPlayerWhiteRef.current ? "white" : "black"))
      return;

    const move = {
      rowFrom: square.position.row,
      columnFrom: square.position.column,
      rowTo: target.row,
      columnTo: target.column,
      piece: square.piece,
      timeLeft: timer.timeRef.current,
      moveNotation: "",
    } as Move;

    if (!moveValidator.isMoveCorrect(move)) return;

    const currentSquares = [...moveValidator.squares];
    const piece: Piece | null =
      currentSquares.find(
        (sq) => sq.position.column === move.columnTo && sq.position.row === move.rowTo
      )?.piece ?? null;

    dispatch(addPiece(piece));
    dispatch(movePiece(move));

    const isCheck = moveValidator.isPlayerInCheck(move);
    const isCheckmate = moveValidator.isPlayerInMat(move);
    const isPat = moveValidator.isPlayerInPat(move);

    const notation = generateChessNotation(
      move,
      moveValidator.squares,
      isCheck,
      isCheckmate,
      isPat
    );
    move.moveNotation = notation;

    GameService.makeMove(move);

    dispatch(
      addMove({ notation, color: isPlayerWhiteRef.current ? "white" : "black" })
    );

    drawRequest.setCanAcceptDraw(false);
    enemyTimer.startTimer();
    timer.stopTimer();
    setIfPlayerCanMove(false);

    if (isCheckmate) {
      GameService.checkmate();
      gameEnd.handleVictory("Checkmate!");
      handleGameEnd();
      return;
    }

    if (isPat) {
      GameService.pat();
      gameEnd.handleDraw("Enemy has no legal moves.");
      handleGameEnd();
      return;
    }
  };

  const handleOpponentMove = (move: Move) => {
    enemyTimer.stopTimer();
    enemyTimer.handleTimeChange(move.timeLeft);

    const currentSquares = [...moveValidator.squaresRef.current];
    const piece: Piece | null =
      currentSquares.find(
        (sq) => sq.position.column === move.columnTo && sq.position.row === move.rowTo
      )?.piece ?? null;

    dispatch(addPiece(piece));
    dispatch(
      addMove({
        notation: move.moveNotation,
        color: isPlayerWhiteRef.current ? "black" : "white",
      })
    );

    dispatch(movePiece(move));
    setIfPlayerCanMove(true);
    timer.startTimer();
  };

  const handleTimeRunOut = async () => {
    handleGameEnd();
    gameEnd.handleDefeat("Run out of time.");
    GameService.timeRunOut();
  };

  const handleEnemyTimeRunOut = () => {
    handleGameEnd();
    gameEnd.handleVictory("Enemy run out of time!");
  };

  const handleLostByCheckmate = () => {
    handleGameEnd();
    gameEnd.handleDefeat("Checkmate");
  };

  const handleDrawByPat = () => {
    handleGameEnd();
    gameEnd.handleDraw("You have no legal moves.");
  };

  const handleEnemyLeft = () => {
    handleGameEnd();
    gameEnd.handleVictory("Enemy player left the game!");
  };

  const onClickResignGame = async () => {
    if (gameEnd.gameResult !== null) return;
    handleGameEnd();
    gameEnd.handleDefeat("Lose by resign");
    GameService.resignGame();
  };

  const onClickAcceptDrawRequest = () => {
    handleGameEnd();
    gameEnd.handleDraw("Players aggred to a draw!");
    drawRequest.acceptDrawRequest();
  };

  const handleAcceptedDraw = () => {
    handleGameEnd();
    gameEnd.handleDraw("Players aggred to a draw!");
  };

  const handleEnemyResignGame = () => {
    handleGameEnd();
    gameEnd.handleVictory("Enemy player resigned!");
  };

  const handleGameEnd = () => {
    drawRequest.setCanAcceptDraw(false);
    timer.stopTimer();
    enemyTimer.stopTimer();
    setIfPlayerCanMove(false);
  };

  return {
    gameEnd,
    drawRequest,
    timer,
    enemyTimer,
    isPlayerWhiteRef,
    handlePlayerJoin,
    handleGameStart,
    handleGameFull,
    handleMakeMove,
    handleOpponentMove,
    handleTimeRunOut,
    handleEnemyTimeRunOut,
    handleLostByCheckmate,
    handleDrawByPat,
    handleEnemyLeft,
    onClickResignGame,
    onClickAcceptDrawRequest,
    handleAcceptedDraw,
    handleEnemyResignGame
  }
}
