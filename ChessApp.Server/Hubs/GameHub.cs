using ChessApp.Server.Exceptions;
using ChessApp.Server.Models;
using ChessApp.Server.Services;
using ChessApp.Server.Utilities;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Numerics;

namespace ChessApp.Server.Hubs
{
    public class GameHub : Hub
    {
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> GameSemaphores = new();
        private readonly GameService _gameService;

        public GameHub(GameService gameService)
        {
            _gameService = gameService;
        }

        public async Task JoinGameRoom(string gameId, string playerName)
        {
            var semaphore = GameSemaphores.GetOrAdd(gameId, _ => new SemaphoreSlim(1, 1));
            await semaphore.WaitAsync();

            try
            {
                var game = _gameService.GetGame(gameId) ?? throw new GameNotFoundException(gameId);

                if (game.PlayerWhite?.ConnectionId == Context.ConnectionId || game.PlayerBlack?.ConnectionId == Context.ConnectionId)
                {
                    return;
                }

                if (game.PlayerWhite == null && game.PlayerBlack == null)
                {
                    Random random = new();
                    bool isPlayerWhite = random.Next(2) == 0;

                    var player = new Player
                    {
                        ConnectionId = Context.ConnectionId,
                        PlayerName = playerName,
                        Color = isPlayerWhite ? "white" : "black",
                        TimeLeft = GameTypeUtil.GetGameTimeForGameType(game.Type)
                    };

                    if (isPlayerWhite)
                    {
                        game.PlayerWhite = player;
                    }
                    else
                    {
                        game.PlayerBlack = player;
                    }

                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                    await Clients.Caller.SendAsync("PlayerJoined", player);
                }
                else if (game.PlayerWhite == null && game.PlayerBlack != null)
                {
                    var player = new Player
                    {
                        PlayerName = playerName,
                        ConnectionId = Context.ConnectionId,
                        Color = "white",
                        TimeLeft = GameTypeUtil.GetGameTimeForGameType(game.Type)
                    };
                    game.PlayerWhite = player;

                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                    await Clients.Caller.SendAsync("PlayerJoined", player);
                    await Clients.Group(gameId).SendAsync("GameStarted", game);
                }
                else if (game.PlayerWhite != null && game.PlayerBlack == null)
                {
                    var player = new Player
                    {
                        PlayerName = playerName,
                        ConnectionId = Context.ConnectionId,
                        Color = "black",
                        TimeLeft = GameTypeUtil.GetGameTimeForGameType(game.Type)
                    };
                    game.PlayerBlack = player;

                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                    await Clients.Caller.SendAsync("PlayerJoined", player);
                    await Clients.Group(gameId).SendAsync("GameStarted", game);
                }
                else
                {
                    await Clients.Caller.SendAsync("GameFull", gameId);
                    return;
                }
            }
            catch (GameNotFoundException)
            {
                await Clients.Caller.SendAsync("GameNotFound", gameId);
                return;
            }
            finally
            {
                semaphore.Release();
            }
        }

        public async Task LeaveGameRoom(string gameId)
        {
            var resultLost = new GameResult { Result = "You lost.", Reason = "You left the game." };
            var resultWin = new GameResult { Result = "You won!", Reason = "Enemy player left the game!" };

            var resultObserver = new GameResult { Result = "", Reason = "Enemy player left the game!" };

            try
            {
                var game = _gameService.GetGame(gameId) ?? throw new GameNotFoundException(gameId);
                game.Status = GameStatus.Abandoned;

                var playerLost = game.PlayerBlack?.ConnectionId == Context.ConnectionId ? game.PlayerBlack : game.PlayerWhite;
                var playerWin = game.PlayerBlack?.ConnectionId == Context.ConnectionId ? game.PlayerWhite : game.PlayerBlack;

                var excludedClients = new List<string>();

                if (playerWin != null)
                {
                    await Clients.Client(playerWin.ConnectionId).SendAsync("GameOver", resultWin);
                    excludedClients.Add(playerWin.ConnectionId);
                    resultObserver.Result = $"Player {playerWin.PlayerName} wins!";
                }

                if (playerLost != null)
                {
                    await Clients.Client(playerLost.ConnectionId).SendAsync("GameOver", resultLost);
                    excludedClients.Add(playerLost.ConnectionId);
                }

                await Clients.GroupExcept(gameId, excludedClients).SendAsync("GameOver", resultObserver);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);
            }
            catch (GameNotFoundException)
            {
                await Clients.Caller.SendAsync("GameNotFound", gameId);
                return;
            }
        }

        public async Task PlayerMadeGameTurn(string gameId, GameTurn turn)
        {
            try
            {
                if (turn.Player.TimeLeft <= 0)
                {
                    await TimeRunOut(gameId);
                }
                else
                {
                    await Clients.Group(gameId).SendAsync("MadeTurn", turn);

                    var game = _gameService.GetGame(gameId) ?? throw new GameNotFoundException(gameId);
                    game.Turns.Add(turn);

                    if (turn.IsCheckmate)
                    {
                        var caller = turn.Player == game.PlayerWhite ? game.PlayerWhite : game.PlayerBlack;
                        var receiver = turn.Player == game.PlayerWhite ? game.PlayerBlack : game.PlayerWhite;

                        if (caller != null && receiver != null)
                        {
                            await PlayerCheckmated(gameId, caller, receiver);
                        }
                        return;
                    }

                    if (turn.IsPat)
                    {
                        var caller = turn.Player == game.PlayerWhite ? game.PlayerWhite : game.PlayerBlack;
                        var receiver = turn.Player == game.PlayerWhite ? game.PlayerBlack : game.PlayerWhite;

                        if (caller != null && receiver != null)
                        {
                            await PlayerInPat(gameId, caller, receiver);
                        }
                        return;
                    }
                }
            }
            catch (GameNotFoundException)
            {
                await Clients.Caller.SendAsync("GameNotFound", gameId);
                return;
            }

        }

        public async Task TimeRunOut(string gameId)
        {
            try
            {
                var game = _gameService.GetGame(gameId) ?? throw new GameNotFoundException(gameId);

                var caller = Context.ConnectionId == game.PlayerWhite?.ConnectionId ? game.PlayerWhite : game.PlayerBlack;
                var receiver = Context.ConnectionId == game.PlayerWhite?.ConnectionId ? game.PlayerBlack : game.PlayerWhite;

                var playerLostResult = new GameResult { Result = "You lost.", Reason = "You ran out of time." };
                var playerWonResult = new GameResult { Result = "You won!", Reason = "Enemy ran out of time!" };

                var observersResult = new GameResult { Result = $"Player {receiver?.PlayerName} won!", Reason = "Enemy ran out of time!" };

                await Clients.Client(caller.ConnectionId).SendAsync("GameOver", playerLostResult);
                await Clients.Client(receiver.ConnectionId).SendAsync("GameOver", playerWonResult);
                await Clients.GroupExcept(gameId, [caller.ConnectionId, receiver.ConnectionId]).SendAsync("GameOver", observersResult);
                _gameService.SetGameStatusToEnded(gameId);
            }
            catch (GameNotFoundException)
            {
                await Clients.Caller.SendAsync("GameNotFound", gameId);
                return;
            }
        }

        public async Task PlayerCheckmated(string gameId, Player caller, Player receiver)
        {
            var playerLostResult = new GameResult { Result = "You lost.", Reason = "You lost by checkmate." };
            var playerWonResult = new GameResult { Result = "You won!", Reason = "Checkmate!" };

            var observersResult = new GameResult { Result = $"Player {caller.PlayerName} won!", Reason = "Checkmate!" };

            await Clients.Client(caller.ConnectionId).SendAsync("GameOver", playerWonResult);
            await Clients.Client(receiver.ConnectionId).SendAsync("GameOver", playerLostResult);
            await Clients.GroupExcept(gameId, [caller.ConnectionId, receiver.ConnectionId]).SendAsync("GameOver", observersResult);

            _gameService.SetGameStatusToEnded(gameId);
        }

        public async Task PlayerInPat(string gameId, Player caller, Player receiver)
        {
            var resultDrawCaller = new GameResult { Result = "Tie!", Reason = "Enemy has no legal moves!" };
            var resultDrawReceiver = new GameResult { Result = "Tie!", Reason = "You have no legal moves!" };

            var observersResult = new GameResult { Result = "Tie!", Reason = $"Player {receiver} has no legal moves!" };

            await Clients.Client(caller.ConnectionId).SendAsync("GameOver", resultDrawCaller);
            await Clients.Client(receiver.ConnectionId).SendAsync("GameOver", resultDrawReceiver);
            await Clients.GroupExcept(gameId, [caller.ConnectionId, receiver.ConnectionId]).SendAsync("GameOver", observersResult);

            _gameService.SetGameStatusToEnded(gameId);
        }

        public async Task SendDrawRequest(string gameId)
        {
            try
            {
                var game = _gameService.GetGame(gameId) ?? throw new GameNotFoundException(gameId);
                var receiver = Context.ConnectionId == game.PlayerWhite?.ConnectionId ? game.PlayerBlack : game.PlayerWhite;

                await Clients.Client(receiver.ConnectionId).SendAsync("DrawRequest");
            }
            catch (GameNotFoundException)
            {
                await Clients.Caller.SendAsync("GameNotFound", gameId);
                return;
            }

        }

        public async Task AcceptDrawRequest(string gameId)
        {
            var resultDraw = new GameResult { Result = "Tie!", Reason = "Players agreed to a draw!" };
            await Clients.Group(gameId).SendAsync("GameOver", resultDraw);

            _gameService.SetGameStatusToEnded(gameId);
        }

        public async Task DeclineDrawRequest(string gameId) //To chyba w ogóle bez sensu, ponieważ nic nie wnosi... (ale zostawię)
        {
            await Clients.OthersInGroup(gameId).SendAsync("DeclineDraw");
        }

        public async Task ResignGame(string gameId)
        {
            try
            {
                var game = _gameService.GetGame(gameId) ?? throw new GameNotFoundException(gameId);

                var caller = Context.ConnectionId == game.PlayerWhite?.ConnectionId ? game.PlayerWhite : game.PlayerBlack;
                var receiver = Context.ConnectionId == game.PlayerWhite?.ConnectionId ? game.PlayerBlack : game.PlayerWhite;

                var playerLostResult = new GameResult { Result = "You lost.", Reason = "Lost by resign." };
                var playerWonResult = new GameResult { Result = "You won!", Reason = "Enemy resigned!" };

                var observersResult = new GameResult { Result = $"Player {receiver?.PlayerName} won!", Reason = "Enemy resigned!" };

                await Clients.Client(caller.ConnectionId).SendAsync("GameOver", playerLostResult);
                await Clients.Client(receiver.ConnectionId).SendAsync("GameOver", playerWonResult);
                await Clients.GroupExcept(gameId, [caller.ConnectionId, receiver.ConnectionId]).SendAsync("GameOver", observersResult);
                _gameService.SetGameStatusToEnded(gameId);
            }
            catch (GameNotFoundException)
            {
                await Clients.Caller.SendAsync("GameNotFound", gameId);
                return;
            }
        }
    }
}
