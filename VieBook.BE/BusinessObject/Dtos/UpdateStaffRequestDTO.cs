using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class UpdateStaffRequestDTO
    {
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public DateOnly? DateOfBirth { get; set; }

        // Admin có thể truyền mật khẩu mới (optional)
        public string? NewPassword { get; set; }
    }
}
