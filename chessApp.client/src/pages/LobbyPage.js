import GameList from "./../components/lobby/GameList.tsx"
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LobbyService from "../services/LobbyService.ts";

function LobbyPage(){
    const [games, setGames] = useState([]);
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
          LobbyService.joinGame(game.gameId);
      }else {
          navigate("/player-name");
      }
    }

    const handleGameStart = (game) => {
        localStorage.setItem("Game", JSON.stringify(game));
        navigate(`/game/${game.gameId}`);
    }

    useEffect(() => {

        const initializeConnection = async () => {
            await LobbyService.startConnection();
            LobbyService.onGameAdded(handleGameAdded);
            LobbyService.onGameRemoved(handleGameRemoved);
            LobbyService.onWaitingGames(handleWaitingGames);
            LobbyService.onGameStarted(handleGameStart);

            await LobbyService.waitingGames();
        };
    
        initializeConnection();
        
        return () => {
          LobbyService.stopConnection();
        }
    }, [])

    return(
        <React.Fragment>
          <GameList games={games} joinGame={handleJoinGame}/>
        </React.Fragment>
    );
}

export default LobbyPage;