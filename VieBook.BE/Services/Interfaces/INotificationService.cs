using BusinessObject.Dtos;
using BusinessObject.Models;

namespace Services.Interfaces
{
    public interface INotificationService
    {
        // CRUD Operations
        Task<NotificationResponseDTO?> GetByIdAsync(long notificationId);
        Task<List<NotificationResponseDTO>> GetByUserIdAsync(int userId);
        Task<List<NotificationResponseDTO>> GetUnreadByUserIdAsync(int userId);
        Task<List<NotificationResponseDTO>> GetByUserIdAndTypeAsync(int userId, string type);
        Task<NotificationResponseDTO> CreateAsync(CreateNotificationDTO createDto);
        Task<NotificationResponseDTO?> UpdateAsync(UpdateNotificationDTO updateDto);
        Task<bool> DeleteAsync(long notificationId);

        // Mark as read operations
        Task<bool> MarkAsReadAsync(long notificationId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);

        // Recent notifications
        Task<List<NotificationResponseDTO>> GetRecentNotificationsAsync(int userId, int count = 10);

        // Specific notification types
        Task<NotificationResponseDTO> CreatePaymentSuccessNotificationAsync(int userId, decimal amount);
        Task<NotificationResponseDTO> CreatePaymentFailedNotificationAsync(int userId, decimal amount);
        Task<NotificationResponseDTO> CreateWalletRechargeNotificationAsync(int userId, decimal amount);
        Task<NotificationResponseDTO> CreateBookPurchaseNotificationAsync(int userId, string bookTitle);
        Task<NotificationResponseDTO> CreateBookApprovalNotificationAsync(int userId, string bookTitle, bool approved);
        Task<NotificationResponseDTO> CreateNewFollowerNotificationAsync(int userId, string followerName);
        Task<NotificationResponseDTO> CreateSystemAnnouncementNotificationAsync(int userId, string title, string body);

        // Bulk operations
        Task<List<NotificationResponseDTO>> CreateBulkNotificationsAsync(List<CreateNotificationDTO> createDtos);
        Task<bool> DeleteOldNotificationsAsync(int daysOld = 30);
    }
}
