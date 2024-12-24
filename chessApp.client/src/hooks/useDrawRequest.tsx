import { useRef, useState } from "react";
import GameService from "../services/GameService.ts";

export default function useDrawRequest(gameResult: string | null) {
  const [canAcceptDraw, setCanAcceptDraw] = useState(false);
  const drawRequestButtonRef = useRef<HTMLButtonElement | null>(null);
  
  const setButtonRef = (button: HTMLButtonElement | null) => {
    drawRequestButtonRef.current = button;
  };

  const sendDrawRequest = () => {
    if (gameResult !== null) return;
    if (drawRequestButtonRef.current) {
      drawRequestButtonRef.current.disabled = true;
    }
    GameService.sendDrawRequest();
  };

  const receivedDrawRequest =() => {
    setCanAcceptDraw(true);

    if (drawRequestButtonRef.current) {
      drawRequestButtonRef.current.disabled = false;
    }
  }

  const acceptDrawRequest = () => {
    GameService.acceptDraw();
    setCanAcceptDraw(false);
  };

  const declineDrawRequest = () => {
    GameService.declineDraw();
    setCanAcceptDraw(false);
  };

  return {
    canAcceptDraw,
    setButtonRef,
    setCanAcceptDraw,
    receivedDrawRequest,
    sendDrawRequest,
    acceptDrawRequest,
    declineDrawRequest,
  };
}
