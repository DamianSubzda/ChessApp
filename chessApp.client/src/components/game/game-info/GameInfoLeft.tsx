import React from "react";
import TakenPieces from "./game-info__left/taken-pieces/TakenPieces.tsx";
import Timer from "./game-info__left/timer/Timer.tsx";
import { GameControllerType } from "../../../hooks/useGameController.tsx";
import { AppState } from "../../../store/store.ts";
import { useSelector } from "react-redux";

interface GameInfoLeftPlayerProps {
  gameController: GameControllerType;
}

function GameInfoLeft({ gameController }: GameInfoLeftPlayerProps) {
  const takenPieces = useSelector((state: AppState) => state.takenPieces);

  const isRotated = gameController.isBoardRotated;
  const playerColor = gameController.player.current?.color;

  // Zmienna kontrolująca widok przeciwnika i gracza
  const playerName = isRotated
    ? playerColor === "white"
      ? "Enemy name"
      : "Player name"
    : playerColor === "white"
    ? "Player name"
    : "Enemy name";

  const enemyName = isRotated
    ? playerColor === "white"
      ? "Player name"
      : "Enemy name"
    : playerColor === "white"
    ? "Enemy name"
    : "Player name";

  // Zmienna kontrolująca zbite figury
  const playerTakenPieces = isRotated
    ? playerColor === "white"
      ? takenPieces.blackGroupedPieces
      : takenPieces.whiteGroupedPieces
    : playerColor === "white"
    ? takenPieces.whiteGroupedPieces
    : takenPieces.blackGroupedPieces;

  const enemyTakenPieces = isRotated
    ? playerColor === "white"
      ? takenPieces.whiteGroupedPieces
      : takenPieces.blackGroupedPieces
    : playerColor === "white"
    ? takenPieces.blackGroupedPieces
    : takenPieces.whiteGroupedPieces;

  // Timer gracza
  const playerTimer = isRotated
    ? playerColor === "white"
      ? gameController.blackTimer
      : gameController.whiteTimer
    : playerColor === "white"
    ? gameController.whiteTimer
    : gameController.blackTimer;

  // Timer przeciwnika
  const enemyTimer = isRotated
    ? playerColor === "white"
      ? gameController.whiteTimer
      : gameController.blackTimer
    : playerColor === "white"
    ? gameController.blackTimer
    : gameController.whiteTimer;

  return (
    <div className="game-page__left">
      <div className="display-name display-name--enemy">{enemyName}</div>
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
      <div className="display-name display-name--player">{playerName}</div>
    </div>
  );
}

export default GameInfoLeft;
