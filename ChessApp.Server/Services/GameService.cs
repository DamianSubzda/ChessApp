using ChessApp.Server.Exceptions;
using ChessApp.Server.Models;
using System.Collections.Concurrent;

namespace ChessApp.Server.Services
{
    public class GameService
    {
        private readonly ConcurrentDictionary<string, Game> _games = new(); //Future database.

        public bool TryAddGame(Game game)
        {
            return _games.TryAdd(game.GameId, game);
        }

        public bool TryRemoveGame(string gameId, out Game? game)
        {
            return _games.TryRemove(gameId, out game);
        }

        public Game? GetGame(string gameId)
        {
            _games.TryGetValue(gameId, out var game);
            return game;
        }
        public Game? GetStartedGame(string gameId)
        {
            _games.TryGetValue(gameId, out var game);
            if (game != null && game.Status != GameStatus.Started)
            {
                game = null;
            }
            return game;
        }

        public IEnumerable<Game> GetAllWaitingGames()
        {
            return _games.Values.Where(game => game.Status == GameStatus.Waiting);
        }

        public void SetGameStatusToWaiting(string gameId)
        {
            _games.TryGetValue(gameId, out var game);
            SetStatus(game, GameStatus.Waiting);
        }

        public void SetGameStatusToStarted(string gameId)
        {
            _games.TryGetValue(gameId, out var game);
            SetStatus(game, GameStatus.Started);
        }

        public void SetGameStatusToAbandoned(string gameId)
        {
            _games.TryGetValue(gameId, out var game);
            SetStatus(game, GameStatus.Abandoned);
        }

        public void SetGameStatusToEnded(string gameId)
        {
            _games.TryGetValue(gameId, out var game);
            SetStatus(game, GameStatus.Ended);
        }

        private void SetStatus(Game? game, GameStatus status)
        {
            if (game == null)
            {
                throw new GameNotFoundException();
            }
            game.Status = status;
        }
    }
}
