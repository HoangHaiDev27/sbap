using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class UserDTO
    {
        // dùng để nhận đầu vào
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public decimal Wallet { get; set; }
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class UserNameDTO
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; }
    }
}