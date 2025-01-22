

export type GameDetails = {
    timeLeft: number;
    canEnPassant: boolean; //true if player moved pawn two squares ahead and enemy pawn was nearby
    canCastleKingSide: boolean; //false if king or rook (on king side) moved
    canCastleQueenSide: boolean; //false if king or rook (on queen side) moved
}