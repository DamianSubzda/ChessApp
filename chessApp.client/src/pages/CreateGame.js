import { useEffect, useRef } from "react";
import { createLobbyConnection } from "../hubs/lobbyHubConnection";

function CreateGame() {
    const gameRef = useRef(null);
    const connectionRef = useRef(null);

    function initialConnection(){
        connectionRef.current = createLobbyConnection();

        connectionRef.current.start()
            .then(() => {
                console.log("Connected to SignalR hub!");
                return connectionRef.current.invoke("CreateGame", "Player 1");
            })
            .then((createdGame) => {
                gameRef.current = createdGame;
            }).catch(() => { });
    }

    function handleBeforeUnload(event){
        if (gameRef.current) {
            const payload = JSON.stringify(gameRef.current);
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon("https://localhost:7168/api/abandon-game", blob);
        }

        if (connectionRef.current) {
            connectionRef.current.stop().catch((err) => console.error("Error stopping connection:", err));
        }
    };

    useEffect(() => {
        console.log("Create");
        initialConnection();
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            console.log("RETURN ");
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (gameRef.current) {
                console.log("BEAACON");

                const payload = JSON.stringify(gameRef.current);
                const blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon("https://localhost:7168/api/abandon-game", blob);

                // connection.invoke("AbandonGame", gameRef.current.gameId).catch((err) =>
                //     console.error("Error abandoning game:", err)
                // );
            }

            connectionRef.current.stop().catch((err) =>
                console.error("Error stopping connection:", err)
            );
        };
    }, []);

    return <h1>Waiting for player to join...</h1>;
}

export default CreateGame;
