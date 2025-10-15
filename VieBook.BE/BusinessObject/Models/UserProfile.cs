using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

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

    public bool IsPhoneVerified { get; set; }

    public DateTime? PhoneVerifiedAt { get; set; }

    public string? PortfolioUrl { get; set; }

    public string? Bio { get; set; }

    public bool AgreeTos { get; set; }
    public string? Address { get; set; }

    // Removed owner review workflow fields per requirements

    public virtual User User { get; set; } = null!;
}
