import React from "react";
import TakenPieces from "./game-info__left/taken-pieces/TakenPieces.tsx";
import Timer from "./game-info__left/timer/Timer.tsx";
import { GameControllerType } from "../../../hooks/useGameController.tsx";
import { AppState } from "../../../store/store.ts";
import { useSelector } from "react-redux";
import PlayerName from "./game-info__left/PlayerName.tsx";
import "./GameInfoLeft.scss";

interface GameInfoLeftPlayerProps {
  gameController: GameControllerType;
}

function GameInfoLeft({ gameController }: GameInfoLeftPlayerProps) {
  const takenPieces = useSelector((state: AppState) => state.takenPieces);
  const game = useSelector((state: AppState) => state.game);

  const playerColor = gameController.player.current
    ? gameController.player.current?.color
    : gameController.observer.current?.color;

  const playerName =
    playerColor === "white"
      ? game.game?.playerWhite?.playerName
      : game.game?.playerBlack?.playerName;

  const enemyName =
    playerColor === "black"
      ? game.game?.playerWhite?.playerName
      : game.game?.playerBlack?.playerName;

  const playerTakenPieces =
    playerColor === "white"
      ? takenPieces.blackGroupedPieces
      : takenPieces.whiteGroupedPieces;

  const enemyTakenPieces =
    playerColor === "white"
      ? takenPieces.whiteGroupedPieces
      : takenPieces.blackGroupedPieces;

  const playerTimer =
    playerColor === "white"
      ? gameController.whiteTimer
      : gameController.blackTimer;

  const enemyTimer =
    playerColor === "white"
      ? gameController.blackTimer
      : gameController.whiteTimer;

  return (
    <div className="game-page__left">
      <PlayerName name={enemyName} />
      <div className="taken-pieces taken-pieces--enemy">
        <TakenPieces groupedPieces={enemyTakenPieces} />
      </div>
      <Timer
        className="timer"
        time={enemyTimer.time}
        onTimeRunOut={() => {}}
        onTimeChange={enemyTimer.handleTimeChange}
        isTimerRunning={enemyTimer.isRunning}
      />
      <Timer
        className="timer"
        time={playerTimer.time}
        onTimeRunOut={gameController.handleTimeRunOut}
        onTimeChange={playerTimer.handleTimeChange}
        isTimerRunning={playerTimer.isRunning}
      />
      <div className="taken-pieces taken-pieces--player">
        <TakenPieces groupedPieces={playerTakenPieces} />
      </div>
      <PlayerName name={playerName} />
    </div>
  );
}

export default GameInfoLeft;
