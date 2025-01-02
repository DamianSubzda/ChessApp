namespace ChessApp.Server.Models
{
    public class Piece
    {
        public required string PieceType {  get; set; }
        public required string Color { get; set; }
        public required string Src { get; set; }
    }
}
