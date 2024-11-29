import { useRef, useEffect } from "react";
import { createLobbyConnection } from "../hubs/lobbyHubConnection";

export function useLobbyConnection(onGameAdded, onGameRemoved, onWaitingGames) {
    const connectionRef = useRef(null);
    
    useEffect(() => {
        const connection = createLobbyConnection();

        connection.start()
            .then(() => {
                console.log("Connected to lobby!");
            })
            .catch((err) => {
                console.log("Lobby connection failed: ", err);
            });
        
        connection.on("GameAdded", onGameAdded);
        connection.on("GameRemoved", onGameRemoved);
        connection.on("WaitingGames", onWaitingGames);

        connectionRef.current = connection;
        
        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop()
                    .then(() => console.log("Connection stopped"))
                    .catch((err) => console.error("Error stopping connection:", err));
            }
        }

    }, [])

}