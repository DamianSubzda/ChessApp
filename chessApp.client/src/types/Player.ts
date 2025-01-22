
export type  Player = {
    readonly playerName: string;
    readonly connectionId: string;
    readonly color: "white" | "black";
    readonly role: "player" | "observer";
}