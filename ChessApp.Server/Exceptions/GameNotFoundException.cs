namespace ChessApp.Server.Exceptions
{
    public class GameNotFoundException : Exception
    {
        public GameNotFoundException() 
            : base($"The game does not exist!") { }

        public GameNotFoundException(string gameId)
            : base($"The game {gameId} does not exist!") { }
    }
}
