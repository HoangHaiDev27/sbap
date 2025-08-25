using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class UserDTO
    {
        // dùng để nhận đầu vào
        public string Email { get; set; }
        public string Password { get; set; }

        // dùng để trả ra client
        public string? ConfirmPass { get; set; }
        public int UserID { get; set; }
        public string? FullName { get; set; }
        public string? Role { get; set; }
        public bool IsActive { get; set; }
        public bool RememberMe { get; set; }
    }
}
