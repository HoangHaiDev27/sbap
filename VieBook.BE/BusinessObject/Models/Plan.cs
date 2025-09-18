using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Plan
{
    public int PlanId { get; set; }

    public string Name { get; set; } = null!;

    public string ForRole { get; set; } = null!;

    public string Period { get; set; } = null!;

    public decimal Price { get; set; }

    public string Currency { get; set; } = null!;

    public int? TrialDays { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}
