import { useEffect, useRef, useState } from "react";
import { createLobbyConnection } from "../hubs/lobbyHubConnection";
import config from "./../config.json"
import { useNavigate } from "react-router-dom";

function CreateGame() {
    const gameRef = useRef(null);
    const connectionRef = useRef(null);
    const navigate = useNavigate();

    const [gameId, setGameId] = useState("");

    const handleGameCreate = (game) => {
        gameRef.current = game;
        setGameId(game.gameId)
    }

    const handleGameStart = (game) => {
        localStorage.setItem("Game", JSON.stringify(game));
        navigate(`/game/${gameRef.current.gameId}`);
    }

    const handleConnectionStart = () => {
        console.log("Connected to SignalR hub!");
                const playerName = localStorage.getItem("PlayerName");
                if (playerName){
                    return connectionRef.current.invoke("CreateGame");
                } else {
                    navigate("/player-name")
                }
    }

    const handleConnectionClose = () => {
        if (gameRef.current) {
            const payload = JSON.stringify(gameRef.current);
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon(`${config.apiURL}abandon-game`, blob);
        }
    }

    const initialConnection = () => {
        const connection = createLobbyConnection();
        connectionRef.current = connection;

        connection.start().then(handleConnectionStart).catch(() => { });
        
        connection.on("GameCreated", handleGameCreate);
        connection.on("GameStarted", handleGameStart);

        connection.onclose(handleConnectionClose);
    }

    const handleBeforeUnload = (event) => {
        
        if (gameRef.current) {
            const payload = JSON.stringify(gameRef.current);
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon(`${config.apiURL}abandon-game`, blob);
        }

        if (connectionRef.current) {
            connectionRef.current.stop().catch((err) => console.error("Error stopping connection:", err));
        }
    };

    useEffect(() => {
        initialConnection();
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (gameRef.current) {

                const payload = JSON.stringify(gameRef.current);
                const blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon(`${config.apiURL}abandon-game`, blob);
            }

            connectionRef.current.stop().catch((err) =>
                console.error("Error stopping connection:", err)
            );
        };
    }, []);

    return <h1>Waiting for player to join {gameId}...</h1>;
}

export default CreateGame;
