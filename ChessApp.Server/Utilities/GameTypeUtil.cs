using ChessApp.Server.Models;

namespace ChessApp.Server.Utilities
{
    public static class GameTypeUtil
    {
        private const int Minute = 60;
        public static int GetGameTimeForGameType(GameType gameType)
        {
            switch (gameType)
            {
                case GameType.Bullet:
                    return Minute;
                case GameType.Blitz:
                    return Minute * 3;
                case GameType.Rapid:
                    return Minute * 10;
                case GameType.Standard:
                    return Minute * 15;
                case GameType.Classical:
                    return Minute * 60;
                default:
                    return Minute;
            }
        }
    }
}
