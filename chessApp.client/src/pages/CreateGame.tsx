import { useEffect, useRef, useState } from "react";
import config from "../config.json";
import { useNavigate } from "react-router-dom";
import LobbyService from "../services/LobbyService.ts";
import { Game } from "../types/Game.ts";
import React from "react";

function CreateGame() {
  const gameRef = useRef<Game | null>(null);
  const navigate = useNavigate();
  const [gameId, setGameId] = useState("");
  const isInitialized = useRef(false);

  const handleGameCreate = (game: Game) => {
    gameRef.current = game;
    setGameId(game.gameId);
  };

  const handleGameStart = (game: Game) => {
    localStorage.setItem("Game", JSON.stringify(game));
    navigate(`/game/${gameRef.current?.gameId}`);
  };

  const sendAbandonGameBeacon = () => {
    if (gameRef.current) {
      const payload = JSON.stringify(gameRef.current);
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(`${config.apiURL}abandon-new-game`, blob);
    }
  };

  useEffect(() => {
    const playerName = localStorage.getItem("PlayerName");
    if (!playerName) {
      navigate("/player-name");
      return; 
    }
    
    const handleBeforeUnload = () => {
      sendAbandonGameBeacon();
    };

    const initializeConnection = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      await LobbyService.startConnection();
      LobbyService.onGameCreated(handleGameCreate);
      LobbyService.onGameStarted(handleGameStart);

      await LobbyService.createGame(playerName);
    };

    initializeConnection();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      sendAbandonGameBeacon();
      LobbyService.stopConnection();
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <h1>Waiting for player to join...</h1>
      <h2>GameId: {gameId}</h2>
    </div>
  );
}

export default CreateGame;
