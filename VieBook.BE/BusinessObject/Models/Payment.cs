using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Payment
{
    public long PaymentId { get; set; }

    public long OrderItemId { get; set; }

    public string Provider { get; set; } = null!;

    public string TransactionId { get; set; } = null!;

    public decimal Amount { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? PaidAt { get; set; }

    public virtual OrderItem OrderItem { get; set; } = null!;
}
