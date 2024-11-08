import { useEffect, useState } from "react";


function Timer({initialTime, onStop}){
    const [time, setTime] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(()=>{
        if (!isRunning) return;

        const interval = time < 10 
            ? setInterval(() => setTime(prevTime => Math.max(prevTime - 0.1, 0)), 100)
            : setInterval(() => setTime(prevTime => Math.max(prevTime - 1, 0)), 1000);

        return () => clearInterval(interval);

    }, [isRunning, time])

    useEffect(()=>{
        if (time <= 0) {
            setIsRunning(false);
            onStop();
        }

    }, [time, onStop])

    function displayTime(){

        if (time >= 3600){
            const hours = Math.floor(time/3600)
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = Math.floor(time % 60);
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else if (time >= 10){
            const minutes = Math.floor(time/60);
            const seconds = Math.floor(time % 60);
            return `${minutes}:${String(seconds).padStart(2, '0')}`;
        } else {
            const secounds = Math.floor(time);
            const millis = (time - secounds).toFixed(1).slice(2);
            return `0:${secounds}.${millis}`;
        }
    }

    return(
        <div>
            <h2>Timer: {displayTime()}</h2>
            <button onClick={() => setIsRunning(!isRunning)}>Stop/Start</button>
        </div>
    );
}

export default Timer;