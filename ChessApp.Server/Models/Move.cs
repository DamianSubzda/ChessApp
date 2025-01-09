namespace ChessApp.Server.Models
{
    public class Move
    {
        public required Piece Piece { get; set; }
        public required Coordinate From { get; set; }
        public required Coordinate To { get; set; }
        public Piece? TakenPiece { get; set; }
        public required string Notation { get; set; }
    }
}
