import "./GamePage.scss";
import React from "react";
import config from "../config.json";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useGameValidator from "../hooks/useGameValidator.tsx";
import useGameController from "../hooks/useGameController.tsx";

import Chessboard from "../components/board/Chessboard.tsx";
import Timer from "../components/timer/Timer.tsx";
import MovesHistory from "../components/moves-history/MovesHistory.tsx";
import Result from "../components/board/Result.tsx";
import ResignIcon from "../components/icons/ResignIcon.tsx";
import DrawRequestIcon from "../components/icons/DrawRequestIcon.tsx";
import TakenPieces from "../components/taken-pieces/TakenPieces.tsx";
import DrawRequestPopup from "../components/drawRequestPopup/DrawRequestPopup .tsx";

import type { AppState } from "../store/store.ts";

import GameService from "../services/GameService.ts";

import { clearMoves } from "../store/moveHistoryReducer.ts";
import { clearPieces } from "../store/takenPiecesReducer.ts";

function GamePage() {
  const { gameId } = useParams();
  const takenPieces = useSelector((state: AppState) => state.takenPieces);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isValidGameId = useGameValidator(gameId);
  const gameController = useGameController();

  useEffect(() => {
    if (isValidGameId !== true) return;

    const handleBeforeUnload = () => {
      if (gameId) {
        const payload = JSON.stringify(gameId);
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(`${config.apiURL}abandon-game`, blob);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isValidGameId, gameId]);

  useEffect(() => {
    if (isValidGameId === false || gameId === undefined) {
      navigate("/lobby");
      return;
    } else if (isValidGameId !== true) return;

    dispatch(clearPieces());
    dispatch(clearMoves());

    const playerName = localStorage.getItem("PlayerName") ?? "";
    GameService.joinGame(gameId, playerName);

    GameService.onGameStarted(gameController.handleGameStart);
    GameService.onGameFull(gameController.handleGameFull);
    GameService.onPlayerJoined(gameController.handlePlayerJoin);
    GameService.onOpponentMoveMade(gameController.handleOpponentMove);
    GameService.onPlayerLeft(gameController.handleEnemyLeft);
    GameService.onTimeRunOut(gameController.handleEnemyTimeRunOut);
    GameService.onCheckmate(gameController.handleLostByCheckmate);
    GameService.onPat(gameController.handleDrawByPat);
    GameService.onDrawRequest(gameController.drawRequest.receivedDrawRequest);
    GameService.onAcceptDraw(gameController.handleAcceptedDraw);
    GameService.onDeclineDraw(() => {});
    GameService.onResign(gameController.handleEnemyResignGame);

    return () => {
      if (gameId) {
        const payload = JSON.stringify(gameId);
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(`${config.apiURL}abandon-game`, blob);
      }
      GameService.stopConnection();
    };
  }, [isValidGameId, gameId]);

  if (isValidGameId === null) return <p>Verifying game ID...</p>;
  if (isValidGameId === false) return <p>Invalid game ID. Redirecting...</p>;
  
  return (
    <div className="game-page">
      <Result result={gameController.gameEnd.gameResult} reason={gameController.gameEnd.endGameReason} />
      <div className="game-page__left">
        <div className="taken-pieces taken-pieces--enemy">
          <TakenPieces
            groupedPieces={
              gameController.isPlayerWhiteRef.current
                ? takenPieces.whiteGroupedPieces
                : takenPieces.blackGroupedPieces
            }
          />
        </div>
        <Timer
          className="timer"
          time={gameController.enemyTimer.time}
          onTimeRunOut={gameController.handleEnemyTimeRunOut}
          onTimeChange={gameController.enemyTimer.handleTimeChange}
          isTimerRunning={gameController.enemyTimer.isRunning}
        />
        <Timer
          className="timer"
          time={gameController.timer.time}
          onTimeRunOut={gameController.handleTimeRunOut}
          onTimeChange={gameController.timer.handleTimeChange}
          isTimerRunning={gameController.timer.isRunning}
        />
        <div className="taken-pieces taken-pieces--player">
          <TakenPieces
            groupedPieces={
              !gameController.isPlayerWhiteRef.current
                ? takenPieces.whiteGroupedPieces
                : takenPieces.blackGroupedPieces
            }
          />
        </div>
      </div>

      <Chessboard
        isPlayerWhite={gameController.isPlayerWhiteRef.current}
        makeMove={gameController.handleMakeMove}
      />
      <div className="game-page__right">
        <MovesHistory />
        <div className="game-page__right__buttons">
          {gameController.drawRequest.canAcceptDraw && (
            <DrawRequestPopup
              handleAcceptedDraw={gameController.onClickAcceptDrawRequest}
              handleDeclinedDraw={gameController.drawRequest.declineDrawRequest}
            />
          )}
          <button onClick={gameController.onClickResignGame}>
            <ResignIcon size={32} />
          </button>
          <button
            onClick={gameController.drawRequest.sendDrawRequest}
            ref={gameController.drawRequest.setButtonRef}
          >
            <DrawRequestIcon size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
