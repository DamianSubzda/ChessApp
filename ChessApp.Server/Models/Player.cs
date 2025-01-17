namespace ChessApp.Server.Models
{
    public class Player
    {
        public required string PlayerName { get; set; }
        public required string ConnectionId { get; set; }
        public required string Color { get; set; }
        public required int TimeLeft { get; set; }
        public required string Role { get; set; }
    }
}
