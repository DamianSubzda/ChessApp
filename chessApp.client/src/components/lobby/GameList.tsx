import { Game } from "../../types/Game";
import GameRecord from "./GameRecord.tsx";
import React from "react";

type GameListProps = {
  games: Game[];
  joinGame: (game: Game) => void;
};

function GameList({ games, joinGame }: GameListProps) {
  return (
    <>
      {games.map((game: Game, index: number) => (
        <div key={game.gameId}>
          <GameRecord index={index} game={game} joinGame={joinGame} />
        </div>
      ))}
    </>
  );
}

export default GameList;