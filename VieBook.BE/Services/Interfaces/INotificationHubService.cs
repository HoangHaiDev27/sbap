namespace Services.Interfaces
{
    /// <summary>
    /// Service để gửi notification real-time qua SignalR
    /// </summary>
    public interface INotificationHubService
    {
        /// <summary>
        /// Gửi notification đến một user cụ thể
        /// </summary>
        Task SendNotificationToUserAsync(int userId, object notificationData);
    }
}

