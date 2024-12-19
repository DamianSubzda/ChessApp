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
import GameService from "../services/GameService.ts";

import Chessboard from "../components/board/Chessboard.tsx";
import Timer from "../components/timer/Timer.tsx";
import MovesHistory from "../components/moves-history/MovesHistory.tsx";
import Result from "../components/board/Result.tsx";

import type { Square } from "../types/Square.ts";
import type { Move } from "../types/Move.ts";

import type { AppState } from "../store/store.ts";
import { movePiece } from "../store/boardReducer.ts";
import { addMove, clearMoves } from "../store/moveHistoryReducer.ts";
import { addPiece, clearPieces } from "../store/takenPiecesReducer.ts";

import { generateChessNotation } from "../utils/movesNotation.ts";
import ResignIcon from "../components/icons/ResignIcon.tsx";
import DrawRequestIcon from "../components/icons/DrawRequestIcon.tsx";
import TakenPieces from "../components/taken-pieces/TakenPieces.tsx";
import DrawRequestPopup from "../components/drawRequestPopup/DrawRequestPopup .tsx";
import { Player } from "../types/Player.ts";
import { Piece } from "../types/Piece.ts";

function GamePage() {
  const { gameId } = useParams();
  const squares = useSelector((state: AppState) => state.board.squares);
  const squaresRef = useRef<Square[]>([]);
  const takenPieces = useSelector((state: AppState) => state.takenPieces);
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

  const handlePlayerJoin = (playerData: Player) => {
    isWhitePOVRef.current = playerData.isWhite;
    setUserRole("player");
  };

  const handleGameStart = () => {
    setIfPlayerCanMove(isWhitePOVRef.current);
  }

  const handleGameFull = () => {
    setUserRole("observer");
  };

  const handleOpponentMove = (move: Move) => {
    setIsEnemyTimerRunning(false);
    setEnemyTime(move.timeLeft);

    const currentSquares = [...squaresRef.current];
    const piece: Piece | null = currentSquares.find(
        (sq) => sq.column === move.columnTo && sq.row === move.rowTo
    )?.piece ?? null;

    dispatch(addPiece(piece));
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

  const handleMakeMove = async (square: Square, target: any) => {
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
    
    const currentSquares = [...squares];
    const piece: Piece | null = currentSquares.find(
      (sq) => sq.column === move.columnTo && sq.row === move.rowTo
    )?.piece ?? null;
    
    dispatch(addPiece(piece));
    dispatch(movePiece(move));

    const isCheck = check(move);
    const isCheckmate = checkmate(move);
    const isPat = checkPat(move);

    const notation = generateChessNotation(
      move,
      squares,
      isCheck,
      isCheckmate,
      isPat
    );
    move.moveNotation = notation;
    
    GameService.makeMove(move);
    
    dispatch(
      addMove({ notation, color: isWhitePOVRef.current ? "white" : "black" })
    );

    setIfPlayerCanAcceptDraw(false);
    setIsEnemyTimerRunning(true);
    setIsTimerRunning(false);
    setIfPlayerCanMove(false);

    if (isCheckmate) {
      GameService.checkmate();
      setGameResult("You won!");
      setEndGameReason("Checkmate!");
      handleGameEnd();
      return;
    }

    if (isPat) {
      GameService.pat();
      
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

  const handleTimeRunOut = async () => {
    handleGameEnd();  
    setGameResult("You lose.");
    setEndGameReason("Run out of time.");
    GameService.timeRunOut();
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

  const onClickResignGame = async () => {
    if (gameResult !== null) return;
    handleGameEnd();
    setGameResult("You lose");
    setEndGameReason("Lose by resign");
    
    GameService.resignGame();
  };

  const onClickSendDrawRequest = async () => {
    if (gameResult !== null) return;
    if (drawRequestButtonRef.current) {
      drawRequestButtonRef.current.disabled = true;
    }
    GameService.sendDrawRequest();
  };

  const onClickAcceptDrawRequest = () => {
    handleGameEnd();
    setGameResult("Draw!");
    setEndGameReason("Players aggred to a draw!");
    
    GameService.acceptDraw();
  };

  const onClickDeclineDrawRequest = async () => {
    setIfPlayerCanAcceptDraw(false);
    GameService.declineDraw();
  };

  const handleEnemySendDrawRequest = () => {
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
    if (isValidGameId === false || gameId === undefined) {
      navigate("/lobby");
      return;
    } else if (isValidGameId !== true) return;

    dispatch(clearPieces())
    dispatch(clearMoves());

    const playerName = localStorage.getItem("PlayerName") ?? "";
    GameService.joinGame(gameId, playerName);

    GameService.onGameStarted(handleGameStart);
    GameService.onGameFull(handleGameFull);
    GameService.onPlayerJoined(handlePlayerJoin);
    GameService.onOpponentMoveMade(handleOpponentMove);
    GameService.onPlayerLeft(handleEnemyLeft);
    GameService.onTimeRunOut(handleEnemyTimeRunOut);
    GameService.onCheckmate(handleLostByCheckmate)
    GameService.onPat(handleDrawByPat);
    GameService.onDrawRequest(handleEnemySendDrawRequest);
    GameService.onAcceptDraw(handleAcceptedDraw);
    GameService.onDeclineDraw(handleDeclinedDraw);
    GameService.onResign(handleEnemyResignGame);

    return () => {
      if (gameId) {
        const payload = JSON.stringify(gameId);
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(`${config.apiURL}abandon-game`, blob);
      }
      GameService.stopConnection();
    };
  }, [isValidGameId, gameId]);

  useEffect(() => {
    squaresRef.current = squares;
  }, [squares]);


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
          <TakenPieces groupedPieces={isWhitePOVRef.current ? takenPieces.whiteGroupedPieces : takenPieces.blackGroupedPieces} />
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
          <TakenPieces groupedPieces={!isWhitePOVRef.current ? takenPieces.whiteGroupedPieces : takenPieces.blackGroupedPieces} />
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
