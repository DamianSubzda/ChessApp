import "./GamePage.scss"
import React from "react";
import config from "../config.json";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useCheckMove, useCheckPat, useCheckMat } from "../hooks/useCheckMove.tsx";
import { createGameConnection } from "../hubs/gameHubConnection.js";
import { HubConnection } from "@microsoft/signalr";
import Chessboard from "../components/board/Chessboard.tsx";
import Timer from "../components/board/Timer.tsx"
import MovesHistory from "../components/board/MovesHistory.tsx";

import type { Square } from "../types/Square.ts";
import type { Move } from "../types/Move.ts";

import type { AppState } from "../store/store.ts";
import { movePiece } from "../store/boardReducer.ts";
import { addMove, clearMoves } from "../store/moveHistoryReducer.ts";

import { generateChessNotation } from "../utils/movesNotation.ts";

function GamePage() {
    const { gameId } = useParams();
    const connectionRef = useRef<HubConnection | null>();
    const squares = useSelector((state: AppState) => state.board.squares);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const checkMove = useCheckMove();
    const checkPat = useCheckPat();
    const checkMat = useCheckMat();

    const [isValidGameId, setIsValidGameId] = useState<boolean | null>(null);

    const [userRole, setUserRole] = useState("observer");
    const isWhitePOVRef = useRef<boolean>(true);
    const [isPlayerMove, setIfPlayerCanMove] = useState<boolean>(false);

    const [time, setTime] = useState(600);
    const [enemyTime, setEnemyTime] = useState(600);
    const timeRef = useRef(time);

    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isEnemyTimerRunning, setIsEnemyTimerRunning] = useState(false);

    const [whichPlayerWon, setWhichPlayerWon] = useState<string | null>(null);    

    const handlePlayerJoin = (data) => {
        const isWhite = connectionRef.current?.connectionId === data.player1.connectionId ? data.player1.isWhite : data.player2.isWhite 
        isWhitePOVRef.current = isWhite;
        setIfPlayerCanMove(isWhite);
        setUserRole("player");
    }

    const handleGameFull = () => {
        setUserRole("observer");
    }

    const handleOpponentMove = (move: Move) => {
        setIsEnemyTimerRunning(false);
        setEnemyTime(move.timeLeft);
        dispatch(addMove( { notation: move.moveNotation, color: isWhitePOVRef.current ? "black" : "white" }));

        dispatch(movePiece(move));
        setIfPlayerCanMove(true);
        setIsTimerRunning(true);
    }

    const handleMakeMove = (square: Square, target: any) => {
        if (userRole !== "player" || !isPlayerMove) return;
        if (square.piece?.color !== (isWhitePOVRef.current ? "white" : "black")) return;

        const move = { 
            rowFrom: square.row,
            columnFrom: square.column,
            rowTo: target.row,
            columnTo: target.column,
            piece: square.piece,
            timeLeft: timeRef.current,
            moveNotation: "",
        } as Move;

        if (!checkMove(move)) return;
        
        dispatch(movePiece(move));

        const notation = generateChessNotation(move, squares);
        move.moveNotation = notation;

        setIsEnemyTimerRunning(true);
        setIsTimerRunning(false);
        connectionRef.current?.invoke("MakeMove", gameId, move);
        setIfPlayerCanMove(false);

        if (checkMat(move)){
            connectionRef.current?.invoke("PlayerCheckmated", gameId);
            setWhichPlayerWon(square.piece.color);
        }

        if (checkPat(move)){
            connectionRef.current?.invoke("PlayerInPat", gameId);
            setWhichPlayerWon(square.piece.color);
        }
        
        dispatch(addMove( { notation, color: isWhitePOVRef.current ? "white" : "black" }));

    }

    const handleTimeChange = (newTime: number) => {
        setTime(newTime);
        timeRef.current = newTime;
    }

    const handleEnemyTimeChange = (newTime: number) => {
        setEnemyTime(newTime);
    }

    const handleTimeRunOut = () => {
        setIsTimerRunning(false);
        setIsEnemyTimerRunning(false);
        setIfPlayerCanMove(false);
        connectionRef.current?.invoke("TimeRunOut", gameId);
        
        setWhichPlayerWon(isWhitePOVRef.current ? "black" : "white");
    }

    const handleEnemyTimeRunOut = () => {
        setWhichPlayerWon(isWhitePOVRef.current ? "white" : "black");
    }

    const handleWin = () => {
        setIsTimerRunning(false);
        setIsEnemyTimerRunning(false);
        setIfPlayerCanMove(false);
        setWhichPlayerWon(isWhitePOVRef.current ? "white" : "black");
    }

    const handleLost = () => {
        setIsTimerRunning(false);
        setIsEnemyTimerRunning(false);
        setIfPlayerCanMove(false);
        setWhichPlayerWon(isWhitePOVRef.current ? "black" : "white");
    }

    const handleTie = () => {
        setIsTimerRunning(false);
        setIsEnemyTimerRunning(false);
        setIfPlayerCanMove(false);
        setWhichPlayerWon("tie");
    }

    const handleEnemyLeft = () => {
        setIsTimerRunning(false);
        setIsEnemyTimerRunning(false);
        setIfPlayerCanMove(false);
        setWhichPlayerWon(isWhitePOVRef.current ? "white" : "black");
    }

    //Pobranie informacji o istnieniu gry.
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

    //Redirect jeśli gra nie istnieje
    useEffect(() => {
        if (isValidGameId === false) {
            navigate("/lobby");
        }
        
    }, [isValidGameId, navigate]);

    //Obsługa wyjścia z gry.
    useEffect(() => {
        if (isValidGameId !== true) return;
        const handleBeforeUnload = () => {
            if (gameId) {
                const payload = JSON.stringify(gameId);
                const blob = new Blob([payload], { type: "application/json" });
                navigator.sendBeacon(`${config.apiURL}abandon-game`, blob);
            }
        };
        
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isValidGameId, gameId]);


    useEffect(() => {
        if (isValidGameId !== true) return;

        dispatch(clearMoves());

        const connection = createGameConnection();
        connectionRef.current = connection;

        connection.on("GameFull", handleGameFull);
        connection.on("PlayerJoined", handlePlayerJoin);
        connection.on("MadeMove", handleOpponentMove);
        connection.on("PlayerLost", handleWin);
        connection.on("PlayerLeft", handleEnemyLeft);
        connection.on("Checkmate", handleLost);
        connection.on("Pat", handleTie);

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
            console.log("before error");
            if (gameId) {
                const payload = JSON.stringify(gameId);
                const blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon(`${config.apiURL}abandon-game`, blob);
            }
            connection.stop();
        };
    }, [ isValidGameId ]);

    if (isValidGameId === null) {
        return <p>Verifying game ID...</p>;
    }

    if (isValidGameId === false) {
        return <p>Invalid game ID. Redirecting...</p>;
    }

    return (
        <div className="game-page">
            { !whichPlayerWon && 
                <div className="result-notification">
                    <h1>Player: {whichPlayerWon} won!</h1>
                </div>
            }
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
                isPlayerWhite={isWhitePOVRef.current}
                makeMove={handleMakeMove}
                />
            <div className="game-page__right">
                <MovesHistory />
            </div>
        </div>
    );
}

export default GamePage;
