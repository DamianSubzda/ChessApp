using ChessApp.Server.Models;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace ChessApp.Server.Hubs
{
    
    public class LobbyHub : Hub
    {
        private static readonly ConcurrentDictionary<string, Game> WaitingGames = new ConcurrentDictionary<string, Game>();

        public async Task CreateGame(string playerName)
        {
            var game = new Game
            {
                GameId = "",
                Player1 = playerName,
            };

            if (WaitingGames.TryAdd(playerName, game))
            {
                await Clients.All.SendAsync("NewGameCreated", game);
            }
        }

        public async Task GetCurrentWaitingGames()
        {
            await Clients.Caller.SendAsync("WaitingGames", WaitingGames.Values);
        }

        public async Task JoinGame(string gameId, string playerName)
        {
            if (WaitingGames.TryGetValue(playerName, out var game))
            {
                WaitingGames.TryRemove(gameId, out _);
                game.Player2 = playerName;

                await Clients.Group(gameId).SendAsync("GameStarted", game);
                await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            }
        }

    }
}
