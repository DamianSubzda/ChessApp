import React from "react";
import GameList from "./../lobby/GameList"
import { useState, useEffect } from "react";
import { createLobbyConnection } from "./../../hubs/lobbyHubConnection"

function Lobby(){

    const [games, setGames] = useState([]);

    useEffect(() => {
        const hubConnection = createLobbyConnection();

        hubConnection.on("WaitingGames", (waitingGames) => {
            setGames(waitingGames);
        });

        hubConnection.on("GameAdded", (newGame) => {
            setGames((prevGames) => [...prevGames, newGame]);
            console.log(games);
        });

        hubConnection.on("GameRemoved", (oldGame) => {
            console.log("REMOVED GAME");
            setGames((prevGames) => prevGames.filter(game => game.gameId !== oldGame.gameId));
        });

        hubConnection.start()
            .then(() => {
                console.log("Connected to SignalR hub!");
                hubConnection.invoke("GetCurrentWaitingGames");
            })
            .catch((err) => console.error("SignalR connection failed: ", err));

        return () => {
            if (hubConnection) {
                hubConnection.stop();
            }
        };
    }, []);

    return(
        <React.Fragment>
            <GameList games={games} />
        </React.Fragment>
    );
}

export default Lobby;