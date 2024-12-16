import "./GamePage.scss";
import React from "react";
import config from "../config.json";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  useCheckMove,
  useCheckPat,
  useCheckMat,
  useCheck,
} from "../hooks/useCheckMove.tsx";
import { createGameConnection } from "../hubs/gameHubConnection.js";
import { HubConnection } from "@microsoft/signalr";
import Chessboard from "../components/board/Chessboard.tsx";
import Timer from "../components/timer/Timer.tsx";
import MovesHistory from "../components/moves-history/MovesHistory.tsx";
import Result from "../components/board/Result.tsx";

import type { Square } from "../types/Square.ts";
import type { Move } from "../types/Move.ts";

import type { AppState } from "../store/store.ts";
import { movePiece } from "../store/boardReducer.ts";
import { addMove, clearMoves } from "../store/moveHistoryReducer.ts";

import { generateChessNotation } from "../utils/movesNotation.ts";
import ResignIcon from "../components/icons/ResignIcon.tsx";
import DrawRequestIcon from "../components/icons/DrawRequestIcon.tsx";
import TakenPieces from "../components/taken-pieces/TakenPieces.tsx";
import DrawRequestPopup from "../components/drawRequestPopup/DrawRequestPopup .tsx";

function GamePage() {
  const { gameId } = useParams();
  const connectionRef = useRef<HubConnection | null>(null);
  const squares = useSelector((state: AppState) => state.board.squares);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const checkMove = useCheckMove();
  const checkPat = useCheckPat();
  const checkmate = useCheckMat();
  const check = useCheck();

  const [isValidGameId, setIsValidGameId] = useState<boolean | null>(null);

  const [userRole, setUserRole] = useState("observer");
  const isWhitePOVRef = useRef<boolean>(true);
  const [isPlayerMove, setIfPlayerCanMove] = useState<boolean>(false);

  const [time, setTime] = useState(600);
  const [enemyTime, setEnemyTime] = useState(600);
  const timeRef = useRef(time);

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isEnemyTimerRunning, setIsEnemyTimerRunning] = useState(false);

  const [gameResult, setGameResult] = useState<string | null>(null);
  const [endGameReason, setEndGameReason] = useState<string | null>(null);

  const drawRequestButtonRef = useRef<HTMLButtonElement | null>(null);
  const [canPlayerAcceptDraw, setIfPlayerCanAcceptDraw] = useState(false);

  const handlePlayerJoin = (data) => {
    const isWhite =
      connectionRef.current?.connectionId === data.player1.connectionId
        ? data.player1.isWhite
        : data.player2.isWhite;
    isWhitePOVRef.current = isWhite;
    setIfPlayerCanMove(isWhite);
    setUserRole("player");
  };

  const handleGameFull = () => {
    setUserRole("observer");
  };

  const handleOpponentMove = (move: Move) => {
    setIsEnemyTimerRunning(false);
    setEnemyTime(move.timeLeft);
    dispatch(
      addMove({
        notation: move.moveNotation,
        color: isWhitePOVRef.current ? "black" : "white",
      })
    );

    dispatch(movePiece(move));
    setIfPlayerCanMove(true);
    setIsTimerRunning(true);
  };

  const handleMakeMove = (square: Square, target: any) => {
    if (userRole !== "player" || !isPlayerMove) return;
    if (square.piece?.color !== (isWhitePOVRef.current ? "white" : "black"))
      return;

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
    const isCheck = check(move);
    const isCheckmate = checkmate(move);
    const isPat = checkPat(move);

    console.log(isCheck, isCheckmate, isPat);

    const notation = generateChessNotation(move, squares, isCheck, isCheckmate, isPat);
    move.moveNotation = notation;
    connectionRef.current?.invoke("MakeMove", gameId, move);

    dispatch(
      addMove({ notation, color: isWhitePOVRef.current ? "white" : "black" })
    );

    setIfPlayerCanAcceptDraw(false);
    setIsEnemyTimerRunning(true);
    setIsTimerRunning(false);
    setIfPlayerCanMove(false);

    if (isCheckmate) {
      connectionRef.current?.invoke("PlayerCheckmated", gameId);
      setGameResult("You won!");
      setEndGameReason("Checkmate!");
      handleGameEnd();
      return;
    }

    if (isPat) {
      connectionRef.current?.invoke("PlayerInPat", gameId);
      setGameResult("Draw!");
      setEndGameReason("Enemy has no legal moves.");
      handleGameEnd();
      return;
    }

  };

  const handleTimeChange = (newTime: number) => {
    setTime(newTime);
    timeRef.current = newTime;
  };

  const handleEnemyTimeChange = (newTime: number) => {
    setEnemyTime(newTime);
  };

  const handleTimeRunOut = () => {
    handleGameEnd();
    connectionRef.current?.invoke("TimeRunOut", gameId);

    setGameResult("You lose.");
    setEndGameReason("Run out of time.");
  };

  const handleEnemyTimeRunOut = () => {
    handleGameEnd();
    setGameResult("You won!");
    setEndGameReason("Enemy run out of time!");
  };

  const handleLostByCheckmate = () => {
    handleGameEnd();
    setGameResult("You lose.");
    setEndGameReason("Checkmate");
  };

  const handleDrawByPat = () => {
    handleGameEnd();
    setGameResult("Draw!");
    setEndGameReason(`You have no legal moves.`);
  };

  const handleEnemyLeft = () => {
    handleGameEnd();
    setGameResult("You won!");
    setEndGameReason(`Enemy player left the game!`);
  };

  const onClickResignGame = () => {
    handleGameEnd();
    setGameResult("You lose");
    setEndGameReason("Lose by resign");
    connectionRef.current?.invoke("ResignGame", gameId);
  };

  const onClickSendDrawRequest = () => {
    if (drawRequestButtonRef.current) {
      drawRequestButtonRef.current.disabled = true;
    }

    connectionRef.current?.invoke("SendDrawRequest", gameId);
  };

  const onClickAcceptDrawRequest = () => {
    handleGameEnd();
    setGameResult("Draw!");
    setEndGameReason("Players aggred to a draw!");
    connectionRef.current?.invoke("AcceptDrawRequest", gameId);
  };

  const onClickDeclineDrawRequest = () => {
    setIfPlayerCanAcceptDraw(false);
    connectionRef.current?.invoke("DeclineDrawRequest", gameId);
  };

  const handleEnemySendDrawRequest = () => {
    //Zmiana flagi pokazującej okno do potwierdzenia remisu (do następnego ruchu).
    setIfPlayerCanAcceptDraw(true);

    if (drawRequestButtonRef.current) {
      drawRequestButtonRef.current.disabled = false;
    }
  };

  const handleAcceptedDraw = () => {
    handleGameEnd();
    setGameResult("Draw!");
    setEndGameReason("Players aggred to a draw!");
  };

  const handleDeclinedDraw = () => {
    //nothing to do.
  };

  const handleEnemyResignGame = () => {
    handleGameEnd();
    setGameResult("You won!");
    setEndGameReason(`Enemy player resigned!`);
  };

  const handleGameEnd = () => {
    setIfPlayerCanAcceptDraw(false);
    setIsTimerRunning(false);
    setIsEnemyTimerRunning(false);
    setIfPlayerCanMove(false);
  };

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
  }, [isValidGameId]);

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
    connection.on("PlayerLeft", handleEnemyLeft);
    connection.on("TimeRunOut", handleEnemyTimeRunOut);
    connection.on("Checkmate", handleLostByCheckmate);
    connection.on("Pat", handleDrawByPat);
    connection.on("DrawRequest", handleEnemySendDrawRequest);
    connection.on("AcceptDraw", handleAcceptedDraw);
    connection.on("DeclineDraw", handleDeclinedDraw);
    connection.on("Resign", handleEnemyResignGame);

    connection
      .start()
      .then(() => {
        console.log("Connected to game!: ", gameId);
        const playerName = localStorage.getItem("PlayerName");
        connection.invoke("JoinGameRoom", gameId, playerName);
      })
      .catch(() => {
        navigate("/lobby");
      });

    return () => {
      if (gameId) {
        const payload = JSON.stringify(gameId);
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(`${config.apiURL}abandon-game`, blob);
      }
      connection.stop();
    };
  }, [isValidGameId]);

  if (isValidGameId === null) {
    return <p>Verifying game ID...</p>;
  }

  if (isValidGameId === false) {
    return <p>Invalid game ID. Redirecting...</p>;
  }

  return (
    <div className="game-page">
      <Result result={gameResult} reason={endGameReason} />
      <div className="game-page__left">
        <div className="taken-pieces taken-pieces--enemy">
          <TakenPieces pieces={[]} />
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
          <TakenPieces pieces={[]} />
        </div>
      </div>

      <Chessboard
        isPlayerWhite={isWhitePOVRef.current}
        makeMove={handleMakeMove}
      />
      <div className="game-page__right">
        <MovesHistory />
        <div className="game-page__right__buttons">
          {canPlayerAcceptDraw && (
            <DrawRequestPopup
              handleAcceptedDraw={onClickAcceptDrawRequest}
              handleDeclinedDraw={onClickDeclineDrawRequest}
            />
          )}
          <button onClick={onClickResignGame}>
            <ResignIcon size={32} />
          </button>
          <button onClick={onClickSendDrawRequest} ref={drawRequestButtonRef}>
            <DrawRequestIcon size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
