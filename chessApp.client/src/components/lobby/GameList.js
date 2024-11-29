import "./GameList.scss"
import { Link } from "react-router-dom";
import GameRecord from "./GameRecord";

function GameList({games, joinGame}){
    return (
        <>
            <Link to="/">Return</Link>
            <div className="lobby-panel">
                
                <h1>Current open games:</h1>
                <div>
                    {games.map((game) => (
                        <div key={game.gameId}>
                            {/* <GameRecord/> */}
                            <button onClick={() => joinGame(game)}>JOIN | {game.gameId}</button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default GameList;