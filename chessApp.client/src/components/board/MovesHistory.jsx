import "./MovesHistory.scss"

function MovesHistory() {
    const moves = [
        { "lp": 1, "move": "e4", "player": "white" },
        { "lp": 1, "move": "e5", "player": "black" },
        { "lp": 2, "move": "Nf3", "player": "white" },
        { "lp": 2, "move": "Nf1", "player": "black" },
        { "lp": 3, "move": "Nf6", "player": "black" },
        { "lp": 3, "move": "Nf6", "player": "white" },
        { "lp": 4, "move": "Nf6", "player": "black" },
        { "lp": 4, "move": "Nf6", "player": "white" },
        { "lp": 5, "move": "Nf6", "player": "black" },
        { "lp": 5, "move": "Nf6", "player": "white" },
        { "lp": 6, "move": "Nf6", "player": "black" },
        { "lp": 6, "move": "Nf6", "player": "white" },
        { "lp": 7, "move": "Nf6", "player": "black" },
        { "lp": 7, "move": "Nf6", "player": "white" },
        { "lp": 8, "move": "Nf6", "player": "black" },
        { "lp": 8, "move": "Nf6", "player": "white" },
        { "lp": 9, "move": "Nf6", "player": "black" },
        { "lp": 9, "move": "Nf6", "player": "white" },
        { "lp": 10, "move": "Nf6", "player": "black" },
        { "lp": 10, "move": "Nf6", "player": "white" },
        { "lp": 11, "move": "Nf6", "player": "black" },
        { "lp": 11, "move": "Nf6", "player": "white" },
        { "lp": 12, "move": "Nf6", "player": "black" },
        { "lp": 12, "move": "Nf6", "player": "white" },
        { "lp": 13, "move": "Nf6", "player": "black" },
        { "lp": 13, "move": "Nf6", "player": "white" },
        { "lp": 14, "move": "Nf6", "player": "black" },
        { "lp": 14, "move": "Nf6", "player": "white" },
        { "lp": 15, "move": "Nf6", "player": "black" },
        { "lp": 15, "move": "Nf6", "player": "white" },
        { "lp": 16, "move": "Nf6", "player": "black" },
        { "lp": 16, "move": "Nf6", "player": "white" },
        { "lp": 17, "move": "Nf6", "player": "black" },
        { "lp": 17, "move": "Nf6", "player": "white" },
        { "lp": 18, "move": "Nf6", "player": "black" },
        { "lp": 18, "move": "Nf6", "player": "white" },
        { "lp": 19, "move": "Nf6", "player": "black" },
        { "lp": 19, "move": "Nf6", "player": "white" },
        { "lp": 20, "move": "Nf6", "player": "black" },
    ];

    const groupedMoves = moves.reduce((acc, move) => {
        const index = move.lp - 1;
        if (!acc[index]) {
            acc[index] = { lp: move.lp, white: "", black: "" };
        }
        acc[index][move.player] = move.move;
        return acc;
    }, []);

    return (
        <>
            <h3>Moves:</h3>
            <div className="table-container">
                <table className="table__element">
                    <thead>
                        <tr>
                            <th style={{width: "10%"}}>Lp.</th>
                            <th style={{width: "45%"}}>White</th>
                            <th style={{width: "45%"}}>Black</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedMoves.map((row) => (
                            <tr key={row.lp}>
                                <td>{row.lp}</td>
                                <td>{row.white}</td>
                                <td>{row.black}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default MovesHistory;
