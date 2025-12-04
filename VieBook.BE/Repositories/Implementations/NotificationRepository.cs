using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly NotificationDAO _dao;

        public NotificationRepository(NotificationDAO dao)
        {
            _dao = dao;
        }

        public async Task<Notification?> GetByIdAsync(long notificationId)
        {
            return await _dao.GetByIdAsync(notificationId);
        }

        public async Task<List<Notification>> GetByUserIdAsync(int userId)
        {
            return await _dao.GetByUserIdAsync(userId);
        }

        public async Task<List<Notification>> GetUnreadByUserIdAsync(int userId)
        {
            return await _dao.GetUnreadByUserIdAsync(userId);
        }

        public async Task<List<Notification>> GetByUserIdAndTypeAsync(int userId, string type)
        {
            return await _dao.GetByUserIdAndTypeAsync(userId, type);
        }

        public async Task<Notification> CreateAsync(Notification notification)
        {
            return await _dao.CreateAsync(notification);
        }

        public async Task<Notification> UpdateAsync(Notification notification)
        {
            return await _dao.UpdateAsync(notification);
        }

        public async Task<bool> DeleteAsync(long notificationId)
        {
            return await _dao.DeleteAsync(notificationId);
        }

        public async Task<bool> MarkAsReadAsync(long notificationId)
        {
            return await _dao.MarkAsReadAsync(notificationId);
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            return await _dao.MarkAllAsReadAsync(userId);
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _dao.GetUnreadCountAsync(userId);
        }

        public async Task<List<Notification>> GetRecentNotificationsAsync(int userId, int count = 10)
        {
            return await _dao.GetRecentNotificationsAsync(userId, count);
        }

        public async Task<bool> ExistsAsync(long notificationId)
        {
            return await _dao.ExistsAsync(notificationId);
        }
    }
}
