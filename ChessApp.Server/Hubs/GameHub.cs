using Microsoft.AspNetCore.SignalR;

namespace ChessApp.Server.Hubs
{
    public class GameHub : Hub
    {
        public async Task JoinGameRoom(string gameId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        }

        public async Task LeaveGameRoom(string gameId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);
        }
    }
}
