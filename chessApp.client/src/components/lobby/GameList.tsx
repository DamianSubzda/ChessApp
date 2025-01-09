import { Game } from "../../types/Game";
import "./GameList.scss"
import GameRecord from "./GameRecord.tsx";
import React from "react";

type GameListProps = {
    games: Game[];
    joinGame: (game: Game) => void
}

function GameList({games, joinGame}: GameListProps){
    return (
        <>
            <div className="lobby-panel">
                {games.length === 0 ?
                    <h1>There are no waiting games yet...</h1>
                    : 
                    <div>
                        <h1>Current open games:</h1>
                        <div className="game-list">
                            <div className="header">
                                <p>Lp.</p>
                                <p>Player Name</p>
                                <p>Creation Time</p>
                                <p>Game ID</p>
                                <p> </p>
                            </div>
                            {games.map((game: Game, index: number) => (
                                <div key={game.gameId}>
                                    <GameRecord index={index} game={game} joinGame={joinGame}/>
                                </div>
                            ))}
                        </div> 
                    </div>
                }
            </div>
        </>
    );
}

export default GameList;