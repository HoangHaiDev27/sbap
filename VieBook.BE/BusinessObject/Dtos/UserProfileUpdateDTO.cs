using System;

namespace BusinessObject.Dtos
{
    public class UserProfileUpdateDTO
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? AvatarUrl { get; set; }
        public string? BankNumber { get; set; }
        public string? BankName { get; set; }
    }
}


