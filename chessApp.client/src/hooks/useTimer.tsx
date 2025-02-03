import { useState, useRef, useEffect } from "react";

export default function useGameTimer(initialTime: number, onTimeRunOut: () => void) {
  const [time, setTime] = useState(initialTime);
  const timeRef = useRef<number>(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const startTimer = () => setIsRunning(true);
  const stopTimer = () => setIsRunning(false);

  const resetTimer = (newTime: number = initialTime) => {
    setIsRunning(false);
    setTime(newTime);
    timeRef.current = newTime;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!isRunning) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const tick = () => {
      const decrement = timeRef.current < 10 ? 0.1 : 1;
      timeRef.current = Math.max(timeRef.current - decrement, 0);
      setTime(timeRef.current);

      if (timeRef.current === 0) {
        setIsRunning(false);
        onTimeRunOut();
      } else {
        const delay = timeRef.current < 10 ? 100 : 1000;
        timeoutRef.current = window.setTimeout(tick, delay);
      }
    };

    const initialDelay = timeRef.current < 10 ? 100 : 1000;
    timeoutRef.current = window.setTimeout(tick, initialDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isRunning, onTimeRunOut]);

  return {
    time,
    timeRef,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
  };
}
