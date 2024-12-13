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
    public class GameContoller : ControllerBase
    {
        private readonly IHubContext<GameHub> _hubContext;
        private readonly GameService _gameService;
        public GameContoller(IHubContext<GameHub> hubContext, GameService gameService)
        {
            _gameService = gameService;
            _hubContext = hubContext;
        }

        [HttpPost("abandon-game")]
        public async Task<IActionResult> AbandonGame([FromBody] string gameId)
        {
            try
            {
                if (gameId == null || string.IsNullOrWhiteSpace(gameId))
                {
                    return BadRequest("Invalid game data.");
                }

                _gameService.SetGameStatusToAbandoned(gameId);

                await _hubContext.Clients.Group(gameId).SendAsync("PlayerLeft");
                return Ok("Game abandoned successfully.");
            }
            catch(GameNotFoundException ex)
            {
                return NotFound(ex.Message);
            }


        }
    }
}
