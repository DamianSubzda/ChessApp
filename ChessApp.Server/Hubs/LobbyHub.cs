using ChessApp.Server.Exceptions;
using ChessApp.Server.Models;
using ChessApp.Server.Services;
using Microsoft.AspNetCore.SignalR;
using System;

namespace ChessApp.Server.Hubs
{
    
    public class LobbyHub : Hub
    {
        private static readonly SemaphoreSlim Semaphore = new(1, 1);

        private readonly GameService _lobbyService;

        public LobbyHub(GameService lobbyService)
        {
            _lobbyService = lobbyService;
        }

        public async Task<Game?> CreateGame(string createdBy)
        {
            string gameId = Guid.NewGuid().ToString();

            var game = new Game
            {
                GameId = gameId,
                CreatedBy = createdBy,
                CreatedTimeAt = TimeOnly.FromDateTime(DateTime.Now),
                Status = GameStatus.Waiting
            };

            if (_lobbyService.TryAddGame(gameId, game))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                await Clients.Caller.SendAsync("GameCreated", game);
                await Clients.Others.SendAsync("GameAdded", game);
                return game;
            }

            return null;
        }

        public async Task GetCurrentWaitingGames()
        {
            var games = _lobbyService.GetAllWaitingGames();
            await Clients.Caller.SendAsync("WaitingGames", games);
        }

        public async Task AbandonGame(string gameId)
        {
            var game = _lobbyService.GetGame(gameId);
            try
            {
                if (game == null) throw new GameNotFoundException(gameId);

                game.Status = GameStatus.Abandoned;
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);
            }
            catch(GameNotFoundException ex)
            {
                Console.WriteLine(ex.Message);
            }
            await Clients.All.SendAsync("GameRemoved", game);

        }

        public async Task JoinGame(string gameId)
        {
            await Semaphore.WaitAsync();

            try
            {
                var game = _lobbyService.GetGame(gameId);
                if (game != null)
                {                   
                    await Clients.All.SendAsync("GameRemoved", game);
                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                    await Clients.Group(gameId).SendAsync("GameStarted", game);
                    game.Status = GameStatus.Started;
                }

            }
            finally
            {
                Semaphore?.Release();
            }
            
        }

    }
}
