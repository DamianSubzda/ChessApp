import "./GamePage.scss";
import React from "react";
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
      if (gameId && gameController.gameOver.gameResult === null && gameController.userRole.current === "player") {
        GameService.leaveGame();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isValidGameId, gameId]);

    useEffect(() => {
    const playerName = localStorage.getItem("PlayerName");
    if (!playerName) {
        navigate("/player-name");
        return;
    }

    if (isValidGameId === false || gameId === undefined) {
      navigate("/lobby");
      return;
    } else if (isValidGameId !== true) return;

    dispatch(clearPieces());
    dispatch(clearMoves());
    
    GameService.joinGame(gameId, playerName);

    GameService.onGameStarted(gameController.handleGameStart);
    GameService.onObserverJoined(gameController.handleJoinedAsObserver);
    GameService.onPlayerJoined(gameController.handlePlayerJoin);
    GameService.onRecivedMove(gameController.handleTurn);
    GameService.onGameOver(gameController.handleGameOver)
    GameService.onDrawRequest(gameController.drawRequest.receivedDrawRequest);

    return () => {
      const cleanup = async () => {
        if (gameId && gameController.gameOver.gameResult === null && gameController.userRole.current === "player") {
          await GameService.leaveGame();
        }
        GameService.stopConnection();
      };
  
      cleanup();
    };
  }, [isValidGameId, gameId, dispatch, navigate]);

  if (isValidGameId === null) return <p>Verifying game ID...</p>;
  if (isValidGameId === false) return <p>Invalid game ID. Redirecting...</p>;
  
  return (
    <div className="game-page">
      <Result result={gameController.gameOver.gameResult} />
      <div className="game-page__left">
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
          time={gameController.player.current?.color === "white" ? gameController.blackTimer.time : gameController.whiteTimer.time}
          onTimeRunOut={() => {}}
          onTimeChange={gameController.player.current?.color === "white" ? gameController.blackTimer.handleTimeChange : gameController.whiteTimer.handleTimeChange}
          isTimerRunning={gameController.player.current?.color === "white" ? gameController.blackTimer.isRunning : gameController.whiteTimer.isRunning}
        />
        <Timer
          className="timer"
          time={gameController.player.current?.color === "white" ? gameController.whiteTimer.time : gameController.blackTimer.time}
          onTimeRunOut={gameController.handleTimeRunOut}
          onTimeChange={gameController.player.current?.color === "white" ? gameController.whiteTimer.handleTimeChange : gameController.blackTimer.handleTimeChange}
          isTimerRunning={gameController.player.current?.color === "white" ? gameController.whiteTimer.isRunning : gameController.blackTimer.isRunning}
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
      </div>

      <Chessboard
        isPlayerWhite={gameController.player.current?.color === "white"}
        makeMove={gameController.handleMakeTurn}
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
          {gameController.userRole.current === "player" &&
            <>
              <button onClick={gameController.onClickResignGame}>
                <ResignIcon size={32} />
              </button>
              <button
                onClick={gameController.drawRequest.sendDrawRequest}
                ref={gameController.drawRequest.setButtonRef}
              >
                <DrawRequestIcon size={32} />
              </button>
            </>
          }
          
        </div>
      </div>
    </div>
  );
}

export default GamePage;
