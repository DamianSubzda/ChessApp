import { useState, useRef } from "react";
import GameService from "../services/GameService.ts";
import { movePiece, promoteToQueen, reverseBoard } from "../store/boardReducer.ts";
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
  const whiteTimer = useTimer(0);
  const blackTimer = useTimer(0);
  const moveValidator = useMoveValidator();
  const gameOver = useGameOver();
  const drawRequest = useDrawRequest(gameOver.gameResult);

  const dispatch = useDispatch();

  const userRole = useRef<string>("observer");
  const player = useRef<Player | null>(null);
  const [isPlayerMove, setIfPlayerCanMove] = useState<boolean>(false);
  
  const handlePlayerJoin = (playerData: Player) => {
    player.current = playerData;
    userRole.current = "player";
  };

  const handleGameStart = (game: Game) => {
    if (game.playerWhite && game.playerBlack){
      whiteTimer.handleTimeChange(game.playerWhite.timeLeft);
      blackTimer.handleTimeChange(game.playerBlack.timeLeft);
    }

    setIfPlayerCanMove(player.current?.color === "white");
    localStorage.setItem("Game", JSON.stringify(game));
  };

  const handleJoinedAsObserver = (game: Game) => {
    if (game.playerWhite && game.playerBlack){
      whiteTimer.handleTimeChange(game.playerWhite.timeLeft);
      blackTimer.handleTimeChange(game.playerBlack.timeLeft);
    }

    game.turns.forEach((turn) => {
      handleTurn(turn);
    });    

    userRole.current = "observer";
  };

  const handleMakeTurn = async (square: Square, target: any) => {
    if (userRole.current !== "player" || !isPlayerMove) return;
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

    const isPromotion = moveValidator.isPromotion(move);

    if (isPromotion) {
      dispatch(promoteToQueen(move));
    }

    const isCheck = moveValidator.isPlayerInCheck(move);
    const isCheckmate = moveValidator.isPlayerInMat(move);
    const isPat = moveValidator.isPlayerInPat(move);

    const notation = generateChessNotation(
      move,
      moveValidator.squares,
      isPromotion,
      isCheck,
      isCheckmate,
      isPat
    );
    move.notation = notation;

    if (player.current) {
      player.current.timeLeft = player.current.color === "white" ? whiteTimer.timeRef.current : blackTimer.timeRef.current;
    }
    
    const turn = {
      player: player.current, 
      move: move,
      isPromotion: isPromotion,
      isCheckmate: isCheckmate,
      isPat: isPat,
    } as GameTurn

    GameService.makeTurn(turn);

    drawRequest.setCanAcceptDraw(false);
    setIfPlayerCanMove(false);

  };

  const handleTurn = (turn: GameTurn) => {
    if (turn.player.color === "white"){
      whiteTimer.stopTimer();
      whiteTimer.handleTimeChange(turn.player.timeLeft);
      blackTimer.startTimer();
    } else {
      blackTimer.stopTimer();
      blackTimer.handleTimeChange(turn.player.timeLeft);
      whiteTimer.startTimer();
    }

    if (turn.player.connectionId !== player.current?.connectionId){
      dispatch(movePiece(turn.move));

      if (turn.isPromotion) {
        dispatch(promoteToQueen(turn.move));
      }

      setIfPlayerCanMove(true);
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
    if (gameOver.gameResult !== null || userRole.current !== "player") return;
    GameService.timeRunOut();
  };

  const onClickResignGame = async () => { 
    if (gameOver.gameResult !== null || userRole.current !== "player") return;
    GameService.resignGame();
  };

  const onClickAcceptDrawRequest = () => {
    drawRequest.acceptDrawRequest();
  };

  const handleGameOver = (result: GameResult) => {
    gameOver.handleGameOver(result);
    drawRequest.setCanAcceptDraw(false);
    whiteTimer.stopTimer();
    blackTimer.stopTimer();
    setIfPlayerCanMove(false);
  }

  return {
    gameOver,
    drawRequest,
    whiteTimer,
    blackTimer,
    player,
    userRole,
    handlePlayerJoin,
    handleGameStart,
    handleJoinedAsObserver,
    handleMakeTurn,
    handleTurn,
    handleGameOver,
    handleTimeRunOut,
    onClickResignGame,
    onClickAcceptDrawRequest,
    onClickRotateBoardForObserver,
  }
}
