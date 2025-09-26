using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Subscription
{
    public long SubscriptionId { get; set; }

    public int UserId { get; set; }

    public int PlanId { get; set; }

    public string Status { get; set; } = null!;

    public bool AutoRenew { get; set; }

    public DateTime StartAt { get; set; }

    public DateTime EndAt { get; set; }

    public int RemainingConversions { get; set; }

    public DateTime? CancelAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Plan Plan { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
