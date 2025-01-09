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
import useGameOver from "./useGameOver.tsx";
import useMoveValidator from "./useMoveValidator.tsx";
import { useDispatch } from "react-redux";
import { Player } from "../types/Player";
import { Game } from "../types/Game.ts";
import { Coordinate } from "../types/Coordinate.ts";
import { GameTurn } from "../types/GameTurn.ts";
import { GameResult } from "../types/GameResult.ts";

export default function useGameController() {
  const timer = useTimer(0);
  const enemyTimer = useTimer(0); 
  const moveValidator = useMoveValidator();
  const gameOver = useGameOver();
  const drawRequest = useDrawRequest(gameOver.gameResult);

  const dispatch = useDispatch();

  const [userRole, setUserRole] = useState("observer"); 
  const player = useRef<Player | null>(null);
  const [isPlayerMove, setIfPlayerCanMove] = useState<boolean>(false); 
  
  const handlePlayerJoin = (playerData: Player) => {
    player.current = playerData;
    timer.handleTimeChange(playerData.timeLeft);
    enemyTimer.handleTimeChange(playerData.timeLeft);
    setUserRole("player");
  };

  const handleGameStart = (game: Game) => {
    localStorage.setItem("Game", JSON.stringify(game));
    setIfPlayerCanMove(player.current?.color === "white");
  };

  const handleGameFull = () => {
    setUserRole("observer");
  };

  const handleMakeTurn = async (square: Square, target: any) => {
    if (userRole !== "player" || !isPlayerMove) return;
    if (square.piece?.color !== player.current?.color)
      return;

    const move = {
      from: { row: square.position.row, column: square.position.column } as Coordinate,
      to: { row: target.row, column: target.column } as Coordinate,
      piece: square.piece,
    } as Move;
    if (!moveValidator.isMoveCorrect(move)) return;

    const currentSquares = [...moveValidator.squares];
    const takenPiece: Piece | null =
      currentSquares.find(
        (sq) => sq.position.column === move.to.column && sq.position.row === move.to.row
      )?.piece ?? null;
    move.takenPiece = takenPiece;

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
    move.notation = notation;

    if (player.current) {
      player.current.timeLeft = timer.timeRef.current;
    }

    const turn = {
      player: player.current, 
      move: move,
      isCheckmate: isCheckmate,
      isPat: isPat,
    } as GameTurn
    GameService.makeTurn(turn);

    drawRequest.setCanAcceptDraw(false);
    setIfPlayerCanMove(false);

  };

  const handleTurn = (turn: GameTurn) => {
    if (turn.player.connectionId === player.current?.connectionId){
      //ruch gracza
      timer.stopTimer();
      timer.handleTimeChange(turn.player.timeLeft);
      enemyTimer.startTimer();
    } else {
      //ruch przeciwnika
      dispatch(movePiece(turn.move));
    enemyTimer.stopTimer();
      enemyTimer.handleTimeChange(turn.player.timeLeft);
      setIfPlayerCanMove(true);
      timer.startTimer();
    }
    dispatch(addPiece(turn.move.takenPiece));
    dispatch(
      addMove({
        notation: turn.move.notation,
        color: turn.player.color,
      })
    );
  };

  const handleTimeRunOut = async () => {
    GameService.timeRunOut();
  };

  const onClickResignGame = async () => {
    if (gameOver.gameResult !== null) return;
    GameService.resignGame();
  };

  const onClickAcceptDrawRequest = () => {
    drawRequest.acceptDrawRequest();
  };

  const handleGameOver = (result: GameResult) => {
    gameOver.handleGameOver(result);
    drawRequest.setCanAcceptDraw(false);
    timer.stopTimer();
    enemyTimer.stopTimer();
    setIfPlayerCanMove(false);
  }

  return {
    gameEnd: gameOver,
    drawRequest,
    timer,
    enemyTimer,
    player,
    handlePlayerJoin,
    handleGameStart,
    handleGameFull,
    handleMakeTurn,
    handleTurn,
    handleGameOver,
    handleTimeRunOut,
    onClickResignGame,
    onClickAcceptDrawRequest,
  }
}
