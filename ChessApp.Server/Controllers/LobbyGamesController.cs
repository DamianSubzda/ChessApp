using ChessApp.Server.Exceptions;
using ChessApp.Server.Hubs;
using ChessApp.Server.Models;
using ChessApp.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ChessApp.Server.Controllers
{
    [ApiController]
    [Route("api")]
    public class LobbyGamesController : ControllerBase
    {
        private readonly IHubContext<LobbyHub> _hubContext;
        private readonly GameService _gameService;
        public LobbyGamesController(IHubContext<LobbyHub> hubContext, GameService gameService)
        {
            _gameService = gameService;
            _hubContext = hubContext;
        }

        [HttpPost("abandon-new-game")]
        public async Task<IActionResult> AbandonGame([FromBody] Game game)
        {
            try
            {
                if (game == null || string.IsNullOrWhiteSpace(game.GameId))
                {
                    return BadRequest("Invalid game data.");
                }

                _gameService.SetGameStatusToAbandoned(game.GameId);

                await _hubContext.Clients.All.SendAsync("GameRemoved", _gameService.GetGame(game.GameId));
                return Ok("Game abandoned successfully.");
            }
            catch (GameNotFoundException ex)
            {
                return NotFound(ex.Message);
            }

        }

        [HttpPost("join-game")]
        public IActionResult JoinGame([FromBody] string gameId)
        {
            if (_gameService.GetStartedGame(gameId) != null)
            {
                return Ok("Game joined seccessfully.");
            }

            return NotFound("Game not found!");
        }

    }
}
