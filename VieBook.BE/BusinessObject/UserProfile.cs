using System;
using System.Collections.Generic;

namespace BusinessObject;

public partial class UserProfile
{
    public int UserId { get; set; }

    public string? FullName { get; set; }

    public string? PhoneNumber { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    public string? AvatarUrl { get; set; }

    public decimal Wallet { get; set; }

    public string? BankNumber { get; set; }

    public string? BankName { get; set; }

    public virtual User User { get; set; } = null!;
}
