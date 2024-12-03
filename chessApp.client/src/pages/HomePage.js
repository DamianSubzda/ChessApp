import { useNavigate } from "react-router-dom";
import "./HomePage.scss"

function HomePage(){
    const navigate = useNavigate();

    const handleRedirect = (path) => {
        const playerName = localStorage.getItem("PlayerName");

        if (playerName) {
            navigate(path);
        } else {
            navigate("/player-name", { state: { redirectPath: path } });
        }
    }

    return(
        <div className="home-page">
            <div className="panel">
                <button id="button" onClick={() => handleRedirect("/new-game")}>New Game</button>
                <button id="button" onClick={() => handleRedirect("/lobby")}>Lobby</button>
            </div>
        </div>
    );
}

export default HomePage;