import { Link } from "react-router-dom";

function MenuPage(){

    return(
        <div>
            <nav>
                <Link to="/new-game"><button>NewGame</button></Link>
                <Link to="/lobby"><button>Lobby</button></Link>
            </nav>
        </div>
    );
}

export default MenuPage;