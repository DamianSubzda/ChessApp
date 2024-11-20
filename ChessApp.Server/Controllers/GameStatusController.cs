using ChessApp.Server.Hubs;
using ChessApp.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ChessApp.Server.Controllers
{
    [ApiController]
    [Route("api")]
    public class GameStatusController : ControllerBase
    {
        private readonly IHubContext<LobbyHub> _hubContext;

        public GameStatusController(IHubContext<LobbyHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpPost("abandon-game")]
        public async Task<IActionResult> AbandonGame([FromBody] Game game)
        {
            if (game == null || string.IsNullOrWhiteSpace(game.GameId))
            {
                return BadRequest("Invalid game data.");
            }

            await _hubContext.Clients.All.SendAsync("GameRemoved", game);

            return Ok(new { Message = "Game abandoned successfully." });
        }
    }
}
