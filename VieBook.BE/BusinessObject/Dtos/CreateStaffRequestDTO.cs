using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class CreateStaffRequestDTO
    {
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public DateOnly? DateOfBirth { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
