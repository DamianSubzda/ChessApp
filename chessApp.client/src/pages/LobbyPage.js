import GameList from "./../components/lobby/GameList"
import React, { useState, useRef, useEffect } from "react";
import { createLobbyConnection } from "./../hubs/lobbyHubConnection";
import { useNavigate } from "react-router-dom";

function LobbyPage(){
    const [games, setGames] = useState([]);
    const connectionRef = useRef(null);
    const navigate = useNavigate();

    const handleGameAdded = (newGame) => {
        setGames((prevGames) => [...prevGames, newGame]);
    };

    const handleGameRemoved = (oldGame) => {
        setGames((prevGames) => prevGames.filter((game) => game.gameId !== oldGame.gameId));
    };

    const handleWaitingGames = (waitingGames) => {
        setGames(waitingGames);
    };

    const handleJoinGame = (game) => {
        const playerName = localStorage.getItem("PlayerName");
        if (playerName){
            connectionRef.current.invoke("JoinGame", game.gameId);
        }else {
            navigate("/player-name");
        }
        
    }

    const handleGameStart = (game) => {
        localStorage.setItem("Game", JSON.stringify(game));
        connectionRef.current.stop();
        navigate(`/game/${game.gameId}`);
    }

    useEffect(() => {
        const connection = createLobbyConnection();

        connection.start()
            .then(() => {
                console.log("Connected to lobby!");
                connection.invoke("GetCurrentWaitingGames");
            })
            .catch(() => { });
        
        connection.on("GameAdded", handleGameAdded);
        connection.on("GameRemoved", handleGameRemoved);
        connection.on("WaitingGames", handleWaitingGames);
        connection.on("GameStarted", handleGameStart);
        
        connectionRef.current = connection;
        
        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop()
                    .then(() => console.log("Connection stopped"))
                    .catch((err) => console.error("Error stopping connection:", err));
            }
        }
    }, [])

    return(
        <React.Fragment>
            <GameList games={games} joinGame={handleJoinGame}/>
        </React.Fragment>
    );
}

export default LobbyPage;