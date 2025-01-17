import "./Game.scss";
import React from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import useGameValidator from "../../hooks/useGameValidator.tsx";
import useGameController from "../../hooks/useGameController.tsx";

import Chessboard from "../game/board/Chessboard.tsx";
import Result from "../game/board/Result.tsx";

import GameService from "../../services/GameService.ts";

import { clearMoves } from "../../store/moveHistoryReducer.ts";
import { clearPieces } from "../../store/takenPiecesReducer.ts";
import GameInfoLeft from "./game-info/GameInfoLeft.tsx";
import GameInfoRightPlayer from "../game/game-info/GameInfoRight.tsx";

function Game() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isValidGameId = useGameValidator(gameId);
  const gameController = useGameController();

  useEffect(() => {
    if (isValidGameId !== true) return;

    const handleBeforeUnload = () => {
      if (
        gameId &&
        !gameController.gameOver.hasHandledGameOver.current &&
        gameController.player.current?.role === "player"
      ) {
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
    GameService.onGameOver(gameController.handleGameOver);
    GameService.onDrawRequest(gameController.drawRequest.receivedDrawRequest);

    return () => {
      const cleanup = async () => {
        if (
          gameId &&
          !gameController.gameOver.hasHandledGameOver.current &&
          gameController.player.current?.role === "player"
        ) {
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
      <GameInfoLeft gameController={gameController} />
      <Chessboard
        player={gameController.player.current}
        makeMove={gameController.handleMakeTurn}
      />
      <GameInfoRightPlayer gameController={gameController} />
    </div>
  );
}

export default Game;
