namespace ChessApp.Server.Models
{
    public class GameTurn
    {
        public required Player Player { get; set; }
        public required Move Move { get; set; }
        public required GameDetails GameDetails { get; set; }
        public required bool IsCheckmate { get; set; }
        public required bool IsPat { get; set; }
        public required bool IsTieByInsufficientMaterial {  get; set; }
        public required bool IsTieBy50MovesRule { get; set; }
        public required bool IsTieByRepeatingPosition { get; set; }

    }
}
