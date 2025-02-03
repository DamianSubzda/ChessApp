import { GameResult } from "../../../types/GameResult.ts";
import "./Result.scss";
import React from "react";

type ResultPropsType = {
    result: GameResult | null;
};

function Result({ result }: ResultPropsType) {

    const getResultClassName = ():string => {
        return result.result.toLowerCase();
    }

    return (
        <>
            {result && (
                <div className={`result-notification ${getResultClassName()}`}>
                    <h1>{result.result.toUpperCase() === "NEUTRAL" ? "": result.result.toUpperCase()}</h1>
                    <h2>🔥{result.reason}🔥</h2>
                </div>
            )}
        </>
    );
}

export default Result;
