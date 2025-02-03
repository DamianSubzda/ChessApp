using ChessApp.Server.Exceptions;
using ChessApp.Server.Models;
using ChessApp.Server.Services;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

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
                        Role = "player"
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
                        Role = "player"
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
                        Role = "player"
                    };
                    game.PlayerBlack = player;

                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                    await Clients.Caller.SendAsync("PlayerJoined", player);
                    await Clients.Group(gameId).SendAsync("GameStarted", game);
                }
                else
                {
                    var player = new Player
                    {
                        PlayerName = playerName,
                        ConnectionId = Context.ConnectionId,
                        Color = "white",
                        Role = "observer"
                    };

                    await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                    await Clients.Caller.SendAsync("JoinedAsObserver", game, player);
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
            var resultLost = new GameResult { Result = "Lose", Reason = "You left the game" };
            var resultWin = new GameResult { Result = "Win", Reason = "Enemy player left the game!" };

            var resultObserver = new GameResult { Result = "Neutral", Reason = "" };

            try
            {
                var game = _gameService.GetGame(gameId) ?? throw new GameNotFoundException(gameId);
                game.Status = GameStatus.Abandoned;

                var playerLost = game.PlayerBlack?.ConnectionId == Context.ConnectionId ? game.PlayerBlack : game.PlayerWhite;
                var playerWin = game.PlayerBlack?.ConnectionId == Context.ConnectionId ? game.PlayerWhite : game.PlayerBlack;

                var excludedClients = new List<string>();

                if (playerWin != null && playerLost != null)
                {
                    await Clients.Client(playerWin.ConnectionId).SendAsync("GameOver", resultWin);
                    await Clients.Client(playerLost.ConnectionId).SendAsync("GameOver", resultLost);
                    excludedClients.Add(playerWin.ConnectionId);
                    excludedClients.Add(playerLost.ConnectionId);

                    resultObserver.Reason = $"Player {playerWin.PlayerName} wins!\n{playerLost.PlayerName} left the game!";
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
                if (turn.TimeLeft <= 0)
                {
                    await TimeRunOut(gameId);
                }
                else
                {
                    await Clients.Group(gameId).SendAsync("MadeTurn", turn);

                    var game = _gameService.GetGame(gameId) ?? throw new GameNotFoundException(gameId);
                    game.Turns.Add(turn);

                    var caller = turn.Player == game.PlayerWhite ? game.PlayerWhite : game.PlayerBlack;
                    var receiver = turn.Player == game.PlayerWhite ? game.PlayerBlack : game.PlayerWhite;

                    if (caller == null || receiver == null)
                    {
                        return;
                    }

                    if (turn.IsCheckmate)
                    {
                        await PlayerCheckmated(gameId, caller, receiver);
                    }
                    else if (turn.IsPat)
                    {
                        await PlayerInPat(gameId, caller, receiver);
                    }
                    else if (turn.IsTieByInsufficientMaterial)
                    {
                        await InsufficientMaterial(gameId, caller, receiver);
                    }
                    else if (turn.IsTieBy50MovesRule)
                    {
                        await TieBy50MovesRule(gameId, caller, receiver);
                    }
                    else if (turn.IsTieByRepeatingPosition)
                    {
                        await TieByRepeatingPosition(gameId, caller, receiver);
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

                var playerLostResult = new GameResult { Result = "Lose", Reason = "Time ran out" };
                var playerWonResult = new GameResult { Result = "Win", Reason = "Enemy ran out of time!" };

                var observersResult = new GameResult { Result = "Neutral", Reason = $"{receiver?.PlayerName} won!\n{caller?.PlayerName} ran out of time!" };
                
                if (caller != null && receiver != null)
                {
                    await Clients.Client(caller.ConnectionId).SendAsync("GameOver", playerLostResult);
                    await Clients.Client(receiver.ConnectionId).SendAsync("GameOver", playerWonResult);
                    await Clients.GroupExcept(gameId, [caller.ConnectionId, receiver.ConnectionId]).SendAsync("GameOver", observersResult);
                }
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
            var playerLostResult = new GameResult { Result = "Lose", Reason = "Checkmate" };
            var playerWonResult = new GameResult { Result = "Win", Reason = "Checkmate!" };

            var observersResult = new GameResult { Result = "Neutral", Reason = $"Player {caller.PlayerName} won by checkmate!" };

            await Clients.Client(caller.ConnectionId).SendAsync("GameOver", playerWonResult);
            await Clients.Client(receiver.ConnectionId).SendAsync("GameOver", playerLostResult);
            await Clients.GroupExcept(gameId, [caller.ConnectionId, receiver.ConnectionId]).SendAsync("GameOver", observersResult);

            _gameService.SetGameStatusToEnded(gameId);
        }

        public async Task PlayerInPat(string gameId, Player caller, Player receiver)
        {
            var resultDrawCaller = new GameResult { Result = "Tie", Reason = "Enemy had no legal moves!" };
            var resultDrawReceiver = new GameResult { Result = "Tie", Reason = "You had no legal moves!" };

            var observersResult = new GameResult { Result = "Neutral", Reason = $"Tie!\n{receiver.PlayerName} had no legal moves!" };

            await Clients.Client(caller.ConnectionId).SendAsync("GameOver", resultDrawCaller);
            await Clients.Client(receiver.ConnectionId).SendAsync("GameOver", resultDrawReceiver);
            await Clients.GroupExcept(gameId, [caller.ConnectionId, receiver.ConnectionId]).SendAsync("GameOver", observersResult);

            _gameService.SetGameStatusToEnded(gameId);
        }

        public async Task InsufficientMaterial(string gameId, Player caller, Player receiver)
        {
            var result = new GameResult { Result = "Tie", Reason = "Insufficient material!" };
            var observersResult = new GameResult { Result = "Neutral", Reason = $"Tie!\nInsufficient material!" };

            await Clients.Client(caller.ConnectionId).SendAsync("GameOver", result);
            await Clients.Client(receiver.ConnectionId).SendAsync("GameOver", result);
            await Clients.GroupExcept(gameId, [caller.ConnectionId, receiver.ConnectionId]).SendAsync("GameOver", observersResult);

            _gameService.SetGameStatusToEnded(gameId);
        }

        public async Task TieBy50MovesRule(string gameId, Player caller, Player receiver)
        {
            var result = new GameResult { Result = "Tie", Reason = "50 moves rule!" };
            var observersResult = new GameResult { Result = "Neutral", Reason = "50 moves rule!" };

            await Clients.Client(caller.ConnectionId).SendAsync("GameOver", result);
            await Clients.Client(receiver.ConnectionId).SendAsync("GameOver", result);
            await Clients.GroupExcept(gameId, [caller.ConnectionId, receiver.ConnectionId]).SendAsync("GameOver", observersResult);

            _gameService.SetGameStatusToEnded(gameId);
        }

        public async Task TieByRepeatingPosition(string gameId, Player caller, Player receiver)
        {
            var result = new GameResult { Result = "Tie", Reason = "Three times repeated position!" };
            var observersResult = new GameResult { Result = "Neutral", Reason = "Three times repeated position!" };

            await Clients.Client(caller.ConnectionId).SendAsync("GameOver", result);
            await Clients.Client(receiver.ConnectionId).SendAsync("GameOver", result);
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
            try
            {
                var game = _gameService.GetGame(gameId) ?? throw new GameNotFoundException(gameId);

                var result = new GameResult { Result = "Tie", Reason = "Players agreed to a draw!" };
                var observersResult = new GameResult { Result = "Neutral", Reason = "Players agreed to a draw!" };

                var caller = game.PlayerWhite?.ConnectionId == Context.ConnectionId ? game.PlayerWhite : game.PlayerBlack;
                var receiver = game.PlayerWhite?.ConnectionId == Context.ConnectionId ? game.PlayerBlack: game.PlayerWhite;

                var excludedClients = new List<string>();

                if (caller != null && receiver != null)
                {
                    await Clients.Client(caller.ConnectionId).SendAsync("GameOver", result);
                    await Clients.Client(receiver.ConnectionId).SendAsync("GameOver", result);

                    excludedClients.Add(caller.ConnectionId);
                    excludedClients.Add(receiver.ConnectionId);
                }

                await Clients.GroupExcept(gameId, excludedClients).SendAsync("GameOver", observersResult);
                _gameService.SetGameStatusToEnded(gameId);

            }
            catch (GameNotFoundException)
            {
                await Clients.Caller.SendAsync("GameNotFound", gameId);
                return;
            }


            
        }

        public async Task DeclineDrawRequest(string gameId)
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

                var playerLostResult = new GameResult { Result = "Lose", Reason = "Lost by resign" };
                var playerWonResult = new GameResult { Result = "Win", Reason = "Enemy resigned!" };

                var observersResult = new GameResult { Result = "Neutral", Reason = $"{receiver?.PlayerName} won!\n{caller?.PlayerName} resigned!" };
                
                if (caller != null && receiver != null)
                {
                    await Clients.Client(caller.ConnectionId).SendAsync("GameOver", playerLostResult);
                    await Clients.Client(receiver.ConnectionId).SendAsync("GameOver", playerWonResult);
                    await Clients.GroupExcept(gameId, [caller.ConnectionId, receiver.ConnectionId]).SendAsync("GameOver", observersResult);
                }
                
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
