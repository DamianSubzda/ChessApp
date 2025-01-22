import { useEffect, useRef, useState,  } from "react";
import GameService from "../services/GameService.ts";
import { castle, enPassant, movePiece, promoteToQueen, reverseBoard } from "../store/boardReducer.ts";
import { addTurn, setGame } from "../store/gameReducer.ts";
import { addPiece } from "../store/takenPiecesReducer.ts";
import { Move } from "../types/Move";
import { Piece } from "../types/Piece";
import { Square } from "../types/Square";
import { generateChessNotation } from "../utils/movesNotation.ts";
import useTimer from "./useTimer.tsx";
import useDrawRequest from "./useDrawRequest.tsx";
import useGameOver from "./useGameOver.tsx";
import useMoveValidator from "./moves/useMoveValidator.tsx";
import { useDispatch } from "react-redux";
import { Player } from "../types/Player";
import { Game } from "../types/Game.ts";
import { Coordinate } from "../types/Coordinate.ts";
import { GameTurn } from "../types/GameTurn.ts";
import { GameResult } from "../types/GameResult.ts";
import { getTimeFromGameType } from "../utils/getTimeFromGameType.ts";
import { GameDetails } from "../types/GameDetails.ts";
import useSpecialMoves from "./moves/useSpecialMoves.tsx";

export default function useGameController() {
  const dispatch = useDispatch();
  const player = useRef<Player | null>(null);
  const observer = useRef<Player | null>(null);

  const moveValidator = useMoveValidator();
  const specialMoves = useSpecialMoves();
  const gameOver = useGameOver();
  const drawRequest = useDrawRequest(gameOver.gameResult);

  const [isPlayerMove, setIfPlayerCanMove] = useState<boolean>(false);

  const handleTimeRunOut = async () => {
    if (gameOver.hasHandledGameOver.current || player.current === null) return;
    GameService.timeRunOut();
  };

  const whiteTimer = useTimer(0, player.current?.color === "white" ? handleTimeRunOut : () => {});
  const blackTimer = useTimer(0, player.current?.color === "black" ? handleTimeRunOut : () => {});

  const handlePlayerJoin = (playerData: Player) => {
    player.current = playerData;
  };

  const handleJoinedAsObserver = (game: Game, playerData: Player) => {
    observer.current = playerData;
    dispatch(setGame(game));
    setTimers(game);

    game.turns.forEach((turn) => {
      handleTurn(turn);
    });
  };

  const handleGameStart = (game: Game) => {
    dispatch(setGame(game));
    setTimers(game);
  };

  const setTimers = (game: Game) => {
    if (game.playerWhite && game.playerBlack){
      const time = getTimeFromGameType(game.type);
      whiteTimer.resetTimer(time);
      blackTimer.resetTimer(time);
    }
  }

  useEffect(() => {
    setIfPlayerCanMove(player.current?.color === "white");
  }, [player.current?.color]);

  const handleMakeTurn = async (square: Square, target: any) => {
    if (player.current === null || !isPlayerMove) return;
    if (square.piece?.color !== player.current?.color) return;

    const from = { row: square.position.row, column: square.position.column } as Coordinate;
    const to = { row: target.row, column: target.column } as Coordinate;

    const currentSquares = [...moveValidator.squares];
    const takenPiece: Piece | null =
      currentSquares.find(
        (sq) => sq.position.column === to.column && sq.position.row === to.row
      )?.piece ?? null;
    
    const move = {
      from: from,
      to: to,
      piece: square.piece,
      takenPiece: takenPiece,
      isPromotion: specialMoves.isPromotion(from, to, square.piece),
      isCastle: specialMoves.isCastle(from, to, square.piece),
      isEnPassant: specialMoves.isEnPassant(from, to, square.piece),
      notation: "",
    } as Move;

    if (!moveValidator.isMoveCorrect(move)) return;

    dispatch(movePiece(move));

    if (move.isPromotion) {
      dispatch(promoteToQueen(move));
    }

    if(move.isEnPassant) {
      dispatch(enPassant(move))
    }

    if(move.isCastle) {
      dispatch(castle(move));
    }

    const isCheck = moveValidator.isPlayerInCheck(move);
    const isCheckmate = moveValidator.isPlayerInMat(move);
    const isPat = moveValidator.isPlayerInPat(move);
    const isTieByInsufficientMaterial = moveValidator.isTieByInsufficientMaterial(move);
    const isTieBy50MovesRule = moveValidator.isTieBy50MovesRule(move);
    const isTieByRepeatingPosition = moveValidator.isTieByRepeatingPosition(move);
    const isTie = isPat || isTieByInsufficientMaterial || isTieBy50MovesRule || isTieByRepeatingPosition;

    const notation = generateChessNotation(
      move,
      moveValidator.squares,
      isCheck,
      isCheckmate,
      isTie
    );
    move.notation = notation;
    
    const timeLeft = player.current.color === "white" ? whiteTimer.timeRef.current : blackTimer.timeRef.current;

    const gameDetails = { //TODO
      timeLeft: timeLeft,
      canEnPassant: false,
      canCastleKingSide: false,
      canCastleQueenSide: false,
    } as GameDetails;

    const turn = {
      player: player.current,
      move: move,
      gameDetails: gameDetails,
      isCheckmate: isCheckmate,
      isPat: isPat,
      isTieByInsufficientMaterial: isTieByInsufficientMaterial,
      isTieBy50MovesRule: isTieBy50MovesRule,
      isTieByRepeatingPosition: isTieByRepeatingPosition
      } as GameTurn

    GameService.makeTurn(turn);

    drawRequest.setCanAcceptDraw(false);
    setIfPlayerCanMove(false);
  };

  const handleTurn = (turn: GameTurn) => {
    if (turn.player.color === "white"){
      whiteTimer.stopTimer();
      whiteTimer.resetTimer(turn.gameDetails.timeLeft);
      blackTimer.startTimer();
    } else {
      blackTimer.stopTimer();
      blackTimer.resetTimer(turn.gameDetails.timeLeft);
      whiteTimer.startTimer();
    }
    if (turn.player.connectionId !== player.current?.connectionId){
      dispatch(movePiece(turn.move));

      if (turn.move.isPromotion) {
        dispatch(promoteToQueen(turn.move));
      }

      if(turn.move.isEnPassant) {
        dispatch(enPassant(turn.move))
      }
  
      if(turn.move.isCastle) {
        dispatch(castle(turn.move));
      }

      setIfPlayerCanMove(true);
    }

    dispatch(addPiece(turn.move.takenPiece));
    dispatch(addTurn(turn));
  };

  const onClickResignGame = async () => {
    if (gameOver.hasHandledGameOver.current || player.current === null) return;
    GameService.resignGame();
  };

  const onClickAcceptDrawRequest = () => {
    drawRequest.acceptDrawRequest();
  };

  const onClickRotateBoardForObserver = async () => {
    if (observer.current) {
      const updatedObserver = {
        ...observer.current,
        color: observer.current.color === "white" ? "black" : "white",
      } as Player;
      observer.current = updatedObserver;
    }
    dispatch(reverseBoard());
  }

  const handleGameOver = (result: GameResult) => {
    gameOver.handleGameOver(result);
    drawRequest.setCanAcceptDraw(false);
    whiteTimer.stopTimer();
    blackTimer.stopTimer();
    setIfPlayerCanMove(false);
  }

  return {
    gameOver,
    drawRequest,
    whiteTimer,
    blackTimer,
    player,
    observer,
    handlePlayerJoin,
    handleGameStart,
    handleJoinedAsObserver,
    handleMakeTurn,
    handleTurn,
    handleGameOver,
    handleTimeRunOut,
    onClickResignGame,
    onClickAcceptDrawRequest,
    onClickRotateBoardForObserver,
  }
}

export type GameControllerType = ReturnType<typeof useGameController>;