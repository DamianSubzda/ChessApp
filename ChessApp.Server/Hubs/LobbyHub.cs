using ChessApp.Server.Models;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace ChessApp.Server.Hubs
{
    
    public class LobbyHub : Hub
    {
        private static readonly ConcurrentDictionary<string, Game> WaitingGames = new();

        public async Task<Game?> CreateGame(string playerName)
        {
            string gameId = Guid.NewGuid().ToString();

            var game = new Game
            {
                GameId = gameId,
                Player1 = playerName,
            };

            if (WaitingGames.TryAdd(gameId, game))
            {
                await Clients.Caller.SendAsync("GameCreated", game);
                await Clients.Others.SendAsync("GameAdded", game);
                return game;
            }

            return null;
        }

        public async Task GetCurrentWaitingGames()
        {
            await Clients.Caller.SendAsync("WaitingGames", WaitingGames.Values);
        }

        public async Task AbandonGame(string gameId)
        {
            if (WaitingGames.TryRemove(gameId, out var game))
            {
                await Clients.All.SendAsync("GameRemoved", game);
            }
        }

        public async Task JoinGame(string gameId, string playerName)
        {
            if (WaitingGames.TryGetValue(gameId, out var game))
            {
                WaitingGames.TryRemove(gameId, out _);
                game.Player2 = playerName;

                await Clients.Group(gameId).SendAsync("GameStarted", game);
                await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            }
        }

    }
}
