import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./LobbyPage.scss"

import GameList from "./../components/lobby/GameList.tsx"
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
      <>
        <div className="lobby__panel">
            <div className="gamelist">
                <div className="gamelist__header">
                    <p>Lp.</p>
                    <p>Player Name</p>
                    <p>Creation Time</p>
                    <p>Game ID</p>
                    <p> </p>
                </div>
                <div className="gamelist__body">
                  {games.length === 0 ?
                    <h1>There are no waiting games yet...</h1>
                    : 
                    <></>
                  }
                  <GameList games={games} joinGame={handleJoinGame}/>
                </div>
            </div> 
          </div>
      </>
    );
}

export default LobbyPage;