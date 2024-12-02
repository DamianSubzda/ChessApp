using ChessApp.Server.Exceptions;
using ChessApp.Server.Models;
using ChessApp.Server.Services;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace ChessApp.Server.Hubs
{
    public class GameHub : Hub
    {
        private static readonly SemaphoreSlim Semaphore = new(1, 1);
        private readonly GameService _gameService;

        public GameHub(GameService gameService)
        {
            _gameService = gameService;
        }

        public async Task JoinGameRoom(string gameId, string playerName)
        {
            await Semaphore.WaitAsync();
            
            try
            {
                var game = _gameService.GetGame(gameId) ?? throw new GameNotFoundException(gameId);

                if (game.Player1 == null)
                {
                    Random random = new();
                    bool isPlayerWhite = random.Next(2) == 0;

                    game.Player1 = new Player
                    {
                        ConnectionId = Context.ConnectionId,
                        PlayerName = playerName,
                        IsWhite = isPlayerWhite
                    };
                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                }
                else if (game.Player2 == null)
                {
                    game.Player2 = new Player
                    {
                        PlayerName = playerName,
                        ConnectionId = Context.ConnectionId,
                        IsWhite = !game.Player1.IsWhite,
                    };

                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                    await Clients.Group(gameId).SendAsync("PlayerJoined", game);
                }
                else if (game.Player1.ConnectionId == Context.ConnectionId || game.Player2.ConnectionId == Context.ConnectionId)
                {
                    return;
                }
                else
                {
                    await Clients.Caller.SendAsync("GameFull", gameId);
                    return;
                }
            }
            catch (GameNotFoundException ex)
            {
                //TODO: Może jakieś powiadomienie, że gra nie została znaleziona
                return;
            }
            finally
            {
                Semaphore.Release();
            }
        }

        public async Task LeaveGameRoom(string gameId) //To do edycji ale to później. Wychodzenie graczy itp.
        {
            var game = _gameService.GetGame(gameId) ?? throw new GameNotFoundException(gameId);
            game.Status = GameStatus.Abandoned;
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);
            await Clients.Group(gameId).SendAsync("PlayerLeft", Context.ConnectionId);
        }

        public async Task MakeMove(string gameId, Move move)
        {
            if (move.TimeLeft <=0)
            {
                await Clients.OthersInGroup(gameId).SendAsync("PlayerLost");
            }
            else
            {
                await Clients.OthersInGroup(gameId).SendAsync("MadeMove", move);
            }
            
        }

        public async Task TimeRunOut(string gameId)
        {
            await Clients.OthersInGroup(gameId).SendAsync("PlayerLost");
        }
    }
}
