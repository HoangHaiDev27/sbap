using System;

namespace BusinessObject.Dtos
{
    public class UserFeedbackDTO
    {
        public int FeedbackId { get; set; }
        public int? FromUserId { get; set; }
        public string? FromUserName { get; set; }
        public string? FromUserEmail { get; set; }
        public string? FromUserAvatarUrl { get; set; }
        public string Content { get; set; } = null!;
        public string TargetType { get; set; } = null!;
        public int? TargetId { get; set; }
        public string? TargetBookTitle { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? DeletedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}


