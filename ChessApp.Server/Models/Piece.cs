namespace ChessApp.Server.Models
{
    public class Piece
    {
        public required int Column { get; set; }
        public required int Row { get; set; }
        public string? Color { get; set; }
        public string? Src { get; set; }
    }
}
