﻿using ChessApp.Server.Exceptions;
using ChessApp.Server.Models;
using ChessApp.Server.Services;
using Microsoft.AspNetCore.SignalR;

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
                    bool isPlayerWhite = random.Next(2) == 0; //To do sprawdzenia ponieważ często daje ten am kolor. Pseudolosowość nie działa tak jak powinna 

                    game.Player1 = new Player
                    {
                        ConnectionId = Context.ConnectionId,
                        PlayerName = playerName,
                        IsWhite = isPlayerWhite
                    };
                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                    await Clients.Caller.SendAsync("PlayerJoined", game.Player1);
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
                    await Clients.Caller.SendAsync("PlayerJoined", game.Player2);
                    await Clients.Group(gameId).SendAsync("GameStarted");
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
                await Clients.Caller.SendAsync("GameNotFound", gameId);
                return;
            }
            finally
            {
                Semaphore.Release();
            }
        }

        public async Task LeaveGameRoom(string gameId)
        {
            try
            {
                var game = _gameService.GetGame(gameId) ?? throw new GameNotFoundException(gameId);
                game.Status = GameStatus.Abandoned;
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);
                await Clients.Group(gameId).SendAsync("PlayerLeft");
            }
            catch (GameNotFoundException ex)
            {
                return;
            }
        }

        public async Task MakeMove(string gameId, Move move)
        {
            if (move.TimeLeft <= 0)
            {
                await TimeRunOut(gameId);
            }
            else
            {
                await Clients.OthersInGroup(gameId).SendAsync("MadeMove", move);
            }

        }

        public async Task TimeRunOut(string gameId)
        {
            await Clients.OthersInGroup(gameId).SendAsync("TimeRunOut");
            _gameService.SetGameStatusToEnded(gameId);
        }

        public async Task PlayerCheckmated(string gameId)
        {
            await Clients.OthersInGroup(gameId).SendAsync("Checkmate");
            _gameService.SetGameStatusToEnded(gameId);
        }

        public async Task PlayerInPat(string gameId)
        {
            await Clients.OthersInGroup(gameId).SendAsync("Pat");
            _gameService.SetGameStatusToEnded(gameId);
        }

        public async Task SendDrawRequest(string gameId)
        {
            await Clients.OthersInGroup(gameId).SendAsync("DrawRequest");
        }

        public async Task AcceptDrawRequest(string gameId)
        {
            await Clients.OthersInGroup(gameId).SendAsync("AcceptDraw");
            _gameService.SetGameStatusToEnded(gameId);
        }

        public async Task DeclineDrawRequest(string gameId)
        {
            await Clients.OthersInGroup(gameId).SendAsync("DeclineDraw");
        }

        public async Task ResignGame(string gameId)
        {
            await Clients.OthersInGroup(gameId).SendAsync("Resign");
            _gameService.SetGameStatusToEnded(gameId);
        }
    }
}
