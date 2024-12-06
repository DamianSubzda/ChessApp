import "./MovesHistory.css"

function MovesHistory() {
    const moves = [
        { "lp": 1, "move": "e4", "player": "white" },
        { "lp": 1, "move": "e5", "player": "black" },
        { "lp": 2, "move": "Nf3", "player": "white" },
        { "lp": 2, "move": "Nf1", "player": "black" },
        { "lp": 3, "move": "Nf6", "player": "white" }
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
        <div>
            <h3>Moves:</h3>
            <table border="1" style={{ display:"table", width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>Lp.</th>
                        <th>White</th>
                        <th>Black</th>
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
    );
}

export default MovesHistory;
