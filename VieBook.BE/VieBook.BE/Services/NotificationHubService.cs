using Microsoft.AspNetCore.SignalR;
using Services.Interfaces;
using VieBook.BE.Hubs;

namespace VieBook.BE.Services
{
    /// <summary>
    /// Implementation của INotificationHubService để gửi notification qua SignalR
    /// </summary>
    public class NotificationHubService : INotificationHubService
    {
        private readonly IHubContext<ChatHub> _hubContext;

        public NotificationHubService(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendNotificationToUserAsync(int userId, object notificationData)
        {
            await ChatHub.SendNotificationToUser(_hubContext, userId, notificationData);
        }
    }
}

