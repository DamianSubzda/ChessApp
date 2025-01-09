namespace ChessApp.Server.Models
{
    public class Game
    {
        public string GameId { get; set; } = Guid.NewGuid().ToString();
        public required string CreatedBy { get; set; }
        public TimeOnly CreatedAt { get; set; } = TimeOnly.FromDateTime(DateTime.Now);
        public Player? PlayerWhite { get; set; }
        public Player? PlayerBlack { get; set; }
        public List<GameTurn> Turns { get; set; } = new List<GameTurn>();
        public GameStatus Status { get; set; } = GameStatus.Waiting;
        public GameType Type { get; set; } = GameType.Standard;
        public int TimeIncrementPerMove { get; set; } = 0;
        
        public Game() { }
    }

    public enum GameType
    {
        Bullet,
        Blitz,
        Rapid,
        Standard,
        Classical
    }

    public enum GameStatus{
        Waiting,
        Started,
        Abandoned,
        Ended
    }
}
