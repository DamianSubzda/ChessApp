import React from "react";
import "./PlayerName.scss"

interface PlayerNameProps {
  name: string | undefined;
}

function PlayerName({ name }: PlayerNameProps) {
  return <p className="player-name">{name}</p>;
}

export default PlayerName;
