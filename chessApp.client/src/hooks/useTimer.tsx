import { useState, useRef } from "react";

export default function useGameTimer(initialTime: number) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const timeRef = useRef(time);

  const handleTimeChange = (newTime: number) => {
    setTime(newTime);
    timeRef.current = newTime;
  };
  
  const startTimer = () => setIsRunning(true);
  const stopTimer = () => setIsRunning(false);

  return {
    time,
    timeRef,
    isRunning,
    handleTimeChange,
    startTimer,
    stopTimer,
  };
}
