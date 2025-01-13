import React from "react";
import TakenPieces from "../game-info/game-info__left/taken-pieces/TakenPieces.tsx";
import Timer from "../game-info/game-info__left/timer/Timer.tsx";

function GameInfoLeft({ gameController, takenPieces }) {
  return (
    <div className="game-page__left">
      <div className="display-name display-name--enemy">Enenmy name</div>
      <div className="taken-pieces taken-pieces--enemy">
        <TakenPieces
          groupedPieces={
            gameController.player.current?.color === "white"
              ? takenPieces.whiteGroupedPieces
              : takenPieces.blackGroupedPieces
          }
        />
      </div>
      <Timer
        className="timer"
        time={
          gameController.player.current?.color === "white"
            ? gameController.blackTimer.time
            : gameController.whiteTimer.time
        }
        onTimeRunOut={() => {}}
        onTimeChange={
          gameController.player.current?.color === "white"
            ? gameController.blackTimer.handleTimeChange
            : gameController.whiteTimer.handleTimeChange
        }
        isTimerRunning={
          gameController.player.current?.color === "white"
            ? gameController.blackTimer.isRunning
            : gameController.whiteTimer.isRunning
        }
      />
      <Timer
        className="timer"
        time={
          gameController.player.current?.color === "white"
            ? gameController.whiteTimer.time
            : gameController.blackTimer.time
        }
        onTimeRunOut={gameController.handleTimeRunOut}
        onTimeChange={
          gameController.player.current?.color === "white"
            ? gameController.whiteTimer.handleTimeChange
            : gameController.blackTimer.handleTimeChange
        }
        isTimerRunning={
          gameController.player.current?.color === "white"
            ? gameController.whiteTimer.isRunning
            : gameController.blackTimer.isRunning
        }
      />
      <div className="taken-pieces taken-pieces--player">
        <TakenPieces
          groupedPieces={
            gameController.player.current?.color !== "white"
              ? takenPieces.whiteGroupedPieces
              : takenPieces.blackGroupedPieces
          }
        />
      </div>
      <div className="display-name display-name--player">Player name</div>
    </div>
  );
}

export default GameInfoLeft;
