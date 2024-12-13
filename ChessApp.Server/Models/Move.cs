namespace ChessApp.Server.Models
{
    public class Move
    {
        public required int RowFrom { get; set; }
        public required int ColumnFrom { get; set; }
        public required int RowTo { get; set; }
        public required int ColumnTo { get; set; }
        public required string MoveNotation { get; set; }
        public required Piece Piece { get; set; }
        public required float TimeLeft { get; set; }
    }
}
