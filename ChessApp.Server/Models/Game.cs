namespace ChessApp.Server.Models
{
    public class Game
    {
        public required string GameId { get; set; }
        public required string Player1 { get; set; }
        public string? Player2 { get; set; }
    }
}
