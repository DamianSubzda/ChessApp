import "./GameList.scss"
import { Link } from "react-router-dom";
import GameRecord from "./GameRecord";

function GameList(){
    return (
        <>
            <Link to="/">Return</Link>
            <div className="lobby-panel">
                
                <h1>Current open games:</h1>
                <table>
                    <GameRecord/>
                    <GameRecord/>
                    <GameRecord/>
                    <GameRecord/>
                </table>
            </div>
        </>
    );
}

export default GameList;