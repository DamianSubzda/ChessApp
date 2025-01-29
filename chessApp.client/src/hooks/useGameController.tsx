import { useEffect, useRef, useState,  } from "react";
import { useDispatch } from "react-redux";

import GameService from "../services/GameService.ts";

//Redux actions:
import { reverseBoard } from "../store/boardReducer.ts";
import { setGame } from "../store/gameReducer.ts";

//Types:
import { Square } from "../types/Square";
import { Player } from "../types/Player";
import { Game } from "../types/Game.ts";
import { GameTurn } from "../types/GameTurn.ts";
import { GameResult } from "../types/GameResult.ts";

//Hooks:
import useTimer from "./useTimer.tsx";
import useDrawRequest from "./useDrawRequest.tsx";
import useGameOver from "./useGameOver.tsx";
import useTurnHandler from "./useTurnHandler.ts";

//Utils:
import { getTimeFromGameType } from "../utils/getTimeFromGameType.ts";


export default function useGameController() {
  const dispatch = useDispatch();
  const player = useRef<Player | null>(null);
  const observer = useRef<Player | null>(null);
  const [isPlayerMove, setIfPlayerCanMove] = useState<boolean>(false);

  const turnHandler = useTurnHandler(player);
  const gameOver = useGameOver();
  const drawRequest = useDrawRequest(gameOver.gameResult);

  const handleTimeRunOut = async () => {
    if (gameOver.hasHandledGameOver.current || player.current === null) return;
    await GameService.timeRunOut();
  };

  const whiteTimer = useTimer(0, player.current?.color === "white" ? handleTimeRunOut : () => {});
  const blackTimer = useTimer(0, player.current?.color === "black" ? handleTimeRunOut : () => {});

  const handlePlayerJoin = (playerData: Player) => {
    player.current = playerData;
  };

  const handleJoinedAsObserver = (game: Game, playerData: Player) => {
    observer.current = playerData;
    const localObserverTurns = game.turns;
    game.turns = [] as GameTurn[];
    dispatch(setGame(game));
    setTimers(game);

    localObserverTurns.forEach((turn) => {
      handleTurn(turn);
    });
  };

  const handleGameStart = (game: Game) => {
    dispatch(setGame(game));
    setTimers(game);
  };

  const setTimers = (game: Game) => {
    if (game.playerWhite && game.playerBlack){
      const time = getTimeFromGameType(game.type);
      whiteTimer.resetTimer(time);
      blackTimer.resetTimer(time);
    }
  }

  useEffect(() => {
    setIfPlayerCanMove(player.current?.color === "white");
  }, [player.current?.color]);

  const handleMakeTurn = async (square: Square, target: any) => {
    if (!isPlayerMove) return;
    if (!turnHandler.isTurnCorrect(square, target)) return;

    const timeLeft = player.current.color === "white" ? whiteTimer.timeRef.current : blackTimer.timeRef.current;
    turnHandler.handleMakeTurn(square, target, timeLeft);
    
    drawRequest.setCanAcceptDraw(false);
    setIfPlayerCanMove(false);
  };

  const handleTurn = (turn: GameTurn) => {
    if (turn.player.color === "white"){
      whiteTimer.stopTimer();
      whiteTimer.resetTimer(turn.timeLeft);
      blackTimer.startTimer();
    } else {
      blackTimer.stopTimer();
      blackTimer.resetTimer(turn.timeLeft);
      whiteTimer.startTimer();
    }

    turnHandler.handleTurn(turn);

    if (player.current !== null && player.current.color !== turn.player.color){
      setIfPlayerCanMove(true);
    }
  };

  const onClickResignGame = async () => {
    if (gameOver.hasHandledGameOver.current || player.current === null) return;
    await GameService.resignGame();
  };

  const onClickAcceptDrawRequest = () => {
    drawRequest.acceptDrawRequest();
  };

  const onClickRotateBoardForObserver = () => {
    if (observer.current) {
      observer.current = {
        ...observer.current,
        color: observer.current.color === "white" ? "black" : "white",
      };
    }
    dispatch(reverseBoard());
  }

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
    observer,
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

export type GameControllerType = ReturnType<typeof useGameController>;