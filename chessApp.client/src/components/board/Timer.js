import { useEffect } from "react";
import "./Timer.scss"

function Timer({time, onTimeRunOut, onTimeChange, isTimerRunning}){

    useEffect(()=>{
        if (!isTimerRunning) return;

        const interval = time < 10 
        ? setInterval(() => {
            const newTime = Math.max(time - 0.1, 0);
            onTimeChange(newTime);

            if (newTime === 0) {
                clearInterval(interval);
                onTimeRunOut();
            }
        }, 100)
        : setInterval(() => {
            const newTime = Math.max(time - 1, 0);
            onTimeChange(newTime);

            if (newTime === 0) {
                clearInterval(interval);
                onTimeRunOut();
            }
        }, 1000);

        return () => clearInterval(interval);

    }, [isTimerRunning, time, onTimeRunOut, onTimeChange])

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
        }
        else if (time >= 0) {
            const secounds = Math.floor(time);
            const millis = (time - secounds).toFixed(1).slice(2);
            return `0:${secounds}.${millis}`;
        }
        else{
            return `0:00:0`;
        }
    }

    return(
        <div className="timer">
            <h2>Timer: {displayTime()}</h2>
        </div>
    );
}

export default Timer;