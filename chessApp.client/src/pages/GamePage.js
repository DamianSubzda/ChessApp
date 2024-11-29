import Chessboard from "./../components/board/Chessboard";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createGameConnection } from "./../hubs/gameHubConnection";
import React from "react";
import config from "./../config.json";
import Timer from "./../components/board/Timer"
import { useDispatch } from "react-redux";
import { movePiece } from "../store/boardReducer";

function GamePage() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const connectionRef = useRef();

    const [isValidGameId, setIsValidGameId] = useState(null);

    const [isPlayerPlaying, setPlayerPlaying] = useState(false);
    const [isPlayerWhite, setPlayerColor] = useState(true);
    const [isPlayersMove, setIfPlayerCanMove] = useState(false);

    const handlePlayerJoin = (data) => {
        const isWhite = connectionRef.current.connectionId === data.player1.connectionId ? data.player1.isWhite : data.player2.isWhite 
        setPlayerColor(isWhite);
        setIfPlayerCanMove(isWhite);
        setPlayerPlaying(true);
    }

    const handleGameFull = () => {
        setPlayerPlaying(false);
    }

    const handleOpponentMove = (move) => {
        dispatch(movePiece({
            pieceData: { 
                column: move.piece.column,
                row: move.piece.row,
                pieceColor: move.piece.color,
                pieceSrc: move.piece.src
            },
            targetPosition: { row: move.row, column: move.column }
        }));
    
        setIfPlayerCanMove(true);
    }

    const handleMakeMove = (move) => {
        move.timeLeft = 0;
        //Ustawienie czasu
        connectionRef.current.invoke("MakeMove", gameId, move);
        setIfPlayerCanMove(false);
    }

    useEffect(() => {
        fetch(`${config.apiURL}join-game`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gameId),
        })
        .then((response) => {
            setIsValidGameId(response.ok);
        })
        .catch(() => setIsValidGameId(false));
    }, [gameId]);

    useEffect(() => {
        if (isValidGameId === false) {
            navigate("/lobby");
        }
    }, [isValidGameId, navigate]);

    useEffect(() => {
        if (isValidGameId !== true) return;

        const connection = createGameConnection();
        connectionRef.current = connection;

        connection.on("GameFull", handleGameFull);
        connection.on("PlayerJoined", handlePlayerJoin);
        connection.on("MadeMove", handleOpponentMove);

        connection.start()
        .then(() => {
            console.log("Connected to game!: ", gameId);
            const playerName = localStorage.getItem("PlayerName");
            connection.invoke("JoinGameRoom", gameId, playerName);
        })
        .catch(() => {
            navigate("/lobby");
        });

        return () => {
            connection.stop();
        };
    }, [isValidGameId, gameId, navigate]);

    if (isValidGameId === null) {
        return <p>Verifying game ID...</p>;
    }

    if (isValidGameId === false) {
        return <p>Invalid game ID. Redirecting...</p>;
    }

    return (
        <>
            <Timer initialTime={600} onStop={() => console.log("Test")}/>
            <Chessboard 
                isPlayerWhite={isPlayerWhite}
                isPlayerPlaying={isPlayerPlaying}
                isPlayersMove={isPlayersMove}
                makeMove={handleMakeMove}
                />
            <Timer initialTime={600} onStop={() => console.log("Test")}/>
        </>
    );
}

export default GamePage;
