using System;

namespace BusinessObject.Dtos
{
    public class UserManagementDTO
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public decimal Wallet { get; set; }
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public int BookCount { get; set; }
        public int OrderCount { get; set; }
    }

    public class UserLockRequestDTO
    {
        public int UserId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class UserUnlockRequestDTO
    {
        public int UserId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
