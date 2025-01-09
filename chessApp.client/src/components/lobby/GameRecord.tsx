import { Game } from "../../types/Game";
import "./GameRecord.scss"
import React from "react";

type GameRecordProps = {
    index: number;
    game: Game;
    joinGame: (game: Game) => void;
}

function GameRecord({index, game, joinGame}: GameRecordProps){
    return(
        <div className="record">
            <p>{index + 1}</p>
            <p>{game.createdBy}</p> 
            <p>{game.createdAt.slice(0, -8)}</p>
            <p>{game.gameId}</p> 
            <button onClick={() => joinGame(game)}>Join</button>
        </div>
    );
}

export default GameRecord;