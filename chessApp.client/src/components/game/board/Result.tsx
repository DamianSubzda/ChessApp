import { GameResult } from "../../../types/GameResult.ts";
import "./Result.scss"

import React from "react";

type ResultPropsType = {
    result: GameResult | null
}

function Result({ result }: ResultPropsType) {
    return (
        <>
            { result && (
            <div className="result-notification">
                <h1>{result.result}</h1>
                <h2>reason: {result.reason}</h2>
            </div> 
            )}
        </>
    );
}

export default Result;