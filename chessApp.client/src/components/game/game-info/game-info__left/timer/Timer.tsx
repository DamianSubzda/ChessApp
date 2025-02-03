import "./Timer.scss"
import React from "react";
import ClockIcon from "../../../../icons/ClockIcon.tsx";

interface TimerProps {
    time: number,
}

function Timer({ time }: TimerProps) {

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

    return (
        <div className={`timer ${time <= 10 ? "danger" : ""}`}>
            <div className="timer__content">
                <ClockIcon />
                <p>{displayTime()}</p>
            </div>
        </div>
    );
    
}

export default Timer;