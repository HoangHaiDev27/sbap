using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface INotificationRepository
    {
        Task<Notification?> GetByIdAsync(long notificationId);
        Task<List<Notification>> GetByUserIdAsync(int userId);
        Task<List<Notification>> GetUnreadByUserIdAsync(int userId);
        Task<List<Notification>> GetByUserIdAndTypeAsync(int userId, string type);
        Task<Notification> CreateAsync(Notification notification);
        Task<Notification> UpdateAsync(Notification notification);
        Task<bool> DeleteAsync(long notificationId);
        Task<bool> MarkAsReadAsync(long notificationId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<List<Notification>> GetRecentNotificationsAsync(int userId, int count = 10);
        Task<bool> ExistsAsync(long notificationId);
    }
}
