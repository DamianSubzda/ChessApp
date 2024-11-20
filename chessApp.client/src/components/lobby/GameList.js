import "./GameList.scss"
import { Link } from "react-router-dom";
import GameRecord from "./GameRecord";

function GameList(props){
    return (
        <>
            <Link to="/">Return</Link>
            <div className="lobby-panel">
                
                <h1>Current open games:</h1>
                <table>
                    {props.games.map((game) => (
                        <GameRecord key={game.gameId}/>
                    ))}
                </table>
            </div>
        </>
    );
}

export default GameList;