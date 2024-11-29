namespace ChessApp.Server.Models
{
    public class Player
    {
        public required string PlayerName { get; set; }
        public required string ConnectionId { get; set; }
        public bool IsWhite { get; set; } 
    }
}
