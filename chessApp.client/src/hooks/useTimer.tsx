import { useState, useRef, useEffect } from "react";

export default function useGameTimer(initialTime: number, onTimeRunOut: () => void) {
  const [time, setTime] = useState(initialTime);
  const timeRef = useRef<number>(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const startTimer = () => setIsRunning(true);
  const stopTimer = () => setIsRunning(false);

  const resetTimer = (newTime: number = initialTime) => {
    setIsRunning(false);
    setTime(newTime);
    timeRef.current = newTime;
  };

  useEffect(() => {
    if (!isRunning) return;
    
    intervalRef.current = window.setInterval(() => {
      timeRef.current = Math.max(timeRef.current - (timeRef.current < 10 ? 0.1 : 1), 0);

      if (timeRef.current === 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsRunning(false);
        onTimeRunOut();
      }

      setTime(timeRef.current);
    }, timeRef.current < 10 ? 100 : 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  return {
    time,
    timeRef,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
  };
}
