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
        <div className="home__page">
            <div className="home__panel">
                <div className="home__panel__title">
                    <img src="/assets/pieces/neo/wp.png" alt="" />
                    <h1>Chess</h1>
                    <img src="/assets/pieces/neo/bp.png" alt="" />
                </div>
                <div className="home__panel__menu">
                    <button id="button" onClick={() => handleRedirect("/new-game")}>New Game</button>
                    <button id="button" onClick={() => handleRedirect("/lobby")}>Lobby</button>
                </div>
            </div>
        </div>
    );
}

export default HomePage;