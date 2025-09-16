using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class UserFeedback
{
    public int FeedbackId { get; set; }

    public int? FromUserId { get; set; }

    public string Content { get; set; } = null!;

    public string TargetType { get; set; } = null!;

    public int? TargetId { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? DeletedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual User? DeletedByNavigation { get; set; }

    public virtual User? FromUser { get; set; }
}
