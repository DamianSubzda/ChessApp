import { useState, useEffect } from "react";
import config from "../config.json"

export default function useGameValidator(gameId: string | undefined) {
    const [isValidGameId, setIsValidGameId] = useState<boolean | null>(null);
  
    useEffect(() => {
      fetch(`${config.apiURL}join-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameId),
      })
        .then((response) => setIsValidGameId(response.ok))
        .catch(() => setIsValidGameId(false));
    }, [gameId]);
  
    return isValidGameId;
  }
  