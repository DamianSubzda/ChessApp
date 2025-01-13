import "./GamePage.scss";
import React from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useGameValidator from "../hooks/useGameValidator.tsx";
import useGameController from "../hooks/useGameController.tsx";

import Chessboard from "../components/game/board/Chessboard.tsx";
import Result from "../components/game/board/Result.tsx";

import type { AppState } from "../store/store.ts";

import GameService from "../services/GameService.ts";

import { clearMoves } from "../store/moveHistoryReducer.ts";
import { clearPieces } from "../store/takenPiecesReducer.ts";
import GameInfoLeft from "../components/game/game-info/GameInfoLeft.tsx";
import GameInfoRight from "../components/game/game-info/GameInfoRight.tsx";

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
      
      <GameInfoLeft gameController={gameController} takenPieces={takenPieces} />

      <Chessboard
        colorOfPOV={gameController.player.current?.color}
        makeMove={gameController.handleMakeTurn}
      />
      
      <GameInfoRight gameController={gameController} />

    </div>
  );
}

export default GamePage;
