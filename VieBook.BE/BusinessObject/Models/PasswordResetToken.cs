using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class PasswordResetToken
{
    public Guid TokenId { get; set; }

    public int UserId { get; set; }

    public byte[] TokenHash { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public DateTime? UsedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
