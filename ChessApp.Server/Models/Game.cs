namespace ChessApp.Server.Models
{
    public class Game
    {
        public required string GameId { get; set; }
        public Player? Player1 { get; set; }
        public Player? Player2 { get; set; }
        public required GameStatus Status { get; set; }
    }

    public enum GameStatus{
        Waiting,
        Started,
        Abandoned,
        Ended
    }
}
