namespace ChessApp.Server.Models
{
    public class GameTurn
    {
        public required Player Player { get; set; }
        public required Move Move { get; set; }
        public required bool IsPromotion { get; set; }
        public required bool IsCheckmate { get; set; }
        public required bool IsPat { get; set; }
        
    }
}
