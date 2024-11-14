import { Link } from "react-router-dom";
import "./MenuPage.scss"

function MenuPage(){

    return(
        <div className="panel">
            <Link to="/new-game" id="button">NewGame</Link>
            <Link to="/lobby" id="button">Lobby</Link>
        </div>
    );
}

export default MenuPage;