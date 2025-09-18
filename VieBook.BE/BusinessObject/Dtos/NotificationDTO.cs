using BusinessObject.Models;

namespace BusinessObject.Dtos
{
    public class NotificationDTO
    {
        public long NotificationId { get; set; }
        public int UserId { get; set; }
        public string Type { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string? Body { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateNotificationDTO
    {
        public int UserId { get; set; }
        public string Type { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string? Body { get; set; }
    }

    public class UpdateNotificationDTO
    {
        public long NotificationId { get; set; }
        public bool IsRead { get; set; }
    }

    public class NotificationResponseDTO
    {
        public long NotificationId { get; set; }
        public int UserId { get; set; }
        public string Type { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string? Body { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserName { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
    }

    // Notification types constants
    public static class NotificationTypes
    {
        public const string PAYMENT_SUCCESS = "PAYMENT_SUCCESS";
        public const string PAYMENT_FAILED = "PAYMENT_FAILED";
        public const string WALLET_RECHARGE = "WALLET_RECHARGE";
        public const string BOOK_PURCHASE = "BOOK_PURCHASE";
        public const string BOOK_APPROVAL = "BOOK_APPROVAL";
        public const string BOOK_REJECTED = "BOOK_REJECTED";
        public const string NEW_FOLLOWER = "NEW_FOLLOWER";
        public const string NEW_COMMENT = "NEW_COMMENT";
        public const string NEW_LIKE = "NEW_LIKE";
        public const string SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT";
        public const string PROMOTION = "PROMOTION";
    }
}
