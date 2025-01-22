namespace ChessApp.Server.Models
{
    public class GameDetails
    {
        public required float TimeLeft { get; set; }
        public required bool CanEnPassant { get; set; }
        public required bool CanCastleKingSide { get; set; }
        public required bool CanCastleQueenSide { get; set; }

    }
}
