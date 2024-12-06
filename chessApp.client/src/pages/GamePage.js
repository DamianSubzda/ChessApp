import Chessboard from "./../components/board/Chessboard";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createGameConnection } from "./../hubs/gameHubConnection";
import React from "react";
import config from "./../config.json";
import Timer from "./../components/board/Timer"
import { useDispatch } from "react-redux";
import { movePiece } from "../store/boardReducer";
import { useCheckMove, useCheckPat, useCheckMat } from "../hooks/useCheckMove";
import "./GamePage.scss"
import MovesHistory from "../components/board/MovesHistory";

function GamePage() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const connectionRef = useRef();
    const checkMove = useCheckMove();
    const checkPat = useCheckPat();
    const checkMat = useCheckMat();

    const [isValidGameId, setIsValidGameId] = useState(null);

    const [isPlayerPlaying, setPlayerPlaying] = useState(false);
    const [isPlayerWhite, setPlayerColor] = useState(true);
    const [isPlayersMove, setIfPlayerCanMove] = useState(false);

    const [time, setTime] = useState(600);
    const [enemyTime, setEnemyTime] = useState(600);

    const timeRef = useRef(time);

    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isEnemyTimerRunning, setIsEnemyTimerRunning] = useState(false);

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
        
        setIsEnemyTimerRunning(false);
        setIsTimerRunning(true);
        setEnemyTime(move.timeLeft);

        setIfPlayerCanMove(true);
    }

    const handleMakeMove = (pieceData, targetPosition) => {
        if (!isPlayerPlaying || !isPlayersMove) return;
        if (!checkMove(pieceData, targetPosition, isPlayerWhite)) return;

        dispatch(movePiece({ pieceData, targetPosition }));

        setIsEnemyTimerRunning(true);
        setIsTimerRunning(false);

        const move = { 
            timeLeft: timeRef.current,
            piece: {
                column: pieceData.column,
                row: pieceData.row,
                color: pieceData.pieceColor,
                src: pieceData.pieceSrc
            },
            row: targetPosition.row,
            column: targetPosition.column
        };
        
        connectionRef.current.invoke("MakeMove", gameId, move);
        setIfPlayerCanMove(false);

        if (checkMat(pieceData, targetPosition)){
            alert("MAT"); //Send signalR
            setPlayerPlaying(false);
        }

        if (checkPat(pieceData, targetPosition)){
            alert("PAT"); //Send signalR
            setPlayerPlaying(false);
        }
    }

    const handleTimeChange = (newTime) => {
        setTime(newTime);
        timeRef.current = newTime;
    }

    const handleEnemyTimeChange = (newTime) => {
        setEnemyTime(newTime);
    }

    const handleTimeRunOut = () => {
        //Przegrana
        console.log("You lose!");

        setIsTimerRunning(false);
        setIsEnemyTimerRunning(false);
        setPlayerPlaying(false);
        setIfPlayerCanMove(false);
        connectionRef.current.invoke("TimeRunOut", gameId);
        
        alert("You lose on time!");
    }

    const handleEnemyTimeRunOut = () => {
        //Wygrana
        console.log("You won!");
    }

    const handleWin = () => {
        console.log("You won!");

        setIsTimerRunning(false);
        setIsEnemyTimerRunning(false);
        setPlayerPlaying(false);
        setIfPlayerCanMove(false);

        alert("Congratulation! You won!");
    }

    const handleEnemyLeft = () => {
        console.log("You won! Enemy left!");

        setIsTimerRunning(false);
        setIsEnemyTimerRunning(false);
        setPlayerPlaying(false);
        setIfPlayerCanMove(false);
        alert("Congratulation! You won! Enemy left!");
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
        connection.on("PlayerLost", handleWin);
        connection.on("PlayerLeft", handleEnemyLeft);

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
        <div className="game-page">
            <div className="game-page__left">
                <div className="taken-pieces taken-pieces--enemy">
                    taken enemy pieces
                </div>
                <Timer
                    className="timer"
                    time={enemyTime} 
                    onTimeRunOut={handleEnemyTimeRunOut} 
                    onTimeChange={handleEnemyTimeChange}
                    isTimerRunning={isEnemyTimerRunning}
                    />
                <Timer 
                    className="timer"
                    time={time} 
                    onTimeRunOut={handleTimeRunOut} 
                    onTimeChange={handleTimeChange}
                    isTimerRunning={isTimerRunning}
                    />
                <div className="taken-pieces taken-pieces--player">
                    taken pieces
                </div>
            </div>
            
            <Chessboard 
                isPlayerWhite={isPlayerWhite}
                makeMove={handleMakeMove}
                />
            <div className="game-page__right">
                <MovesHistory />
            </div>
        </div>
    );
}

export default GamePage;
