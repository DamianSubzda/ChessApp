
export type Player = {
    playerName: string;
    connectionId: string;
    color: "white" | "black";
    timeLeft: number;
    role: "player" | "observer"
}