import "./Result.scss"

import React from "react";

type ResultPropsType = {
    result: string | null,
    reason: string | null
}

function Result({ result, reason }: ResultPropsType) {
    return (
        <>
            { result && (
            <div className="result-notification">
                <h1>{result}</h1>
                <h2>reason: {reason}</h2>
            </div> 
            )}
        </>
    );
}

export default Result;