namespace ChessApp.Server.Models
{
    public class Move
    {
        public required int Row { get; set; }
        public required int Column { get; set; }
        public required Piece Piece { get; set; }
        public required int TimeLeft { get; set; }
    }
}
