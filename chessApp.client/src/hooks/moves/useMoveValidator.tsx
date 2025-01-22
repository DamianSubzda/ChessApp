import { useSelector } from "react-redux";
import { AppState } from "../../store/store.ts";
import { Move } from "../../types/Move.ts";
import { GameTurn } from "../../types/GameTurn.ts";
import {
  checkIfPlayerWillBeInCheck,
  checkIfPlayerWillBeInPat,
  checkIfPlayerWillBeCheckmated,
  checkIfPlayerWillHaveInsufficientMaterial,
  checkIfTieBy50MovesRule,
} from "../../utils/game-rules/gameStatus.ts";
import { checkIfPlayersMoveIsCorrect } from "../../utils/game-rules/validation.ts";

export default function useMoveValidator() {
  const squares = useSelector((state: AppState) => state.boardStore.squares);
  const turns = useSelector((state: AppState) => state.gameStore.game?.turns) ?? [] as GameTurn[];

  const isMoveCorrect = (move: Move) => {
    return checkIfPlayersMoveIsCorrect(move, squares);
  };

  const isPlayerInCheck = (move: Move) => {
    return checkIfPlayerWillBeInCheck(move, squares);
  };

  const isPlayerInPat = (move: Move) => {
    return checkIfPlayerWillBeInPat(move, squares);
  };

  const isPlayerInMat = (move: Move) => {
    return checkIfPlayerWillBeCheckmated(move, squares);
  };

  const isTieByInsufficientMaterial = (move: Move) => {
    return checkIfPlayerWillHaveInsufficientMaterial(move, squares);
  };

  const isTieBy50MovesRule = (move: Move) => {
    if (!turns || turns?.length < 99) return false;
    return checkIfTieBy50MovesRule(move, turns.slice(-99));
  };

  const isTieByRepeatingPosition = (move: Move) => {
    return false; //TODO
  };

  return {
    squares,
    isMoveCorrect,
    isPlayerInCheck,
    isPlayerInPat,
    isPlayerInMat,
    isTieByInsufficientMaterial,
    isTieBy50MovesRule,
    isTieByRepeatingPosition,
  };
}
