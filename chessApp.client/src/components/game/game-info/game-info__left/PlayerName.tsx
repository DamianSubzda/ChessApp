import React from "react";

interface PlayerNameProps {
  name: string | undefined;
}

function PlayerName({ name }: PlayerNameProps) {
  return (
    <>
      <p>{name}</p>
    </>
  );
}

export default PlayerName;
