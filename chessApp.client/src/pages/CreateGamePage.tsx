import React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./CreateGamePage.scss"
import config from "../config.json";

import LobbyService from "../services/LobbyService.ts";
import { Game } from "../types/Game.ts";

function CreateGamePage() {
  const navigate = useNavigate();

  const isInitialized = useRef(false);
  const isGameStarted = useRef(false);
  const gameRef = useRef<Game | null>(null);
  const [gameId, setGameId] = useState("");

  const handleGameCreate = (game: Game) => {
    gameRef.current = game;
    setGameId(game.gameId);
  };

  const handleGameStart = (game: Game) => {
    isGameStarted.current = true;
    localStorage.setItem("Game", JSON.stringify(game));
    navigate(`/game/${gameRef.current?.gameId}`);
  };

  const sendAbandonGameBeacon = () => {
    if (gameRef.current && !isGameStarted.current) {
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
      sendAbandonGameBeacon(); //TU
      LobbyService.stopConnection();
    };
  }, []);

  return (
    <div className="main__container">
      <h1>Waiting for opponent to join...</h1>
      <h5>{gameId}</h5>
    </div>
  );
}

export default CreateGamePage;
