using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IMapper _mapper;

        public NotificationService(INotificationRepository notificationRepository, IMapper mapper)
        {
            _notificationRepository = notificationRepository;
            _mapper = mapper;
        }

        public async Task<NotificationResponseDTO?> GetByIdAsync(long notificationId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);
            return notification != null ? MapToResponseDTO(notification) : null;
        }

        public async Task<List<NotificationResponseDTO>> GetByUserIdAsync(int userId)
        {
            var notifications = await _notificationRepository.GetByUserIdAsync(userId);
            return notifications.Select(MapToResponseDTO).ToList();
        }

        public async Task<List<NotificationResponseDTO>> GetUnreadByUserIdAsync(int userId)
        {
            var notifications = await _notificationRepository.GetUnreadByUserIdAsync(userId);
            return notifications.Select(MapToResponseDTO).ToList();
        }

        public async Task<List<NotificationResponseDTO>> GetByUserIdAndTypeAsync(int userId, string type)
        {
            var notifications = await _notificationRepository.GetByUserIdAndTypeAsync(userId, type);
            return notifications.Select(MapToResponseDTO).ToList();
        }

        public async Task<NotificationResponseDTO> CreateAsync(CreateNotificationDTO createDto)
        {
            var notification = new Notification
            {
                UserId = createDto.UserId,
                Type = createDto.Type,
                Title = createDto.Title,
                Body = createDto.Body,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            var createdNotification = await _notificationRepository.CreateAsync(notification);
            return MapToResponseDTO(createdNotification);
        }

        public async Task<NotificationResponseDTO?> UpdateAsync(UpdateNotificationDTO updateDto)
        {
            var notification = await _notificationRepository.GetByIdAsync(updateDto.NotificationId);
            if (notification == null) return null;

            notification.IsRead = updateDto.IsRead;
            var updatedNotification = await _notificationRepository.UpdateAsync(notification);
            return MapToResponseDTO(updatedNotification);
        }

        public async Task<bool> DeleteAsync(long notificationId)
        {
            return await _notificationRepository.DeleteAsync(notificationId);
        }

        public async Task<bool> MarkAsReadAsync(long notificationId)
        {
            return await _notificationRepository.MarkAsReadAsync(notificationId);
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            return await _notificationRepository.MarkAllAsReadAsync(userId);
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _notificationRepository.GetUnreadCountAsync(userId);
        }

        public async Task<List<NotificationResponseDTO>> GetRecentNotificationsAsync(int userId, int count = 10)
        {
            var notifications = await _notificationRepository.GetRecentNotificationsAsync(userId, count);
            return notifications.Select(MapToResponseDTO).ToList();
        }

        // Specific notification types
        public async Task<NotificationResponseDTO> CreatePaymentSuccessNotificationAsync(int userId, decimal amount)
        {
            var createDto = new CreateNotificationDTO
            {
                UserId = userId,
                Type = NotificationTypes.PAYMENT_SUCCESS,
                Title = "Thanh toán thành công",
                Body = $"Giao dịch thanh toán {amount:N0} VNĐ đã được xử lý thành công."
            };
            return await CreateAsync(createDto);
        }

        public async Task<NotificationResponseDTO> CreatePaymentFailedNotificationAsync(int userId, decimal amount)
        {
            var createDto = new CreateNotificationDTO
            {
                UserId = userId,
                Type = NotificationTypes.PAYMENT_FAILED,
                Title = "Thanh toán thất bại",
                Body = $"Giao dịch thanh toán {amount:N0} VNĐ không thành công. Vui lòng thử lại."
            };
            return await CreateAsync(createDto);
        }

        public async Task<NotificationResponseDTO> CreateWalletRechargeNotificationAsync(int userId, decimal amount)
        {
            var createDto = new CreateNotificationDTO
            {
                UserId = userId,
                Type = NotificationTypes.WALLET_RECHARGE,
                Title = "Nạp tiền thành công",
                Body = $"Bạn đã nạp thành công {amount:N0} xu vào ví. Số dư hiện tại đã được cập nhật."
            };
            return await CreateAsync(createDto);
        }

        public async Task<NotificationResponseDTO> CreateBookPurchaseNotificationAsync(int userId, string bookTitle)
        {
            var createDto = new CreateNotificationDTO
            {
                UserId = userId,
                Type = NotificationTypes.BOOK_PURCHASE,
                Title = "Mua sách thành công",
                Body = $"Bạn đã mua thành công cuốn sách \"{bookTitle}\". Sách đã được thêm vào thư viện của bạn."
            };
            return await CreateAsync(createDto);
        }

        public async Task<NotificationResponseDTO> CreateChapterPurchaseNotificationAsync(int userId, int bookId, int chapterCount, decimal totalCost)
        {
            var createDto = new CreateNotificationDTO
            {
                UserId = userId,
                Type = NotificationTypes.BOOK_PURCHASE,
                Title = "Mua chương thành công",
                Body = $"Bạn đã mua thành công {chapterCount} chương với tổng chi phí {totalCost:N0} xu. Các chương đã được thêm vào thư viện của bạn."
            };
            return await CreateAsync(createDto);
        }

        public async Task<NotificationResponseDTO> CreateBookApprovalNotificationAsync(int userId, string bookTitle, bool approved)
        {
            var createDto = new CreateNotificationDTO
            {
                UserId = userId,
                Type = approved ? NotificationTypes.BOOK_APPROVAL : NotificationTypes.BOOK_REJECTED,
                Title = approved ? "Sách được duyệt" : "Sách bị từ chối",
                Body = approved
                    ? $"Cuốn sách \"{bookTitle}\" của bạn đã được duyệt và xuất bản."
                    : $"Cuốn sách \"{bookTitle}\" của bạn đã bị từ chối. Vui lòng kiểm tra và chỉnh sửa."
            };
            return await CreateAsync(createDto);
        }

        public async Task<NotificationResponseDTO> CreateNewFollowerNotificationAsync(int userId, string followerName)
        {
            var createDto = new CreateNotificationDTO
            {
                UserId = userId,
                Type = NotificationTypes.NEW_FOLLOWER,
                Title = "Người theo dõi mới",
                Body = $"{followerName} đã bắt đầu theo dõi bạn."
            };
            return await CreateAsync(createDto);
        }

        public async Task<NotificationResponseDTO> CreateSystemAnnouncementNotificationAsync(int userId, string title, string body)
        {
            var createDto = new CreateNotificationDTO
            {
                UserId = userId,
                Type = NotificationTypes.SYSTEM_ANNOUNCEMENT,
                Title = title,
                Body = body
            };
            return await CreateAsync(createDto);
        }

        public async Task<List<NotificationResponseDTO>> CreateBulkNotificationsAsync(List<CreateNotificationDTO> createDtos)
        {
            var notifications = createDtos.Select(dto => new Notification
            {
                UserId = dto.UserId,
                Type = dto.Type,
                Title = dto.Title,
                Body = dto.Body,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            var results = new List<NotificationResponseDTO>();
            foreach (var notification in notifications)
            {
                var created = await _notificationRepository.CreateAsync(notification);
                results.Add(MapToResponseDTO(created));
            }

            return results;
        }

        public async Task<bool> DeleteOldNotificationsAsync(int daysOld = 30)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-daysOld);
            var oldNotifications = await _notificationRepository.GetByUserIdAsync(0); // This needs to be fixed
            // Implementation for deleting old notifications
            return true;
        }

        private NotificationResponseDTO MapToResponseDTO(Notification notification)
        {
            return new NotificationResponseDTO
            {
                NotificationId = notification.NotificationId,
                UserId = notification.UserId,
                Type = notification.Type,
                Title = notification.Title,
                Body = notification.Body,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                UserName = notification.User?.Email ?? "Unknown", // You might want to add a Name field to User
                UserEmail = notification.User?.Email ?? "Unknown"
            };
        }
    }
}
