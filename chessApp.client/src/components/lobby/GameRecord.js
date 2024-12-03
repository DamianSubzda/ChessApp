import "./GameRecord.scss"

function GameRecord({index, game, joinGame}){
    return(
        <div className="record">
            <p>{index + 1}</p>
            <p>{game.createdBy}</p> 
            <p>{game.createdTimeAt.slice(0, -8)}</p>
            <p>{game.gameId}</p> 
            <button onClick={() => joinGame(game)}>Join</button>
        </div>
    );
}

export default GameRecord;